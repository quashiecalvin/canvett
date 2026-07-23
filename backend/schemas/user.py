from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, model_validator


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str
    company_name: Optional[str] = None

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v):
        if v not in ("recruiter", "seeker"):
            raise ValueError("Role must be either 'recruiter' or 'seeker'")
        return v

    @field_validator("password")
    @classmethod
    def password_must_be_reasonable(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @model_validator(mode="after")
    def recruiter_needs_company(self):
        if self.role == "recruiter" and not (self.company_name or "").strip():
            raise ValueError("Company name is required for recruiter accounts")
        return self


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    company_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
