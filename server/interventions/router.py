"""
interventions/router.py — Intervention assignment and progress tracking endpoints.

Routes:
  GET  /interventions/my          → list all assigned interventions for current user
  POST /interventions/{id}/start  → mark intervention as 'in-progress'
  POST /interventions/{id}/complete → mark intervention as 'completed'
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserInterventionProgress
from schemas import UserInterventionOut
from auth.utils import get_current_user

router = APIRouter(prefix="/interventions", tags=["Interventions"])


def _get_progress(
    db: Session, user_id: int, intervention_id: int
) -> UserInterventionProgress:
    """Fetch a specific progress record or raise 404."""
    progress = (
        db.query(UserInterventionProgress)
        .filter(
            UserInterventionProgress.user_id == user_id,
            UserInterventionProgress.intervention_id == intervention_id,
        )
        .first()
    )
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This intervention is not assigned to you."
        )
    return progress


@router.get("/my", response_model=list[UserInterventionOut])
def get_my_interventions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return all interventions assigned to the current user,
    including their completion status and full intervention details.
    """
    records = (
        db.query(UserInterventionProgress)
        .filter(UserInterventionProgress.user_id == current_user.id)
        .all()
    )
    return [
        UserInterventionOut(
            progress_id=r.id,
            status=r.status,
            completed_at=r.completed_at,
            intervention=r.intervention,
        )
        for r in records
    ]


@router.post("/{intervention_id}/start", status_code=status.HTTP_200_OK)
def start_intervention(
    intervention_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark an intervention as 'in-progress'.
    Only valid if current status is 'assigned'.
    """
    progress = _get_progress(db, current_user.id, intervention_id)

    if progress.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This intervention is already completed."
        )

    progress.status = "in-progress"
    db.commit()
    return {"message": "Intervention started.", "status": progress.status}


@router.post("/{intervention_id}/complete", status_code=status.HTTP_200_OK)
def complete_intervention(
    intervention_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark an intervention as 'completed' and record the timestamp.
    Triggers automatic unlock of post-assessment when all interventions are done.
    """
    progress = _get_progress(db, current_user.id, intervention_id)

    if progress.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This intervention is already completed."
        )

    progress.status = "completed"
    progress.completed_at = datetime.utcnow()
    db.commit()

    # Check if all interventions are now complete → signal post-assessment unlock
    all_records = (
        db.query(UserInterventionProgress)
        .filter(UserInterventionProgress.user_id == current_user.id)
        .all()
    )
    all_complete = all(r.status == "completed" for r in all_records)

    return {
        "message": "Intervention completed!",
        "status": progress.status,
        "post_assessment_unlocked": all_complete,
    }
