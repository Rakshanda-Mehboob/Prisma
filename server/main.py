"""
main.py — FastAPI application entrypoint.

Startup:
  - Creates all SQLite tables (app.db) on first run via Base.metadata.create_all()
  - Mounts all routers with correct prefixes
  - Enables CORS for the React frontend (http://localhost:5173 in dev)

Run with:
  uvicorn main:app --reload

API docs auto-generated at:
  http://localhost:8000/docs   (Swagger UI)
  http://localhost:8000/redoc  (ReDoc)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models  # noqa: F401 — must import so SQLAlchemy registers all models

from auth.router import router as auth_router
from assessment.router import router as assessment_router
from interventions.router import router as interventions_router
from dashboard.router import router as dashboard_router

# Create all tables in app.db on startup (idempotent — safe to run multiple times)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TPB Cyberbullying Intervention System",
    description=(
        "A Theory of Planned Behavior (TPB)-based system for assessing and "
        "improving student attitudes toward cyberbullying. "
        "Senior Design Project — Faculty of Computing, Riphah International University."
    ),
    version="1.0.0",
    contact={
        "name": "Rakshanda Mehboob, Ayesha Khalil, Areeza Afridi",
        "email": "fyp@riphah.edu.pk",
    },
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Allow the React dev server (localhost:5173) and any deployed frontend origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(assessment_router)
app.include_router(interventions_router)
app.include_router(dashboard_router)


@app.get("/", tags=["Health"])
def health_check():
    """Health check — confirms the API is running."""
    return {
        "status": "online",
        "project": "TPB Cyberbullying Intervention System",
        "docs": "/docs",
    }
