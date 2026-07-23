from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.session import get_db
from database import models_job, models_candidate, models_user
from services.activity import log_activity
from services.auth import require_recruiter
from schemas.job import JobCreate, JobUpdate, JobOut

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/", response_model=JobOut)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_recruiter),
):
    new_job = models_job.Job(**job.model_dump(), recruiter_id=user.id)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    log_activity(db, f"New job posting created: {new_job.title}")
    return new_job


@router.get("/", response_model=list[JobOut])
def list_jobs(
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_recruiter),
):
    jobs = (
        db.query(models_job.Job)
        .filter(models_job.Job.recruiter_id == user.id)
        .order_by(models_job.Job.posted_date.desc())
        .all()
    )
    for job in jobs:
        job.applicant_count = (
            db.query(models_candidate.Candidate)
            .filter(models_candidate.Candidate.job_id == job.id)
            .count()
        )
        job.ranked_count = (
            db.query(models_candidate.Score)
            .filter(models_candidate.Score.job_id == job.id)
            .count()
        )
    return jobs


@router.get("/{job_id}", response_model=JobOut)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_recruiter),
):
    job = (
        db.query(models_job.Job)
        .filter(models_job.Job.id == job_id, models_job.Job.recruiter_id == user.id)
        .first()
    )
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_recruiter),
):
    job = (
        db.query(models_job.Job)
        .filter(models_job.Job.id == job_id, models_job.Job.recruiter_id == user.id)
        .first()
    )
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    db.query(models_candidate.Score).filter(models_candidate.Score.job_id == job_id).delete()
    db.query(models_candidate.Candidate).filter(models_candidate.Candidate.job_id == job_id).delete()
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}


@router.put("/{job_id}", response_model=JobOut)
def update_job(
    job_id: int,
    updated: JobUpdate,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_recruiter),
):
    job = (
        db.query(models_job.Job)
        .filter(models_job.Job.id == job_id, models_job.Job.recruiter_id == user.id)
        .first()
    )
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    for field, value in updated.model_dump().items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    log_activity(db, f"Job posting updated: {job.title}")
    return job
