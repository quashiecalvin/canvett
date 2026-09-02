from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func

from database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    company_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    headline = Column(String, nullable=True)
    skills = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    company_logo = Column(Text, nullable=True)
    photo = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    languages = Column(String, nullable=True)
    pref_field = Column(String, nullable=True)
    pref_job_type = Column(String, nullable=True)
    pref_location = Column(String, nullable=True)
    onboarded = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
