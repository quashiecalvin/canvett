from sqlalchemy import Column, Integer, String, Text, Float, ARRAY, ForeignKey, Boolean
from database.connection import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    resume_text = Column(Text, nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)


class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    overall_score = Column(Float, nullable=False)
    skills_score = Column(Float, nullable=False)
    experience_score = Column(Float, nullable=False)
    education_score = Column(Float, nullable=False)
    matched_skills = Column(ARRAY(String), nullable=False)
    unmatched_skills = Column(ARRAY(String), nullable=False)
    duration_verified = Column(Boolean, default=True)
