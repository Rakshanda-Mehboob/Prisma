"""
config.py — Centralized application configuration.

Loads settings from environment variables with safe development defaults.
Supports .env files via python-dotenv if available.
"""

import os
from typing import List

# Attempt to load .env file if python-dotenv is installed
try:
    from dotenv import load_dotenv
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

ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# ── Database ───────────────────────────────────────────────────────────────────
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")

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
GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
