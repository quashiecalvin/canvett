"""Unit tests for the in-process auth rate limiter."""
import pytest
from fastapi import HTTPException

import services.ratelimit as rl


class _FakeReq:
    def __init__(self, ip="1.2.3.4", xff=None):
        self.headers = {"x-forwarded-for": xff} if xff else {}
        self.client = type("C", (), {"host": ip})()


def setup_function():
    rl._hits.clear()


def test_allows_up_to_limit_then_blocks():
    dep = rl.rate_limit("login")           # 10 per 5 min
    req = _FakeReq()
    for _ in range(10):
        dep(req)                            # should not raise
    with pytest.raises(HTTPException) as exc:
        dep(req)                            # 11th blocked
    assert exc.value.status_code == 429
    assert "Retry-After" in exc.value.headers


def test_separate_ips_independent():
    dep = rl.rate_limit("register")        # 5 per hour
    a, b = _FakeReq("10.0.0.1"), _FakeReq("10.0.0.2")
    for _ in range(5):
        dep(a)
    with pytest.raises(HTTPException):
        dep(a)
    dep(b)  # different IP still allowed


def test_forwarded_for_is_used():
    dep = rl.rate_limit("forgot")          # 5 per hour
    req = _FakeReq(ip="127.0.0.1", xff="203.0.113.9, 10.0.0.1")
    for _ in range(5):
        dep(req)
    with pytest.raises(HTTPException):
        dep(req)
