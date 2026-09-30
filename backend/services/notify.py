from database import models_notification


def create_notification(db, user_id: int, title: str, body: str | None = None, link: str | None = None):
    """Add an in-app notification for a user. Caller commits the session."""
    note = models_notification.Notification(
        user_id=user_id, title=title, body=body, link=link
    )
    db.add(note)
    return note
