import time
from collections import defaultdict
from fastapi import HTTPException, status, Request

# In-memory store: IP -> list of timestamps
_forgot_password_attempts: dict[str, list[float]] = defaultdict(list)

# In-memory store: Email -> list of timestamps
_forgot_password_email_attempts: dict[str, list[float]] = defaultdict(list)

# Allow up to 10 OTP generation requests per hour per IP/email
MAX_REQUESTS_PER_HOUR = 10
WINDOW_SECONDS = 3600  # 1 hour


def check_forgot_password_rate_limit(request: Request, email: str) -> None:
    """
    Enforces rate limiting on OTP generation requests: max 10 requests per hour per IP and per email.
    Raises HTTPException(429) if exceeded.
    """
    now = time.time()
    client_ip = request.client.host if request.client else "unknown"
    clean_email = email.strip().lower()

    # 1. Clean up timestamps older than 1 hour for client IP
    ip_history = [t for t in _forgot_password_attempts[client_ip] if now - t < WINDOW_SECONDS]
    _forgot_password_attempts[client_ip] = ip_history

    if len(ip_history) >= MAX_REQUESTS_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset requests from this IP address. Please wait an hour before trying again.",
        )

    # 2. Clean up timestamps older than 1 hour for email
    email_history = [t for t in _forgot_password_email_attempts[clean_email] if now - t < WINDOW_SECONDS]
    _forgot_password_email_attempts[clean_email] = email_history

    if len(email_history) >= MAX_REQUESTS_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset requests for this email address. Please wait an hour before trying again.",
        )

    # Record current attempt
    _forgot_password_attempts[client_ip].append(now)
    _forgot_password_email_attempts[clean_email].append(now)
