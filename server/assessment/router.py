"""
assessment/router.py — Assessment endpoints (scenario-based model) — v2.0.

Routes:
  GET  /assessment/status   → which stages are complete, is post unlocked
  GET  /assessment/pre      → fetch/generate 3-scenario pre-assessment
  POST /assessment/pre      → submit pre-assessment answers, trigger scoring + interventions
  GET  /assessment/post     → fetch/generate 3-scenario post-assessment
  POST /assessment/post     → submit post-assessment answers
  POST /assessment/reset    → reset assessment(s) for retake

Architecture (v2.0):
  - Each assessment = 3 narrative scenarios × 6 questions each = 18 items
  - Scenarios generated once at start, questions are grouped under scenarios
  - No internal labels (TPB construct, platform, category) exposed to frontend
  - All 4 TPB constructs measured: Attitude, SubjectiveNorm, PBC, BehavioralIntention
"""

import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
from models import (
    User, Assessment, AssessmentResponse, Intervention, UserInterventionProgress,
    AssessmentInstance, AssessmentScenario, AssessmentQuestion, Scenario,
)
from schemas import (
    AssessmentScores,
    AssessmentStatusOut,
    AssessmentOut,
    AssessmentInstanceOut,
    AssessmentScenarioOut,
    AssessmentQuestionOut,
    QuestionOptionOut,
    ScenarioAssessmentSubmitRequest,
)
from auth.utils import get_current_user
from assessment.scoring import calculate_scores, identify_weak_constructs, calculate_overall
from assessment.adaptive_engine import generate_scenario_assessment

router = APIRouter(prefix="/assessment", tags=["Assessment"])


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_legacy_assessment(db: Session, user_id: int, stage: str) -> Assessment | None:
    """Check for a completed assessment in the legacy table (backward compat)."""
    return (
        db.query(Assessment)
        .filter(Assessment.user_id == user_id, Assessment.stage == stage)
        .first()
    )


def _get_instance(db: Session, user_id: int, stage: str) -> AssessmentInstance | None:
    """Get the scenario-based assessment instance for this user and stage."""
    return (
        db.query(AssessmentInstance)
        .filter(AssessmentInstance.user_id == user_id, AssessmentInstance.stage == stage)
        .order_by(AssessmentInstance.id.desc())
        .first()
    )


def _all_interventions_complete(db: Session, user_id: int) -> bool:
    """Return True if user has completed assigned personalized learning.
    If no progress records exist, treat as complete (no interventions assigned).
    """
    progress_records = (
        db.query(UserInterventionProgress)
        .filter(UserInterventionProgress.user_id == user_id)
        .all()
    )
    if not progress_records:
        return True
    # All assigned interventions must be completed
    return all(p.status == "completed" for p in progress_records)


def _is_stage_completed(db: Session, user_id: int, stage: str) -> bool:
    """Check if a stage is completed (either legacy or new model)."""
    # Check new model
    instance = _get_instance(db, user_id, stage)
    if instance and instance.status == "submitted":
        return True
    # Check legacy model
    legacy = _get_legacy_assessment(db, user_id, stage)
    return legacy is not None


def _format_instance_for_frontend(instance: AssessmentInstance) -> dict:
    """
    Format an AssessmentInstance for the frontend.
    Strips all internal metadata (TPB construct, platform, category).
    Only exposes: scenario text, question text, answer options.
    """
    scenarios = []
    for scenario in instance.scenarios:
        questions = []
        for q in scenario.questions:
            options = json.loads(q.options_json) if q.options_json else []
            questions.append({
                "id": q.id,
                "question_text": q.question_text,
                "options": [{"index": i, "text": o["text"]} for i, o in enumerate(options)],
            })

        scenarios.append({
            "id": scenario.id,
            "order_index": scenario.order_index,
            "scenario_text": scenario.text if hasattr(scenario, 'text') else scenario.scenario_text,
            "questions": questions,
        })

    return {
        "id": instance.id,
        "stage": instance.stage,
        "status": instance.status,
        "scenarios": scenarios,
    }


