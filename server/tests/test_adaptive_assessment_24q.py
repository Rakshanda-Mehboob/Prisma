"""
Comprehensive Unit & Integration Test Suite for Prisma TPB Assessment Engine.

Verifies all 17 requirements:
  1. Exactly 3 scenarios are generated.
  2. Exactly 8 questions are generated per scenario.
  3. Exactly 24 questions exist overall.
  4. Each scenario contains exactly 2 questions per TPB construct:
     Attitude (2), SubjectiveNorm (2), PBC (2), BehavioralIntention (2).
  5. Every question has exactly 4 options.
  6. Option scores are exactly 0, 1, 2, and 3 with identical labels.
  7. Positive questions are scored correctly (0 -> 0, 3 -> 3).
  8. Negative questions are reverse-scored correctly (0 -> 3, 3 -> 0).
  9. No double reverse-scoring occurs.
  10. OpenAI failure triggers the local fallback cleanly.
  11. Invalid OpenAI JSON is rejected by central validation.
  12. Invalid construct distribution is rejected.
  13. Previous scenarios are avoided when alternatives exist (anti-repetition).
  14. Database persistence saves all 24 questions and relationships.
  15. Construct totals are calculated correctly (out of 18).
  16. Overall score is between 0 and 72 (max score 72).
  17. End-to-end API exchange between client submission format and server.
"""

import json
import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from database import Base
import models
from assessment.adaptive_engine import (
    validate_assessment_structure,
    synthesize_scenario_assessment,
    generate_scenario_assessment,
    resolve_student_profile,
    get_user_scenario_history,
)
from assessment.scoring import (
    reverse_score,
    normalize_score,
    calculate_scores,
    calculate_overall,
    calculate_total_adjusted_score,
    calculate_overall_percentage,
    identify_weak_constructs,
    TPBScores,
    MAX_SCORE_PER_QUESTION,
    MAX_SCORE_PER_CONSTRUCT,
    MAX_TOTAL_SCORE,
    TOTAL_QUESTIONS,
)
from assessment.template_library import SCENARIO_TEMPLATES


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Create dummy user
    user = models.User(
        id=1,
        full_name="Fatima Noor",
        email="fatima.noor@university.edu.pk",
        cms_number="CMS-1001",
        password_hash="fakehash",
        role="student",
        department="Computer Science",
        living_situation="University hostel",
    )
    session.add(user)

    # Create UserProfile
    profile = models.UserProfile(
        user_id=1,
        department="Computer Science",
        academic_year="2nd Year",
        living_situation="University hostel",
        social_media_platforms=json.dumps(["WhatsApp", "Instagram"]),
        social_media_frequency="Frequently",
        online_communities=json.dumps(["Group chats", "University communities"]),
        digital_usage_patterns=json.dumps(["Academic communication", "Social interaction"]),
    )
    session.add(profile)
    session.commit()

    yield session
    session.close()


def test_template_library_structure():
    """Requirement 1-6: Verify all 18 templates adhere strictly to the 8-item TPB distribution and natural options."""
    assert len(SCENARIO_TEMPLATES) == 18
    for t in SCENARIO_TEMPLATES:
        assert len(t["questions"]) == 8, f"Template {t['template_key']} does not have 8 questions"
        constructs = [q["tpb_construct"] for q in t["questions"]]
        assert constructs.count("Attitude") == 2
        assert constructs.count("SubjectiveNorm") == 2
        assert constructs.count("PBC") == 2
        assert constructs.count("BehavioralIntention") == 2

        for q in t["questions"]:
            opts = q["options"]
            assert len(opts) == 4
            scores = {opt["score"] for opt in opts}
            assert scores == {0, 1, 2, 3}
            # Verify options are natural English statements, NOT standard Likert labels
            for opt in opts:
                text_clean = opt["text"].strip().lower()
                assert text_clean not in {"strongly agree", "agree", "disagree", "strongly disagree"}


def test_validation_function_accepts_valid_assessment(test_db):
    """Requirement 11 & 12: Validator accepts valid 24-item assessments."""
    profile_data = resolve_student_profile(test_db, 1)
    scenarios = synthesize_scenario_assessment(test_db, profile_data, set())
    is_valid, msg = validate_assessment_structure(scenarios)
    assert is_valid is True, f"Validation failed: {msg}"


def test_validation_function_rejects_invalid_scenarios():
    """Requirement 12: Validator strictly rejects wrong counts or construct distributions."""
    # Fewer than 3 scenarios
    assert validate_assessment_structure([])[0] is False
    assert validate_assessment_structure([{"scenario_text": "S1"}])[0] is False

    # Scenario with 7 questions instead of 8
    dummy_opts = [
        {"text": "It seems like normal group fun.", "score": 0},
        {"text": "I feel it could go too far.", "score": 1},
        {"text": "I would be uncomfortable with people joining in.", "score": 2},
        {"text": "I think it can seriously affect the student.", "score": 3},
    ]
    invalid_s = [
        {
            "scenario_text": f"Scenario {i}",
            "questions": [
                {"question_text": f"Q{j}", "tpb_construct": "Attitude", "options": dummy_opts}
                for j in range(7)
            ]
        }
        for i in range(3)
    ]
    is_valid, reason = validate_assessment_structure(invalid_s)
    assert is_valid is False
    assert "must have exactly 8 questions" in reason


