"""
assessment/scoring.py — Core TPB scoring engine (v2.0).

Theory of Planned Behavior constructs measured:
  - Attitude (AT)                  : student's evaluation of cyberbullying as harmful/acceptable
  - Subjective Norm (SN)           : perceived social pressure from peers/family to avoid it
  - Perceived Behavioral Control   : perceived ability to intervene, avoid, or support
  - Behavioral Intention (BI)      : stated intention to act responsibly in future situations

Scoring model (Hidden 4-Option Scale: 0–3):
  Every question has 4 natural-language choices mapped to internal scores 0–3:
    0 = Strongly Disagree / Passive / Tolerating harm
    1 = Disagree / Hesitant / Unsure
    2 = Agree / Supportive / Constructive
    3 = Strongly Agree / Active Upstander / Prosocial Intervention

Reverse Scoring:
  For negatively worded questions (where agreement reflects tolerating bullying):
    Strongly Disagree → 3
    Disagree → 2
    Agree → 1
    Strongly Agree → 0
  Formula: reverse_score(score) = 3 - score.
  This ensures higher scores always represent healthier cyberbullying attitudes and intentions.

Score Normalization:
  Normalized Score = (Obtained Score / Maximum Possible Score) * 100
  For N questions in a construct, Maximum Possible Score = N * 3.
  Normalized Score = (sum(scores) / (N * 3)) * 100.
  Produces a 0–100 percentage.
  Constructs with normalized score < WEAK_THRESHOLD (60.0%) are flagged for intervention.

References:
  Ajzen, I. (1991). The theory of planned behavior. Organizational Behavior and
  Human Decision Processes, 50(2), 179–211.
"""

from typing import NamedTuple

WEAK_THRESHOLD = 60.0       # Scores below this percentage trigger intervention assignment
MAX_SCORE_PER_QUESTION = 3  # 4-option scale: 0, 1, 2, 3


class TPBScores(NamedTuple):
    attitude: float
    subjective_norm: float
    pbc: float
    behavioral_intention: float


def reverse_score(score: int, max_score: int = MAX_SCORE_PER_QUESTION) -> int:
    """
    Reverse scoring for negatively worded questions:
      Strongly Disagree (0) -> 3
      Disagree (1) -> 2
      Agree (2) -> 1
      Strongly Agree (3) -> 0
    Formula: max_score - score
    """
    return max(0, min(max_score, max_score - score))


def normalize_score(obtained: float, max_possible: float) -> float:
    """
    Convert obtained score and maximum possible score to a 0–100 percentage.
    Formula: Normalized Score = (Obtained Score / Maximum Possible Score) * 100
    """
    if max_possible <= 0:
        return 0.0
    return round((obtained / max_possible) * 100, 2)


def calculate_scores(
    responses: list[dict],  # list of {"construct": str, "selected_score": int, Optional "is_reversed": bool}
) -> TPBScores:
    """
    Compute per-construct normalized scores (0–100) from 0–3 assessment responses.
    Applies reverse scoring when a question is flagged as is_reversed/reverse_scored.

    Args:
        responses: list of dicts with keys "construct", "selected_score", and optional "is_reversed"

    Returns:
        TPBScores namedtuple with attitude, subjective_norm, pbc, behavioral_intention fields.
    """
    buckets: dict[str, list[int]] = {
        "Attitude": [],
        "SubjectiveNorm": [],
        "PBC": [],
        "BehavioralIntention": [],
    }

    for r in responses:
        construct = r.get("construct")
        if construct in buckets:
            score = int(r.get("selected_score", 0))
            is_reversed = bool(r.get("is_reversed") or r.get("reverse_scored"))
            if is_reversed:
                score = reverse_score(score)
            buckets[construct].append(score)

    def calculate_construct_normalized(scores: list[int]) -> float:
        if not scores:
            return 0.0
        obtained = sum(scores)
        max_possible = len(scores) * MAX_SCORE_PER_QUESTION
        return normalize_score(obtained, max_possible)

    return TPBScores(
        attitude=calculate_construct_normalized(buckets["Attitude"]),
        subjective_norm=calculate_construct_normalized(buckets["SubjectiveNorm"]),
        pbc=calculate_construct_normalized(buckets["PBC"]),
        behavioral_intention=calculate_construct_normalized(buckets["BehavioralIntention"]),
    )


def calculate_overall(scores: TPBScores) -> float:
    """
    Compute the overall composite TPB score using a weighted average.
    Weights follow Ajzen's model where BI is the proximate predictor
    (Attitude + SN + PBC → BI → Behavior).
    """
    weighted = (
        scores.attitude * 0.22
        + scores.subjective_norm * 0.22
        + scores.pbc * 0.28
        + scores.behavioral_intention * 0.28
    )
    return round(weighted, 2)


