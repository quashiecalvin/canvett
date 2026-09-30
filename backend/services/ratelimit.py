"""Lightweight in-process rate limiting for sensitive auth endpoints.

Keeps a sliding window of request timestamps per client IP per bucket. This is
per-process (fine for the single Fly machine Canvett runs on); a multi-instance
deployment would move this to a shared store such as Redis.
"""
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

# bucket -> (max_hits, window_seconds)
LIMITS = {
    "login": (10, 300),          # 10 attempts / 5 min
    "register": (5, 3600),       # 5 / hour
    "forgot": (5, 3600),         # 5 / hour
    "reset": (10, 3600),         # 10 / hour
    "google": (20, 300),         # 20 / 5 min
}

_hits: dict[str, deque] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limit(bucket: str):
    max_hits, window = LIMITS[bucket]

    def dependency(request: Request):
        ip = _client_ip(request)
        key = f"{bucket}:{ip}"
        now = time.time()
        dq = _hits[key]
        while dq and now - dq[0] > window:
            dq.popleft()
        if len(dq) >= max_hits:
            retry_after = int(window - (now - dq[0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many attempts. Please wait a moment and try again.",
                headers={"Retry-After": str(retry_after)},
            )
        dq.append(now)

    return dependency
