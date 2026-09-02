from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.session import get_db
from database import (
    models_user,
    models_job,
    models_candidate,
    models_application,
    models_saved,
    models_activity,
)
from schemas.user import UserRegister, UserLogin, UserOut, TokenOut, ProfileUpdate, PasswordChange, AccountDelete, OnboardingData
from services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_seeker,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = (
        db.query(models_user.User)
        .filter(models_user.User.email == payload.email.lower())
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    user = models_user.User(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role=payload.role,
        company_name=(payload.company_name or "").strip() or None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.role)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = (
        db.query(models_user.User)
        .filter(models_user.User.email == payload.email.lower())
        .first()
    )

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token(user.id, user.role)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(user: models_user.User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(get_current_user),
):
    user.full_name = payload.full_name

    new_email = payload.email.lower()
    if new_email != user.email:
        existing = (
            db.query(models_user.User)
            .filter(models_user.User.email == new_email, models_user.User.id != user.id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists",
            )
        user.email = new_email

    if user.role == "recruiter":
        user.company_name = (payload.company_name or "").strip() or None
        if payload.company_logo is not None:
            user.company_logo = payload.company_logo.strip() or None
    user.phone = (payload.phone or "").strip() or None
    user.location = (payload.location or "").strip() or None
    user.headline = (payload.headline or "").strip() or None
    user.skills = (payload.skills or "").strip() or None
    user.bio = (payload.bio or "").strip() or None
    user.website = (payload.website or "").strip() or None
    user.languages = (payload.languages or "").strip() or None
    user.pref_field = (payload.pref_field or "").strip() or None
    user.pref_job_type = (payload.pref_job_type or "").strip() or None
    user.pref_location = (payload.pref_location or "").strip() or None
    if payload.photo is not None:
        user.photo = payload.photo.strip() or None
    db.commit()
    db.refresh(user)
    return user


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your current password is incorrect",
        )
    user.password_hash = hash_password(payload.new_password)
    db.commit()


@router.post("/delete-account", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    payload: AccountDelete,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(get_current_user),
):
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect",
        )

    # 1. This account's own saved-job bookmarks
    db.query(models_saved.SavedJob).filter(
        models_saved.SavedJob.user_id == user.id
    ).delete(synchronize_session=False)

    # 2. Applications this account submitted (as a seeker) + the candidate rows they created
    my_candidate_ids = [
        a.candidate_id
        for a in db.query(models_application.Application)
        .filter(models_application.Application.user_id == user.id)
        .all()
    ]
    db.query(models_application.Application).filter(
        models_application.Application.user_id == user.id
    ).delete(synchronize_session=False)
    if my_candidate_ids:
        db.query(models_candidate.Score).filter(
            models_candidate.Score.candidate_id.in_(my_candidate_ids)
        ).delete(synchronize_session=False)
        db.query(models_candidate.Candidate).filter(
            models_candidate.Candidate.id.in_(my_candidate_ids)
        ).delete(synchronize_session=False)

    # 3. Jobs this account posted (as a recruiter) and everything under them
    job_ids = [
        j.id
        for j in db.query(models_job.Job)
        .filter(models_job.Job.recruiter_id == user.id)
        .all()
    ]
    if job_ids:
        db.query(models_saved.SavedJob).filter(
            models_saved.SavedJob.job_id.in_(job_ids)
        ).delete(synchronize_session=False)
        db.query(models_application.Application).filter(
            models_application.Application.job_id.in_(job_ids)
        ).delete(synchronize_session=False)
        db.query(models_candidate.Score).filter(
            models_candidate.Score.job_id.in_(job_ids)
        ).delete(synchronize_session=False)
        db.query(models_candidate.Candidate).filter(
            models_candidate.Candidate.job_id.in_(job_ids)
        ).delete(synchronize_session=False)
        db.query(models_job.Job).filter(
            models_job.Job.id.in_(job_ids)
        ).delete(synchronize_session=False)

    # 4. This recruiter's activity log
    db.query(models_activity.Activity).filter(
        models_activity.Activity.recruiter_id == user.id
    ).delete(synchronize_session=False)

    # 5. The account itself
    db.delete(user)
    db.commit()


@router.post("/onboarding", response_model=UserOut)
def complete_onboarding(
    payload: OnboardingData,
    db: Session = Depends(get_db),
    user: models_user.User = Depends(require_seeker),
):
    if payload.pref_field is not None:
        user.pref_field = payload.pref_field.strip() or None
    if payload.pref_job_type is not None:
        user.pref_job_type = payload.pref_job_type.strip() or None
    if payload.pref_location is not None:
        user.pref_location = payload.pref_location.strip() or None
    if payload.location is not None:
        user.location = payload.location.strip() or None
    if payload.skills is not None:
        user.skills = payload.skills.strip() or None
    user.onboarded = True
    db.commit()
    db.refresh(user)
    return user
