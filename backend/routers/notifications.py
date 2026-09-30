from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.session import get_db
from database import models_notification, models_user
from services.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
def list_notifications(
    db: Session = Depends(get_db),
    user: models_user.User = Depends(get_current_user),
):
    rows = (
        db.query(models_notification.Notification)
        .filter(models_notification.Notification.user_id == user.id)
        .order_by(models_notification.Notification.created_at.desc())
        .limit(50)
        .all()
    )
    items = [
        {
            "id": n.id,
            "title": n.title,
            "body": n.body,
            "link": n.link,
            "read": n.read,
            "created_at": n.created_at,
        }
        for n in rows
    ]
    unread = sum(1 for n in rows if not n.read)
    return {"items": items, "unread": unread}


@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_read(
    db: Session = Depends(get_db),
    user: models_user.User = Depends(get_current_user),
):
    (
        db.query(models_notification.Notification)
        .filter(
            models_notification.Notification.user_id == user.id,
            models_notification.Notification.read.is_(False),
        )
        .update({"read": True})
    )
    db.commit()


@router.post("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(get_current_user),
):
    (
        db.query(models_notification.Notification)
        .filter(
            models_notification.Notification.id == notification_id,
            models_notification.Notification.user_id == user.id,
        )
        .update({"read": True})
    )
    db.commit()
