"""
auth/router.py — Authentication and student profile endpoints.

Routes:
  POST  /auth/register  → Register a new student account
  POST  /auth/login     → Authenticate credentials and return signed JWT
  GET   /auth/me        → Return currently authenticated user profile
  PATCH /auth/profile   → Update mutable profile fields (department, living situation)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserOut,
    ProfileUpdateRequest,
)
from auth.utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


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
    return user


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

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the profile data of the currently authenticated user."""
    return current_user


@router.patch("/profile", response_model=UserOut)
def update_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update optional profile attributes (department, living_situation).
    Immutable credentials (email, CMS number, password) are protected against modification here.
    """
    if payload.department is not None:
        current_user.department = payload.department.strip() or None
    if payload.living_situation is not None:
        current_user.living_situation = payload.living_situation.strip() or None
    db.commit()
    db.refresh(current_user)
    return current_user
