"""
main.py — FastAPI application entrypoint and route aggregator.

Startup lifecycle:
  - Idempotently creates SQLite tables via Base.metadata.create_all(engine)
  - Configures CORS middleware for frontend clients (React/Vite development & production)
  - Mounts modular routers: Auth, Assessment, Interventions, Dashboard
  - Exposes health check endpoint and interactive API documentation (/docs, /redoc)

Execution:
  uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models  # noqa: F401 — registers all SQLAlchemy ORM models with Base metadata
from config import CORS_ORIGINS, CORS_ORIGIN_REGEX

from auth.router import router as auth_router
from assessment.router import router as assessment_router
from interventions.router import router as interventions_router
from dashboard.router import router as dashboard_router

# Initialize all database schema tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TPB Cyberbullying Intervention System",
    description=(
        "A Theory of Planned Behavior (TPB)-grounded psychoeducational system for assessing "
        "and improving university student attitudes, subjective norms, and perceived "
        "behavioral control regarding cyberbullying prevention. "
        "Faculty of Computing, Riphah International University."
    ),
    version="1.0.0",
    contact={
        "name": "Rakshanda Mehboob, Ayesha Khalil, Areeza Afridi",
        "email": "fyp@riphah.edu.pk",
    },
)

# ── Cross-Origin Resource Sharing (CORS) ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Route Mounting ─────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(assessment_router)
app.include_router(interventions_router)
app.include_router(dashboard_router)


# ── Health Check Endpoint ──────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    """Confirms operational status of the API server."""
    return {
        "status": "online",
        "project": "TPB Cyberbullying Intervention System",
        "docs": "/docs",
    }
