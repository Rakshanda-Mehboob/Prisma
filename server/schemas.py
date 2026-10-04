"""
schemas.py — Pydantic v2 request/response models for all API routes.
These are separate from SQLAlchemy models — they define the API contract.

v1.1 additions:
  - StudentProfileIn / StudentProfileOut for onboarding
  - UserOut extended with has_profile
  - AssessmentScores extended with behavioral_intention_score
  - AssessmentOut extended with behavioral_intention_score
  - ConstructScores / DashboardOut extended with behavioral_intention
"""

import warnings
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

warnings.filterwarnings(
    "ignore",
    message='Field name "construct" in "ScenarioOut" shadows an attribute in parent "BaseModel"',
    category=UserWarning,
)


# ──────────────────────────────────────────────
# AUTH
# ──────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    cms_number: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=6)
    department: Optional[str] = None
    living_situation: Optional[str] = None


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
    department: Optional[str] = None
    living_situation: Optional[str] = None
    created_at: datetime
    login_count: int = 0
    has_profile: bool = False

    model_config = {"from_attributes": True}


class ProfileUpdateRequest(BaseModel):
    """Payload for PATCH /auth/profile — mutable profile fields."""
    full_name: Optional[str] = Field(None, max_length=120)
    department: Optional[str] = Field(None, max_length=100)
    living_situation: Optional[str] = Field(None, max_length=100)


# ──────────────────────────────────────────────
# STUDENT PROFILE (Onboarding)
# ──────────────────────────────────────────────

class StudentProfileIn(BaseModel):
    """Full behavioral profile submitted during onboarding."""
    # Academic
    degree_program: Optional[str] = None
    academic_year: Optional[str] = None
    faculty_department: Optional[str] = None
    learning_environment: Optional[str] = None
    class_size: Optional[str] = None

    # Digital
    platforms_used: Optional[list[str]] = None          # multi-select
    online_activity_level: Optional[str] = None
    main_online_activities: Optional[list[str]] = None  # multi-select

    # Social
    university_activity_level: Optional[str] = None
    participation_types: Optional[list[str]] = None     # multi-select
    social_role: Optional[str] = None

    # Cyberbullying Experience (sensitive — all optional)
    encounter_frequency: Optional[str] = None
    experience_types: Optional[list[str]] = None        # multi-select
    experience_role: Optional[str] = None


class StudentProfileOut(BaseModel):
    """Serialized student profile for API responses."""
    id: int
    user_id: int
    degree_program: Optional[str] = None
    academic_year: Optional[str] = None
    faculty_department: Optional[str] = None
    learning_environment: Optional[str] = None
    class_size: Optional[str] = None
    platforms_used: Optional[list[str]] = None
    online_activity_level: Optional[str] = None
    main_online_activities: Optional[list[str]] = None
    university_activity_level: Optional[str] = None
    participation_types: Optional[list[str]] = None
    social_role: Optional[str] = None
    encounter_frequency: Optional[str] = None
    experience_types: Optional[list[str]] = None
    experience_role: Optional[str] = None
    created_at: datetime
    updated_at: datetime

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
    selected_score: int = Field(..., ge=1, le=7)


class AssessmentSubmitRequest(BaseModel):
    responses: list[AssessmentResponseIn]


class AssessmentScores(BaseModel):
    attitude_score: float
    subjective_norm_score: float
    pbc_score: float
    behavioral_intention_score: float
    overall_score: float
    weak_constructs: list[str]  # constructs below threshold


class AssessmentOut(BaseModel):
    id: int
    stage: str
    attitude_score: Optional[float]
    subjective_norm_score: Optional[float]
    pbc_score: Optional[float]
    behavioral_intention_score: Optional[float]
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
    behavioral_intention: Optional[float]


class ConstructDelta(BaseModel):
    attitude: Optional[float]
    subjective_norm: Optional[float]
    pbc: Optional[float]
    behavioral_intention: Optional[float]


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
