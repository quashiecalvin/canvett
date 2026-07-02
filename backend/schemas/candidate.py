from pydantic import BaseModel


class CandidateBase(BaseModel):
    name: str
    filename: str
    job_id: int


class CandidateOut(CandidateBase):
    id: int
    resume_text: str
    