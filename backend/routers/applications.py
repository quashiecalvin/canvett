from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.session import get_db
from database import models_job, models_candidate, models_user, models_application
from services.auth import require_seeker, get_current_user
from services.parser import (
    MAX_RESUME_SIZE,
    parse_resume_bytes,
    validate_resume_upload,
)
from services.scoring import score_for_job, build_score
from services.activity import log_activity
from services.jobs import get_active_job_or_404, company_name_for_job

router = APIRouter(prefix="/applications", tags=["Applications"])


# ---------- shared: score resume text and record the application ----------

def _create_application(db, job, user, resume_text, method, phone=None):
    already = (
        db.query(models_application.Application)
        .filter(
            models_application.Application.job_id == job.id,
            models_application.Application.user_id == user.id,
        )
        .first()
    )
    if already:
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    result = score_for_job(db, job, resume_text)

    candidate = models_candidate.Candidate(
        name=user.full_name,
        filename=f"{method}:{user.email}",
        resume_text=resume_text,
        job_id=job.id,
    )
    db.add(candidate)
    db.flush()

    db.add(build_score(candidate.id, job.id, result))

    application = models_application.Application(
        job_id=job.id,
        user_id=user.id,
        candidate_id=candidate.id,
        method=method,
        contact_email=user.email,
        contact_phone=(phone or "").strip() or None,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    log_activity(db, f"New application received for {job.title}", job.recruiter_id)

    return {
        "application_id": application.id,
        "extracted_text": resume_text,
        "matched_skills": result["matched_skills"],
        "unmatched_skills": result["unmatched_skills"],
        "duration_verified": result["duration_verified"],
    }


# ---------- path 1: upload a CV ----------

@router.post("/upload/{job_id}")
async def apply_by_upload(
    job_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_seeker),
):
    job = get_active_job_or_404(db, job_id)

    contents = await file.read(MAX_RESUME_SIZE + 1)
    try:
        filename = validate_resume_upload(file.filename, contents)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    # A ResumeParseError here is turned into a 400 with its message by the
    # application-wide handler in main.py.
    resume_text = parse_resume_bytes(filename, contents)
    if not resume_text or not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="We couldn't read any text from that file. Please check it and try again, or use the application form instead.",
        )

    return _create_application(db, job, user, resume_text, "upload")


# ---------- path 2: structured form ----------

class ExperienceEntry(BaseModel):
    job_title: str
    company: str
    start: str        # "June 2025"
    end: str          # "March 2025" or "Present"
    description: str = ""


class EducationEntry(BaseModel):
    qualification: str
    institution: str
    start: str
    end: str


class FormApplication(BaseModel):
    phone: str = ""
    summary: str = ""
    experience: list[ExperienceEntry] = []
    education: list[EducationEntry] = []
    skills: list[str] = []


def _assemble_resume_text(form: FormApplication) -> str:
    lines = []

    if form.summary.strip():
        lines.append("SUMMARY")
        lines.append(form.summary.strip())
        lines.append("")

    if form.experience:
        lines.append("EXPERIENCE")
        for e in form.experience:
            lines.append(e.job_title)
            lines.append(e.company)
            lines.append(f"{e.start} - {e.end}")
            if e.description.strip():
                lines.append(e.description.strip())
            lines.append("")

    if form.education:
        lines.append("EDUCATION")
        for ed in form.education:
            lines.append(ed.qualification)
            lines.append(ed.institution)
            lines.append(f"{ed.start} - {ed.end}")
            lines.append("")

    if form.skills:
        lines.append("SKILLS")
        lines.append(", ".join(form.skills))

    return "\n".join(lines)


@router.post("/form/{job_id}")
def apply_by_form(
    job_id: int,
    form: FormApplication,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_seeker),
):
    job = get_active_job_or_404(db, job_id)
    resume_text = _assemble_resume_text(form)
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Please fill in at least some of the form before submitting")
    return _create_application(db, job, user, resume_text, "form", form.phone)


# ---------- seeker: my applications ----------

@router.get("/mine")
def my_applications(
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_seeker),
):
    apps = (
        db.query(models_application.Application)
        .filter(models_application.Application.user_id == user.id)
        .order_by(models_application.Application.created_at.desc())
        .all()
    )
    result = []
    for app in apps:
        job = db.query(models_job.Job).filter(models_job.Job.id == app.job_id).first()
        result.append({
            "application_id": app.id,
            "job_id": app.job_id,
            "department": job.department if job else None,
            "job_title": job.title if job else "A role",
            "company": company_name_for_job(db, job),
            "location": job.location if job else "",
            "method": app.method,
            "status": app.status,
            "applied_on": app.created_at,
        })
    return result
