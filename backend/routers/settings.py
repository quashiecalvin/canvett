from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.session import get_db
from database import models_settings

router = APIRouter(prefix="/settings", tags=["Settings"])


class SettingsUpdate(BaseModel):
    skills_weight: float
    experience_weight: float
    education_weight: float
    unverified_factor: float
    skill_threshold: float


def _get_or_create(db: Session):
    settings = db.query(models_settings.Settings).first()
    if settings is None:
        settings = models_settings.Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/")
def get_settings(db: Session = Depends(get_db)):
    s = _get_or_create(db)
    return {
        "skills_weight": s.skills_weight,
        "experience_weight": s.experience_weight,
        "education_weight": s.education_weight,
        "unverified_factor": s.unverified_factor,
        "skill_threshold": s.skill_threshold,
    }


@router.put("/")
def update_settings(updated: SettingsUpdate, db: Session = Depends(get_db)):
    total = updated.skills_weight + updated.experience_weight + updated.education_weight
    if abs(total - 1.0) > 0.001:
        raise HTTPException(
            status_code=400,
            detail="Scoring weights must add up to 100%.",
        )

    s = _get_or_create(db)
    s.skills_weight = updated.skills_weight
    s.experience_weight = updated.experience_weight
    s.education_weight = updated.education_weight
    s.unverified_factor = updated.unverified_factor
    s.skill_threshold = updated.skill_threshold
    db.commit()
    db.refresh(s)

    return {"message": "Settings updated"}
