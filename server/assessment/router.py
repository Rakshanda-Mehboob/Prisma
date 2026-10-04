"""
assessment/router.py — Assessment endpoints (pre and post stage) — v1.1.

Routes:
  GET  /assessment/status     → which stages are complete, is post unlocked
  GET  /assessment/pre        → fetch personalized pre-stage scenarios (profile-aware)
  POST /assessment/pre        → submit pre-assessment responses, trigger scoring + intervention assignment
  GET  /assessment/post       → fetch post-stage scenarios (only if post is unlocked)
  POST /assessment/post       → submit post-assessment responses

Business rules:
  - A user can only have ONE pre and ONE post assessment.
  - Post-assessment is locked until all assigned interventions have status='completed'.
  - Submitting pre-assessment automatically assigns interventions for weak constructs.
  - Scenarios are generated using the student's behavioral profile for personalization.
  - All 4 TPB constructs measured: Attitude, SubjectiveNorm, PBC, BehavioralIntention.
  - 3 scenario blocks × 8 questions = 24 items total.
"""

import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User, Scenario, Assessment, AssessmentResponse, Intervention, UserInterventionProgress, StudentProfile
from schemas import (
    ScenarioOut,
    AssessmentSubmitRequest,
    AssessmentScores,
    AssessmentStatusOut,
)
from auth.utils import get_current_user
from assessment.scoring import calculate_scores, identify_weak_constructs, calculate_overall
from assessment.ai_generator import generate_personalized_scenario_blocks
import random

router = APIRouter(prefix="/assessment", tags=["Assessment"])


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_assessment(db: Session, user_id: int, stage: str) -> Assessment | None:
    return (
        db.query(Assessment)
        .filter(Assessment.user_id == user_id, Assessment.stage == stage)
        .first()
    )


def _all_interventions_complete(db: Session, user_id: int) -> bool:
    """Return True if every assigned intervention for this user is completed."""
    progress_records = (
        db.query(UserInterventionProgress)
        .filter(UserInterventionProgress.user_id == user_id)
        .all()
    )
    if not progress_records:
        return False
    return all(p.status == "completed" for p in progress_records)


def _get_student_profile_data(db: Session, user_id: int) -> dict | None:
    """
    Fetch and deserialize the student's behavioral profile for AI scenario personalization.
    Returns None if no profile exists (AI falls back to generic generation).
    """
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == user_id)
        .first()
    )
    if not profile:
        return None

    def _parse(val):
        if val is None:
            return None
        try:
            return json.loads(val)
        except Exception:
            return None

    return {
        "degree_program": profile.degree_program,
        "academic_year": profile.academic_year,
        "faculty_department": profile.faculty_department,
        "learning_environment": profile.learning_environment,
        "class_size": profile.class_size,
        "platforms_used": _parse(profile.platforms_used),
        "online_activity_level": profile.online_activity_level,
        "main_online_activities": _parse(profile.main_online_activities),
        "university_activity_level": profile.university_activity_level,
        "participation_types": _parse(profile.participation_types),
        "social_role": profile.social_role,
        "encounter_frequency": profile.encounter_frequency,
        "experience_types": _parse(profile.experience_types),
        "experience_role": profile.experience_role,
    }


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("/status", response_model=AssessmentStatusOut)
def get_assessment_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return which assessment stages are complete and whether post is unlocked."""
    pre = _get_assessment(db, current_user.id, "pre")
    post = _get_assessment(db, current_user.id, "post")
    post_unlocked = pre is not None and _all_interventions_complete(db, current_user.id)

    return AssessmentStatusOut(
        pre_completed=pre is not None,
        post_completed=post is not None,
        post_unlocked=post_unlocked,
        pre_assessment=pre,
        post_assessment=post,
    )


@router.get("/pre", response_model=list[ScenarioOut])
def get_pre_scenarios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return personalized pre-stage scenario questions.
    Uses the student's behavioral profile to generate contextually relevant,
    non-generic scenarios covering all 4 TPB constructs.
    Raises 409 if pre-assessment already submitted.
    """
    if _get_assessment(db, current_user.id, "pre"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already completed the pre-assessment."
        )

    # Fetch student profile for personalization
    profile_data = _get_student_profile_data(db, current_user.id)

    # Generate 3 personalized scenario blocks (24 questions total: 3×8)
    scenarios = generate_personalized_scenario_blocks(
        db=db,
        stage="pre",
        profile_data=profile_data,
        num_blocks=3,
    )

    if not scenarios:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No scenarios available. Please check server logs."
        )

    # Shuffle answer options for each scenario to prevent fixed ordering
    for scenario in scenarios:
        random.shuffle(scenario.options)

    return scenarios


