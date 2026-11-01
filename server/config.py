"""
config.py — Centralized application configuration.

Loads settings from environment variables with safe development defaults.
Supports .env files via python-dotenv if available.
"""

import os
from pathlib import Path
from typing import List

# Attempt to load .env file if python-dotenv is installed
try:
    from dotenv import load_dotenv
    _server_env = Path(__file__).resolve().parent / ".env"
    if _server_env.exists():
        load_dotenv(dotenv_path=_server_env)
    _root_env = Path(__file__).resolve().parent.parent / ".env"
    if _root_env.exists():
        load_dotenv(dotenv_path=_root_env)
    load_dotenv()
except ImportError:
    pass

# ── Security & Authentication ──────────────────────────────────────────────────
_DEFAULT_DEV_SECRET = "tpb-fyp-super-secret-key-change-in-prod-2024"
SECRET_KEY: str = os.getenv("SECRET_KEY", _DEFAULT_DEV_SECRET)

if SECRET_KEY == _DEFAULT_DEV_SECRET:
    print(
        "[WARNING] SECRET_KEY environment variable not set. "
        "Using development fallback key. "
        "Please set a strong SECRET_KEY in production environments."
    )

# ── Debug / Development Mode ──────────────────────────────────────────────────
# Set DEBUG=true in .env ONLY during local development with no real SMTP configured.
# Never enable in production — it exposes password-reset URLs in API responses.
DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# ── Database ───────────────────────────────────────────────────────────────────
_default_db = (Path(__file__).resolve().parent / "app.db").as_posix()
DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{_default_db}")

# ── CORS Settings ──────────────────────────────────────────────────────────────
_cors_env = os.getenv("CORS_ORIGINS")
if _cors_env:
    CORS_ORIGINS: List[str] = [origin.strip() for origin in _cors_env.split(",") if origin.strip()]
else:
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

CORS_ORIGIN_REGEX: str = r"https?://(localhost|127\.0\.0\.1)(:[0-9]+)?"

# ── External AI Services ───────────────────────────────────────────────────────
OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")

# ── Password Recovery & Email Settings ─────────────────────────────────────────
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("PASSWORD_RESET_TOKEN_EXPIRE_MINUTES", "30"))
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

SMTP_HOST: str | None = os.getenv("SMTP_HOST")
SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER: str | None = os.getenv("SMTP_USER")
SMTP_PASSWORD: str | None = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "noreply@prisma-defense.edu.pk")
SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")
