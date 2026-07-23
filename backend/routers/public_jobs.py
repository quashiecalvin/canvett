from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.session import get_db
from database import models_job, models_user

router = APIRouter(prefix="/public/jobs", tags=["Public Jobs"])


def _serialize(job, recruiter):
    return {
        "id": job.id,
        "title": job.title,
        "department": job.department,
        "employment_type": job.employment_type,
        "location": job.location,
        "description": job.description,
        "required_skills": job.required_skills,
        "experience_requirement": job.experience_requirement,
        "education_requirement": job.education_requirement,
        "company": (recruiter.company_name or recruiter.full_name) if recruiter else "A company on Canvett",
        "posted_date": job.posted_date,
    }


@router.get("/")
def list_open_jobs(db: Session = Depends(get_db)):
    jobs = (
        db.query(models_job.Job)
        .filter(models_job.Job.status == "Active")
        .order_by(models_job.Job.posted_date.desc())
        .all()
    )
    result = []
    for job in jobs:
        recruiter = (
            db.query(models_user.User)
            .filter(models_user.User.id == job.recruiter_id)
            .first()
            if hasattr(job, "recruiter_id") and job.recruiter_id
            else None
        )
        result.append(_serialize(job, recruiter))
    return result


@router.get("/{job_id}")
def get_open_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models_job.Job).filter(models_job.Job.id == job_id).first()
    if job is None or job.status != "Active":
        raise HTTPException(status_code=404, detail="This job is no longer available")

    recruiter = (
        db.query(models_user.User)
        .filter(models_user.User.id == job.recruiter_id)
        .first()
        if hasattr(job, "recruiter_id") and job.recruiter_id
        else None
    )
    return _serialize(job, recruiter)