@router.post("/pre", response_model=AssessmentScores, status_code=status.HTTP_201_CREATED)
def submit_pre_assessment(
    payload: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit pre-assessment responses.
    1. Validates no duplicate submission.
    2. Runs the full TPB scoring engine (4 constructs).
    3. Saves Assessment + AssessmentResponse rows.
    4. Assigns interventions for weak constructs.
    Returns computed scores + list of weak constructs.
    """
    if _get_assessment(db, current_user.id, "pre"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Pre-assessment already submitted."
        )

    # Build response data enriched with construct info
    scenario_ids = [r.scenario_id for r in payload.responses]
    scenario_map: dict[int, Scenario] = {
        s.id: s
        for s in db.query(Scenario).filter(Scenario.id.in_(scenario_ids)).all()
    }

    enriched = []
    for r in payload.responses:
        s = scenario_map.get(r.scenario_id)
        if s:
            enriched.append({"construct": s.construct, "selected_score": r.selected_score})

    # Score all 4 TPB constructs
    scores = calculate_scores(enriched)
    overall = calculate_overall(scores)
    weak = identify_weak_constructs(scores)

    # Persist Assessment
    assessment = Assessment(
        user_id=current_user.id,
        stage="pre",
        attitude_score=scores.attitude,
        subjective_norm_score=scores.subjective_norm,
        pbc_score=scores.pbc,
        behavioral_intention_score=scores.behavioral_intention,
    )
    db.add(assessment)
    db.flush()  # get assessment.id before committing

    # Persist individual responses
    for r in payload.responses:
        db.add(AssessmentResponse(
            assessment_id=assessment.id,
            scenario_id=r.scenario_id,
            selected_score=r.selected_score,
        ))

    # Assign interventions for weak constructs
    for construct in weak:
        interventions = (
            db.query(Intervention)
            .filter(Intervention.target_construct == construct)
            .all()
        )
        for intervention in interventions:
            # Avoid duplicate assignments
            existing = (
                db.query(UserInterventionProgress)
                .filter(
                    UserInterventionProgress.user_id == current_user.id,
                    UserInterventionProgress.intervention_id == intervention.id,
                )
                .first()
            )
            if not existing:
                db.add(UserInterventionProgress(
                    user_id=current_user.id,
                    intervention_id=intervention.id,
                    status="assigned",
                ))

    db.commit()

    return AssessmentScores(
        attitude_score=scores.attitude,
        subjective_norm_score=scores.subjective_norm,
        pbc_score=scores.pbc,
        behavioral_intention_score=scores.behavioral_intention,
        overall_score=overall,
        weak_constructs=weak,
    )


@router.get("/post", response_model=list[ScenarioOut])
def get_post_scenarios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return personalized post-stage scenarios. Only accessible once all interventions are completed.
    Raises 403 if post is still locked.
    """
    if _get_assessment(db, current_user.id, "post"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already completed the post-assessment."
        )
    if not _all_interventions_complete(db, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complete all assigned learning modules before taking the post-assessment."
        )

    # Fetch student profile for personalization
    profile_data = _get_student_profile_data(db, current_user.id)

    # Generate 3 personalized post-stage scenario blocks
    scenarios = generate_personalized_scenario_blocks(
        db=db,
        stage="post",
        profile_data=profile_data,
        num_blocks=3,
    )

    if not scenarios:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No post scenarios available. Please check server logs."
        )

    # Shuffle answer options for each scenario to prevent fixed ordering
    for scenario in scenarios:
        random.shuffle(scenario.options)

    return scenarios


@router.post("/post", response_model=AssessmentScores, status_code=status.HTTP_201_CREATED)
def submit_post_assessment(
    payload: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit post-assessment responses. Requires all interventions to be completed.
    Returns computed post scores + weak constructs (for dashboard comparison).
    """
    if _get_assessment(db, current_user.id, "post"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Post-assessment already submitted."
        )
    if not _all_interventions_complete(db, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complete all assigned learning modules before taking the post-assessment."
        )

    scenario_ids = [r.scenario_id for r in payload.responses]
    scenario_map: dict[int, Scenario] = {
        s.id: s
        for s in db.query(Scenario).filter(Scenario.id.in_(scenario_ids)).all()
    }

    enriched = []
    for r in payload.responses:
        s = scenario_map.get(r.scenario_id)
        if s:
            enriched.append({"construct": s.construct, "selected_score": r.selected_score})

    scores = calculate_scores(enriched)
    overall = calculate_overall(scores)
    weak = identify_weak_constructs(scores)

    assessment = Assessment(
        user_id=current_user.id,
        stage="post",
        attitude_score=scores.attitude,
        subjective_norm_score=scores.subjective_norm,
        pbc_score=scores.pbc,
        behavioral_intention_score=scores.behavioral_intention,
    )
    db.add(assessment)
    db.flush()

    for r in payload.responses:
        db.add(AssessmentResponse(
            assessment_id=assessment.id,
            scenario_id=r.scenario_id,
            selected_score=r.selected_score,
        ))

    db.commit()

    return AssessmentScores(
        attitude_score=scores.attitude,
        subjective_norm_score=scores.subjective_norm,
        pbc_score=scores.pbc,
        behavioral_intention_score=scores.behavioral_intention,
        overall_score=overall,
        weak_constructs=weak,
    )


@router.post("/reset")
def reset_assessment(
    stage: str = "all",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Reset assessment(s) for the current user so they can retake or re-evaluate.
    Accepts stage='pre', 'post', or 'all'.
    """
    stages_to_reset = ["pre", "post"] if stage in ("all", None, "") else [stage]
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_user.id, Assessment.stage.in_(stages_to_reset))
        .all()
    )
    for a in assessments:
        db.query(AssessmentResponse).filter(AssessmentResponse.assessment_id == a.id).delete()
        db.delete(a)

    db.commit()
    return {"message": "Assessment reset successfully", "stage": stage}
