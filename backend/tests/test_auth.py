from datetime import datetime, timezone

import jwt
import pytest
from fastapi import HTTPException

from services import auth
from services.auth import (
    ALGORITHM,
    SECRET_KEY,
    create_access_token,
    hash_password,
    require_recruiter,
    require_seeker,
    verify_password,
)


class TestPasswordHashing:
    def test_hash_and_verify_roundtrip(self):
        hashed = hash_password("s3cret!")
        assert hashed != "s3cret!"
        assert verify_password("s3cret!", hashed)

    def test_wrong_password_rejected(self):
        hashed = hash_password("s3cret!")
        assert not verify_password("wrong", hashed)

    def test_hashes_are_salted(self):
        assert hash_password("same") != hash_password("same")


class TestCreateAccessToken:
    def test_payload_contents(self):
        token = create_access_token(42, "recruiter")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "42"
        assert payload["role"] == "recruiter"

    def test_expiry_is_in_the_future(self):
        token = create_access_token(1, "seeker")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["exp"] > datetime.now(timezone.utc).timestamp()

    def test_tampered_token_rejected(self):
        token = create_access_token(1, "seeker")
        with pytest.raises(jwt.PyJWTError):
            jwt.decode(token + "x", SECRET_KEY, algorithms=[ALGORITHM])


class _FakeUser:
    def __init__(self, role):
        self.role = role


class TestRoleGuards:
    def test_require_recruiter_allows_recruiter(self):
        user = _FakeUser("recruiter")
        assert require_recruiter(user) is user

    def test_require_recruiter_rejects_seeker(self):
        with pytest.raises(HTTPException) as exc_info:
            require_recruiter(_FakeUser("seeker"))
        assert exc_info.value.status_code == 403

    def test_require_seeker_allows_seeker(self):
        user = _FakeUser("seeker")
        assert require_seeker(user) is user

    def test_require_seeker_rejects_recruiter(self):
        with pytest.raises(HTTPException) as exc_info:
            require_seeker(_FakeUser("recruiter"))
        assert exc_info.value.status_code == 403


import os
import subprocess
import sys

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _import_auth(env_overrides):
    """Import services.auth in a clean subprocess with a given environment.
    Returns the completed process (returncode + stderr) so we can assert on the
    fail-fast behaviour without polluting this test process's module state.
    """
    env = {k: v for k, v in os.environ.items() if k not in ("APP_ENV", "SECRET_KEY")}
    env.update(env_overrides)
    return subprocess.run(
        [sys.executable, "-c", "import services.auth"],
        cwd=_BACKEND_DIR, env=env, capture_output=True, text=True,
    )


class TestSecretKeyPolicy:
    def test_production_without_secret_key_fails_fast(self):
        proc = _import_auth({"APP_ENV": "production"})
        assert proc.returncode != 0
        assert "SECRET_KEY" in proc.stderr

    def test_production_with_short_secret_key_fails_fast(self):
        proc = _import_auth({"APP_ENV": "production", "SECRET_KEY": "too-short"})
        assert proc.returncode != 0
        assert "at least" in proc.stderr

    def test_production_with_strong_secret_key_starts(self):
        proc = _import_auth({"APP_ENV": "production", "SECRET_KEY": "x" * 40})
        assert proc.returncode == 0, proc.stderr

    def test_development_without_secret_key_starts(self):
        proc = _import_auth({"APP_ENV": "development"})
        assert proc.returncode == 0, proc.stderr


class TestGoogleAuth:
    """The /auth/google flow, with Google's own token verification stubbed out.

    We patch routers.auth.verify_google_token so no real Google token is needed;
    it returns the claims Google would have handed back for a verified account.
    """

    CLAIMS = {
        "email": "grace@gmail.com",
        "email_verified": True,
        "name": "Grace Google",
        "picture": "https://example.com/g.png",
    }

    @pytest.fixture()
    def stub_google(self, monkeypatch):
        def _stub(credential):
            return dict(self.CLAIMS)

        import routers.auth as auth_router
        monkeypatch.setattr(auth_router, "verify_google_token", _stub)

    def test_new_user_without_role_is_asked_for_one(self, client, stub_google):
        r = client.post("/auth/google", json={"credential": "tok"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["needs_role"] is True
        assert data["email"] == "grace@gmail.com"
        assert data["full_name"] == "Grace Google"
        assert data["access_token"] is None

    def test_new_seeker_is_created_and_signed_in(self, client, stub_google):
        r = client.post("/auth/google", json={"credential": "tok", "role": "seeker"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["needs_role"] is False
        assert data["access_token"]
        assert data["user"]["role"] == "seeker"
        assert data["user"]["email"] == "grace@gmail.com"
        assert data["user"]["photo"] == "https://example.com/g.png"

    def test_new_recruiter_requires_company(self, client, stub_google):
        r = client.post("/auth/google", json={"credential": "tok", "role": "recruiter"})
        assert r.status_code == 400
        assert "Company name" in r.json()["detail"]

    def test_new_recruiter_with_company_is_created(self, client, stub_google):
        r = client.post(
            "/auth/google",
            json={"credential": "tok", "role": "recruiter", "company_name": "Acme"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["role"] == "recruiter"
        assert data["user"]["company_name"] == "Acme"

    def test_returning_google_user_signs_straight_in(self, client, stub_google):
        first = client.post("/auth/google", json={"credential": "tok", "role": "seeker"})
        assert first.status_code == 200
        # Second time, no role needed - the account already exists.
        again = client.post("/auth/google", json={"credential": "tok"})
        assert again.status_code == 200, again.text
        data = again.json()
        assert data["needs_role"] is False
        assert data["access_token"]
        assert data["user"]["email"] == "grace@gmail.com"

    def test_password_login_on_google_account_is_guided(self, client, stub_google):
        client.post("/auth/google", json={"credential": "tok", "role": "seeker"})
        r = client.post("/auth/login", json={"email": "grace@gmail.com", "password": "whatever"})
        assert r.status_code == 401
        assert "Google" in r.json()["detail"]

    def test_invalid_token_is_rejected(self, client):
        # No stub here: with no GOOGLE_CLIENT_ID configured, the endpoint reports
        # the feature is unavailable rather than accepting an unverified token.
        r = client.post("/auth/google", json={"credential": "not-a-real-token"})
        assert r.status_code in (401, 503)
