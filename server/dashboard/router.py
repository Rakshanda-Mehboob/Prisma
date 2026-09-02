"""
dashboard/router.py — Dashboard data aggregation and feedback endpoints.

Routes:
  GET  /dashboard      → aggregate pre/post scores, deltas, progress, feedback text
  POST /feedback       → submit rating + comments for a completed intervention
  GET  /feedback/my    → list all feedback submitted by current user
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User, Assessment, UserInterventionProgress, Feedback
from schemas import (
    DashboardOut, ConstructScores, ConstructDelta,
    FeedbackSubmitRequest, FeedbackOut, UserOut
)
from auth.utils import get_current_user
from assessment.scoring import generate_feedback_text, TPBScores

router = APIRouter(tags=["Dashboard & Feedback"])


@router.get("/dashboard", response_model=DashboardOut)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Aggregate all data needed by the frontend dashboard:
    - Pre and post TPB construct scores
    - Per-construct deltas (post − pre)
    - Intervention completion statistics
    - Personalized rule-based feedback messages
    - Whether post-assessment is unlocked
    """
    # Fetch assessments
    pre = db.query(Assessment).filter(
        Assessment.user_id == current_user.id, Assessment.stage == "pre"
    ).first()
    post = db.query(Assessment).filter(
        Assessment.user_id == current_user.id, Assessment.stage == "post"
    ).first()

    # Build score objects
    pre_scores = None
    if pre:
        pre_scores = ConstructScores(
            attitude=pre.attitude_score,
            subjective_norm=pre.subjective_norm_score,
            pbc=pre.pbc_score,
        )

    post_scores = None
    if post:
        post_scores = ConstructScores(
            attitude=post.attitude_score,
            subjective_norm=post.subjective_norm_score,
            pbc=post.pbc_score,
        )

    # Compute deltas
    deltas = None
    if pre and post:
        deltas = ConstructDelta(
            attitude=round((post.attitude_score or 0) - (pre.attitude_score or 0), 2),
            subjective_norm=round(
                (post.subjective_norm_score or 0) - (pre.subjective_norm_score or 0), 2
            ),
            pbc=round((post.pbc_score or 0) - (pre.pbc_score or 0), 2),
        )

    # Intervention progress
    progress_records = (
        db.query(UserInterventionProgress)
        .filter(UserInterventionProgress.user_id == current_user.id)
        .all()
    )
    total = len(progress_records)
    completed = sum(1 for p in progress_records if p.status == "completed")
    completion_pct = round((completed / total * 100) if total > 0 else 0.0, 1)
    post_unlocked = total > 0 and completed == total

    # Personalized feedback text (only if both assessments done)
    feedback_messages: list[str] = []
    if pre and post:
        pre_t = TPBScores(
            attitude=pre.attitude_score or 0,
            subjective_norm=pre.subjective_norm_score or 0,
            pbc=pre.pbc_score or 0,
        )
        post_t = TPBScores(
            attitude=post.attitude_score or 0,
            subjective_norm=post.subjective_norm_score or 0,
            pbc=post.pbc_score or 0,
        )
        feedback_messages = generate_feedback_text(pre_t, post_t)

    return DashboardOut(
        user=UserOut.model_validate(current_user),
        pre_scores=pre_scores,
        post_scores=post_scores,
        deltas=deltas,
        total_interventions=total,
        completed_interventions=completed,
        completion_percent=completion_pct,
        feedback_text=feedback_messages,
        post_unlocked=post_unlocked,
    )


@router.post("/feedback", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    payload: FeedbackSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit a star rating and optional comments for a completed intervention.
    One feedback per user per intervention — raises 409 on duplicate.
    """
    # Verify the intervention was assigned and completed
    progress = (
        db.query(UserInterventionProgress)
        .filter(
            UserInterventionProgress.user_id == current_user.id,
            UserInterventionProgress.intervention_id == payload.intervention_id,
        )
        .first()
    )
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This intervention is not assigned to you."
        )
    if progress.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only rate a completed intervention."
        )

    # Check for duplicate feedback
    existing = (
        db.query(Feedback)
        .filter(
            Feedback.user_id == current_user.id,
            Feedback.intervention_id == payload.intervention_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted feedback for this intervention."
        )

    feedback = Feedback(
        user_id=current_user.id,
        intervention_id=payload.intervention_id,
        rating=payload.rating,
        comments=payload.comments,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/feedback/my", response_model=list[FeedbackOut])
def get_my_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all feedback submitted by the current user."""
    return (
        db.query(Feedback)
        .filter(Feedback.user_id == current_user.id)
        .all()
    )
