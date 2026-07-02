from pydantic import BaseModel


class ScoreOut(BaseModel):
    candidate_id: int
    job_id: int
    overall_score: float
    skills_score: float
    experience_score: float
    education_score: float
    matched_skills: list[str]
    unmatched_skills: list[str]