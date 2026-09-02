from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.session import get_db
from database import models_user, models_job, models_saved
from services.auth import require_seeker
from services.jobs import company_name_for_job, company_logo_for_job

router = APIRouter(prefix="/saved-jobs", tags=["Saved Jobs"])


def _serialize(db, job, saved_at=None):
    return {
        "job_id": job.id,
        "title": job.title,
        "company": company_name_for_job(db, job),
        "company_logo": company_logo_for_job(db, job),
        "location": job.location,
        "employment_type": job.employment_type,
        "department": job.department,
        "required_skills": job.required_skills,
        "posted_date": job.posted_date,
        "saved_at": saved_at,
    }


@router.get("/")
def list_saved(db: Session = Depends(get_db), user: models_user.User = Depends(require_seeker)):
    rows = (
        db.query(models_saved.SavedJob)
        .filter(models_saved.SavedJob.user_id == user.id)
        .order_by(models_saved.SavedJob.created_at.desc())
        .all()
    )
    out = []
    for r in rows:
        job = db.query(models_job.Job).filter(models_job.Job.id == r.job_id).first()
        if job:
            out.append(_serialize(db, job, r.created_at))
    return out


@router.post("/{job_id}")
def save_job(job_id: int, db: Session = Depends(get_db), user: models_user.User = Depends(require_seeker)):
    job = db.query(models_job.Job).filter(models_job.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    existing = (
        db.query(models_saved.SavedJob)
        .filter(models_saved.SavedJob.user_id == user.id, models_saved.SavedJob.job_id == job_id)
        .first()
    )
    if not existing:
        db.add(models_saved.SavedJob(user_id=user.id, job_id=job_id))
        db.commit()
    return {"saved": True, "job_id": job_id}


@router.delete("/{job_id}")
def unsave_job(job_id: int, db: Session = Depends(get_db), user: models_user.User = Depends(require_seeker)):
    db.query(models_saved.SavedJob).filter(
        models_saved.SavedJob.user_id == user.id, models_saved.SavedJob.job_id == job_id
    ).delete()
    db.commit()
    return {"saved": False, "job_id": job_id}
