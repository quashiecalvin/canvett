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


@router.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    scores = db.query(models_candidate.Score).all()

    bands = {"Strong (75-100%)": 0, "Moderate (50-74%)": 0, "Weak (below 50%)": 0}
    for s in scores:
        if s.overall_score >= 75:
            bands["Strong (75-100%)"] += 1
        elif s.overall_score >= 50:
            bands["Moderate (50-74%)"] += 1
        else:
            bands["Weak (below 50%)"] += 1

    score_distribution = [{"band": k, "count": v} for k, v in bands.items()]

    jobs = db.query(models_job.Job).all()
    per_job = []
    for job in jobs:
        job_scores = [s.overall_score for s in scores if s.job_id == job.id]
        per_job.append({
            "job_title": job.title,
            "candidates": len(job_scores),
            "avg_score": round(sum(job_scores) / len(job_scores), 1) if job_scores else 0,
        })

    per_job.sort(key=lambda j: j["candidates"], reverse=True)

    return {
        "score_distribution": score_distribution,
        "per_job": per_job,
    }
