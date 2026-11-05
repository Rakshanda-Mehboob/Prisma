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
import secrets
import hashlib
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy import func
from sqlalchemy.orm import Session
from auth.rate_limiter import check_forgot_password_rate_limit

from database import get_db
from models import User, StudentProfile, UserProfile, PasswordResetToken
from schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserOut,
    ProfileUpdateRequest,
    StudentProfileIn,
    StudentProfileOut,
    UserProfileIn,
    UserProfileOut,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
    VerifyTokenResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)
from auth.utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from auth.email_service import send_password_reset_email
from config import PASSWORD_RESET_TOKEN_EXPIRE_MINUTES, FRONTEND_URL, DEBUG, SMTP_HOST

router = APIRouter(prefix="/auth", tags=["Auth"])


def _serialize_user(user: User) -> dict:
    """Build UserOut-compatible dict, computing has_profile."""
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "cms_number": user.cms_number,
        "role": user.role,
        "university": user.university,
        "department": user.department,
        "living_situation": user.living_situation,
        "created_at": user.created_at,
        "login_count": user.login_count,
        "has_profile": user.student_profile is not None,
    }


@router.get("/check-availability")
def check_availability(
    field: str,
    value: str,
    db: Session = Depends(get_db),
):
    """
    Check if a unique field (SAP ID / CMS roll number or email) is already registered in the database.
    Used for real-time asynchronous inline validation on the frontend.
    """
    val = value.strip()
    if not val:
        return {"available": True, "field": field, "message": ""}

    field_clean = field.strip().lower()
    if field_clean in ("sap_id", "cms_number", "sap"):
        exists = db.query(User).filter(func.upper(User.cms_number) == val.upper()).first() is not None
        if exists:
            return {
                "available": False,
                "field": "cms_number",
                "message": "This SAP ID is already registered.",
            }
        return {
            "available": True,
            "field": "cms_number",
            "message": "SAP ID is available.",
        }

    elif field_clean == "email":
        exists = db.query(User).filter(func.lower(User.email) == val.lower()).first() is not None
        if exists:
            return {
                "available": False,
                "field": "email",
                "message": "This email is already registered.",
            }
        return {
            "available": True,
            "field": "email",
            "message": "Email is available.",
        }

    return {"available": True, "field": field, "message": ""}


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new student account with rich profile context.
    Validates uniqueness of email and CMS identifier, hashes password with bcrypt,
    creates User, UserProfile, and StudentProfile in a unified transaction.
    """
    clean_email = payload.email.strip().lower()

    # Generate CMS identifier if omitted
    if payload.cms_number and payload.cms_number.strip():
        clean_cms = payload.cms_number.strip().upper()
    else:
        import time
        clean_cms = f"CMS-{int(time.time())}"

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
        full_name=(payload.full_name or '').strip() or clean_email.split('@')[0],
        email=clean_email,
        cms_number=clean_cms,
        password_hash=hash_password(payload.password),
        university=payload.university.strip() if payload.university else None,
        department=payload.department.strip() if payload.department else None,
        living_situation=payload.living_situation.strip() if payload.living_situation else None,
    )
    db.add(user)
    db.flush()

    def _json(val):
        return json.dumps(val) if val is not None else None

    platforms = payload.social_media_platforms or payload.platforms_used or None
    frequency = payload.social_media_frequency or payload.online_activity_level or None
    online_comm = payload.online_communities or None
    digital_patterns = payload.digital_usage_patterns or None

    # Create UserProfile with only values the user actually provided
    user_prof = UserProfile(
        user_id=user.id,
        age_group=payload.age_group,
        gender=payload.gender,
        department=payload.department.strip() if payload.department else None,
        academic_level=payload.academic_level.strip() if payload.academic_level else None,
        academic_year=payload.academic_year.strip() if payload.academic_year else None,
        living_situation=payload.living_situation.strip() if payload.living_situation else None,
        social_media_platforms=_json(platforms),
        social_media_frequency=frequency,
        online_communities=_json(online_comm),
        digital_usage_patterns=_json(digital_patterns),
    )
    db.add(user_prof)

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
    Update optional profile attributes (department, living_situation, university).
    Immutable credentials (email, CMS number, password) are protected against modification here.
    """
    if payload.department is not None:
        current_user.department = payload.department.strip() or None
    if payload.living_situation is not None:
        current_user.living_situation = payload.living_situation.strip() or None
    if payload.university is not None:
        current_user.university = payload.university.strip() or None
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
    Used by the onboarding flow after registration or profile management.
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
        "university": payload.university,
        "degree_program": payload.degree_program,
        "academic_level": payload.academic_level,
        "academic_year": payload.academic_year,
        "faculty_department": payload.faculty_department or payload.degree_program,
        "living_situation": payload.living_situation,
        "learning_environment": payload.learning_environment,
        "class_size": payload.class_size,
        "platforms_used": _json(payload.platforms_used),
        "online_activity_level": payload.online_activity_level,
        "main_online_activities": _json(payload.main_online_activities),
        "main_interaction_with": payload.main_interaction_with,
        "university_groups_participation": payload.university_groups_participation,
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

    # Sync primary fields back to User for fast query
    if payload.degree_program:
        current_user.department = payload.degree_program
    elif payload.faculty_department:
        current_user.department = payload.faculty_department
    if payload.living_situation:
        current_user.living_situation = payload.living_situation
    if payload.university:
        current_user.university = payload.university

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
        "university": profile.university,
        "degree_program": profile.degree_program,
        "academic_level": profile.academic_level,
        "academic_year": profile.academic_year,
        "faculty_department": profile.faculty_department,
        "living_situation": profile.living_situation,
        "learning_environment": profile.learning_environment,
        "class_size": profile.class_size,
        "platforms_used": _parse(profile.platforms_used),
        "online_activity_level": profile.online_activity_level,
        "main_online_activities": _parse(profile.main_online_activities),
        "main_interaction_with": profile.main_interaction_with,
        "university_groups_participation": profile.university_groups_participation,
        "university_activity_level": profile.university_activity_level,
        "participation_types": _parse(profile.participation_types),
        "social_role": profile.social_role,
        "encounter_frequency": profile.encounter_frequency,
        "experience_types": _parse(profile.experience_types),
        "experience_role": profile.experience_role,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    }


