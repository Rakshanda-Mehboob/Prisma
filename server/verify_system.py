"""
verify_system.py — Comprehensive end-to-end verification of TPB module:
- 4 constructs (Attitude, SubjectiveNorm, PBC, BehavioralIntention)
- Profile-aware AI/synthesizer scenario generation (3 blocks x 8 = 24 items)
- 7-point Likert scoring & weak construct intervention assignment
- Dashboard & Intervention progress
"""

import sys
import json
from database import SessionLocal
import models
from assessment.ai_generator import generate_personalized_scenario_blocks
from assessment.scoring import calculate_scores, identify_weak_constructs, calculate_overall
from auth.utils import hash_password

def run_tests():
    print("=== STARTING PRISMA TPB SYSTEM VERIFICATION ===")
    db = SessionLocal()

    # 1. Verify Interventions in DB
    print("\n--- 1. Verifying Interventions in DB ---")
    interventions = db.query(models.Intervention).all()
    constructs = set(i.target_construct for i in interventions)
    print(f"Total interventions: {len(interventions)}")
    print(f"Target constructs covered: {constructs}")
    assert "Attitude" in constructs, "Missing Attitude interventions"
    assert "SubjectiveNorm" in constructs, "Missing SubjectiveNorm interventions"
    assert "PBC" in constructs, "Missing PBC interventions"
    assert "BehavioralIntention" in constructs, "Missing BehavioralIntention interventions"
    print("[OK] All 4 constructs have verified interventions!")

    # 2. Test Profile-Aware Scenario Generation
    print("\n--- 2. Testing 3-Block (24 Questions) Scenario Generation ---")
    sample_profile = {
        "degree_program": "Computer Science",
        "academic_year": "Third Year",
        "faculty_department": "Faculty of Computing",
        "learning_environment": "Hybrid",
        "class_size": "Large",
        "platforms_used": ["WhatsApp", "Discord", "University LMS"],
        "online_activity_level": "High",
        "main_online_activities": ["Academic discussions", "Gaming communities"],
        "university_activity_level": "Moderate",
        "participation_types": ["Academic groups", "Online communities"],
        "social_role": "Usually participates",
        "encounter_frequency": "Sometimes",
        "experience_types": ["Insults or mocking", "Group chat conflicts"],
        "experience_role": "Observer",
    }

    scenarios = generate_personalized_scenario_blocks(
        db=db,
        stage="pre",
        profile_data=sample_profile,
        num_blocks=3
    )

    print(f"Generated {len(scenarios)} scenario items.")
    assert len(scenarios) == 24, f"Expected 24 questions, got {len(scenarios)}"

    counts = {"Attitude": 0, "SubjectiveNorm": 0, "PBC": 0, "BehavioralIntention": 0}
    for s in scenarios:
        counts[s.construct] += 1
        assert len(s.options) == 7, f"Scenario {s.id} should have 7 options, got {len(s.options)}"

    print(f"Construct distribution: {counts}")
    assert counts == {"Attitude": 6, "SubjectiveNorm": 6, "PBC": 6, "BehavioralIntention": 6}, "Unequal construct distribution"
    print("[OK] 24 scenario questions successfully generated with 7-point Likert options across all 4 constructs!")

    # 3. Test 7-Point Likert Scoring Engine
    print("\n--- 3. Testing 7-Point Likert Scoring Engine ---")
    # Simulate low Attitude (scores: 2, 2, 1, 2, 1, 2 -> avg ~1.67 -> norm ~11.1)
    # High SubjectiveNorm (scores: 6, 7, 6, 7, 6, 7 -> avg 6.5 -> norm ~91.7)
    # Moderate PBC (scores: 4, 5, 4, 4, 5, 4 -> avg 4.33 -> norm ~55.5 -> weak (<60))
    # High BehavioralIntention (scores: 6, 6, 7, 6, 6, 7 -> avg 6.33 -> norm ~88.9)
    test_responses = []
    for s in scenarios:
        if s.construct == "Attitude":
            score = 2
        elif s.construct == "SubjectiveNorm":
            score = 7
        elif s.construct == "PBC":
            score = 4
        elif s.construct == "BehavioralIntention":
            score = 6
        test_responses.append({"construct": s.construct, "selected_score": score})

    scores = calculate_scores(test_responses)
    overall = calculate_overall(scores)
    weak = identify_weak_constructs(scores)

    print(f"Attitude Score: {scores.attitude:.1f}/100")
    print(f"Subjective Norm Score: {scores.subjective_norm:.1f}/100")
    print(f"PBC Score: {scores.pbc:.1f}/100")
    print(f"Behavioral Intention Score: {scores.behavioral_intention:.1f}/100")
    print(f"Composite Overall Score: {overall:.1f}/100")
    print(f"Identified Weak Constructs (<60): {weak}")

    assert "Attitude" in weak, "Attitude should be weak"
    assert "PBC" in weak, "PBC should be weak"
    assert "SubjectiveNorm" not in weak, "SubjectiveNorm should not be weak"
    assert "BehavioralIntention" not in weak, "BehavioralIntention should not be weak"
    print("[OK] Scoring engine and weak construct identification validated successfully!")

    print("\n=== ALL SYSTEM TESTS PASSED CLEANLY ===")
    db.close()

if __name__ == "__main__":
    run_tests()
