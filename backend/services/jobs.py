from fastapi import HTTPException

from database import models_job, models_user

FALLBACK_COMPANY = "A company on Canvett"


def get_owned_job_or_404(db, job_id, user):
    job = (
        db.query(models_job.Job)
        .filter(models_job.Job.id == job_id, models_job.Job.recruiter_id == user.id)
        .first()
    )
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


def get_active_job_or_404(db, job_id):
    job = db.query(models_job.Job).filter(models_job.Job.id == job_id).first()
    if job is None or job.status != "Active":
        raise HTTPException(status_code=404, detail="This job is no longer available")
    return job


def company_name_for_job(db, job):
    if job is None or not job.recruiter_id:
        return FALLBACK_COMPANY
    recruiter = (
        db.query(models_user.User)
        .filter(models_user.User.id == job.recruiter_id)
        .first()
    )
    if recruiter is None:
        return FALLBACK_COMPANY
    return recruiter.company_name or recruiter.full_name
