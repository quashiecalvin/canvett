from sqlalchemy.orm import Session
from database import models_activity


def log_activity(db: Session, description: str):
    activity = models_activity.Activity(description=description)
    db.add(activity)
    db.commit()