def _get_assessment_out(db: Session, user_id: int, stage: str) -> AssessmentOut | None:
    """Get an AssessmentOut object for the status endpoint."""
    # First check new model
    instance = _get_instance(db, user_id, stage)
    if instance and instance.status == "submitted":
        return AssessmentOut(
            id=instance.id,
            stage=instance.stage,
            attitude_score=instance.attitude_score,
            subjective_norm_score=instance.subjective_norm_score,
            pbc_score=instance.pbc_score,
            behavioral_intention_score=instance.behavioral_intention_score,
            submitted_at=instance.submitted_at or instance.generated_at,
        )
    # Fall back to legacy
    legacy = _get_legacy_assessment(db, user_id, stage)
    if legacy:
        return AssessmentOut(
            id=legacy.id,
            stage=legacy.stage,
            attitude_score=legacy.attitude_score,
            subjective_norm_score=legacy.subjective_norm_score,
            pbc_score=legacy.pbc_score,
            behavioral_intention_score=legacy.behavioral_intention_score,
            submitted_at=legacy.submitted_at,
        )
    return None


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("/status", response_model=AssessmentStatusOut)
def get_assessment_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return which assessment stages are complete and whether post is unlocked."""
    pre_done = _is_stage_completed(db, current_user.id, "pre")
    post_done = _is_stage_completed(db, current_user.id, "post")
    post_unlocked = pre_done and _all_interventions_complete(db, current_user.id)

    return AssessmentStatusOut(
        pre_completed=pre_done,
        post_completed=post_done,
        post_unlocked=post_unlocked,
        pre_assessment=_get_assessment_out(db, current_user.id, "pre"),
        post_assessment=_get_assessment_out(db, current_user.id, "post"),
    )


@router.get("/pre")
def get_pre_assessment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch or generate the pre-assessment.
    Returns 3 scenarios with grouped questions. No internal labels exposed.
    """
    if _is_stage_completed(db, current_user.id, "pre"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already completed the pre-assessment."
        )

    # Check if an instance already exists (generated but not yet submitted)
    instance = _get_instance(db, current_user.id, "pre")

    if not instance:
        # Generate a new assessment
        try:
            instance = generate_scenario_assessment(db, current_user.id, "pre")
        except IntegrityError:
            db.rollback()
            instance = _get_instance(db, current_user.id, "pre")

    return _format_instance_for_frontend(instance)


