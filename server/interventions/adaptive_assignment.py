"""
interventions/adaptive_assignment.py — Adaptive Module Assignment Engine.

Theory of Planned Behavior (TPB) Construct-to-Module Mapping:
  - Attitude (0–69%)                       -> Module 1 (Introduction) and Module 2 (Causes and Effects)
  - Perceived Behavioral Control (0–69%)  -> Module 3 (Preventive and Reactive Measures)
  - Subjective Norms (0–69%)               -> Module 4 (Your Role)
  - Behavioral Intention                   -> Outcome variable.

Adaptive Logic (Two-Tier):
  - Score < 70  -> MANDATORY intervention for that construct only.
  - All scores >= 70 -> No mandatory intervention.
                        Find the relatively lowest-scoring construct across all,
                        and recommend ONE optional personalised enhancement module for it.
  - Modules are NEVER shown for constructs that are not the lowest or not below threshold.
"""

from typing import Dict, List, Optional, Tuple, Any

# ──────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ──────────────────────────────────────────────────────────────────────────────
# TPB Construct Readiness Threshold (Percentage: 0–100).
# Scores strictly below 70.0 (0–69) are classified as "Low" and require intervention.
# Scores 70.0 and above (70–100) are classified as "High" (Good Readiness) with NO intervention.
CONSTRUCT_LOW_THRESHOLD: float = 70.0
DEFAULT_ADAPTIVE_THRESHOLD: float = CONSTRUCT_LOW_THRESHOLD


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
            "Your Attitude score fell below 70%, indicating an opportunity to strengthen awareness of "
            "subtle cyber harms, digital defamation, and peer impact. Module 1 provides foundational awareness."
        ),
        "why_recommended_enhancement": (
            "Your Attitude score is your relatively lowest-scoring construct compared to your other results. "
            "Module 1 will sharpen your awareness of subtle cyber harms and digital defamation, "
            "helping you reach even higher cybersecurity readiness."
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
            "Your Attitude score fell below 70%. Module 2 deepens victim empathy and explores how "
            "academic jealousy and enmity drive online harassment."
        ),
        "why_recommended_enhancement": (
            "Your Attitude score is your relatively lowest-scoring construct. "
            "Module 2 deepens your empathy for victims and explores the motivations behind online harassment, "
            "helping you close the gap between good and excellent readiness."
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
            "Your Perceived Behavioral Control score fell below 70%, suggesting you would benefit from building "
            "practical skills and confidence to secure accounts, preserve evidence, and report violations under PECA 2016."
        ),
        "why_recommended_enhancement": (
            "Your Perceived Behavioral Control score is your relatively lowest-scoring construct. "
            "Module 3 will strengthen your practical digital hygiene skills, evidence preservation techniques, "
            "and understanding of legal protections under PECA 2016 — pushing your readiness to its peak."
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
            "Your Subjective Norms score fell below 70%. Module 4 empowers you to challenge passive bystander silence "
            "and establish constructive peer expectations in campus group chats."
        ),
        "why_recommended_enhancement": (
            "Your Subjective Norms score is your relatively lowest-scoring construct. "
            "Module 4 will help you go beyond passive awareness — challenging bystander silence and building "
            "the peer-leadership skills that distinguish good from excellent digital citizenship."
        ),
    },
}


def normalize_to_percentage(val: Optional[float]) -> Optional[float]:
    """
    Ensure score is expressed as a 0–100 percentage.
    If input is on a 1–5 scale (<= 5.0), converts to percentage: ((val - 1.0) / 4.0) * 100.
    If input is already > 5.0, clips to [0.0, 100.0].
    """
    if val is None:
        return None
    try:
        f = float(val)
        if f <= 5.0 and f >= 0.0:
            # 1-5 Likert scale -> percentage
            pct = ((f - 1.0) / 4.0) * 100.0
            return round(max(0.0, min(100.0, pct)), 2)
        return round(max(0.0, min(100.0, f)), 2)
    except (ValueError, TypeError):
        return None


