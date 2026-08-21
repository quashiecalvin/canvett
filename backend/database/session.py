from database.connection import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        # Leave the connection in a usable state for the next request instead of
        # returning it to the pool mid-transaction.
        db.rollback()
        raise
    finally:
        db.close()
