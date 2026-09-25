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


class GoogleAuth(BaseModel):
    """A Google sign-in attempt.

    `credential` is the ID token Google Identity Services hands the browser.
    On a first-time user the frontend calls once with no role (to verify the
    person and learn we need a role), then again with the role they picked.
    """

    credential: str
    role: Optional[str] = None
    company_name: Optional[str] = None

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v):
        if v is not None and v not in ("recruiter", "seeker"):
            raise ValueError("Role must be either 'recruiter' or 'seeker'")
        return v


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    # "password" or "google" - lets the UI hide password-only controls
    # (change password) for accounts that sign in with Google.
    auth_provider: str = "password"
    company_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    skills: Optional[str] = None
    bio: Optional[str] = None
    company_logo: Optional[str] = None
    photo: Optional[str] = None
    website: Optional[str] = None
    languages: Optional[str] = None
    pref_field: Optional[str] = None
    pref_job_type: Optional[str] = None
    pref_location: Optional[str] = None
    onboarded: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class GoogleAuthResult(BaseModel):
    """Result of a Google sign-in.

    Returning user, or a first-timer who has now picked a role: `access_token`
    and `user` are set and `needs_role` is False. A first-timer we have verified
    but who still needs to choose a role: `needs_role` is True and we echo back
    their verified name/email to show on the role step.
    """

    needs_role: bool = False
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[UserOut] = None


class ProfileUpdate(BaseModel):
    full_name: str
    email: EmailStr
    company_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    skills: Optional[str] = None
    bio: Optional[str] = None
    company_logo: Optional[str] = None
    photo: Optional[str] = None
    website: Optional[str] = None
    languages: Optional[str] = None
    pref_field: Optional[str] = None
    pref_job_type: Optional[str] = None
    pref_location: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_length(cls, v):
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters")
        return v


class AccountDelete(BaseModel):
    password: str


class OnboardingData(BaseModel):
    pref_field: Optional[str] = None
    pref_job_type: Optional[str] = None
    pref_location: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[str] = None
