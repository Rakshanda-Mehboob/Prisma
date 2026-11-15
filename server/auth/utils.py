"""
auth/utils.py — JWT token creation, verification, and bcrypt password hashing.

Provides authentication utilities and the `get_current_user` FastAPI dependency
used to protect endpoints and identify student sessions across the platform.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import bcrypt

from database import get_db
from models import User
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# ── OAuth2 Scheme ──────────────────────────────────────────────────────────────
# Reads "Authorization: Bearer <token>" from incoming HTTP request headers (optional for cookie fallback)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


# ── Password Hashing & Verification ────────────────────────────────────────────
def hash_password(plain_password: str) -> str:
    """
    Hashes a plain-text password using bcrypt with a randomly generated salt.
    Returns the decoded UTF-8 hash string suitable for database storage.
    """
    pwd_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies that a plain-text candidate password matches a stored bcrypt hash.
    Safely handles malformed hashes without throwing uncaught exceptions.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


# ── JWT Token Lifecycle ────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a cryptographically signed HMAC-SHA256 (HS256) JWT access token.
    Payload dictionary must include user identifier `sub`.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    request: Request = None,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that extracts, decodes, and validates the JWT.
    Retrieves the corresponding `User` record from the database.
    Extracts token from either:
      1. Authorization: Bearer <token> header (API clients / pytest TestClient)
      2. HttpOnly access_token cookie (browsers protected against XSS)
    Raises HTTP 401 Unauthorized if the token is missing, expired, or invalid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1. Check Bearer token from Authorization header
    raw_token = token
    # 2. Fall back to secure HttpOnly cookie if header is not present
    if not raw_token and request and hasattr(request, "cookies"):
        raw_token = request.cookies.get("access_token") or request.cookies.get("tpb_token")

    if not raw_token:
        raise credentials_exception

    try:
        payload = jwt.decode(raw_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user
