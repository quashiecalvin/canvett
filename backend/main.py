import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import jobs, candidates, stats, settings, auth, applications, public_jobs
from services.parser import ResumeParseError

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


app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(stats.router)
app.include_router(settings.router)
app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(public_jobs.router)


@app.get("/")
def read_root():
    return {"message": "Canvett backend is running"}