def identify_weak_constructs(scores: TPBScores) -> list[str]:
    """
    Return a list of TPB construct names that fall below WEAK_THRESHOLD (60.0%).
    These constructs will have interventions assigned to the student.

    Example:
        scores = TPBScores(attitude=45.0, subjective_norm=72.0, pbc=38.0, behavioral_intention=55.0)
        → ["Attitude", "PBC", "BehavioralIntention"]
    """
    weak = []
    construct_map = {
        "Attitude": scores.attitude,
        "SubjectiveNorm": scores.subjective_norm,
        "PBC": scores.pbc,
        "BehavioralIntention": scores.behavioral_intention,
    }
    for name, score in construct_map.items():
        if score < WEAK_THRESHOLD:
            weak.append(name)

    # If all constructs are strong, still assign at least the weakest one
    if not weak:
        weakest = min(construct_map, key=lambda k: construct_map[k])
        weak.append(weakest)

    return weak


def get_intervention_type(construct: str) -> dict:
    """
    Return the intervention type metadata for a given weak construct.
    Used by the result screen to provide context-aware guidance messaging.
    """
    types = {
        "Attitude": {
            "label": "Empathy & Awareness",
            "description": "Deepen your understanding of how harmful online behaviors impact others.",
            "activities": ["Empathy scenarios", "Consequence awareness", "Perspective-taking activities"],
            "color": "#4f46e5",
            "emoji": "💭",
        },
        "SubjectiveNorm": {
            "label": "Social Responsibility",
            "description": "Explore how peers and communities can positively influence digital behavior.",
            "activities": ["Positive peer influence examples", "Social responsibility activities", "Community norms analysis"],
            "color": "#0891b2",
            "emoji": "👥",
        },
        "PBC": {
            "label": "Confidence & Skills",
            "description": "Build practical skills for handling and reporting online conflicts.",
            "activities": ["Reporting guidance", "Conflict management strategies", "Response technique practice"],
            "color": "#7c3aed",
            "emoji": "💪",
        },
        "BehavioralIntention": {
            "label": "Commitment & Action",
            "description": "Strengthen your commitment to responsible online behavior through practice.",
            "activities": ["Commitment activities", "Decision-making scenarios", "Future planning exercises"],
            "color": "#059669",
            "emoji": "🎯",
        },
    }
    return types.get(construct, types["Attitude"])


def generate_feedback_text(
    pre_scores: TPBScores,
    post_scores: TPBScores,
) -> list[str]:
    """
    Rule-based personalized feedback generator comparing pre vs post scores.
    Returns a list of human-readable feedback strings for the dashboard.
    """
    messages: list[str] = []

    def delta_message(construct_name: str, pre: float, post: float) -> str:
        diff = round(post - pre, 1)
        label = (
            construct_name
            .replace("SubjectiveNorm", "Subjective Norm")
            .replace("BehavioralIntention", "Behavioral Intention")
        )
        if diff >= 15:
            return (
                f"🎉 Outstanding! Your {label} score improved by {diff} points. "
                f"You've shown remarkable growth in this area."
            )
        elif diff >= 8:
            return (
                f"✅ Great progress! Your {label} score improved by {diff} points. "
                f"Keep reinforcing these values in your daily interactions."
            )
        elif diff >= 1:
            return (
                f"📈 Your {label} score improved by {diff} points. "
                f"Small steps lead to lasting change — stay consistent."
            )
        elif diff == 0:
            return (
                f"➡️ Your {label} score remained the same. "
                f"Consider revisiting the intervention modules for deeper reflection."
            )
        else:
            return (
                f"⚠️ Your {label} score changed by {diff} points. "
                f"Don't be discouraged — behavioral change takes time and practice."
            )

    messages.append(delta_message("Attitude", pre_scores.attitude, post_scores.attitude))
    messages.append(
        delta_message("Subjective Norm", pre_scores.subjective_norm, post_scores.subjective_norm)
    )
    messages.append(delta_message("Perceived Behavioral Control", pre_scores.pbc, post_scores.pbc))
    messages.append(
        delta_message("Behavioral Intention", pre_scores.behavioral_intention, post_scores.behavioral_intention)
    )

    # Overall message
    avg_pre = (pre_scores.attitude + pre_scores.subjective_norm + pre_scores.pbc + pre_scores.behavioral_intention) / 4
    avg_post = (post_scores.attitude + post_scores.subjective_norm + post_scores.pbc + post_scores.behavioral_intention) / 4
    if avg_post > avg_pre:
        messages.append(
            "🌟 Overall, your awareness of cyberbullying and your confidence to act against it "
            "has improved. You are contributing to a safer digital community."
        )
    else:
        messages.append(
            "💪 Cyberbullying prevention is an ongoing journey. "
            "Revisit the learning modules and reflect on real-world scenarios."
        )

    return messages
