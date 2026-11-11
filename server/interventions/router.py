"""
interventions/router.py — Adaptive Intervention Assignment and Progress Tracking.

Theory of Planned Behavior (TPB) Module Assignment Architecture:
  - Module 1: Introduction to Cyberbullying (Attitude)
  - Module 2: Causes and Effects of Cyberbullying (Attitude)
  - Module 3: Preventive and Reactive Measures (Perceived Behavioral Control)
  - Module 4: Your Role – Peer Dynamics and Social Norms (Subjective Norms)

Adaptive Features:
  - Computes mean item score per construct on 1–5 scale.
  - Automatically identifies low constructs below configurable threshold (default 4.0).
  - Assigns required modules ordered by lowest score first.
  - Sequentially unlocks required modules; keeps non-assigned modules open as optional.
  - Strictly enforces activity completion before marking any module complete.
  - Persists student assignment and progress across sessions.
  - Seamlessly unlocks post-assessment when all REQUIRED modules are finished.
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import User, Assessment, AssessmentInstance, Intervention, UserInterventionProgress
from schemas import UserInterventionOut
from auth.utils import get_current_user


# ──────────────────────────────────────────────────────────────────────────────
# PRE-ASSESSMENT COMPLETION GUARD
# ──────────────────────────────────────────────────────────────────────────────

def _is_pre_completed(db: Session, user_id: int) -> bool:
    """
    Returns True if the user has completed the pre-assessment (new or legacy model).
    This is the gating condition for accessing the Learning Module.
    """
    # Check new scenario-based AssessmentInstance
    inst = (
        db.query(AssessmentInstance)
        .filter(
            AssessmentInstance.user_id == user_id,
            AssessmentInstance.stage == "pre",
        )
        .first()
    )
    if inst and inst.status == "submitted":
        return True
    # Fall back to legacy Assessment table
    legacy = (
        db.query(Assessment)
        .filter(Assessment.user_id == user_id, Assessment.stage == "pre")
        .first()
    )
    return legacy is not None


_PRE_ASSESSMENT_REQUIRED_DETAIL = (
    "Complete your Pre-Assessment first to unlock your personalized learning modules. "
    "Your assessment results determine which learning content is recommended specifically for you."
)
from interventions.adaptive_assignment import (
    DEFAULT_ADAPTIVE_THRESHOLD,
    MODULE_DEFINITIONS,
    calculate_mean_item_scores,
    determine_module_assignments,
)
from interventions.content import MODULE_CURRICULUM

router = APIRouter(prefix="/interventions", tags=["Interventions"])


# ──────────────────────────────────────────────────────────────────────────────
# PERSISTENT MODULE MODELS (Inside interventions module)
# ──────────────────────────────────────────────────────────────────────────────

class UserAdaptiveAssignment(Base):
    """Stores the student's adaptive assessment result and module assignment."""
    __tablename__ = "user_adaptive_assignments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    assigned_modules = Column(Text, nullable=False)       # JSON list of int [1, 2]
    required_module_ids = Column(Text, nullable=False)    # JSON list of int
    optional_module_ids = Column(Text, nullable=False)    # JSON list of int
    low_constructs = Column(Text, nullable=False)         # JSON list of str
    mean_scores = Column(Text, nullable=False)            # JSON dict
    threshold_used = Column(Float, default=DEFAULT_ADAPTIVE_THRESHOLD)
    is_reinforcement = Column(Boolean, default=False)
    is_fallback = Column(Boolean, default=False)
    recommendation_reason = Column(Text, nullable=False)
    # Enhancement module for all-high users (optional, not required for post-assessment)
    optional_enhancement_module = Column(Integer, nullable=True)
    optional_enhancement_construct = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserModuleState(Base):
    """Tracks per-module progress, sequential state, and activity responses."""
    __tablename__ = "user_module_states"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    module_number = Column(Integer, nullable=False)
    is_required = Column(Boolean, default=False)
    status = Column(String(20), default="assigned")  # assigned, in-progress, completed
    activity_completed = Column(Boolean, default=False)
    activity_data = Column(Text, nullable=True)      # JSON response payload
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Create tables if not existing
Base.metadata.create_all(bind=engine)

