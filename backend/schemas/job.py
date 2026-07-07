from pydantic import BaseModel
from datetime import datetime


class JobCreate(BaseModel):
    title: str
    department: str
    employment_type: str
    location: str
    description: str
    required_skills: list[str]
    experience_requirement: str
    education_requirement: str


class JobOut(JobCreate):
    id: int
    status: str
    posted_date: datetime
    applicant_count: int
    ranked_count: int
    experience_requirement: str | None = None
    education_requirement: str | None = None
