import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.session import get_db
from database import models_job, models_candidate, models_user, models_application
from services.profile import extract_location, extract_years
from services.auth import require_seeker, get_current_user
from services.parser import (
    MAX_RESUME_SIZE,
    parse_resume_bytes,
    validate_resume_upload,
)
from services.scoring import score_for_job, build_score
from services.activity import log_activity
from services.jobs import get_active_job_or_404, company_name_for_job, company_logo_for_job
from services.notify import create_notification

router = APIRouter(prefix="/applications", tags=["Applications"])

UPLOAD_DIR = "uploads"


# ---------- shared: score resume text and record the application ----------

def _create_application(db, job, user, resume_text, method, phone=None, cv_filename=None, cv_path=None):
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
        email=user.email,
        cv_filename=cv_filename,
        cv_path=cv_path,
        location=extract_location(resume_text),
        years_experience=extract_years(resume_text),
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
    db.flush()

    # Confirmation notification for the applicant.
    create_notification(
        db,
        user.id,
        title="Application submitted",
        body=f"You applied to \u201c{job.title}\u201d. We'll let you know when the status changes.",
        link="/seeker/applications",
    )

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

    # Store the file so the seeker can reuse it for later applications and view it.
    stored_path = None
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        stored_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}{os.path.splitext(filename)[1].lower()}")
        with open(stored_path, "wb") as buffer:
            buffer.write(contents)
    except OSError:
        stored_path = None  # non-fatal: application still proceeds on the parsed text

    return _create_application(db, job, user, resume_text, "upload", cv_filename=filename, cv_path=stored_path)


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
            "company_logo": company_logo_for_job(db, job),
            "location": job.location if job else "",
            "method": app.method,
            "status": app.status,
            "applied_on": app.created_at,
            "updated_at": app.updated_at,
        })
    return result


@router.get("/status/{job_id}")
def application_status_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_seeker),
):
    """Whether the current seeker has already applied to this job, for the
    "Applied on <date>" state on the job pages."""
    app = (
        db.query(models_application.Application)
        .filter(
            models_application.Application.job_id == job_id,
            models_application.Application.user_id == user.id,
        )
        .first()
    )
    if not app:
        return {"applied": False}
    return {
        "applied": True,
        "status": app.status,
        "applied_on": app.created_at,
        "updated_at": app.updated_at,
    }


# ---------- reuse a previously uploaded CV ----------

def _latest_reusable(db, user):
    """The seeker's most recent upload application whose candidate still has a
    resume on record — the CV we offer to reuse."""
    apps = (
        db.query(models_application.Application)
        .filter(
            models_application.Application.user_id == user.id,
            models_application.Application.method == "upload",
        )
        .order_by(models_application.Application.created_at.desc())
        .all()
    )
    for app in apps:
        cand = db.query(models_candidate.Candidate).filter(models_candidate.Candidate.id == app.candidate_id).first()
        if cand and cand.resume_text and cand.resume_text.strip():
            job = db.query(models_job.Job).filter(models_job.Job.id == app.job_id).first()
            return app, cand, job
    return None, None, None


@router.get("/last-cv")
def last_cv(
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_seeker),
):
    app, cand, job = _latest_reusable(db, user)
    if not cand:
        return {"found": False}
    can_view = bool(cand.cv_path and os.path.exists(cand.cv_path))
    return {
        "found": True,
        "application_id": app.id,
        "filename": cand.cv_filename or "Your CV",
        "applied_on": app.created_at,
        "job_title": job.title if job else None,
        "can_view": can_view,
    }


@router.post("/reuse/{job_id}")
def reuse_cv(
    job_id: int,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_seeker),
):
    job = get_active_job_or_404(db, job_id)
    _app, cand, _job = _latest_reusable(db, user)
    if not cand:
        raise HTTPException(status_code=404, detail="You have no previously uploaded CV to reuse.")
    return _create_application(
        db, job, user, cand.resume_text, "upload",
        cv_filename=cand.cv_filename, cv_path=cand.cv_path,
    )


@router.get("/{application_id}/cv")
def download_cv(
    application_id: int,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_seeker),
):
    app = (
        db.query(models_application.Application)
        .filter(
            models_application.Application.id == application_id,
            models_application.Application.user_id == user.id,
        )
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    cand = db.query(models_candidate.Candidate).filter(models_candidate.Candidate.id == app.candidate_id).first()
    if not cand or not cand.cv_path or not os.path.exists(cand.cv_path):
        raise HTTPException(status_code=404, detail="No stored file for this application.")
    return FileResponse(cand.cv_path, filename=cand.cv_filename or "cv")