# ── Migrate: add optional enhancement columns and backfill existing rows ───────
def _run_migrations():
    """Add new nullable columns to existing tables without dropping data, and backfill existing rows."""
    from sqlalchemy import text
    with engine.connect() as conn:
        for col_def in [
            "ALTER TABLE user_adaptive_assignments ADD COLUMN optional_enhancement_module INTEGER",
            "ALTER TABLE user_adaptive_assignments ADD COLUMN optional_enhancement_construct VARCHAR(50)",
        ]:
            try:
                conn.execute(text(col_def))
                conn.commit()
            except Exception:
                pass  # Column already exists — safe to skip

    # Backfill/update existing assignments so existing accounts receive the latest adaptive recommendations
    try:
        from database import SessionLocal
        with SessionLocal() as db:
            assignments = db.query(UserAdaptiveAssignment).all()
            for asst in assignments:
                if asst.mean_scores:
                    try:
                        scores = json.loads(asst.mean_scores)
                        res = determine_module_assignments(scores, threshold=DEFAULT_ADAPTIVE_THRESHOLD)
                        asst.assigned_modules = json.dumps(res["assigned_modules"])
                        asst.required_module_ids = json.dumps(res["required_module_ids"])
                        asst.optional_module_ids = json.dumps(res["optional_module_ids"])
                        asst.low_constructs = json.dumps(res["low_constructs"])
                        asst.recommendation_reason = res["recommendation_reason"]
                        asst.optional_enhancement_module = res.get("optional_enhancement_module")
                        asst.optional_enhancement_construct = res.get("optional_enhancement_construct")
                    except Exception as err:
                        print(f"[MIGRATION WARNING] Error updating assignment {asst.id}: {err}")
            db.commit()
    except Exception as e:
        print(f"[MIGRATION WARNING] Failed to backfill assignments: {e}")

_run_migrations()


# ──────────────────────────────────────────────────────────────────────────────
# SCHEMAS FOR ADAPTIVE MODULE FLOW
# ──────────────────────────────────────────────────────────────────────────────

class ActivitySubmissionPayload(BaseModel):
    activity_type: str
    responses: Dict[str, Any]


class ModuleDetailOut(BaseModel):
    module_number: int
    id: int
    title: str
    subtitle: str
    target_construct: str
    target_construct_key: str
    construct_mean_score: Optional[float]
    is_required: bool
    is_unlocked: bool
    status: str
    activity_completed: bool
    activity_data: Optional[Dict[str, Any]]
    estimated_minutes: int
    why_recommended: str
    overview: str
    learning_objectives: List[str]
    sections: List[Dict[str, Any]]
    activity: Dict[str, Any]
    completed_at: Optional[datetime]


class AdaptiveLearningPathOut(BaseModel):
    assignment: Dict[str, Any]
    modules: List[ModuleDetailOut]
    all_required_completed: bool
    can_start_post_assessment: bool


# ──────────────────────────────────────────────────────────────────────────────
# DATABASE SEEDING & SYNCHRONIZATION HELPERS
# ──────────────────────────────────────────────────────────────────────────────

def _ensure_core_interventions_seeded(db: Session):
    """
    Ensures the 4 core TPB intervention modules exist in the `interventions` table
    with stable IDs 1, 2, 3, 4 so foreign keys and progress tracking remain consistent.
    """
    for m_num, cur in MODULE_CURRICULUM.items():
        existing = db.query(Intervention).filter(Intervention.id == m_num).first()
        content_type = "case-study" if m_num == 2 else ("quiz" if m_num == 4 else "reading")
        body_summary = f"{cur['overview']}\n\nObjectives:\n" + "\n".join(f"- {o}" for o in cur["learning_objectives"])

        if not existing:
            new_item = Intervention(
                id=m_num,
                target_construct=cur["target_construct"],
                title=cur["title"],
                content_type=content_type,
                content_body=body_summary,
                estimated_minutes=cur["estimated_minutes"],
            )
            db.add(new_item)
        else:
            existing.target_construct = cur["target_construct"]
            existing.title = cur["title"]
            existing.content_type = content_type
            existing.estimated_minutes = cur["estimated_minutes"]

    db.commit()


