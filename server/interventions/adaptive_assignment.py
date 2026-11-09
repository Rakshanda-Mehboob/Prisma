"""
interventions/adaptive_assignment.py — Adaptive Module Assignment Engine.

Theory of Planned Behavior (TPB) Construct-to-Module Mapping:
  - Attitude (ATT)               -> Module 1 (Introduction) and Module 2 (Causes and Effects)
  - Perceived Behavioral Control -> Module 3 (Preventive and Reactive Measures)
  - Subjective Norms (SN)        -> Module 4 (Your Role)
  - Behavioral Intention (BI)    -> Outcome variable, not an intervention module.

Adaptive Logic:
  1. Computes mean item score per construct on the standardized 1–5 scale.
  2. Compares against the configurable threshold (default 4.0).
  3. Sorts low constructs by lowest score first to prioritize student need.
  4. Assigns required vs optional modules.
  5. Provides resilient fallback for missing or malformed scores.
"""

from typing import Dict, List, Optional, Tuple, Any

# ──────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ──────────────────────────────────────────────────────────────────────────────
# Default threshold on the standardized 1–5 Likert scale.
# A construct is classified as "LOW" if its mean item score is strictly below this threshold.
# Score >= 4.0 indicates adequate baseline capability/norm/attitude.
DEFAULT_ADAPTIVE_THRESHOLD: float = 4.0


# Module metadata definitions
MODULE_DEFINITIONS = {
    1: {
        "module_number": 1,
        "title": "Module 1: Introduction to Cyberbullying",
        "subtitle": "Understanding Forms, Mediums, and Impact",
        "target_construct": "Attitude",
        "target_construct_key": "attitude",
        "estimated_minutes": 15,
        "why_recommended": (
            "Your diagnostic answers suggest you would benefit from recognizing the varied forms "
            "of online harassment, subtle digital harms, and campus impact. Module 1 provides the foundational awareness."
        ),
    },
    2: {
        "module_number": 2,
        "title": "Module 2: Causes and Effects of Cyberbullying",
        "subtitle": "Exploring Root Motivations and Building Empathy",
        "target_construct": "Attitude",
        "target_construct_key": "attitude",
        "estimated_minutes": 15,
        "why_recommended": (
            "Your responses indicate an opportunity to deepen empathy for victims and examine how "
            "academic competition and enmity fuel digital harm. Module 2 fosters perspective-taking."
        ),
    },
    3: {
        "module_number": 3,
        "title": "Module 3: Preventive and Reactive Measures",
        "subtitle": "Digital Hygiene, Platform Reporting, and Legal Protections",
        "target_construct": "Perceived Behavioral Control",
        "target_construct_key": "pbc",
        "estimated_minutes": 20,
        "why_recommended": (
            "Your diagnostic answers suggest you may benefit from building practical skills and "
            "digital confidence to protect your privacy, document evidence, and report online situations effectively."
        ),
    },
    4: {
        "module_number": 4,
        "title": "Module 4: Your Role – Peer Dynamics and Social Norms",
        "subtitle": "Bystander Action, Ethical Accountability, and Community Standards",
        "target_construct": "Subjective Norms",
        "target_construct_key": "subjective_norm",
        "estimated_minutes": 20,
        "why_recommended": (
            "Your responses suggest exploring the power of peer influence and positive social standards. "
            "Module 4 empowers you to break the bystander silence and foster digital respect."
        ),
    },
}


def percentage_to_likert_mean(percentage: Optional[float]) -> Optional[float]:
    """
    Convert a 0–100 percentage score to a standardized 1–5 Likert mean item score.
    Formula:
        mean = 1.0 + (percentage / 100.0) * 4.0
    Examples:
        100% -> 5.00
        75%  -> 4.00
        60%  -> 3.40
        50%  -> 3.00
        0%   -> 1.00
    """
    if percentage is None:
        return None
    try:
        val = float(percentage)
        val = max(0.0, min(100.0, val))
        return round(1.0 + (val / 100.0) * 4.0, 3)
    except (ValueError, TypeError):
        return None