@router.get("/user-profile", response_model=UserProfileOut)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve personalized UserProfile for adaptive scenario generation."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found.",
        )

    def _parse(val):
        if not val:
            return []
        try:
            return json.loads(val)
        except Exception:
            return []

    return UserProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        age_group=profile.age_group,
        gender=profile.gender,
        department=profile.department,
        academic_level=profile.academic_level,
        academic_year=profile.academic_year,
        living_situation=profile.living_situation,
        social_media_platforms=_parse(profile.social_media_platforms),
        social_media_frequency=profile.social_media_frequency,
        online_communities=_parse(profile.online_communities),
        digital_usage_patterns=_parse(profile.digital_usage_patterns),
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )




def _generate_otp() -> str:
    """Generate a cryptographically secure 6-digit numeric OTP string."""
    return "".join(secrets.choice("0123456789") for _ in range(6))


def _hash_otp(email: str, otp: str) -> str:
    """Compute SHA-256 hash of email + OTP for tamper-resistant DB storage."""
    combined = f"{email.strip().lower()}:{otp.strip()}"
    return hashlib.sha256(combined.encode("utf-8")).hexdigest()


def _hash_token(token: str) -> str:
    """Compute SHA-256 hexadecimal hash of a raw reset token for secure DB storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


# ── Password Recovery Endpoints (In-App OTP Verification Flow) ─────────────

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Initiates the in-app password recovery flow:
      1. Verifies that the email exists in the database.
         If not registered, returns 404: "No account found with this email address."
      2. Enforces rate limiting on repeated requests.
      3. Generates a secure 6-digit numeric OTP.
      4. Invalidates any previous unused OTP/tokens for this user.
      5. Stores only the SHA-256 hash of the OTP in the database with a 10-minute expiry.
      6. Returns the OTP directly in the response for in-app demonstration (FYP mode).
    """
    email_clean = payload.email.strip().lower()

    # Rate limit check (prevents rapid-fire brute forcing)
    check_forgot_password_rate_limit(request=request, email=email_clean)

    user = db.query(User).filter(func.lower(User.email) == email_clean).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address.",
        )

    # Invalidate previous unused OTP tokens for this user (only 1 active OTP allowed)
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False,
    ).update({"used": True})

    # Generate cryptographically secure 6-digit OTP
    otp_code = _generate_otp()
    otp_hash = _hash_otp(email_clean, otp_code)
    # OTP is valid for 10 minutes
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    token_record = PasswordResetToken(
        user_id=user.id,
        token=otp_hash,
        expires_at=expires_at,
        used=False,
    )
    db.add(token_record)
    db.commit()

    print(f"\n========================================================")
    print(f"  [PRISMA PASSWORD RESET OTP]")
    print(f"  User:   {user.full_name} ({user.email})")
    print(f"  OTP:    {otp_code}")
    print(f"  Valid:  10 minutes")
    print(f"========================================================\n")

    return ForgotPasswordResponse(
        message=f"Verification OTP generated for {user.email}.",
        otp=otp_code,
    )


