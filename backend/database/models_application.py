from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database.connection import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)

    method = Column(String, nullable=False)   # "upload" or "form"
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Under review")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
