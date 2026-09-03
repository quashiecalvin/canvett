import os
import secrets
import warnings
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database.session import get_db
from database import models_user

# --- SECRET_KEY resolution -------------------------------------------------
# The JWT signing key. In production it MUST be supplied via the environment
# and be long enough to be secure; the app refuses to start otherwise, so a
# deploy can never silently run on a weak or throwaway key. In development a
# key is generated and persisted to a local file so tokens survive restarts
# (regenerating on every start would log everyone out between reloads).
MIN_SECRET_BYTES = 32
APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
SECRET_KEY = os.getenv("SECRET_KEY")


def _resolve_dev_secret() -> str:
    """Return a stable development secret, persisted next to the backend."""
    key_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        ".dev_secret_key",
    )
    try:
        if os.path.exists(key_file):
            existing = open(key_file, encoding="utf-8").read().strip()
            if existing:
                return existing
        generated = secrets.token_urlsafe(48)
        with open(key_file, "w", encoding="utf-8") as fh:
            fh.write(generated)
        return generated
    except OSError:
        # Filesystem not writable — fall back to an in-memory key for this run.
        return secrets.token_urlsafe(48)


if APP_ENV == "production":
    if not SECRET_KEY:
        raise RuntimeError(
            "SECRET_KEY environment variable is required in production. "
            "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
        )
    if len(SECRET_KEY.encode("utf-8")) < MIN_SECRET_BYTES:
        raise RuntimeError(
            f"SECRET_KEY must be at least {MIN_SECRET_BYTES} bytes long in production."
        )
elif not SECRET_KEY:
    SECRET_KEY = _resolve_dev_secret()
    warnings.warn(
        "SECRET_KEY is not set; using a development key persisted to "
        "backend/.dev_secret_key. Set SECRET_KEY and APP_ENV=production before deploying.",
        RuntimeWarning,
        stacklevel=2,
    )

ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_access_token(user_id: int, role: str) -> str:
    expiry = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS)
    payload = {"sub": str(user_id), "role": role, "exp": expiry}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models_user.User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_error
    except jwt.PyJWTError:
        raise credentials_error

    user = (
        db.query(models_user.User)
        .filter(models_user.User.id == int(user_id))
        .first()
    )
    if user is None:
        raise credentials_error

    return user


def require_recruiter(user: models_user.User = Depends(get_current_user)) -> models_user.User:
    if user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires a recruiter account",
        )
    return user


def require_seeker(user: models_user.User = Depends(get_current_user)) -> models_user.User:
    if user.role != "seeker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires a job seeker account",
        )
    return user
