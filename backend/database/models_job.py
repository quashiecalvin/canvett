from sqlalchemy import Column, Integer, String, DateTime, ARRAY, Text, ForeignKey
from sqlalchemy.sql import func

from database.connection import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    employment_type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(ARRAY(String), nullable=False)
    experience_requirement = Column(Text, nullable=True)
    education_requirement = Column(Text, nullable=True)
    status = Column(String, default="Active")
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    posted_date = Column(DateTime(timezone=True), server_default=func.now())
    applicant_count = Column(Integer, default=0)
    ranked_count = Column(Integer, default=0)
