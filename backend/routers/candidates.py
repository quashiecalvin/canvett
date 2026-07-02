import os
import shutil

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from database.session import get_db
from database import models_job, models_candidate
from services.parser import parse_resume
from services.scoring import score_candidate
from schemas.score import ScoreOut

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
        name=file.filename.rsplit(".", 1)[0],
        filename=file.filename,
        resume_text=resume_text,
        job_id=job_id,
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    result = score_candidate(resume_text, job.description, job.required_skills)

    score = models_candidate.Score(
        candidate_id=candidate.id,
        job_id=job_id,
        overall_score=result["overall_score"],
        skills_score=result["skills_score"],
        experience_score=result["experience_score"],
        education_score=result["education_score"],
        matched_skills=result["matched_skills"],
        unmatched_skills=result["unmatched_skills"],
    )
    db.add(score)
    db.commit()
    db.refresh(score)

    return score