def calculate_mean_item_scores(
    pre_scores: Optional[Dict[str, Any]] = None,
    raw_responses: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Optional[float]]:
    """
    Compute mean item score per construct on the 1–5 scale.
    Accepts either:
      1. raw_responses: list of dicts with {"construct": str, "selected_score": int (0-3 or 1-5)}
      2. pre_scores: dict with keys ("attitude", "subjective_norm", "pbc", "behavioral_intention")
         either as 0-100 percentages or already on 1-5 scale.

    Returns dict mapping construct keys to float scores (or None if missing).
    """
    result: Dict[str, Optional[float]] = {
        "attitude": None,
        "subjective_norm": None,
        "pbc": None,
        "behavioral_intention": None,
    }

    # Normalize construct naming aliases
    construct_aliases = {
        "attitude": "attitude",
        "att": "attitude",
        "attitude_score": "attitude",
        "subjectivenorm": "subjective_norm",
        "subjective_norm": "subjective_norm",
        "sn": "subjective_norm",
        "subjective_norm_score": "subjective_norm",
        "pbc": "pbc",
        "pbc_score": "pbc",
        "perceivedbehavioralcontrol": "pbc",
        "perceived_behavioral_control": "pbc",
        "behavioralintention": "behavioral_intention",
        "behavioral_intention": "behavioral_intention",
        "bi": "behavioral_intention",
        "behavioral_intention_score": "behavioral_intention",
    }

    # Path A: Calculate directly from raw item responses if provided
    if raw_responses and len(raw_responses) > 0:
        buckets: Dict[str, List[float]] = {
            "attitude": [],
            "subjective_norm": [],
            "pbc": [],
            "behavioral_intention": [],
        }

        # Check scale: are scores 0-3 or 1-5?
        scores_list = [r.get("selected_score", 0) for r in raw_responses if r.get("selected_score") is not None]
        max_val = max(scores_list) if scores_list else 3
        is_zero_to_three = max_val <= 3

        for r in raw_responses:
            raw_c = str(r.get("construct", "")).lower().replace(" ", "").replace("_", "")
            std_c = construct_aliases.get(raw_c)
            if std_c and std_c in buckets:
                score = r.get("selected_score")
                if score is not None:
                    score_f = float(score)
                    if is_zero_to_three:
                        # Convert 0-3 item score to 1-5 scale: 1.0 + (score / 3.0) * 4.0
                        score_f = 1.0 + (score_f / 3.0) * 4.0
                    buckets[std_c].append(score_f)

        for c, s_list in buckets.items():
            if s_list:
                result[c] = round(sum(s_list) / len(s_list), 3)

        if any(v is not None for v in result.values()):
            return result

    # Path B: Derive from pre_scores dict (typically percentage scores 0-100 from database)
    if pre_scores:
        for k, v in pre_scores.items():
            norm_k = construct_aliases.get(str(k).lower().replace(" ", "").replace("_", ""))
            if norm_k and v is not None:
                try:
                    num_val = float(v)
                    # If score is > 5.0, it is a percentage (0-100)
                    if num_val > 5.0:
                        result[norm_k] = percentage_to_likert_mean(num_val)
                    else:
                        result[norm_k] = round(num_val, 3)
                except (ValueError, TypeError):
                    pass

    return result


