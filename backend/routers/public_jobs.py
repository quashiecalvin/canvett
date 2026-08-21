from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.session import get_db
from database import models_job
from services.jobs import get_active_job_or_404, company_name_for_job

router = APIRouter(prefix="/public/jobs", tags=["Public Jobs"])


def _serialize(job, company):
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
        "company": company,
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
    return [_serialize(job, company_name_for_job(db, job)) for job in jobs]


@router.get("/{job_id}")
def get_open_job(job_id: int, db: Session = Depends(get_db)):
    job = get_active_job_or_404(db, job_id)
    return _serialize(job, company_name_for_job(db, job))
