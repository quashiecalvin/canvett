from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.session import get_db
from database import models_job
from services.activity import log_activity
from schemas.job import JobCreate, JobOut

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/", response_model=JobOut)
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    new_job = models_job.Job(**job.model_dump())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    log_activity(db, f"New job posting created: {new_job.title}")
    return new_job


@router.get("/", response_model=list[JobOut])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(models_job.Job).order_by(models_job.Job.posted_date.desc()).all()


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models_job.Job).filter(models_job.Job.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
