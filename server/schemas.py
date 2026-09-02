"""
schemas.py — Pydantic v2 request/response models for all API routes.
These are separate from SQLAlchemy models — they define the API contract.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ──────────────────────────────────────────────
# AUTH
# ──────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    cms_number: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    cms_number: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# ASSESSMENT
# ──────────────────────────────────────────────

class ScenarioOptionOut(BaseModel):
    id: int
    option_text: str
    score: int

    model_config = {"from_attributes": True}


class ScenarioOut(BaseModel):
    id: int
    construct: str
    stage: str
    scenario_text: str
    question_text: str
    options: list[ScenarioOptionOut]

    model_config = {"from_attributes": True}


class AssessmentResponseIn(BaseModel):
    """A single question answer submitted by the student."""
    scenario_id: int
    selected_score: int = Field(..., ge=1, le=5)


class AssessmentSubmitRequest(BaseModel):
    responses: list[AssessmentResponseIn]


class AssessmentScores(BaseModel):
    attitude_score: float
    subjective_norm_score: float
    pbc_score: float
    weak_constructs: list[str]  # constructs below threshold


class AssessmentOut(BaseModel):
    id: int
    stage: str
    attitude_score: Optional[float]
    subjective_norm_score: Optional[float]
    pbc_score: Optional[float]
    submitted_at: datetime

    model_config = {"from_attributes": True}


class AssessmentStatusOut(BaseModel):
    pre_completed: bool
    post_completed: bool
    post_unlocked: bool   # True when all assigned interventions are done
    pre_assessment: Optional[AssessmentOut]
    post_assessment: Optional[AssessmentOut]


# ──────────────────────────────────────────────
# INTERVENTIONS
# ──────────────────────────────────────────────

class InterventionOut(BaseModel):
    id: int
    target_construct: str
    title: str
    content_type: str
    content_body: Optional[str]
    estimated_minutes: Optional[int]

    model_config = {"from_attributes": True}


class UserInterventionOut(BaseModel):
    progress_id: int
    status: str
    completed_at: Optional[datetime]
    intervention: InterventionOut

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# DASHBOARD
# ──────────────────────────────────────────────

class ConstructScores(BaseModel):
    attitude: Optional[float]
    subjective_norm: Optional[float]
    pbc: Optional[float]


class ConstructDelta(BaseModel):
    attitude: Optional[float]
    subjective_norm: Optional[float]
    pbc: Optional[float]


class DashboardOut(BaseModel):
    user: UserOut
    pre_scores: Optional[ConstructScores]
    post_scores: Optional[ConstructScores]
    deltas: Optional[ConstructDelta]
    total_interventions: int
    completed_interventions: int
    completion_percent: float
    feedback_text: list[str]       # personalized feedback messages
    post_unlocked: bool


# ──────────────────────────────────────────────
# FEEDBACK
# ──────────────────────────────────────────────

class FeedbackSubmitRequest(BaseModel):
    intervention_id: int
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None


class FeedbackOut(BaseModel):
    id: int
    intervention_id: int
    rating: Optional[int]
    comments: Optional[str]
    submitted_at: datetime

    model_config = {"from_attributes": True}
