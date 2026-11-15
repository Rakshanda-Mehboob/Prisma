"""
tests/test_password_reset.py
=============================
Comprehensive unit and integration test suite for password recovery:
  1. No OTP returned in HTTP response (production / SMTP mode).
  2. Demo mode returns OTP only when DEBUG=True and SMTP is not configured.
  3. Unknown and known emails return the exact same 200 status and message.
  4. 5-attempt lockout permanently invalidates the OTP.
  5. Expired OTP returns generic 400 error.
  6. Used OTP returns generic 400 error.
  7. Old direct email+OTP path removed from /reset-password (returns 400).
  8. Password changes successfully and new password allows login (old password fails).
  9. Minimum new password length 8 enforced (shorter rejected).
  10. Rate limiting (1 request per 60s per email) enforced with 429.
  11. SMTP dispatch sends email when SMTP is configured.
"""

import sys
import os
import unittest.mock as mock
from datetime import datetime, timedelta
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Ensure server package root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import Base, get_db
import models
from main import app
from auth.utils import hash_password
from auth.router import _hash_otp, _hash_token
from auth.rate_limiter import clear_rate_limits
import config

# In-memory SQLite for isolated test execution
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
Base.metadata.create_all(bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db_and_rate_limits():
    """Ensure clean database and fresh rate limits for every single test."""
    clear_rate_limits()
    db = TestingSessionLocal()
    db.query(models.PasswordResetToken).delete()
    db.query(models.User).delete()

    # Create standard student user
    user = models.User(
        id=1,
        full_name="Zainab Tariq",
        email="zainab.tariq@riphah.edu.pk",
        cms_number="CMS-9988",
        password_hash=hash_password("OldPassword123"),
        role="student",
        university="Riphah International University",
        department="Computer Science",
    )
    db.add(user)
    db.commit()
    db.close()
    yield
    clear_rate_limits()


# ─── 1. No OTP in HTTP Response (Production / SMTP mode) ───────────────────────

def test_no_otp_in_response_when_smtp_configured():
    with mock.patch.object(config, "DEBUG", False), \
         mock.patch.object(config, "SMTP_HOST", "smtp.gmail.com"), \
         mock.patch.object(config, "SMTP_USER", "noreply@gmail.com"):
        res = client.post("/auth/forgot-password", json={"email": "zainab.tariq@riphah.edu.pk"})
        assert res.status_code == 200
        data = res.json()
        assert data["otp"] is None
        assert "verification code has been sent" in data["message"]


def test_no_otp_in_response_when_debug_false_even_without_smtp():
    with mock.patch.object(config, "DEBUG", False), \
         mock.patch.object(config, "SMTP_HOST", None), \
         mock.patch.object(config, "SMTP_USER", None):
        res = client.post("/auth/forgot-password", json={"email": "zainab.tariq@riphah.edu.pk"})
        assert res.status_code == 200
        data = res.json()
        assert data["otp"] is None


# ─── 2. Demo Mode returns OTP only when DEBUG=True and SMTP not configured ─────

def test_demo_mode_returns_otp():
    with mock.patch.object(config, "DEBUG", True), \
         mock.patch.object(config, "SMTP_HOST", None), \
         mock.patch.object(config, "SMTP_USER", None):
        res = client.post("/auth/forgot-password", json={"email": "zainab.tariq@riphah.edu.pk"})
        assert res.status_code == 200
        data = res.json()
        assert data["otp"] is not None
        assert len(data["otp"]) == 6
        assert data["otp"].isdigit()


# ─── 3. Same Response for Unknown Email (Anti-Enumeration) ─────────────────────

def test_same_response_for_unknown_email():
    with mock.patch.object(config, "DEBUG", False), \
         mock.patch.object(config, "SMTP_HOST", "smtp.gmail.com"), \
         mock.patch.object(config, "SMTP_USER", "noreply@gmail.com"):
        res_known = client.post("/auth/forgot-password", json={"email": "zainab.tariq@riphah.edu.pk"})
        clear_rate_limits()
        res_unknown = client.post("/auth/forgot-password", json={"email": "stranger.unknown@riphah.edu.pk"})

        assert res_known.status_code == 200
        assert res_unknown.status_code == 200
        assert res_known.json()["message"] == res_unknown.json()["message"]
        assert res_known.json()["otp"] is None
        assert res_unknown.json()["otp"] is None


# ─── 4. Wrong OTP Rejected ─────────────────────────────────────────────────────

def test_wrong_otp_rejected():
    email = "zainab.tariq@riphah.edu.pk"
    db = TestingSessionLocal()
    otp_code = "654321"
    token_record = models.PasswordResetToken(
        user_id=1,
        email=email,
        token=_hash_otp(email, otp_code),
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        used=False,
        attempts=0,
    )
    db.add(token_record)
    db.commit()
    db.close()

    res = client.post("/auth/verify-otp", json={"email": email, "otp": "999999"})
    assert res.status_code == 400
    assert res.json()["detail"] == "Invalid or expired verification code."


# ─── 5. 5-Attempt Lockout Permanently Invalidates OTP ──────────────────────────

def test_five_attempt_lockout_invalidates_otp():
    email = "zainab.tariq@riphah.edu.pk"
    # Generate OTP in demo mode
    with mock.patch.object(config, "DEBUG", True), \
         mock.patch.object(config, "SMTP_HOST", None), \
         mock.patch.object(config, "SMTP_USER", None):
        res = client.post("/auth/forgot-password", json={"email": email})
        real_otp = res.json()["otp"]

    # 4 wrong attempts
    for i in range(4):
        v = client.post("/auth/verify-otp", json={"email": email, "otp": "000000"})
        assert v.status_code == 400
        assert v.json()["detail"] == "Invalid or expired verification code."

    # 5th wrong attempt triggers lockout
    v5 = client.post("/auth/verify-otp", json={"email": email, "otp": "000000"})
    assert v5.status_code == 400
    assert v5.json()["detail"] == "Invalid or expired verification code."

    # 6th attempt with the REAL / CORRECT OTP must be REJECTED
    v_real = client.post("/auth/verify-otp", json={"email": email, "otp": real_otp})
    assert v_real.status_code == 400
    assert v_real.json()["detail"] == "Invalid or expired verification code."


# ─── 5. Expired Code Rejected with Generic Message ────────────────────────────

def test_expired_code_rejected():
    email = "zainab.tariq@riphah.edu.pk"
    db = TestingSessionLocal()
    otp_code = "778899"
    token_record = models.PasswordResetToken(
        user_id=1,
        token=_hash_otp(email, otp_code),
        expires_at=datetime.utcnow() - timedelta(minutes=5),
        used=False,
    )
    db.add(token_record)
    db.commit()
    db.close()

    res = client.post("/auth/verify-otp", json={"email": email, "otp": otp_code})
    assert res.status_code == 400
    assert res.json()["detail"] == "Invalid or expired verification code."


# ─── 6. Used Code Rejected with Generic Message ───────────────────────────────

def test_used_code_rejected():
    email = "zainab.tariq@riphah.edu.pk"
    db = TestingSessionLocal()
    otp_code = "112233"
    token_record = models.PasswordResetToken(
        user_id=1,
        token=_hash_otp(email, otp_code),
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        used=True,
    )
    db.add(token_record)
    db.commit()
    db.close()

    res = client.post("/auth/verify-otp", json={"email": email, "otp": otp_code})
    assert res.status_code == 400
    assert res.json()["detail"] == "Invalid or expired verification code."


# ─── 7. Old Direct email+OTP Path Removed ─────────────────────────────────────

def test_old_direct_email_otp_path_removed():
    email = "zainab.tariq@riphah.edu.pk"
    # Attempt direct reset without reset_token
    payload = {
        "email": email,
        "otp": "123456",
        "new_password": "BrandNewPassword123!",
        "confirm_password": "BrandNewPassword123!",
    }
    res = client.post("/auth/reset-password", json=payload)
    assert res.status_code == 400
    assert "reset token is required" in res.json()["detail"].lower()


# ─── 8. Password Changes Successfully and Login Updated ───────────────────────

def test_password_changes_successfully_and_login():
    email = "zainab.tariq@riphah.edu.pk"
    # 1. Request OTP
    with mock.patch.object(config, "DEBUG", True), \
         mock.patch.object(config, "SMTP_HOST", None), \
         mock.patch.object(config, "SMTP_USER", None):
        f_res = client.post("/auth/forgot-password", json={"email": email})
        otp = f_res.json()["otp"]

    # 2. Verify OTP
    v_res = client.post("/auth/verify-otp", json={"email": email, "otp": otp})
    assert v_res.status_code == 200
    reset_token = v_res.json()["reset_token"]
    assert reset_token is not None

    # 3. Reset Password
    new_pw = "NewSecretPassword2026!"
    r_res = client.post("/auth/reset-password", json={
        "reset_token": reset_token,
        "new_password": new_pw,
        "confirm_password": new_pw,
    })
    assert r_res.status_code == 200
    assert "successfully" in r_res.json()["message"].lower()

    # 4. Old password fails
    old_login = client.post("/auth/login", json={"email": email, "password": "OldPassword123"})
    assert old_login.status_code == 401

    # 5. New password succeeds
    new_login = client.post("/auth/login", json={"email": email, "password": new_pw})
    assert new_login.status_code == 200
    assert "access_token" in new_login.json()


# ─── 9. Minimum Password Length 8 Enforced ────────────────────────────────────

def test_password_length_under_8_rejected():
    email = "zainab.tariq@riphah.edu.pk"
    with mock.patch.object(config, "DEBUG", True), \
         mock.patch.object(config, "SMTP_HOST", None), \
         mock.patch.object(config, "SMTP_USER", None):
        f_res = client.post("/auth/forgot-password", json={"email": email})
        otp = f_res.json()["otp"]

    v_res = client.post("/auth/verify-otp", json={"email": email, "otp": otp})
    reset_token = v_res.json()["reset_token"]

    # Submit 7-character password
    res = client.post("/auth/reset-password", json={
        "reset_token": reset_token,
        "new_password": "Pass123",
        "confirm_password": "Pass123",
    })
    # Rejected by either Pydantic validation (422) or router length check (400)
    assert res.status_code in (400, 422)


# ─── 10. Rate Limiting: 1 Code Request per 60 Seconds per Email ───────────────

def test_rate_limit_forgot_password_60s_cooldown():
    email = "zainab.tariq@riphah.edu.pk"
    # First request succeeds
    res1 = client.post("/auth/forgot-password", json={"email": email})
    assert res1.status_code == 200

    # Immediate second request for same email is rate limited
    res2 = client.post("/auth/forgot-password", json={"email": email})
    assert res2.status_code == 429
    assert "wait" in res2.json()["detail"].lower()


# ─── 11. Mock SMTP Dispatched When Configured ─────────────────────────────────

def test_mock_smtp_sent_when_configured():
    email = "zainab.tariq@riphah.edu.pk"
    mock_smtp_instance = mock.MagicMock()

    with mock.patch.object(config, "DEBUG", False), \
         mock.patch.object(config, "SMTP_HOST", "smtp.mailtrap.io"), \
         mock.patch.object(config, "SMTP_PORT", 587), \
         mock.patch.object(config, "SMTP_USER", "test_user"), \
         mock.patch.object(config, "SMTP_PASSWORD", "test_pass"), \
         mock.patch("smtplib.SMTP", return_value=mock_smtp_instance):
        res = client.post("/auth/forgot-password", json={"email": email})
        assert res.status_code == 200
        assert res.json()["otp"] is None

        # Verify SMTP server was called
        mock_smtp_instance.__enter__.return_value.sendmail.assert_called_once()
        call_args = mock_smtp_instance.__enter__.return_value.sendmail.call_args[0]
        # (from_address, to_address, message_string)
        assert call_args[1] == email


# ─── 12. Email Sending Function Called Directly ───────────────────────────────

def test_email_sending_function_called():
    email = "zainab.tariq@riphah.edu.pk"
    with mock.patch("auth.router.send_password_reset_otp_email") as mock_email_fn:
        res = client.post("/auth/forgot-password", json={"email": email})
        assert res.status_code == 200
        assert mock_email_fn.called
        call_kwargs = mock_email_fn.call_args.kwargs
        assert call_kwargs.get("email") == email
        otp_passed = call_kwargs.get("otp")
        assert len(otp_passed) == 6
        assert otp_passed.isdigit()


# ─── 13. Successful OTP Verification Creates Reset Token ──────────────────────

def test_successful_otp_verification_creates_reset_token():
    email = "zainab.tariq@riphah.edu.pk"
    db = TestingSessionLocal()
    otp_code = "445566"
    token_record = models.PasswordResetToken(
        user_id=1,
        email=email,
        token=_hash_otp(email, otp_code),
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        used=False,
        attempts=0,
    )
    db.add(token_record)
    db.commit()
    token_id = token_record.id
    db.close()

    res = client.post("/auth/verify-otp", json={"email": email, "otp": otp_code})
    assert res.status_code == 200
    data = res.json()
    assert data["message"] == "OTP verified successfully"
    assert "reset_token" in data
    assert data["reset_token"] is not None
    assert len(data["reset_token"]) >= 20
    # OTP itself must NEVER be returned
    assert "otp" not in data or data.get("otp") is None

    # Verify that the OTP record in the DB is now marked used
    db = TestingSessionLocal()
    updated = db.query(models.PasswordResetToken).filter_by(id=token_id).first()
    assert updated.used is True
    db.close()