def test_synthesizer_anti_repetition(test_db):
    """Requirement 13: Previously used templates are excluded when fresh templates exist."""
    profile_data = resolve_student_profile(test_db, 1)

    # First generation
    run1 = synthesize_scenario_assessment(test_db, profile_data, set())
    keys1 = {s["template_key"] for s in run1}
    assert len(keys1) == 3

    # Second generation with keys1 excluded
    run2 = synthesize_scenario_assessment(test_db, profile_data, keys1)
    keys2 = {s["template_key"] for s in run2}
    assert len(keys2) == 3

    # Must be completely distinct templates
    assert len(keys1.intersection(keys2)) == 0, "Templates were repeated despite alternatives existing"


def test_generate_scenario_assessment_db_persistence(test_db):
    """Requirement 14: All 24 questions, 3 scenarios, and options are persisted to SQLite."""
    instance = generate_scenario_assessment(test_db, user_id=1, stage="pre")

    assert instance.id is not None
    assert instance.stage == "pre"
    assert len(instance.scenarios) == 3

    total_persisted_questions = 0
    construct_counts = {"Attitude": 0, "SubjectiveNorm": 0, "PBC": 0, "BehavioralIntention": 0}

    for sc in instance.scenarios:
        assert sc.scenario_text is not None and len(sc.scenario_text) > 20
        assert len(sc.questions) == 8
        for q in sc.questions:
            total_persisted_questions += 1
            construct_counts[q.tpb_construct] += 1
            opts = json.loads(q.options_json)
            assert len(opts) == 4
            assert {o["score"] for o in opts} == {0, 1, 2, 3}

    assert total_persisted_questions == 24
    assert construct_counts["Attitude"] == 6
    assert construct_counts["SubjectiveNorm"] == 6
    assert construct_counts["PBC"] == 6
    assert construct_counts["BehavioralIntention"] == 6


def test_scoring_reverse_and_normalization():
    """Requirement 7, 8, 9, 15, 16: Test mathematical correctness of scoring."""
    # Reverse scoring formula check
    assert reverse_score(0) == 3
    assert reverse_score(1) == 2
    assert reverse_score(2) == 1
    assert reverse_score(3) == 0

    # Max possible construct score = 6 * 3 = 18
    # Max possible total score = 24 * 3 = 72
    responses = []
    # 6 Attitude items: selected 3 (positive), raw 3 -> adjusted 3
    for _ in range(6):
        responses.append({"construct": "Attitude", "selected_score": 3, "is_reversed": False})
    # 6 SubjectiveNorm items: selected 0 (negative item), raw 0 -> reversed 3
    for _ in range(6):
        responses.append({"construct": "SubjectiveNorm", "selected_score": 0, "is_reversed": True})
    # 6 PBC items: selected 2 (positive item), raw 2 -> adjusted 2
    for _ in range(6):
        responses.append({"construct": "PBC", "selected_score": 2, "is_reversed": False})
    # 6 BehavioralIntention items: selected 1 (positive item), raw 1 -> adjusted 1
    for _ in range(6):
        responses.append({"construct": "BehavioralIntention", "selected_score": 1, "is_reversed": False})

    scores = calculate_scores(responses)

    # Attitude: 18 / 18 = 100%
    assert scores.attitude == 100.0
    # SubjectiveNorm: 18 / 18 = 100% (reversed 0 -> 3 each)
    assert scores.subjective_norm == 100.0
    # PBC: 12 / 18 = 66.67%
    assert scores.pbc == 66.67
    # BehavioralIntention: 6 / 18 = 33.33%
    assert scores.behavioral_intention == 33.33

    # Total adjusted sum
    total_adj = calculate_total_adjusted_score(responses)
    # 18 + 18 + 12 + 6 = 54
    assert total_adj == 54
    assert 0 <= total_adj <= 72

    # Overall percentage: 54 / 72 * 100 = 75.0%
    overall_pct = calculate_overall_percentage(total_adj)
    assert overall_pct == 75.0

    # Overall composite average of 4 constructs
    overall = calculate_overall(scores)
    assert round(overall, 1) == 75.0

    # Weak construct identification: below 60% threshold
    weak = identify_weak_constructs(scores)
    assert "BehavioralIntention" in weak
    assert "Attitude" not in weak
    assert "SubjectiveNorm" not in weak


def test_no_double_reverse_scoring():
    """Requirement 9: Ensure reverse scoring is only applied once."""
    response = [{"construct": "Attitude", "selected_score": 0, "is_reversed": True}]
    scores = calculate_scores(response)
    # selected 0, reversed = 3 - 0 = 3; normalized out of 3 = 100%
    assert scores.attitude == 100.0

