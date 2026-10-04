"""
auth/router.py — Authentication and student profile endpoints.

Routes:
  POST  /auth/register         → Register a new student account
  POST  /auth/login            → Authenticate credentials and return signed JWT
  GET   /auth/me               → Return currently authenticated user profile
  PATCH /auth/profile          → Update mutable profile fields (department, living situation)
  POST  /auth/student-profile  → Create or update detailed onboarding behavioral profile
  GET   /auth/student-profile  → Retrieve the student's behavioral profile
"""

import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import User, StudentProfile
from schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserOut,
    ProfileUpdateRequest,
    StudentProfileIn,
    StudentProfileOut,
)
from auth.utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


def _serialize_user(user: User) -> dict:
    """Build UserOut-compatible dict, computing has_profile."""
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "cms_number": user.cms_number,
        "role": user.role,
        "department": user.department,
        "living_situation": user.living_situation,
        "created_at": user.created_at,
        "login_count": user.login_count,
        "has_profile": user.student_profile is not None,
    }


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new student account.
    Validates uniqueness of email and CMS identifier, hashes password with bcrypt,
    and returns the created user entity (excluding confidential credentials).
    """
    clean_email = payload.email.strip().lower()
    clean_cms = payload.cms_number.strip().upper()

    # Verify absence of duplicate email or CMS number
    if db.query(User).filter(func.lower(User.email) == clean_email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    if db.query(User).filter(func.upper(User.cms_number) == clean_cms).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this CMS number already exists.",
        )

    user = User(
        full_name=payload.full_name.strip(),
        email=clean_email,
        cms_number=clean_cms,
        password_hash=hash_password(payload.password),
        department=payload.department.strip() if payload.department else None,
        living_situation=payload.living_situation.strip() if payload.living_situation else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _serialize_user(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Validate email and password, issuing a signed JWT access bearer token upon success.
    Frontend persists this token in localStorage and includes it in Authorization headers.
    """
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    user.login_count = (user.login_count or 0) + 1
    db.commit()

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the profile data of the currently authenticated user."""
    # Refresh to get student_profile relationship
    db.refresh(current_user)
    return _serialize_user(current_user)


@router.patch("/profile", response_model=UserOut)
def update_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update optional profile attributes (full_name, department, living_situation).
    Immutable credentials (email, CMS number, password) are protected against modification here.
    """
    if payload.full_name is not None:
        name = payload.full_name.strip()
        if name:
            current_user.full_name = name
    if payload.department is not None:
        current_user.department = payload.department.strip() or None
    if payload.living_situation is not None:
        current_user.living_situation = payload.living_situation.strip() or None
    db.commit()
    db.refresh(current_user)
    return _serialize_user(current_user)


@router.post(
    "/student-profile",
    response_model=StudentProfileOut,
    status_code=status.HTTP_201_CREATED,
)
def create_or_update_student_profile(
    payload: StudentProfileIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create or update the student's detailed behavioral profile.
    Used by the onboarding flow after registration.
    Sensitive experience fields are entirely optional.
    """
    # Check if profile already exists (upsert)
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )

    def _json(val):
        """Serialize list to JSON string for storage, or None."""
        if val is None:
            return None
        return json.dumps(val)

    profile_data = {
        "degree_program": payload.degree_program,
        "academic_year": payload.academic_year,
        "faculty_department": payload.faculty_department,
        "learning_environment": payload.learning_environment,
        "class_size": payload.class_size,
        "platforms_used": _json(payload.platforms_used),
        "online_activity_level": payload.online_activity_level,
        "main_online_activities": _json(payload.main_online_activities),
        "university_activity_level": payload.university_activity_level,
        "participation_types": _json(payload.participation_types),
        "social_role": payload.social_role,
        "encounter_frequency": payload.encounter_frequency,
        "experience_types": _json(payload.experience_types),
        "experience_role": payload.experience_role,
    }

    if profile:
        for key, value in profile_data.items():
            setattr(profile, key, value)
    else:
        profile = StudentProfile(user_id=current_user.id, **profile_data)
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return _deserialize_profile(profile)


@router.get("/student-profile", response_model=StudentProfileOut)
def get_student_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the student's behavioral profile for onboarding pre-filling."""
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile found. Please complete the onboarding first.",
        )
    return _deserialize_profile(profile)


def _deserialize_profile(profile: StudentProfile) -> dict:
    """Convert stored JSON strings back to Python lists for API response."""
    import json as _json_mod

    def _parse(val):
        if val is None:
            return None
        try:
            return _json_mod.loads(val)
        except Exception:
            return None

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "degree_program": profile.degree_program,
        "academic_year": profile.academic_year,
        "faculty_department": profile.faculty_department,
        "learning_environment": profile.learning_environment,
        "class_size": profile.class_size,
        "platforms_used": _parse(profile.platforms_used),
        "online_activity_level": profile.online_activity_level,
        "main_online_activities": _parse(profile.main_online_activities),
        "university_activity_level": profile.university_activity_level,
        "participation_types": _parse(profile.participation_types),
        "social_role": profile.social_role,
        "encounter_frequency": profile.encounter_frequency,
        "experience_types": _parse(profile.experience_types),
        "experience_role": profile.experience_role,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    }
