"""
models.py — SQLAlchemy ORM models mirroring the schema in docs/schema.sql.
All 8 tables are defined here. Base.metadata.create_all(engine) in main.py
creates app.db automatically on first run.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Integer, String, Text, Float, DateTime, ForeignKey, CheckConstraint
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
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    assessments: Mapped[list["Assessment"]] = relationship("Assessment", back_populates="user")
    intervention_progress: Mapped[list["UserInterventionProgress"]] = relationship(
        "UserInterventionProgress", back_populates="user"
    )
    feedbacks: Mapped[list["Feedback"]] = relationship("Feedback", back_populates="user")

    __table_args__ = (
        CheckConstraint("role IN ('student', 'admin')", name="user_role_check"),
    )


class Scenario(Base):
    __tablename__ = "scenarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    construct: Mapped[str] = mapped_column(String(20), nullable=False)
    stage: Mapped[str] = mapped_column(String(5), nullable=False)
    scenario_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    options: Mapped[list["ScenarioOption"]] = relationship("ScenarioOption", back_populates="scenario")
    responses: Mapped[list["AssessmentResponse"]] = relationship("AssessmentResponse", back_populates="scenario")

    __table_args__ = (
        CheckConstraint("construct IN ('Attitude','SubjectiveNorm','PBC')", name="scenario_construct_check"),
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
        CheckConstraint("score BETWEEN 1 AND 5", name="option_score_check"),
    )


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    stage: Mapped[str] = mapped_column(String(5), nullable=False)
    attitude_score: Mapped[Optional[float]] = mapped_column(Float)
    subjective_norm_score: Mapped[Optional[float]] = mapped_column(Float)
    pbc_score: Mapped[Optional[float]] = mapped_column(Float)
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
    scenario: Mapped["Scenario"] = relationship("Scenario", back_populates="responses")

    __table_args__ = (
        CheckConstraint("selected_score BETWEEN 1 AND 5", name="response_score_check"),
    )


class Intervention(Base):
    __tablename__ = "interventions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    target_construct: Mapped[str] = mapped_column(String(20), nullable=False)
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
            "target_construct IN ('Attitude','SubjectiveNorm','PBC')",
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
