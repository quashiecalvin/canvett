import logging
import os
from pathlib import Path

# Load backend/.env for local development (e.g. GOOGLE_CLIENT_ID) before any
# module reads its environment. Real environment variables always win, so this
# is a no-op in production (Fly.io) where they are set as secrets. If
# python-dotenv is not installed, plain environment variables still work.
try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent / ".env")
except ImportError:
    pass

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import jobs, candidates, stats, settings, auth, applications, public_jobs, saved, notifications
from services.parser import ResumeParseError
from sqlalchemy import text
from database.connection import engine, SessionLocal, Base
# Import every model module so their tables are registered on Base.metadata
# before create_all runs at startup.
from database import (
    models_candidate,
    models_user,
    models_job,
    models_application,
    models_saved,
    models_settings,
    models_activity,
    models_reset,
    models_notification,
)
from services.profile import extract_location, extract_years

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

logger = logging.getLogger(__name__)

enable_api_docs = os.getenv("ENABLE_API_DOCS", "").lower() in {"1", "true", "yes", "on"}
app = FastAPI(
    title="Canvett API",
    docs_url="/docs" if enable_api_docs else None,
    redoc_url="/redoc" if enable_api_docs else None,
    openapi_url="/openapi.json" if enable_api_docs else None,
)

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,https://canvett.vercel.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    # Baseline hardening headers on every response. HSTS only takes effect over
    # HTTPS (Fly.io terminates TLS), and is inert on plain-HTTP local dev.
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.exception_handler(ResumeParseError)
def handle_resume_parse_error(request: Request, exc: ResumeParseError):
    logger.warning("Resume could not be parsed for %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.middleware("http")
async def log_unhandled_errors(request: Request, call_next):
    # Registered after CORSMiddleware so it runs inside it: the 500 response
    # still carries CORS headers and reaches the browser as a real message.
    # Anything caught here is a bug, so it is logged with a traceback instead of
    # failing the request with no trace of what went wrong.
    try:
        return await call_next(request)
    except Exception:
        logger.exception("Unhandled error during %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content={"detail": "Something went wrong on our side. Please try again."},
        )


@app.on_event("startup")
def _startup_migrate_and_backfill():
    # Create any tables that do not yet exist. This leaves existing tables
    # untouched, so on a database with an older, partial schema it fills in the
    # missing tables (users, applications, saved_jobs, scores, settings,
    # activities); the ALTER statements below then patch columns onto tables that
    # predate later features.
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        logger.exception("schema create_all failed")

    stmts = [
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS status VARCHAR NOT NULL DEFAULT 'New'",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS location VARCHAR",
        "ALTER TABLE candidates ADD COLUMN IF NOT EXISTS years_experience DOUBLE PRECISION",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS headline VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS skills VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS company_logo TEXT",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS photo TEXT",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS languages VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS pref_field VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS pref_job_type VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS pref_location VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarded BOOLEAN NOT NULL DEFAULT false",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR NOT NULL DEFAULT 'password'",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_mode VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS pref_work_mode VARCHAR",
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()",
        # Google accounts have no password of their own.
        "ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL",
        "CREATE TABLE IF NOT EXISTS saved_jobs (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), job_id INTEGER NOT NULL REFERENCES jobs(id), created_at TIMESTAMPTZ DEFAULT now(), CONSTRAINT uq_saved_user_job UNIQUE (user_id, job_id))",
    ]
    try:
        with engine.begin() as conn:
            for st in stmts:
                conn.execute(text(st))
    except Exception:
        logger.exception("candidate column migration failed")
    db = SessionLocal()
    try:
        rows = db.query(models_candidate.Candidate).filter(
            (models_candidate.Candidate.location.is_(None))
            | (models_candidate.Candidate.years_experience.is_(None))
        ).all()
        for c in rows:
            if c.location is None:
                c.location = extract_location(c.resume_text)
            if c.years_experience is None:
                c.years_experience = extract_years(c.resume_text)
        db.commit()
    except Exception:
        logger.exception("candidate profile backfill failed")
        db.rollback()
    finally:
        db.close()


app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(stats.router)
app.include_router(settings.router)
app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(public_jobs.router)
app.include_router(saved.router)
app.include_router(notifications.router)


@app.get("/")
def read_root():
    return {"message": "Canvett backend is running"}


@app.get("/health")
def health_check():
    # Cheap liveness/readiness probe for Fly.io health checks and uptime pings.
    # Confirms the process is up and the database is reachable.
    db_ok = True
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "database": "up" if db_ok else "down"}
