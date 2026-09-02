import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import jobs, candidates, stats, settings, auth, applications, public_jobs, saved
from services.parser import ResumeParseError
from sqlalchemy import text
from database.connection import engine, SessionLocal
from database import models_candidate
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

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/")
def read_root():
    return {"message": "Canvett backend is running"}