def calculate_mean_item_scores(
    pre_scores: Optional[Dict[str, Any]] = None,
    raw_responses: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Optional[float]]:
    """
    Extract individual TPB construct scores as 0–100 percentages.
    """
    result: Dict[str, Optional[float]] = {
        "attitude": None,
        "subjective_norm": None,
        "pbc": None,
        "behavioral_intention": None,
    }

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

    # Path A: Raw responses
    if raw_responses and len(raw_responses) > 0:
        buckets: Dict[str, List[float]] = {
            "attitude": [],
            "subjective_norm": [],
            "pbc": [],
            "behavioral_intention": [],
        }

        scores_list = [r.get("selected_score", 0) for r in raw_responses if r.get("selected_score") is not None]
        max_val = max(scores_list) if scores_list else 3

        for r in raw_responses:
            raw_c = str(r.get("construct", "")).lower().replace(" ", "").replace("_", "")
            std_c = construct_aliases.get(raw_c)
            if std_c and std_c in buckets:
                score = r.get("selected_score")
                if score is not None:
                    score_f = float(score)
                    if max_val <= 3:
                        # 0-3 scale to percentage: (score / 3.0) * 100
                        score_f = (score_f / 3.0) * 100.0
                    elif max_val <= 5:
                        score_f = ((score_f - 1.0) / 4.0) * 100.0
                    buckets[std_c].append(score_f)

        for c, s_list in buckets.items():
            if s_list:
                result[c] = round(sum(s_list) / len(s_list), 2)

        if any(v is not None for v in result.values()):
            return result

    # Path B: Pre-scores dict from database
    if pre_scores:
        for k, v in pre_scores.items():
            norm_k = construct_aliases.get(str(k).lower().replace(" ", "").replace("_", ""))
            if norm_k and v is not None:
                result[norm_k] = normalize_to_percentage(v)

    return result