@router.post("/pre", response_model=AssessmentScores, status_code=status.HTTP_201_CREATED)
def submit_pre_assessment(
    payload: ScenarioAssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit pre-assessment answers.
    1. Validates no duplicate submission.
    2. Saves selected scores to each AssessmentQuestion.
    3. Runs TPB scoring engine (4 constructs).
    4. Assigns interventions for weak constructs.
    """
    if _is_stage_completed(db, current_user.id, "pre"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Pre-assessment already submitted."
        )

    instance = _get_instance(db, current_user.id, "pre")
    if not instance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pre-assessment has been generated. Fetch GET /assessment/pre first."
        )

    # Build question lookup
    all_questions = {}
    for scenario in instance.scenarios:
        for q in scenario.questions:
            all_questions[q.id] = q

    # 1. If any answer.question_id does not belong to this instance, raise HTTP 400 "Invalid question ID".
    for answer in payload.answers:
        if answer.question_id not in all_questions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid question ID",
            )

    # 2. Reject duplicate question_ids in the payload.
    seen_qids = set()
    for answer in payload.answers:
        if answer.question_id in seen_qids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Duplicate question ID in submission.",
            )
        seen_qids.add(answer.question_id)

    # 3. If distinct answered questions != total questions in instance, raise HTTP 400 "Please answer all questions".
    if len(seen_qids) != len(all_questions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please answer all questions",
        )

    # Save answers and build enriched response data for scoring
    enriched = []
    for answer in payload.answers:
        q = all_questions[answer.question_id]
        options = json.loads(q.options_json) if q.options_json else []
        if answer.selected_option >= len(options):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"selected_option {answer.selected_option} is out of range for question {answer.question_id}.",
            )
        resolved_score = options[answer.selected_option]["score"]
        q.selected_score = resolved_score
        enriched.append({
            "construct": q.tpb_construct,
            "selected_score": resolved_score,
            "is_reversed": getattr(q, "is_reverse_scored", False),
        })

    # Score all 4 TPB constructs
    scores = calculate_scores(enriched)
    overall = calculate_overall(scores)
    weak = identify_weak_constructs(scores)

    # Update instance
    instance.status = "submitted"
    instance.submitted_at = datetime.utcnow()
    instance.attitude_score = scores.attitude
    instance.subjective_norm_score = scores.subjective_norm
    instance.pbc_score = scores.pbc
    instance.behavioral_intention_score = scores.behavioral_intention

    # Also persist to legacy Assessment table for backward compat with dashboard
    legacy = Assessment(
        user_id=current_user.id,
        stage="pre",
        attitude_score=scores.attitude,
        subjective_norm_score=scores.subjective_norm,
        pbc_score=scores.pbc,
        behavioral_intention_score=scores.behavioral_intention,
    )
    db.add(legacy)
    db.flush()

    # Persist individual responses to legacy table for backward compat
    # (Create temporary Scenario rows to satisfy FK constraints)
    for scenario in instance.scenarios:
        for q in scenario.questions:
            if q.selected_score is not None:
                # Create a Scenario row for backward compat
                s = Scenario(
                    construct=q.tpb_construct,
                    stage="pre",
                    scenario_text=scenario.scenario_text,
                    question_text=q.question_text,
                )
                db.add(s)
                db.flush()
                db.add(AssessmentResponse(
                    assessment_id=legacy.id,
                    scenario_id=s.id,
                    selected_score=q.selected_score,
                ))

    # Assign intervention for the weakest construct (single personalized module)
    if weak:
        # Choose the first (or only) weakest construct
        weakest_construct = weak[0]
        intervention = (
            db.query(Intervention)
            .filter(Intervention.target_construct == weakest_construct)
            .first()
        )
        if intervention:
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


@router.get("/post")
def get_post_assessment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch or generate the post-assessment.
    Requires all interventions to be completed first.
    """
    if _is_stage_completed(db, current_user.id, "post"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already completed the post-assessment."
        )
    if not _is_stage_completed(db, current_user.id, "pre"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complete the pre-assessment first.",
        )
    if not _all_interventions_complete(db, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complete all assigned learning modules before taking the post-assessment."
        )

    instance = _get_instance(db, current_user.id, "post")
    if not instance:
        try:
            instance = generate_scenario_assessment(db, current_user.id, "post")
        except IntegrityError:
            db.rollback()
            instance = _get_instance(db, current_user.id, "post")

    return _format_instance_for_frontend(instance)


@router.post("/post", response_model=AssessmentScores, status_code=status.HTTP_201_CREATED)
def submit_post_assessment(
    payload: ScenarioAssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit post-assessment answers. Same logic as pre, without intervention assignment."""
    if _is_stage_completed(db, current_user.id, "post"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Post-assessment already submitted."
        )
    if not _is_stage_completed(db, current_user.id, "pre"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complete the pre-assessment first.",
        )
    if not _all_interventions_complete(db, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complete all assigned learning modules before taking the post-assessment."
        )

    instance = _get_instance(db, current_user.id, "post")
    if not instance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No post-assessment has been generated. Fetch GET /assessment/post first."
        )

    all_questions = {}
    for scenario in instance.scenarios:
        for q in scenario.questions:
            all_questions[q.id] = q

    # 1. If any answer.question_id does not belong to this instance, raise HTTP 400 "Invalid question ID".
    for answer in payload.answers:
        if answer.question_id not in all_questions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid question ID",
            )

    # 2. Reject duplicate question_ids in the payload.
    seen_qids = set()
    for answer in payload.answers:
        if answer.question_id in seen_qids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Duplicate question ID in submission.",
            )
        seen_qids.add(answer.question_id)

    # 3. If distinct answered questions != total questions in instance, raise HTTP 400 "Please answer all questions".
    if len(seen_qids) != len(all_questions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please answer all questions",
        )

    enriched = []
    for answer in payload.answers:
        q = all_questions[answer.question_id]
        options = json.loads(q.options_json) if q.options_json else []
        if answer.selected_option >= len(options):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"selected_option {answer.selected_option} is out of range for question {answer.question_id}.",
            )
        resolved_score = options[answer.selected_option]["score"]
        q.selected_score = resolved_score
        enriched.append({
            "construct": q.tpb_construct,
            "selected_score": resolved_score,
            "is_reversed": getattr(q, "is_reverse_scored", False),
        })

    scores = calculate_scores(enriched)
    overall = calculate_overall(scores)
    weak = identify_weak_constructs(scores)

    instance.status = "submitted"
    instance.submitted_at = datetime.utcnow()
    instance.attitude_score = scores.attitude
    instance.subjective_norm_score = scores.subjective_norm
    instance.pbc_score = scores.pbc
    instance.behavioral_intention_score = scores.behavioral_intention

    # Legacy compat
    legacy = Assessment(
        user_id=current_user.id,
        stage="post",
        attitude_score=scores.attitude,
        subjective_norm_score=scores.subjective_norm,
        pbc_score=scores.pbc,
        behavioral_intention_score=scores.behavioral_intention,
    )
    db.add(legacy)

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
    Reset assessment(s) for the current user so they can retake.
    Only administrators are allowed to perform a reset.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can reset assessments.",
        )
    stages_to_reset = ["pre", "post"] if stage in ("all", None, "") else [stage]

    # Reset new model
    instances = (
        db.query(AssessmentInstance)
        .filter(
            AssessmentInstance.user_id == current_user.id,
            AssessmentInstance.stage.in_(stages_to_reset),
        )
        .all()
    )
    for inst in instances:
        for scenario in inst.scenarios:
            db.query(AssessmentQuestion).filter(AssessmentQuestion.scenario_id == scenario.id).delete()
            db.delete(scenario)
        db.delete(inst)

    # Reset legacy model
    legacy_assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_user.id, Assessment.stage.in_(stages_to_reset))
        .all()
    )
    for a in legacy_assessments:
        db.query(AssessmentResponse).filter(AssessmentResponse.assessment_id == a.id).delete()
        db.delete(a)

    db.commit()
    return {"message": "Assessment reset successfully", "stage": stage}