def _get_or_create_user_assignment(db: Session, user: User) -> UserAdaptiveAssignment:
    """
    Fetch existing assignment for user, or compute and persist it based on pre-test scores.
    Always aligns with the latest assessment results from the database.
    """
    _ensure_core_interventions_seeded(db)

    # Retrieve latest pre-assessment scores
    pre_scores = None
    # Check AssessmentInstance (Personalized 3-scenario assessment)
    inst = (
        db.query(AssessmentInstance)
        .filter(AssessmentInstance.user_id == user.id, AssessmentInstance.stage == "pre")
        .order_by(AssessmentInstance.submitted_at.desc().nullslast(), AssessmentInstance.id.desc())
        .first()
    )
    if inst and inst.attitude_score is not None:
        pre_scores = {
            "attitude": inst.attitude_score,
            "subjective_norm": inst.subjective_norm_score,
            "pbc": inst.pbc_score,
            "behavioral_intention": inst.behavioral_intention_score,
        }
    else:
        # Fall back to legacy Assessment table
        legacy_asst = (
            db.query(Assessment)
            .filter(Assessment.user_id == user.id, Assessment.stage == "pre")
            .order_by(Assessment.submitted_at.desc(), Assessment.id.desc())
            .first()
        )
        if legacy_asst and legacy_asst.attitude_score is not None:
            pre_scores = {
                "attitude": legacy_asst.attitude_score,
                "subjective_norm": legacy_asst.subjective_norm_score,
                "pbc": legacy_asst.pbc_score,
                "behavioral_intention": legacy_asst.behavioral_intention_score,
            }

    # Execute adaptive assignment algorithm with the consistent 70.0 threshold
    mean_scores = calculate_mean_item_scores(pre_scores=pre_scores)
    assign_result = determine_module_assignments(mean_scores, threshold=DEFAULT_ADAPTIVE_THRESHOLD)

    assignment = db.query(UserAdaptiveAssignment).filter(UserAdaptiveAssignment.user_id == user.id).first()

    should_recreate = False
    if not assignment:
        should_recreate = True
    else:
        # Check if threshold, scores, or assignments have changed or if enhancement metadata is missing
        current_scores = json.loads(assignment.mean_scores) if assignment.mean_scores else {}
        is_all_high = assign_result.get("all_constructs_high", False)
        if (
            assignment.threshold_used != DEFAULT_ADAPTIVE_THRESHOLD
            or current_scores != mean_scores
            or assignment.assigned_modules != json.dumps(assign_result["assigned_modules"])
            or assignment.required_module_ids != json.dumps(assign_result["required_module_ids"])
            or assignment.optional_module_ids != json.dumps(assign_result["optional_module_ids"])
            or assignment.optional_enhancement_module != assign_result.get("optional_enhancement_module")
            or assignment.optional_enhancement_construct != assign_result.get("optional_enhancement_construct")
            or (is_all_high and not assignment.optional_enhancement_module)
            or (assignment.recommendation_reason != assign_result.get("recommendation_reason"))
        ):
            should_recreate = True

    if should_recreate:
        if not assignment:
            assignment = UserAdaptiveAssignment(user_id=user.id)
            db.add(assignment)

        assignment.assigned_modules = json.dumps(assign_result["assigned_modules"])
        assignment.required_module_ids = json.dumps(assign_result["required_module_ids"])
        assignment.optional_module_ids = json.dumps(assign_result["optional_module_ids"])
        assignment.low_constructs = json.dumps(assign_result["low_constructs"])
        assignment.mean_scores = json.dumps(assign_result["mean_scores"])
        assignment.threshold_used = assign_result["threshold_used"]
        assignment.is_reinforcement = assign_result["is_reinforcement"]
        assignment.is_fallback = assign_result["is_fallback"]
        assignment.recommendation_reason = assign_result["recommendation_reason"]
        # Enhancement module for all-high users
        assignment.optional_enhancement_module = assign_result.get("optional_enhancement_module")
        assignment.optional_enhancement_construct = assign_result.get("optional_enhancement_construct")
        db.commit()
        db.refresh(assignment)

        # Synchronize per-module states and progress records
        required_ids_set = set(assign_result["required_module_ids"])
        for m_num in [1, 2, 3, 4]:
            is_req = m_num in required_ids_set
            state = (
                db.query(UserModuleState)
                .filter(UserModuleState.user_id == user.id, UserModuleState.module_number == m_num)
                .first()
            )
            if not state:
                db.add(UserModuleState(
                    user_id=user.id,
                    module_number=m_num,
                    is_required=is_req,
                    status="assigned" if is_req else "optional",
                    activity_completed=False,
                    activity_data=None,
                ))
            else:
                state.is_required = is_req
                if not is_req and state.status == "assigned":
                    state.status = "optional"

            # Synchronize with UserInterventionProgress for required modules
            prog = (
                db.query(UserInterventionProgress)
                .filter(
                    UserInterventionProgress.user_id == user.id,
                    UserInterventionProgress.intervention_id == m_num,
                )
                .first()
            )
            if is_req:
                if not prog:
                    db.add(UserInterventionProgress(
                        user_id=user.id,
                        intervention_id=m_num,
                        status="assigned",
                    ))
            else:
                # If this module is no longer required and not completed, clean up progress record
                if prog and prog.status != "completed":
                    db.delete(prog)

        db.commit()

    return assignment


