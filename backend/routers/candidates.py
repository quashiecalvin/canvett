import os
import shutil

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from database.session import get_db
from database import models_job, models_candidate, models_application
from services.parser import parse_resume, extract_name
from services.scoring import score_candidate, get_config
from services.activity import log_activity
from schemas.score import ScoreOut, RankedCandidate

router = APIRouter(prefix="/candidates", tags=["Candidates"])

UPLOAD_DIR = "uploads"


@router.post("/upload", response_model=ScoreOut)
def upload_resume(
    job_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    job = db.query(models_job.Job).filter(models_job.Job.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume_text = parse_resume(file_path)

    candidate = models_candidate.Candidate(
        name=extract_name(resume_text),
        filename=file.filename,
        resume_text=resume_text,
        job_id=job_id,
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    result = score_candidate(
        resume_text,
        job.description,
        job.required_skills,
        job.experience_requirement,
        job.education_requirement,
        get_config(db),
    )

    score = models_candidate.Score(
        candidate_id=candidate.id,
        job_id=job_id,
        overall_score=result["overall_score"],
        skills_score=result["skills_score"],
        experience_score=result["experience_score"],
        education_score=result["education_score"],
        matched_skills=result["matched_skills"],
        unmatched_skills=result["unmatched_skills"],
        duration_verified=result["duration_verified"],
    )
    db.add(score)
    db.commit()
    db.refresh(score)

    log_activity(db, f"Resume uploaded and ranked for {job.title}: {candidate.name}")

    return score


@router.get("/ranking/{job_id}", response_model=list[RankedCandidate])
def get_ranking(job_id: int, db: Session = Depends(get_db)):
    results = (
        db.query(models_candidate.Score, models_candidate.Candidate)
        .join(
            models_candidate.Candidate,
            models_candidate.Score.candidate_id == models_candidate.Candidate.id,
        )
        .filter(models_candidate.Score.job_id == job_id)
        .order_by(models_candidate.Score.overall_score.desc())
        .all()
    )

    portal_ids = {
        row[0]
        for row in db.query(models_application.Application.candidate_id)
        .filter(models_application.Application.job_id == job_id)
        .all()
    }

    ranked = []
    for score, candidate in results:
        ranked.append(
            RankedCandidate(
                candidate_id=candidate.id,
                name=candidate.name,
                filename=candidate.filename,
                overall_score=score.overall_score,
                skills_score=score.skills_score,
                experience_score=score.experience_score,
                education_score=score.education_score,
                matched_skills=score.matched_skills,
                unmatched_skills=score.unmatched_skills,
                duration_verified=score.duration_verified,
                source="portal" if candidate.id in portal_ids else "recruiter",
            )
        )
    return ranked


@router.post("/rerank/{job_id}")
def rerank(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models_job.Job).filter(models_job.Job.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    candidates = (
        db.query(models_candidate.Candidate)
        .filter(models_candidate.Candidate.job_id == job_id)
        .all()
    )

    for candidate in candidates:
        result = score_candidate(
            candidate.resume_text,
            job.description,
            job.required_skills,
            job.experience_requirement,
            job.education_requirement,
            get_config(db),
        )
        score = (
            db.query(models_candidate.Score)
            .filter(models_candidate.Score.candidate_id == candidate.id)
            .filter(models_candidate.Score.job_id == job_id)
            .first()
        )
        if score:
            score.overall_score = result["overall_score"]
            score.skills_score = result["skills_score"]
            score.experience_score = result["experience_score"]
            score.education_score = result["education_score"]
            score.matched_skills = result["matched_skills"]
            score.unmatched_skills = result["unmatched_skills"]
            score.duration_verified = result["duration_verified"]

    db.commit()
    log_activity(db, f"Candidates re-ranked for {job.title}")
    return {"message": "Re-ranked", "count": len(candidates)}


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models_candidate.Candidate).filter(models_candidate.Candidate.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")

    db.query(models_candidate.Score).filter(models_candidate.Score.candidate_id == candidate_id).delete()
    db.delete(candidate)
    db.commit()
    return {"message": "Candidate deleted"}


@router.get("/{candidate_id}/detail")
def get_candidate_detail(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models_candidate.Candidate).filter(models_candidate.Candidate.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")

    score = (
        db.query(models_candidate.Score)
        .filter(models_candidate.Score.candidate_id == candidate_id)
        .first()
    )

    application = (
        db.query(models_application.Application)
        .filter(models_application.Application.candidate_id == candidate_id)
        .first()
    )

    return {
        "id": candidate.id,
        "source": "portal" if application else "recruiter",
        "contact_email": application.contact_email if application else None,
        "contact_phone": application.contact_phone if application else None,
        "application_method": application.method if application else None,
        "name": candidate.name,
        "filename": candidate.filename,
        "resume_text": candidate.resume_text,
        "overall_score": score.overall_score if score else 0,
        "skills_score": score.skills_score if score else 0,
        "experience_score": score.experience_score if score else 0,
        "education_score": score.education_score if score else 0,
        "matched_skills": score.matched_skills if score else [],
        "unmatched_skills": score.unmatched_skills if score else [],
        "duration_verified": score.duration_verified if score else True,
    }
