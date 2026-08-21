from enum import Enum
from datetime import datetime

from pydantic import BaseModel


class JobStatus(str, Enum):
    ACTIVE = "Active"
    IN_REVIEW = "In review"
    CLOSED = "Closed"


class JobCreate(BaseModel):
    title: str
    department: str
    employment_type: str
    location: str
    description: str
    required_skills: list[str]
    experience_requirement: str
    education_requirement: str


class JobUpdate(JobCreate):
    status: JobStatus


class JobOut(JobCreate):
    id: int
    status: str
    posted_date: datetime
    applicant_count: int
    ranked_count: int
    experience_requirement: str | None = None
    education_requirement: str | None = None