# ──────────────────────────────────────────────────────────────────────────────
# ADAPTIVE LEARNING MODULE ENDPOINTS
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/modules", response_model=AdaptiveLearningPathOut)
def get_adaptive_learning_path(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the student's personalized adaptive learning journey:
      - Assignment metadata (individual construct scores, low constructs, threshold 70%, recommendation reason)
      - ONLY displays modules for TPB constructs scoring below 70%.
      - High scoring constructs (>= 70%) are omitted / hidden.
      - If all constructs score 70–100%, returns empty modules list with congratulatory message.
    """
    # ── Access guard: pre-assessment must be completed first ──────────────────
    if not _is_pre_completed(db, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=_PRE_ASSESSMENT_REQUIRED_DETAIL,
        )

    assignment = _get_or_create_user_assignment(db, current_user)

    assigned_module_order = json.loads(assignment.assigned_modules)
    required_ids = json.loads(assignment.required_module_ids)
    mean_scores = json.loads(assignment.mean_scores)
    low_constructs = json.loads(assignment.low_constructs) if assignment.low_constructs else []

    # Calculate high constructs
    high_constructs = []
    for c_key in ["attitude", "subjective_norm", "pbc", "behavioral_intention"]:
        s = mean_scores.get(c_key)
        if s is not None and s >= assignment.threshold_used:
            high_constructs.append(c_key)

    all_constructs_high = len(low_constructs) == 0 and not assignment.is_fallback and len(assigned_module_order) == 0

    # Query all module states for this student
    states = (
        db.query(UserModuleState)
        .filter(UserModuleState.user_id == current_user.id)
        .all()
    )
    state_by_num = {s.module_number: s for s in states}

    # Sequential unlocking among assigned modules:
    # First assigned module is unlocked. Each subsequent assigned module unlocks
    # only after the preceding assigned module is completed.
    unlocked_status: Dict[int, bool] = {}
    prev_required_done = True

    for m_num in assigned_module_order:
        st = state_by_num.get(m_num)
        is_done = st and st.status == "completed"
        unlocked_status[m_num] = prev_required_done
        if not is_done:
            prev_required_done = False

    # Assemble response modules: ONLY assigned modules for constructs below threshold (< 70)
    # PLUS, for all-high users, the single optional enhancement module (not required)
    modules_out: List[ModuleDetailOut] = []

    # Required modules (low-construct interventions)
    for m_num in assigned_module_order:
        cur = MODULE_CURRICULUM[m_num]
        st = state_by_num.get(m_num)
        status_val = st.status if st else "assigned"
        act_done = st.activity_completed if st else False
        act_data = json.loads(st.activity_data) if st and st.activity_data else None
        completed_at = st.completed_at if st else None
        is_req = m_num in required_ids
        is_unlocked = unlocked_status.get(m_num, True)

        modules_out.append(ModuleDetailOut(
            module_number=m_num,
            id=m_num,
            title=cur["title"],
            subtitle=cur["subtitle"],
            target_construct=cur.get("target_construct_display", cur["target_construct"]),
            target_construct_key=cur["target_construct_key"],
            construct_mean_score=mean_scores.get(cur["target_construct_key"]),
            is_required=is_req,
            is_unlocked=is_unlocked,
            status=status_val,
            activity_completed=act_done,
            activity_data=act_data,
            estimated_minutes=cur["estimated_minutes"],
            why_recommended=MODULE_DEFINITIONS[m_num]["why_recommended"],
            overview=cur["overview"],
            learning_objectives=cur["learning_objectives"],
            sections=cur["sections"],
            activity=cur["activity"],
            completed_at=completed_at,
        ))

    # Optional enhancement module for all-high users
    opt_enh_module_id = assignment.optional_enhancement_module
    opt_enh_construct = assignment.optional_enhancement_construct
    if all_constructs_high and not opt_enh_module_id:
        # Fallback for existing or legacy rows: dynamically resolve enhancement module
        calc = determine_module_assignments(mean_scores, threshold=assignment.threshold_used)
        opt_enh_module_id = calc.get("optional_enhancement_module")
        opt_enh_construct = calc.get("optional_enhancement_construct")
        if opt_enh_module_id:
            assignment.optional_enhancement_module = opt_enh_module_id
            assignment.optional_enhancement_construct = opt_enh_construct
            assignment.optional_module_ids = json.dumps(calc.get("optional_module_ids", []))
            assignment.recommendation_reason = calc.get("recommendation_reason")
            try:
                db.commit()
            except Exception:
                pass

    if all_constructs_high and opt_enh_module_id and opt_enh_module_id in MODULE_CURRICULUM:
        cur = MODULE_CURRICULUM[opt_enh_module_id]
        st = state_by_num.get(opt_enh_module_id)
        status_val = st.status if st else "optional"
        act_done = st.activity_completed if st else False
        act_data = json.loads(st.activity_data) if st and st.activity_data else None
        completed_at = st.completed_at if st else None

        # Build context-aware enhancement why_recommended using the score
        mod_def = MODULE_DEFINITIONS.get(opt_enh_module_id, {})
        construct_names = {
            "attitude": "Attitude",
            "pbc": "Perceived Behavioral Control",
            "subjective_norm": "Subjective Norms",
            "behavioral_intention": "Behavioral Intention",
        }
        enh_construct_name = construct_names.get(
            opt_enh_construct,
            opt_enh_construct.replace("_", " ").title() if opt_enh_construct else "your weakest construct"
        )
        enh_score = mean_scores.get(opt_enh_construct) if opt_enh_construct else None
        enh_score_str = f" ({round(enh_score)}%)" if enh_score is not None else ""

        base_enh_text = mod_def.get("why_recommended_enhancement")
        if base_enh_text:
            why_enh = base_enh_text
        else:
            why_enh = (
                f"Your {enh_construct_name}{enh_score_str} is your relatively lowest-scoring construct. "
                f"This recommended module will help you close the gap and reach even higher readiness."
            )

        modules_out.append(ModuleDetailOut(
            module_number=opt_enh_module_id,
            id=opt_enh_module_id,
            title=cur["title"],
            subtitle=cur["subtitle"],
            target_construct=cur.get("target_construct_display", cur["target_construct"]),
            target_construct_key=cur["target_construct_key"],
            construct_mean_score=mean_scores.get(cur["target_construct_key"]),
            is_required=False,
            is_unlocked=True,  # Always unlocked for optional modules
            status=status_val,
            activity_completed=act_done,
            activity_data=act_data,
            estimated_minutes=cur["estimated_minutes"],
            why_recommended=why_enh,
            overview=cur["overview"],
            learning_objectives=cur["learning_objectives"],
            sections=cur["sections"],
            activity=cur["activity"],
            completed_at=completed_at,
        ))

    # All required modules must be completed to unlock post-assessment
    all_required_done = (
        len(required_ids) == 0
        or all(
            state_by_num.get(m_id) and state_by_num[m_id].status == "completed"
            for m_id in required_ids
        )
    )

    assignment_dict = {
        "assigned_modules": assigned_module_order,
        "required_module_ids": required_ids,
        "optional_module_ids": json.loads(assignment.optional_module_ids) if assignment.optional_module_ids else [],
        "low_constructs": low_constructs,
        "high_constructs": high_constructs,
        "all_constructs_high": all_constructs_high,
        # Enhancement module info for all-high users
        "optional_enhancement_module": assignment.optional_enhancement_module,
        "optional_enhancement_construct": assignment.optional_enhancement_construct,
        "mean_scores": mean_scores,
        "threshold_used": assignment.threshold_used,
        "is_reinforcement": assignment.is_reinforcement,
        "is_fallback": assignment.is_fallback,
        "recommendation_reason": assignment.recommendation_reason,
    }

    return AdaptiveLearningPathOut(
        assignment=assignment_dict,
        modules=modules_out,
        all_required_completed=all_required_done,
        can_start_post_assessment=all_required_done,
    )


@router.post("/modules/{module_id}/start", status_code=status.HTTP_200_OK)
def start_module(
    module_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marks a module as 'in-progress'."""
    if module_id not in [1, 2, 3, 4]:
        raise HTTPException(status_code=404, detail="Module not found.")

    if not _is_pre_completed(db, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=_PRE_ASSESSMENT_REQUIRED_DETAIL,
        )

    _get_or_create_user_assignment(db, current_user)
    st = (
        db.query(UserModuleState)
        .filter(UserModuleState.user_id == current_user.id, UserModuleState.module_number == module_id)
        .first()
    )
    if not st:
        raise HTTPException(status_code=404, detail="Module state not initialized.")

    if st.status != "completed":
        st.status = "in-progress"
        db.commit()

        # Update UserInterventionProgress if exists
        prog = (
            db.query(UserInterventionProgress)
            .filter(
                UserInterventionProgress.user_id == current_user.id,
                UserInterventionProgress.intervention_id == module_id,
            )
            .first()
        )
        if prog and prog.status != "completed":
            prog.status = "in-progress"
            db.commit()

    return {"message": f"Module {module_id} is in-progress.", "status": st.status}


@router.post("/modules/{module_id}/activity", status_code=status.HTTP_200_OK)
def submit_module_activity(
    module_id: int,
    payload: ActivitySubmissionPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits and validates completion of an interactive module activity:
      - Module 1: 'Rida's Story' categorization
      - Module 2: 'Fatima's Story' perspective-taking empathy reflections
      - Module 3: Evidence Preservation checklist and response simulation
      - Module 4: Department Chat Poll role-playing scenario
    """
    if module_id not in [1, 2, 3, 4]:
        raise HTTPException(status_code=404, detail="Module not found.")

    if not _is_pre_completed(db, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=_PRE_ASSESSMENT_REQUIRED_DETAIL,
        )

    _get_or_create_user_assignment(db, current_user)
    st = (
        db.query(UserModuleState)
        .filter(UserModuleState.user_id == current_user.id, UserModuleState.module_number == module_id)
        .first()
    )
    if not st:
        raise HTTPException(status_code=404, detail="Module state not initialized.")

    responses = payload.responses
    is_valid = False

    if module_id == 1:
        # Check all 3 categorization items answered
        items = responses.get("categorizations", {})
        if len(items) >= 3 and all(v for v in items.values()):
            is_valid = True
    elif module_id == 2:
        # Check both empathy prompts answered with substantive text
        reflections = responses.get("reflections", {})
        r1 = reflections.get("prompt_1", "").strip()
        r2 = reflections.get("prompt_2", "").strip()
        if len(r1.split()) >= 10 and len(r2.split()) >= 10:
            is_valid = True
    elif module_id == 3:
        # Check all checklist items acknowledged and response sequence selected
        checklist = responses.get("checklist_verified", [])
        seq_answer = responses.get("response_sequence")
        if len(checklist) >= 4 and seq_answer is not None:
            is_valid = True
    elif module_id == 4:
        # Check a role choice was made
        role = responses.get("selected_role")
        if role in ["reinforcer", "outsider", "confrontation", "upstander"]:
            is_valid = True

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Activity submission incomplete. Please fulfill all requirements before submitting."
        )

    st.activity_completed = True
    st.activity_data = json.dumps(responses)
    db.commit()

    return {
        "message": f"Activity for Module {module_id} completed successfully.",
        "activity_completed": True,
    }


@router.post("/modules/{module_id}/complete", status_code=status.HTTP_200_OK)
def complete_module(
    module_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Marks a module as completed.
    STRICT REQUIREMENT: Cannot be completed unless the required activity is finished first.
    """
    if module_id not in [1, 2, 3, 4]:
        raise HTTPException(status_code=404, detail="Module not found.")

    if not _is_pre_completed(db, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=_PRE_ASSESSMENT_REQUIRED_DETAIL,
        )

    assignment = _get_or_create_user_assignment(db, current_user)
    st = (
        db.query(UserModuleState)
        .filter(UserModuleState.user_id == current_user.id, UserModuleState.module_number == module_id)
        .first()
    )
    if not st:
        raise HTTPException(status_code=404, detail="Module state not initialized.")

    if not st.activity_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must complete the required activity for this module before marking it complete."
        )

    st.status = "completed"
    st.completed_at = datetime.utcnow()
    db.commit()

    # Synchronize with UserInterventionProgress
    prog = (
        db.query(UserInterventionProgress)
        .filter(
            UserInterventionProgress.user_id == current_user.id,
            UserInterventionProgress.intervention_id == module_id,
        )
        .first()
    )
    if not prog:
        # If completing an optional module, register it as completed
        prog = UserInterventionProgress(
            user_id=current_user.id,
            intervention_id=module_id,
            status="completed",
            completed_at=datetime.utcnow(),
        )
        db.add(prog)
    else:
        prog.status = "completed"
        prog.completed_at = datetime.utcnow()

    db.commit()

    # Check if all REQUIRED modules are now completed
    required_ids = json.loads(assignment.required_module_ids)
    all_states = (
        db.query(UserModuleState)
        .filter(UserModuleState.user_id == current_user.id)
        .all()
    )
    states_dict = {s.module_number: s for s in all_states}
    all_req_done = all(
        states_dict.get(m) and states_dict[m].status == "completed"
        for m in required_ids
    )

    return {
        "message": f"Module {module_id} completed successfully!",
        "status": "completed",
        "all_required_completed": all_req_done,
        "post_assessment_unlocked": all_req_done,
    }


# ──────────────────────────────────────────────────────────────────────────────
# BACKWARD COMPATIBLE INTERVENTION ENDPOINTS
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/my", response_model=list[UserInterventionOut])
def get_my_interventions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns progress records for backwards-compatible API consumers.
    """
    if not _is_pre_completed(db, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=_PRE_ASSESSMENT_REQUIRED_DETAIL,
        )
    _get_or_create_user_assignment(db, current_user)
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
    """Legacy start intervention endpoint."""
    return start_module(intervention_id, current_user, db)


@router.post("/{intervention_id}/complete", status_code=status.HTTP_200_OK)
def complete_intervention(
    intervention_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Legacy complete intervention endpoint."""
    # Ensure activity is flagged for legacy calls
    st = (
        db.query(UserModuleState)
        .filter(UserModuleState.user_id == current_user.id, UserModuleState.module_number == intervention_id)
        .first()
    )
    if st:
        st.activity_completed = True
        db.commit()

    return complete_module(intervention_id, current_user, db)
