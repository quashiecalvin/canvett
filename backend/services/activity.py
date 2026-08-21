import logging

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import models_activity

logger = logging.getLogger(__name__)


def log_activity(db: Session, description: str, recruiter_id: int = None):
    """Records an activity entry.

    The activity feed is a side effect of an action that has already been
    committed, so a failure here is logged and swallowed rather than failing the
    request the user just completed successfully.
    """
    activity = models_activity.Activity(description=description, recruiter_id=recruiter_id)
    db.add(activity)
    try:
        db.commit()
    except SQLAlchemyError:
        logger.exception("Could not record activity: %s", description)
        db.rollback()
