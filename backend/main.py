import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import jobs, candidates, stats, settings, auth, applications, public_jobs

app = FastAPI(title="Canvett API")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
