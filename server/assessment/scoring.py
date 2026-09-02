"""
assessment/scoring.py — Core TPB scoring engine.

Theory of Planned Behavior constructs measured:
  - Attitude (AT)          : student's evaluation of cyberbullying as harmful/acceptable
  - Subjective Norm (SN)   : perceived social pressure from peers/family to avoid it
  - PBC                    : perceived behavioral control to intervene or avoid it

Scoring logic:
  1. Collect selected_score (1–5 Likert) for all questions of each construct.
  2. Average the raw scores per construct.
  3. Normalize to 0–100 scale: normalized = ((avg - 1) / 4) * 100
     → score of 1 (most negative) → 0
     → score of 5 (most positive) → 100
  4. Constructs with normalized score < WEAK_THRESHOLD (60) are flagged for intervention.

References:
  Ajzen, I. (1991). The theory of planned behavior. Organizational Behavior and
  Human Decision Processes, 50(2), 179–211.
"""

from typing import NamedTuple

WEAK_THRESHOLD = 60.0  # Scores below this trigger intervention assignment


class TPBScores(NamedTuple):
    attitude: float
    subjective_norm: float
    pbc: float


def normalize_score(raw_avg: float) -> float:
    """Convert a 1–5 Likert average to a 0–100 normalized score."""
    return round(((raw_avg - 1) / 4) * 100, 2)


def calculate_scores(
    responses: list[dict],  # list of {"construct": str, "selected_score": int}
) -> TPBScores:
    """
    Compute per-construct normalized scores (0–100) from raw assessment responses.

    Args:
        responses: list of dicts with keys "construct" and "selected_score"

    Returns:
        TPBScores namedtuple with attitude, subjective_norm, pbc fields.
    """
    buckets: dict[str, list[int]] = {
        "Attitude": [],
        "SubjectiveNorm": [],
        "PBC": [],
    }

    for r in responses:
        construct = r["construct"]
        score = r["selected_score"]
        if construct in buckets:
            buckets[construct].append(score)

    def safe_avg(scores: list[int]) -> float:
        if not scores:
            return 0.0
        return normalize_score(sum(scores) / len(scores))

    return TPBScores(
        attitude=safe_avg(buckets["Attitude"]),
        subjective_norm=safe_avg(buckets["SubjectiveNorm"]),
        pbc=safe_avg(buckets["PBC"]),
    )


def identify_weak_constructs(scores: TPBScores) -> list[str]:
    """
    Return a list of TPB construct names that fall below WEAK_THRESHOLD.
    These constructs will have interventions assigned to the student.

    Example:
        scores = TPBScores(attitude=45, subjective_norm=72, pbc=38)
        → ["Attitude", "PBC"]
    """
    weak = []
    construct_map = {
        "Attitude": scores.attitude,
        "SubjectiveNorm": scores.subjective_norm,
        "PBC": scores.pbc,
    }
    for name, score in construct_map.items():
        if score < WEAK_THRESHOLD:
            weak.append(name)

    # If all constructs are strong, still assign at least the weakest one
    if not weak:
        weakest = min(construct_map, key=lambda k: construct_map[k])
        weak.append(weakest)

    return weak


def generate_feedback_text(
    pre_scores: TPBScores,
    post_scores: TPBScores,
) -> list[str]:
    """
    Rule-based personalized feedback generator comparing pre vs post scores.
    Returns a list of human-readable feedback strings for the dashboard.

    Reference: Theory of change messaging draws on social-cognitive theory
    (Bandura, 1986) — positive reinforcement of behavioral change.
    """
    messages: list[str] = []

    def delta_message(construct_name: str, pre: float, post: float) -> str:
        diff = round(post - pre, 1)
        label = construct_name.replace("SubjectiveNorm", "Subjective Norm")
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
    messages.append(delta_message("PBC", pre_scores.pbc, post_scores.pbc))

    # Overall message
    avg_pre = (pre_scores.attitude + pre_scores.subjective_norm + pre_scores.pbc) / 3
    avg_post = (post_scores.attitude + post_scores.subjective_norm + post_scores.pbc) / 3
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
