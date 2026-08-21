import logging
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from database.session import get_db
from database import models_job, models_candidate, models_application
from database import models_user
from services.auth import require_recruiter
from services.parser import (
    MAX_RESUME_SIZE,
    parse_resume,
    extract_name,
    validate_resume_upload,
)
from services.scoring import score_candidate, get_config
from services.activity import log_activity
from schemas.score import ScoreOut, RankedCandidate

router = APIRouter(prefix="/candidates", tags=["Candidates"])

logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploads"


def _own_job_or_404(db, job_id, user):
    job = (
        db.query(models_job.Job)
        .filter(models_job.Job.id == job_id, models_job.Job.recruiter_id == user.id)
        .first()
    )
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


def _own_candidate_or_404(db, candidate_id, user):
    candidate = (
        db.query(models_candidate.Candidate)
        .join(models_job.Job, models_candidate.Candidate.job_id == models_job.Job.id)
        .filter(models_candidate.Candidate.id == candidate_id, models_job.Job.recruiter_id == user.id)
        .first()
    )
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.post("/upload", response_model=ScoreOut)
def upload_resume(
    job_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_recruiter),
):
    job = _own_job_or_404(db, job_id, user)

    contents = file.file.read(MAX_RESUME_SIZE + 1)
    try:
        filename = validate_resume_upload(file.filename, contents)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    file_path = os.path.join(
        UPLOAD_DIR,
        f"{uuid.uuid4().hex}{os.path.splitext(filename)[1].lower()}",
    )
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
    except OSError as err:
        logger.exception("Could not store uploaded resume %s", filename)
        raise HTTPException(
            status_code=500,
            detail="We could not store that file. Please try again.",
        ) from err

    # A ResumeParseError here is turned into a 400 with its message by the
    # application-wide handler in main.py.
    resume_text = parse_resume(file_path)
    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="We couldn't read any text from that file. Please check it and try again.",
        )

    # Scored before anything is written so a scoring failure cannot leave an
    # unranked candidate behind.
    result = score_candidate(
        resume_text,
        job.description,
        job.required_skills,
        job.experience_requirement,
        job.education_requirement,
        get_config(db),
    )

    candidate = models_candidate.Candidate(
        name=extract_name(resume_text),
        filename=filename,
        resume_text=resume_text,
        job_id=job_id,
    )
    db.add(candidate)
    db.flush()

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

    log_activity(db, f"Resume uploaded and ranked for {job.title}: {candidate.name}", job.recruiter_id)

    return score


@router.get("/ranking/{job_id}", response_model=list[RankedCandidate])
def get_ranking(
    job_id: int,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_recruiter),
):
    _own_job_or_404(db, job_id, user)
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
def rerank(
    job_id: int,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_recruiter),
):
    job = _own_job_or_404(db, job_id, user)

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
    log_activity(db, f"Candidates re-ranked for {job.title}", job.recruiter_id)
    return {"message": "Re-ranked", "count": len(candidates)}


@router.delete("/{candidate_id}")
def delete_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_recruiter),
):
    candidate = _own_candidate_or_404(db, candidate_id, user)

    db.query(models_application.Application).filter(models_application.Application.candidate_id == candidate_id).delete()
    db.query(models_candidate.Score).filter(models_candidate.Score.candidate_id == candidate_id).delete()
    db.delete(candidate)
    db.commit()
    return {"message": "Candidate deleted"}


@router.get("/{candidate_id}/detail")
def get_candidate_detail(
    candidate_id: int,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_recruiter),
):
    candidate = _own_candidate_or_404(db, candidate_id, user)

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
