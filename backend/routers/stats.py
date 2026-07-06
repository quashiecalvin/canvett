from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.session import get_db
from database import models_job, models_candidate, models_activity

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/")
def get_stats(db: Session = Depends(get_db)):
    active_postings = (
        db.query(models_job.Job)
        .filter(models_job.Job.status == "Active")
        .count()
    )
    total_applicants = db.query(models_candidate.Candidate).count()
    resumes_ranked = db.query(models_candidate.Score).count()
    avg_score = db.query(func.avg(models_candidate.Score.overall_score)).scalar()
    avg_score = round(avg_score, 1) if avg_score is not None else 0

    return {
        "active_postings": active_postings,
        "total_applicants": total_applicants,
        "resumes_ranked": resumes_ranked,
        "avg_match_score": avg_score,
    }


@router.get("/top-candidates")
def top_candidates(db: Session = Depends(get_db)):
    jobs = db.query(models_job.Job).all()

    top = []
    for job in jobs:
        result = (
            db.query(models_candidate.Score, models_candidate.Candidate)
            .join(
                models_candidate.Candidate,
                models_candidate.Score.candidate_id == models_candidate.Candidate.id,
            )
            .filter(models_candidate.Score.job_id == job.id)
            .order_by(models_candidate.Score.overall_score.desc())
            .first()
        )
        if result is not None:
            score, candidate = result
            top.append({
                "candidate_id": candidate.id,
                "name": candidate.name,
                "job_title": job.title,
                "overall_score": score.overall_score,
            })

    top.sort(key=lambda c: c["overall_score"], reverse=True)
    return top[:5]


@router.get("/activity")
def recent_activity(db: Session = Depends(get_db)):
    activities = (
        db.query(models_activity.Activity)
        .order_by(models_activity.Activity.created_at.desc())
        .limit(6)
        .all()
    )
    return [
        {
            "id": a.id,
            "description": a.description,
            "created_at": a.created_at,
        }
        for a in activities
    ]
