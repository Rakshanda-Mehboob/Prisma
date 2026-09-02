"""
auth/router.py — Authentication endpoints.

Routes:
  POST /auth/register  → create new student account
  POST /auth/login     → validate credentials, return JWT
  GET  /auth/me        → return current user profile (JWT required)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import RegisterRequest, LoginRequest, TokenResponse, UserOut
from auth.utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new student account.
    Returns the created user (without password).
    """
    # Check for duplicate email or CMS number
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )
    if db.query(User).filter(User.cms_number == payload.cms_number).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this CMS number already exists."
        )

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        cms_number=payload.cms_number,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Validate email + password, return a signed JWT access token.
    The frontend stores this in localStorage and sends it as:
      Authorization: Bearer <token>
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return current_user
