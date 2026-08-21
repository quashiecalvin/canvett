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