def determine_module_assignments(
    construct_scores: Dict[str, Optional[float]],
    threshold: float = CONSTRUCT_LOW_THRESHOLD,
) -> Dict[str, Any]:
    """
    Determine personalized intervention modules based on individual construct scores:
      - Low (0–69%)    -> Display intervention(s) for that construct.
      - High (70–100%) -> Do NOT display any intervention for that construct (hidden).
      - If multiple constructs are low -> Ordered by lowest score first.
      - If ALL constructs score 70–100:
          Display congratulations message; no interventions required.
    """
    att = construct_scores.get("attitude")
    sn = construct_scores.get("subjective_norm")
    pbc = construct_scores.get("pbc")
    bi = construct_scores.get("behavioral_intention")

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
            "high_constructs": [],
            "all_constructs_high": False,
            "is_reinforcement": True,
            "is_fallback": True,
            "threshold_used": threshold,
            "construct_scores": construct_scores,
            "mean_scores": construct_scores,
            "recommendation_reason": (
                "Welcome to your cyberbullying prevention curriculum. The standard 4-module learning sequence "
                "is available to provide you with comprehensive coverage of digital safety, empathy, and positive peer action."
            ),
            "modules_detail": _build_modules_detail(assigned, [1, 2, 3, 4], construct_scores),
        }

    # Categorize into Low (< threshold) vs High (>= threshold)
    low_constructs_with_scores: List[Tuple[str, float]] = []
    high_constructs: List[str] = []

    for c_key, score in valid_predictors.items():
        if score < threshold:
            low_constructs_with_scores.append((c_key, score))
        else:
            high_constructs.append(c_key)

    # Also check behavioral intention if provided
    if bi is not None and bi >= threshold:
        high_constructs.append("behavioral_intention")

    # Sort low constructs by lowest score first (ascending)
    low_constructs_with_scores.sort(key=lambda x: x[1])
    low_construct_keys = [c[0] for c in low_constructs_with_scores]

    # ── CASE 1: ALL CONSTRUCTS SCORE 70–100 ───────────────────────────────────
    # Find the weakest construct among the high ones for an optional enhancement
    if len(low_construct_keys) == 0:
        # Identify the single weakest construct (lowest score) for optional recommendation
        # Map construct keys to their module numbers
        CONSTRUCT_TO_MODULE = {
            "attitude": 1,          # Module 1 is the entry-level Attitude module
            "pbc": 3,
            "subjective_norm": 4,
            "behavioral_intention": None,  # No dedicated module; fall back to nearest
        }

        # Sort all scored predictor constructs by score ascending to find the weakest
        all_scored = sorted(
            [(c, s) for c, s in valid_predictors.items() if s is not None],
            key=lambda x: x[1],
        )

        # Check if all scored constructs have identical scores (e.g., all 100%)
        unique_scores = set(s for _, s in all_scored)
        all_scores_equal = len(unique_scores) <= 1 and len(all_scored) > 0

        optional_module = None
        optional_construct_key = None
        weakest_key = None
        weakest_score = None

        if all_scores_equal:
            # If all constructs have equal scores (e.g., all 100%), automatically recommend Module 1
            optional_module = 1
            optional_construct_key = "attitude"
            weakest_key = "attitude"
            weakest_score = all_scored[0][1] if all_scored else 100.0
        else:
            # Pick the construct with the lowest score
            weakest_key = all_scored[0][0] if all_scored else None
            weakest_score = all_scored[0][1] if all_scored else None

            # Map to module; if behavioral_intention is weakest pick the next weakest predictor
            optional_construct_key = weakest_key
            if weakest_key and weakest_key in CONSTRUCT_TO_MODULE:
                mod = CONSTRUCT_TO_MODULE[weakest_key]
                if mod is None:
                    # behavioral_intention has no dedicated module; use next weakest predictor
                    for c, _s in all_scored[1:]:
                        if CONSTRUCT_TO_MODULE.get(c) is not None:
                            optional_module = CONSTRUCT_TO_MODULE[c]
                            optional_construct_key = c
                            break
                else:
                    optional_module = mod

        optional_module_ids = [optional_module] if optional_module else []

        # Build reason text
        construct_display_names = {
            "attitude": "Attitude",
            "pbc": "Perceived Behavioral Control",
            "subjective_norm": "Subjective Norms",
            "behavioral_intention": "Behavioral Intention",
        }
        optional_name = construct_display_names.get(optional_construct_key, optional_construct_key) if optional_construct_key else "your strongest growth area"
        optional_score_str = f" ({round(weakest_score)}%)" if weakest_score is not None else ""

        if all_scores_equal:
            reason_text = (
                f"All your TPB construct scores are in the High range (70–100%) with equal readiness ({round(weakest_score)}%). "
                f"No mandatory learning is required. "
                f"Module 1 (Introduction to Cyberbullying Awareness) is recommended as a foundational enhancement module."
            )
        else:
            reason_text = (
                f"All your TPB construct scores are in the High range (70–100%). "
                f"No mandatory learning is required. "
                f"Your relatively lowest score is {optional_name}{optional_score_str} — "
                f"an optional enhancement module is available to help you reach even higher."
            )

        return {
            "assigned_modules": [],
            "required_module_ids": [],
            "optional_module_ids": optional_module_ids,
            "low_constructs": [],
            "high_constructs": list(valid_predictors.keys()),
            "all_constructs_high": True,
            "optional_enhancement_module": optional_module,
            "optional_enhancement_construct": optional_construct_key,
            "is_reinforcement": False,
            "is_fallback": False,
            "threshold_used": threshold,
            "construct_scores": construct_scores,
            "mean_scores": construct_scores,
            "recommendation_reason": reason_text,
            "modules_detail": _build_modules_detail(optional_module_ids, [], construct_scores),
        }

    # ── CASE 2: DISPLAY ONLY MODULES FOR LOW CONSTRUCTS (< 70) ────────────────
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

    construct_display_names = {
        "attitude": "Attitude",
        "pbc": "Perceived Behavioral Control",
        "subjective_norm": "Subjective Norms",
        "behavioral_intention": "Behavioral Intention",
    }
    low_names = [f"{construct_display_names[c]} ({predictors[c]}%)" for c in low_construct_keys if c in construct_display_names]
    high_names = [f"{construct_display_names[c]} ({predictors.get(c, bi)}%)" for c in high_constructs if c in construct_display_names]

    reason_parts = [
        f"Based on your diagnostic assessment, interventions are assigned for constructs scoring below 70%: {', '.join(low_names)}."
    ]
    if high_names:
        reason_parts.append(
            f"Constructs with good readiness ({', '.join(high_names)}) do not require intervention and are omitted."
        )

    return {
        "assigned_modules": assigned_modules,
        "required_module_ids": assigned_modules,
        "optional_module_ids": [],
        "low_constructs": low_construct_keys,
        "high_constructs": high_constructs,
        "all_constructs_high": False,
        "is_reinforcement": False,
        "is_fallback": False,
        "threshold_used": threshold,
        "construct_scores": construct_scores,
        "mean_scores": construct_scores,
        "recommendation_reason": " ".join(reason_parts),
        "modules_detail": _build_modules_detail(assigned_modules, assigned_modules, construct_scores),
    }


def _build_modules_detail(
    assigned_order: List[int],
    required_ids: List[int],
    construct_scores: Dict[str, Optional[float]],
) -> List[Dict[str, Any]]:
    """Build detailed per-module metadata list for displayed modules only."""
    detail = []
    for m_num in assigned_order:
        cfg = MODULE_DEFINITIONS[m_num]
        c_key = cfg["target_construct_key"]
        score = construct_scores.get(c_key)

        detail.append({
            "module_number": m_num,
            "title": cfg["title"],
            "subtitle": cfg["subtitle"],
            "target_construct": cfg["target_construct"],
            "target_construct_key": c_key,
            "construct_score": score,
            "is_required": m_num in required_ids,
            "status": "assigned",
            "estimated_minutes": cfg["estimated_minutes"],
            "why_recommended": cfg["why_recommended"],
        })

    return detail
