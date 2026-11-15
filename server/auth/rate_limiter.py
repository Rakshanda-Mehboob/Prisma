import time
from collections import defaultdict
from typing import Optional
from fastapi import HTTPException, status, Request

# In-memory store: IP -> list of timestamps for forgot-password
_forgot_password_ip_attempts: dict[str, list[float]] = defaultdict(list)

# In-memory store: Email -> list of timestamps for forgot-password
_forgot_password_email_attempts: dict[str, list[float]] = defaultdict(list)

# In-memory store: Email -> timestamp of last forgot-password request (for 60s cooldown)
_forgot_password_last_request: dict[str, float] = {}

# In-memory store: IP -> list of timestamps for verify-otp
_verify_otp_ip_attempts: dict[str, list[float]] = defaultdict(list)

# In-memory store: Email -> list of timestamps for verify-otp
_verify_otp_email_attempts: dict[str, list[float]] = defaultdict(list)

# In-memory store: IP -> list of timestamps for reset-password
_reset_password_ip_attempts: dict[str, list[float]] = defaultdict(list)

# In-memory store: Email -> list of timestamps for reset-password
_reset_password_email_attempts: dict[str, list[float]] = defaultdict(list)

# In-memory store: Email -> count of wrong OTP attempts
_otp_wrong_attempts: dict[str, int] = defaultdict(int)

# Configuration limits
MAX_FORGOT_REQUESTS_PER_HOUR = 10
FORGOT_COOLDOWN_SECONDS = 60
MAX_VERIFY_REQUESTS_PER_WINDOW = 15
MAX_RESET_REQUESTS_PER_WINDOW = 15
WINDOW_SECONDS = 3600  # 1 hour
SHORT_WINDOW_SECONDS = 300  # 5 minutes


def _get_client_ip(request: Request) -> str:
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def check_forgot_password_rate_limit(request: Request, email: str) -> None:
    """
    Enforces rate limiting on OTP generation:
      - Max 1 request per 60 seconds per email
      - Max 10 requests per hour per IP and per email
    """
    now = time.time()
    client_ip = _get_client_ip(request)
    clean_email = email.strip().lower()

    # 1. 60-second cooldown per email
    last_req = _forgot_password_last_request.get(clean_email)
    if last_req is not None and (now - last_req) < FORGOT_COOLDOWN_SECONDS:
        remaining = int(FORGOT_COOLDOWN_SECONDS - (now - last_req))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {remaining} seconds before requesting another verification code.",
        )

    # 2. IP rate limit (max 10/hour)
    ip_history = [t for t in _forgot_password_ip_attempts[client_ip] if now - t < WINDOW_SECONDS]
    _forgot_password_ip_attempts[client_ip] = ip_history
    if len(ip_history) >= MAX_FORGOT_REQUESTS_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset requests from this IP address. Please wait an hour before trying again.",
        )

    # 3. Email rate limit (max 10/hour)
    email_history = [t for t in _forgot_password_email_attempts[clean_email] if now - t < WINDOW_SECONDS]
    _forgot_password_email_attempts[clean_email] = email_history
    if len(email_history) >= MAX_FORGOT_REQUESTS_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset requests for this email address. Please wait an hour before trying again.",
        )

    _forgot_password_last_request[clean_email] = now
    _forgot_password_ip_attempts[client_ip].append(now)
    _forgot_password_email_attempts[clean_email].append(now)


def check_verify_otp_rate_limit(request: Request, email: str) -> None:
    """
    Enforces rate limits on /verify-otp:
      - Max 15 attempts per 5 minutes per IP
      - Max 15 attempts per 5 minutes per email
    """
    now = time.time()
    client_ip = _get_client_ip(request)
    clean_email = email.strip().lower()

    ip_history = [t for t in _verify_otp_ip_attempts[client_ip] if now - t < SHORT_WINDOW_SECONDS]
    _verify_otp_ip_attempts[client_ip] = ip_history
    if len(ip_history) >= MAX_VERIFY_REQUESTS_PER_WINDOW:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification attempts from this IP address. Please wait a few minutes before trying again.",
        )

    email_history = [t for t in _verify_otp_email_attempts[clean_email] if now - t < SHORT_WINDOW_SECONDS]
    _verify_otp_email_attempts[clean_email] = email_history
    if len(email_history) >= MAX_VERIFY_REQUESTS_PER_WINDOW:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification attempts for this account. Please wait a few minutes before trying again.",
        )

    _verify_otp_ip_attempts[client_ip].append(now)
    _verify_otp_email_attempts[clean_email].append(now)


def check_reset_password_rate_limit(request: Request, email: Optional[str] = None) -> None:
    """
    Enforces rate limits on /reset-password:
      - Max 15 attempts per 5 minutes per IP
      - Max 15 attempts per 5 minutes per email (if email is known)
    """
    now = time.time()
    client_ip = _get_client_ip(request)

    ip_history = [t for t in _reset_password_ip_attempts[client_ip] if now - t < SHORT_WINDOW_SECONDS]
    _reset_password_ip_attempts[client_ip] = ip_history
    if len(ip_history) >= MAX_RESET_REQUESTS_PER_WINDOW:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset attempts from this IP address. Please wait a few minutes before trying again.",
        )

    if email:
        clean_email = email.strip().lower()
        email_history = [t for t in _reset_password_email_attempts[clean_email] if now - t < SHORT_WINDOW_SECONDS]
        _reset_password_email_attempts[clean_email] = email_history
        if len(email_history) >= MAX_RESET_REQUESTS_PER_WINDOW:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many password reset attempts for this account. Please wait a few minutes before trying again.",
            )
        _reset_password_email_attempts[clean_email].append(now)

    _reset_password_ip_attempts[client_ip].append(now)


def record_wrong_otp_attempt(email: str) -> int:
    """Increment and return the wrong OTP attempt count for an email."""
    clean = email.strip().lower()
    _otp_wrong_attempts[clean] += 1
    return _otp_wrong_attempts[clean]


def get_wrong_otp_attempts(email: str) -> int:
    """Return the current wrong OTP attempt count for an email."""
    clean = email.strip().lower()
    return _otp_wrong_attempts.get(clean, 0)


def reset_wrong_otp_attempts(email: str) -> None:
    """Reset the wrong OTP attempt count for an email."""
    clean = email.strip().lower()
    _otp_wrong_attempts.pop(clean, None)


def clear_rate_limits() -> None:
    """Reset all in-memory rate limiters and attempt counters (for test suites)."""
    _forgot_password_ip_attempts.clear()
    _forgot_password_email_attempts.clear()
    _forgot_password_last_request.clear()
    _verify_otp_ip_attempts.clear()
    _verify_otp_email_attempts.clear()
    _reset_password_ip_attempts.clear()
    _reset_password_email_attempts.clear()
    _otp_wrong_attempts.clear()
