"""
models.py — SQLAlchemy ORM models mirroring the schema in docs/schema.sql.
All tables are defined here. Base.metadata.create_all(engine) in main.py
creates app.db automatically on first run.

v1.1 additions:
  - StudentProfile: rich behavioral profile for AI personalization
  - Assessment.behavioral_intention_score: 4th TPB construct
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Integer, String, Text, Float, DateTime, ForeignKey, CheckConstraint, Boolean, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    cms_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(10), default="student")
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    living_situation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    university: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    login_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    assessments: Mapped[list["Assessment"]] = relationship("Assessment", back_populates="user")
    intervention_progress: Mapped[list["UserInterventionProgress"]] = relationship(
        "UserInterventionProgress", back_populates="user"
    )
    feedbacks: Mapped[list["Feedback"]] = relationship("Feedback", back_populates="user")
    student_profile: Mapped[Optional["StudentProfile"]] = relationship(
        "StudentProfile", back_populates="user", uselist=False
    )
    user_profile: Mapped[Optional["UserProfile"]] = relationship(
        "UserProfile", back_populates="user", uselist=False
    )
    reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(
        "PasswordResetToken", back_populates="user", cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint("role IN ('student', 'admin')", name="user_role_check"),
    )


class UserProfile(Base):
    """
    User_Profile table meeting Prisma Adaptive Assessment Intelligence Upgrade Requirement 5:
    Fields:
      user_id, age_group, department, academic_year, living_situation,
      social_media_platforms, social_media_frequency, online_communities, digital_usage_patterns.
    """
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # Personal Context
    age_group: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    academic_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    academic_year: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Living Context
    living_situation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Digital Behaviour
    social_media_platforms: Mapped[Optional[str]] = mapped_column(Text, nullable=True)    # JSON array
    social_media_frequency: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Online Interaction Patterns & Community Participation
    online_communities: Mapped[Optional[str]] = mapped_column(Text, nullable=True)        # JSON array
    digital_usage_patterns: Mapped[Optional[str]] = mapped_column(Text, nullable=True)    # JSON array

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="user_profile")


class ScenarioTemplate(Base):
    """
    Scenario_Template table meeting Requirement 5 & 6:
    Fields:
      scenario_id, category, platform_context, living_context,
      department_context, difficulty_level, tpb_dimension, scenario_text,
      question_text, answer_options, context_tags, personalization_tags,
      narrative_variations, questions_data.
    """
    __tablename__ = "scenario_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scenario_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    platform_context: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    living_context: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    department_context: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    difficulty_level: Mapped[int] = mapped_column(Integer, default=1)
    tpb_dimension: Mapped[str] = mapped_column(String(30), nullable=False)
    scenario_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    answer_options: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array of {text, score}
    context_tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array
    personalization_tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON object
    narrative_variations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array
    questions_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserScenarioHistory(Base):
    """
    Requirement 7 & Anti-Repetition Rules:
    Tracks which scenarios/templates were shown to a student to avoid identical scenarios
    and support gradual difficulty progression across pre and post assessments.
    """
    __tablename__ = "user_scenario_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    scenario_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("scenarios.id"), nullable=True)
    template_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("scenario_templates.id"), nullable=True)
    template_key: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    scenario_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    scenario_summary: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    stage: Mapped[str] = mapped_column(String(10), default="pre")
    difficulty_level: Mapped[int] = mapped_column(Integer, default=1)
    shown_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User")


class StudentProfile(Base):
    """
    Rich behavioral profile collected during onboarding.
    Used by the AI scenario generator to produce personalized, contextually
    relevant TPB assessment scenarios for each student.
    """
    __tablename__ = "student_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # ── Academic Profile ──────────────────────────────────────────────────────
    university: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    degree_program: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    academic_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    academic_year: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    faculty_department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    living_situation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    learning_environment: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    class_size: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # ── Digital Interaction Profile ───────────────────────────────────────────
    # JSON arrays stored as Text (SQLite-friendly)
    platforms_used: Mapped[Optional[str]] = mapped_column(Text, nullable=True)   # JSON array
    online_activity_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    main_online_activities: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array

    # ── Social Involvement Profile ────────────────────────────────────────────
    main_interaction_with: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    university_groups_participation: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    university_activity_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    participation_types: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array
    social_role: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)

    # ── Cyberbullying Experience Profile ─────────────────────────────────────
    encounter_frequency: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    experience_types: Mapped[Optional[str]] = mapped_column(Text, nullable=True)   # JSON array
    experience_role: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="student_profile")


class Scenario(Base):
    __tablename__ = "scenarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    construct: Mapped[str] = mapped_column(String(25), nullable=False)
    stage: Mapped[str] = mapped_column(String(5), nullable=False)
    scenario_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)

    # Extended context metadata for adaptive intelligence
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    platform_context: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    living_context: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    department_context: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    difficulty_level: Mapped[int] = mapped_column(Integer, default=1)

    # Relationships
    options: Mapped[list["ScenarioOption"]] = relationship("ScenarioOption", back_populates="scenario")
    responses: Mapped[list["AssessmentResponse"]] = relationship("AssessmentResponse", back_populates="scenario")

    __table_args__ = (
        CheckConstraint(
            "construct IN ('Attitude','SubjectiveNorm','PBC','BehavioralIntention')",
            name="scenario_construct_check"
        ),
        CheckConstraint("stage IN ('pre','post')", name="scenario_stage_check"),
    )


class ScenarioOption(Base):
    __tablename__ = "scenario_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scenario_id: Mapped[int] = mapped_column(Integer, ForeignKey("scenarios.id"), nullable=False)
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationship
    scenario: Mapped["Scenario"] = relationship("Scenario", back_populates="options")

    __table_args__ = (
        CheckConstraint("score BETWEEN 1 AND 7", name="option_score_check"),
    )


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    stage: Mapped[str] = mapped_column(String(5), nullable=False)
    attitude_score: Mapped[Optional[float]] = mapped_column(Float)
    subjective_norm_score: Mapped[Optional[float]] = mapped_column(Float)
    pbc_score: Mapped[Optional[float]] = mapped_column(Float)
    behavioral_intention_score: Mapped[Optional[float]] = mapped_column(Float)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="assessments")
    responses: Mapped[list["AssessmentResponse"]] = relationship(
        "AssessmentResponse", back_populates="assessment"
    )

    __table_args__ = (
        CheckConstraint("stage IN ('pre','post')", name="assessment_stage_check"),
    )


class AssessmentResponse(Base):
    __tablename__ = "assessment_responses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    assessment_id: Mapped[int] = mapped_column(Integer, ForeignKey("assessments.id"), nullable=False)
    scenario_id: Mapped[int] = mapped_column(Integer, ForeignKey("scenarios.id"), nullable=False)
    selected_score: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="responses")
    scenario: Mapped[["Scenario"]] = relationship("Scenario", back_populates="responses")

    __table_args__ = (
        CheckConstraint("selected_score BETWEEN 1 AND 7", name="response_score_check"),
    )


class Intervention(Base):
    __tablename__ = "interventions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    target_construct: Mapped[str] = mapped_column(String(25), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content_type: Mapped[str] = mapped_column(String(20), nullable=False)
    content_body: Mapped[Optional[str]] = mapped_column(Text)
    estimated_minutes: Mapped[Optional[int]] = mapped_column(Integer)

    # Relationships
    progress_records: Mapped[list["UserInterventionProgress"]] = relationship(
        "UserInterventionProgress", back_populates="intervention"
    )
    feedbacks: Mapped[list["Feedback"]] = relationship("Feedback", back_populates="intervention")

    __table_args__ = (
        CheckConstraint(
            "target_construct IN ('Attitude','SubjectiveNorm','PBC','BehavioralIntention')",
            name="intervention_construct_check"
        ),
        CheckConstraint(
            "content_type IN ('video','reading','quiz','case-study')",
            name="intervention_type_check"
        ),
    )


class UserInterventionProgress(Base):
    __tablename__ = "user_intervention_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    intervention_id: Mapped[int] = mapped_column(Integer, ForeignKey("interventions.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(15), default="assigned")
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="intervention_progress")
    intervention: Mapped["Intervention"] = relationship("Intervention", back_populates="progress_records")

    __table_args__ = (
        CheckConstraint(
            "status IN ('assigned','in-progress','completed')",
            name="progress_status_check"
        ),
    )


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    intervention_id: Mapped[int] = mapped_column(Integer, ForeignKey("interventions.id"), nullable=False)
    rating: Mapped[Optional[int]] = mapped_column(Integer)
    comments: Mapped[Optional[str]] = mapped_column(Text)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="feedbacks")
    intervention: Mapped["Intervention"] = relationship("Intervention", back_populates="feedbacks")

    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="feedback_rating_check"),
    )


# ── Scenario-Based Assessment Architecture ────────────────────────────────────
# These tables implement the 3-scenario, grouped-questions assessment model.

class AssessmentInstance(Base):
    """
    Top-level container for a single assessment sitting.
    Each user gets one per stage (pre / post).
    Links to exactly 3 AssessmentScenario rows.
    """
    __tablename__ = "assessment_instances"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    stage: Mapped[str] = mapped_column(String(5), nullable=False)  # 'pre' or 'post'
    status: Mapped[str] = mapped_column(String(20), default="generated")  # generated, in_progress, submitted
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Scores (filled after submission)
    attitude_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    subjective_norm_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    pbc_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    behavioral_intention_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User")
    scenarios: Mapped[list["AssessmentScenario"]] = relationship(
        "AssessmentScenario", back_populates="instance", order_by="AssessmentScenario.order_index"
    )

    __table_args__ = (
        CheckConstraint("stage IN ('pre','post')", name="instance_stage_check"),
        CheckConstraint(
            "status IN ('generated','in_progress','submitted')",
            name="instance_status_check",
        ),
    )


class AssessmentScenario(Base):
    """
    One of exactly 3 narrative scenarios within an assessment instance.
    Each scenario is a realistic cyberbullying situation tailored to the student's profile.
    Contains multiple questions that measure different TPB constructs.
    """
    __tablename__ = "assessment_scenarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    instance_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("assessment_instances.id"), nullable=False, index=True
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)  # 0, 1, 2
    scenario_text: Mapped[str] = mapped_column(Text, nullable=False)

    # Internal metadata (NEVER exposed to the student frontend)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    platform_context: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    user_context_used: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON summary of profile factors

    # Relationships
    instance: Mapped["AssessmentInstance"] = relationship("AssessmentInstance", back_populates="scenarios")
    questions: Mapped[list["AssessmentQuestion"]] = relationship(
        "AssessmentQuestion", back_populates="scenario", order_by="AssessmentQuestion.order_index"
    )


class AssessmentQuestion(Base):
    """
    A single assessment question within a scenario.
    Each question measures one TPB construct.
    Options are stored as a JSON array of {text, score} objects.
    """
    __tablename__ = "assessment_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scenario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("assessment_scenarios.id"), nullable=False, index=True
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)  # question order within scenario

    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    options_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON: [{text, score}, ...]

    # Internal metadata (NEVER exposed to student)
    tpb_construct: Mapped[str] = mapped_column(String(25), nullable=False)

    # Student's answer (filled during assessment)
    selected_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Relationships
    scenario: Mapped["AssessmentScenario"] = relationship("AssessmentScenario", back_populates="questions")

    __table_args__ = (
        CheckConstraint(
            "tpb_construct IN ('Attitude','SubjectiveNorm','PBC','BehavioralIntention')",
            name="question_construct_check",
        ),
    )


class PasswordResetToken(Base):
    """
    password_reset_tokens table for secure, expiring password recovery links.
    """
    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="reset_tokens")