@router.post("/verify-otp", response_model=VerifyOTPResponse)
def verify_otp(
    payload: VerifyOTPRequest,
    db: Session = Depends(get_db),
):
    """
    Validates the 6-digit OTP entered by the user.
    If valid and unexpired:
      - Marks the OTP as used.
      - Issues a single-use session reset token valid for 15 minutes.
    """
    email_clean = payload.email.strip().lower()
    otp_clean = payload.otp.strip()

    if len(otp_clean) != 6 or not otp_clean.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid 6-digit numeric OTP code.",
        )

    user = db.query(User).filter(func.lower(User.email) == email_clean).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address.",
        )

    otp_hash = _hash_otp(email_clean, otp_clean)
    token_record = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.token == otp_hash,
        )
        .first()
    )

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect OTP code. Please check the code and try again.",
        )

    if token_record.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This OTP has already been used. Please request a new code.",
        )

    if token_record.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This OTP has expired. Please request a new verification code.",
        )

    # Invalidate the OTP token immediately
    token_record.used = True

    # Generate a secure session reset token so the user can submit their new password
    reset_session_raw = secrets.token_urlsafe(32)
    reset_session_hash = _hash_token(reset_session_raw)
    reset_expires = datetime.utcnow() + timedelta(minutes=15)

    session_record = PasswordResetToken(
        user_id=user.id,
        token=reset_session_hash,
        expires_at=reset_expires,
        used=False,
    )
    db.add(session_record)
    db.commit()

    return VerifyOTPResponse(
        valid=True,
        reset_token=reset_session_raw,
        message="OTP verified successfully. You may now create your new password.",
    )


@router.get("/verify-reset-token", response_model=VerifyTokenResponse)
def verify_reset_token(
    token: str,
    db: Session = Depends(get_db),
):
    """
    Validates whether a reset token is active, unused, and not expired.
    """
    token_clean = token.strip() if token else ""
    if not token_clean or len(token_clean) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or malformed reset token.",
        )

    token_hash = _hash_token(token_clean)
    token_record = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token == token_hash)
        .first()
    )

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset session is invalid. Please request a new code.",
        )

    if token_record.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset session has already been used. Please request a new code.",
        )

    if token_record.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset session has expired. Please request a new code.",
        )

    user = db.query(User).filter(User.id == token_record.user_id).first()
    user_email = user.email if user else None

    return VerifyTokenResponse(
        valid=True,
        email=user_email,
        message="Session token is valid and active.",
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Consumes a valid reset token (or direct OTP) and updates user password with newly hashed bcrypt string.
    Invalidates any remaining tokens for this user.
    """
    if payload.confirm_password and payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match.",
        )

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long.",
        )

    active_token = (payload.reset_token or payload.token or "").strip()
    user = None
    token_record = None

    if active_token:
        token_hash = _hash_token(active_token)
        token_record = (
            db.query(PasswordResetToken)
            .filter(PasswordResetToken.token == token_hash)
            .first()
        )
        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid password reset token. Please request a new code.",
            )
        if token_record.used:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This reset session has already been used. Please request a new code.",
            )
        if token_record.expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This reset session has expired. Please request a new code.",
            )
        user = db.query(User).filter(User.id == token_record.user_id).first()

    elif payload.email and payload.otp:
        # Direct OTP fallback
        email_clean = payload.email.strip().lower()
        otp_hash = _hash_otp(email_clean, payload.otp.strip())
        user = db.query(User).filter(func.lower(User.email) == email_clean).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )
        token_record = (
            db.query(PasswordResetToken)
            .filter(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.token == otp_hash,
            )
            .first()
        )
        if not token_record or token_record.used or token_record.expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code.",
            )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing reset token or verification code.",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user account associated with this request could not be found.",
        )

    # Hash new password
    user.password_hash = hash_password(payload.new_password)

    # Invalidate all tokens for this user
    if token_record:
        token_record.used = True

    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False,
    ).update({"used": True})

    db.commit()

    return ResetPasswordResponse(
        message="Your password has been reset successfully. Please sign in with your new password."
    )