def determine_module_assignments(
    mean_scores: Dict[str, Optional[float]],
    threshold: float = DEFAULT_ADAPTIVE_THRESHOLD,
) -> Dict[str, Any]:
    """
    Execute adaptive assignment rules based on mean item scores:
      - Attitude LOW -> assign Module 1 and Module 2
      - PBC LOW -> assign Module 3
      - SN LOW -> assign Module 4
      - Multiple constructs LOW -> assign all matching modules, ordered by lowest score first
      - No construct LOW (all above threshold) -> assign all four modules as a reinforcement path (1, 2, 3, 4)
      - Intention low but all three predictors fine -> treat as no construct LOW (assign all four: 1, 2, 3, 4)
      - Missing or unreadable scores -> fallback to full sequence (1, 2, 3, 4) with neutral message

    Returns:
        dict containing:
          - 'assigned_modules': list of assigned module numbers (ordered)
          - 'required_module_ids': set of module numbers that are required
          - 'optional_module_ids': set of module numbers that are optional
          - 'low_constructs': list of construct keys classified as low, ordered by severity
          - 'is_reinforcement': bool indicating whether student is on reinforcement path
          - 'is_fallback': bool indicating whether missing scores triggered default fallback
          - 'recommendation_reason': overall explanation string
          - 'modules_detail': list of dicts with per-module assignment details
    """
    att = mean_scores.get("attitude")
    sn = mean_scores.get("subjective_norm")
    pbc = mean_scores.get("pbc")
    bi = mean_scores.get("behavioral_intention")

    # Check for missing or unreadable scores
    predictors = {"attitude": att, "subjective_norm": sn, "pbc": pbc}
    valid_predictors = {k: v for k, v in predictors.items() if v is not None}

    # Fallback case: pre-test scores are missing or unreadable
    if len(valid_predictors) == 0:
        assigned = [1, 2, 3, 4]
        return {
            "assigned_modules": assigned,
            "required_module_ids": [1, 2, 3, 4],
            "optional_module_ids": [],
            "low_constructs": [],
            "is_reinforcement": True,
            "is_fallback": True,
            "threshold_used": threshold,
            "mean_scores": mean_scores,
            "recommendation_reason": (
                "Welcome to your cyberbullying prevention curriculum. The standard 4-module learning sequence "
                "is assigned to provide you with comprehensive coverage of digital safety, empathy, and positive peer action."
            ),
            "modules_detail": _build_modules_detail(assigned, [1, 2, 3, 4], [], mean_scores),
        }

    # Evaluate predictor constructs against threshold
    low_constructs_with_scores: List[Tuple[str, float]] = []
    for c_key, score in valid_predictors.items():
        if score < threshold:
            low_constructs_with_scores.append((c_key, score))

    # Sort low constructs by lowest score first (ascending)
    low_constructs_with_scores.sort(key=lambda x: x[1])
    low_construct_keys = [c[0] for c in low_constructs_with_scores]

    # Case A: No predictor construct is low (all >= threshold)
    # Note: If Intention is low but all 3 predictors are fine, the rule explicitly treats as no construct LOW (assign all four)
    if len(low_construct_keys) == 0:
        assigned = [1, 2, 3, 4]
        reason = (
            "Great job! Your baseline assessment reflects strong capability across digital empathy, social expectations, "
            "and intervention confidence. All four modules are assigned as a reinforcement path to help you deepen these skills."
        )
        return {
            "assigned_modules": assigned,
            "required_module_ids": [1, 2, 3, 4],
            "optional_module_ids": [],
            "low_constructs": [],
            "is_reinforcement": True,
            "is_fallback": False,
            "threshold_used": threshold,
            "mean_scores": mean_scores,
            "recommendation_reason": reason,
            "modules_detail": _build_modules_detail(assigned, [1, 2, 3, 4], [], mean_scores),
        }

    # Case B: One or more predictor constructs are LOW
    assigned_modules: List[int] = []
    for c_key in low_construct_keys:
        if c_key == "attitude":
            if 1 not in assigned_modules:
                assigned_modules.append(1)
            if 2 not in assigned_modules:
                assigned_modules.append(2)
        elif c_key == "pbc":
            if 3 not in assigned_modules:
                assigned_modules.append(3)
        elif c_key == "subjective_norm":
            if 4 not in assigned_modules:
                assigned_modules.append(4)

    # Assigned modules are REQUIRED. Non-assigned modules are OPTIONAL.
    all_module_ids = [1, 2, 3, 4]
    required_ids = list(assigned_modules)
    optional_ids = [m for m in all_module_ids if m not in required_ids]

    # Generate student-friendly recommendation explanation
    construct_display_names = {
        "attitude": "Attitude & Empathy",
        "pbc": "Practical Response Skills & Control",
        "subjective_norm": "Social Standards & Peer Dynamics",
    }
    low_names = [construct_display_names[c] for c in low_construct_keys if c in construct_display_names]

    if len(low_construct_keys) == 1:
        c = low_construct_keys[0]
        if c == "attitude":
            reason = (
                "Based on your diagnostic assessment, your Attitude score indicates an opportunity to strengthen "
                "awareness of subtle cyber harms and victim empathy. Modules 1 and 2 are recommended as required learning."
            )
        elif c == "pbc":
            reason = (
                "Based on your diagnostic assessment, your answers suggest you may benefit from building practical skills "
                "and digital confidence to protect yourself and report online situations. Module 3 is recommended as required learning."
            )
        else:  # subjective_norm
            reason = (
                "Based on your diagnostic assessment, your Subjective Norms score suggests exploring the constructive power "
                "of peer influence and speaking up against online harassment. Module 4 is recommended as required learning."
            )
    else:
        reason = (
            f"Based on your diagnostic assessment, priority growth areas were identified in: {', '.join(low_names)}. "
            f"Modules {', '.join(str(m) for m in required_ids)} have been assigned as required in order of greatest need."
        )

    return {
        "assigned_modules": assigned_modules,
        "required_module_ids": required_ids,
        "optional_module_ids": optional_ids,
        "low_constructs": low_construct_keys,
        "is_reinforcement": False,
        "is_fallback": False,
        "threshold_used": threshold,
        "mean_scores": mean_scores,
        "recommendation_reason": reason,
        "modules_detail": _build_modules_detail(assigned_modules, required_ids, optional_ids, mean_scores),
    }


def _build_modules_detail(
    assigned_order: List[int],
    required_ids: List[int],
    optional_ids: List[int],
    mean_scores: Dict[str, Optional[float]],
) -> List[Dict[str, Any]]:
    """Build detailed per-module metadata list."""
    detail = []
    # Present modules in required order first, followed by optional modules in numeric order
    full_order = list(assigned_order)
    for m in [1, 2, 3, 4]:
        if m not in full_order:
            full_order.append(m)

    for m_num in full_order:
        cfg = MODULE_DEFINITIONS[m_num]
        is_req = m_num in required_ids
        c_key = cfg["target_construct_key"]
        score = mean_scores.get(c_key)

        detail.append({
            "module_number": m_num,
            "title": cfg["title"],
            "subtitle": cfg["subtitle"],
            "target_construct": cfg["target_construct"],
            "target_construct_key": c_key,
            "construct_mean_score": score,
            "is_required": is_req,
            "status": "assigned",  # initial status before user progress is applied
            "estimated_minutes": cfg["estimated_minutes"],
            "why_recommended": cfg["why_recommended"],
        })

    return detail

