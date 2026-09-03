"""Shared test configuration and fixtures.

Two kinds of tests live in this suite:

* Unit tests import service functions directly and never touch a database.
  They run with any DATABASE_URL (the default sqlite:// is fine).
* Integration/security tests drive the real FastAPI app through a TestClient
  against a PostgreSQL database (the app uses PostgreSQL ARRAY columns, so a
  real Postgres is required). Point DATABASE_URL at a throwaway test database
  before running them, e.g.:

      DATABASE_URL=postgresql://postgres@127.0.0.1:5433/canvett_test \
      SECRET_KEY=test pytest

If the heavy `sentence-transformers` package is not installed, a lightweight
deterministic stub is injected so the scoring stack can be imported without
downloading a model. On a machine that has the real package this is a no-op.
"""
import os
import sys
import types

# Make the backend package importable (tests/ -> backend/).
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")

# ---- optional NLP stub -----------------------------------------------------
try:  # pragma: no cover - depends on the environment
    import sentence_transformers  # noqa: F401
except Exception:  # noqa: BLE001
    import numpy as _np

    _st = types.ModuleType("sentence_transformers")

    class SentenceTransformer:  # noqa: D401 - stub
        def __init__(self, *a, **k):
            pass

        def encode(self, x, convert_to_tensor=False, **k):
            if isinstance(x, (list, tuple)):
                return _np.zeros((len(x), 8), dtype=float)
            return _np.zeros(8, dtype=float)

    class _Util:
        @staticmethod
        def cos_sim(a, b):
            b2 = _np.atleast_2d(_np.asarray(b, dtype=float))
            return _np.zeros((1, b2.shape[0]), dtype=float)

    _st.SentenceTransformer = SentenceTransformer
    _st.util = _Util()
    sys.modules["sentence_transformers"] = _st


# ---- integration fixtures (only used by DB-backed tests) -------------------
import pytest  # noqa: E402
from sqlalchemy import text  # noqa: E402

_TABLES = [
    "saved_jobs", "applications", "scores", "candidates",
    "activities", "jobs", "settings", "users",
]
_TABLES_READY = False


def _is_postgres() -> bool:
    return os.environ.get("DATABASE_URL", "").startswith("postgres")


def _truncate(engine):
    with engine.begin() as conn:
        conn.execute(text(
            "TRUNCATE " + ", ".join(_TABLES) + " RESTART IDENTITY CASCADE"
        ))


@pytest.fixture()
def client():
    """A fresh TestClient against a clean database (Postgres required)."""
    if not _is_postgres():
        pytest.skip("integration tests require a PostgreSQL DATABASE_URL")
    from fastapi.testclient import TestClient
    from database import connection
    import main

    global _TABLES_READY
    if not _TABLES_READY:
        connection.Base.metadata.create_all(bind=connection.engine)
        _TABLES_READY = True
    _truncate(connection.engine)
    return TestClient(main.app)


def _register(client, email, password, full_name, role, company=None):
    body = {"email": email, "password": password, "full_name": full_name, "role": role}
    if company:
        body["company_name"] = company
    r = client.post("/auth/register", json=body)
    assert r.status_code == 201, r.text
    data = r.json()
    return {
        "token": data["access_token"],
        "user": data["user"],
        "auth": {"Authorization": f"Bearer {data['access_token']}"},
    }


@pytest.fixture()
def recruiter(client):
    return _register(client, "rec@acme.io", "password123", "Rita Recruiter", "recruiter", "Acme Corp")


@pytest.fixture()
def recruiter2(client):
    return _register(client, "rec2@globex.io", "password123", "Rob Recruiter", "recruiter", "Globex")


@pytest.fixture()
def seeker(client):
    return _register(client, "seeker@mail.io", "password123", "Sam Seeker", "seeker")


@pytest.fixture()
def job(client, recruiter):
    body = {
        "title": "Backend Engineer",
        "department": "Engineering",
        "employment_type": "Full-time",
        "location": "Accra, Ghana",
        "description": "Build and maintain APIs with Python and FastAPI.",
        "required_skills": ["Python", "FastAPI", "PostgreSQL"],
        "experience_requirement": "2+ years",
        "education_requirement": "BSc Computer Science",
    }
    r = client.post("/jobs/", json=body, headers=recruiter["auth"])
    assert r.status_code == 200, r.text
    return r.json()
