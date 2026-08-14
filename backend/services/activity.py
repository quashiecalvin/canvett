from sqlalchemy.orm import Session
from database import models_activity


def log_activity(db: Session, description: str, recruiter_id: int = None):
    activity = models_activity.Activity(description=description, recruiter_id=recruiter_id)
    db.add(activity)
    db.commit()
