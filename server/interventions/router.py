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
    """
    _ensure_core_interventions_seeded(db)

    assignment = db.query(UserAdaptiveAssignment).filter(UserAdaptiveAssignment.user_id == user.id).first()
    if assignment:
        return assignment

    # Retrieve pre-assessment scores
    pre_scores = None
    # Check AssessmentInstance (Personalized 3-scenario assessment)
    inst = (
        db.query(AssessmentInstance)
        .filter(AssessmentInstance.user_id == user.id, AssessmentInstance.stage == "pre")
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
            .order_by(Assessment.submitted_at.desc())
            .first()
        )
        if legacy_asst and legacy_asst.attitude_score is not None:
            pre_scores = {
                "attitude": legacy_asst.attitude_score,
                "subjective_norm": legacy_asst.subjective_norm_score,
                "pbc": legacy_asst.pbc_score,
                "behavioral_intention": legacy_asst.behavioral_intention_score,
            }

    # Execute adaptive assignment algorithm
    mean_scores = calculate_mean_item_scores(pre_scores=pre_scores)
    assign_result = determine_module_assignments(mean_scores, threshold=DEFAULT_ADAPTIVE_THRESHOLD)

    assignment = UserAdaptiveAssignment(
        user_id=user.id,
        assigned_modules=json.dumps(assign_result["assigned_modules"]),
        required_module_ids=json.dumps(assign_result["required_module_ids"]),
        optional_module_ids=json.dumps(assign_result["optional_module_ids"]),
        low_constructs=json.dumps(assign_result["low_constructs"]),
        mean_scores=json.dumps(assign_result["mean_scores"]),
        threshold_used=assign_result["threshold_used"],
        is_reinforcement=assign_result["is_reinforcement"],
        is_fallback=assign_result["is_fallback"],
        recommendation_reason=assign_result["recommendation_reason"],
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    # Initialize per-module states
    required_ids_set = set(assign_result["required_module_ids"])
    for m_num in [1, 2, 3, 4]:
        is_req = m_num in required_ids_set
        db.add(UserModuleState(
            user_id=user.id,
            module_number=m_num,
            is_required=is_req,
            status="assigned",
            activity_completed=False,
            activity_data=None,
        ))

        # Synchronize with UserInterventionProgress for required modules
        if is_req:
            existing_prog = (
                db.query(UserInterventionProgress)
                .filter(
                    UserInterventionProgress.user_id == user.id,
                    UserInterventionProgress.intervention_id == m_num,
                )
                .first()
            )
            if not existing_prog:
                db.add(UserInterventionProgress(
                    user_id=user.id,
                    intervention_id=m_num,
                    status="assigned",
                ))

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
    Returns the student's complete adaptive learning journey:
      - Assignment metadata (low constructs, mean item scores, threshold, why assigned)
      - Complete 4 modules with target constructs, Required/Optional labels, sequential lock status,
        rich curriculum, and interactive activities.
    """
    assignment = _get_or_create_user_assignment(db, current_user)

    assigned_module_order = json.loads(assignment.assigned_modules)
    required_ids = json.loads(assignment.required_module_ids)
    mean_scores = json.loads(assignment.mean_scores)

    # Query all module states for this student
    states = (
        db.query(UserModuleState)
        .filter(UserModuleState.user_id == current_user.id)
        .all()
    )
    state_by_num = {s.module_number: s for s in states}

    # Sequential unlocking among REQUIRED modules:
    # First required module is unlocked. Each subsequent required module unlocks
    # only after the preceding required module is completed.
    unlocked_status: Dict[int, bool] = {}
    prev_required_done = True

    for m_num in assigned_module_order:
        st = state_by_num.get(m_num)
        is_done = st and st.status == "completed"
        unlocked_status[m_num] = prev_required_done
        if not is_done:
            prev_required_done = False

    # Optional modules are always unlocked for free exploration
    for m_num in [1, 2, 3, 4]:
        if m_num not in required_ids:
            unlocked_status[m_num] = True

    # Assemble response modules
    modules_out: List[ModuleDetailOut] = []

    # Display required modules in assigned order first, then optional in numeric order
    display_order = list(assigned_module_order)
    for m in [1, 2, 3, 4]:
        if m not in display_order:
            display_order.append(m)

    for m_num in display_order:
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

    # All required modules must be completed to unlock post-assessment
    all_required_done = all(
        state_by_num.get(m_id) and state_by_num[m_id].status == "completed"
        for m_id in required_ids
    )

    assignment_dict = {
        "assigned_modules": assigned_module_order,
        "required_module_ids": required_ids,
        "optional_module_ids": json.loads(assignment.optional_module_ids),
        "low_constructs": json.loads(assignment.low_constructs),
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
