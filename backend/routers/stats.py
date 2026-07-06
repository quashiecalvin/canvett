from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.session import get_db
from database import models_job, models_candidate

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
