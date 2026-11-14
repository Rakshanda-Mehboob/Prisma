"""
verify_system.py — Comprehensive end-to-end verification of TPB module:
- 4 constructs (Attitude, SubjectiveNorm, PBC, BehavioralIntention)
- Adaptive scenario assessment generation via adaptive_engine (3 scenarios x 8 questions = 24 items)
- 4-option (0–3) scoring & weak construct intervention assignment (<70 threshold)
- Assessment structure validation (2 per construct per scenario, balanced 6 per construct total)
"""

import sys
import json
from database import SessionLocal
import models
from assessment.adaptive_engine import generate_scenario_assessment
from assessment.scoring import calculate_scores, identify_weak_constructs, calculate_overall
from auth.utils import hash_password


def run_tests():
    print("=== STARTING PRISMA TPB SYSTEM VERIFICATION ===")
    db = SessionLocal()

    try:
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

        # 2. Setup Test Student User and Profile
        print("\n--- 2. Setting up Test Student for Adaptive Assessment ---")
        test_email = "verifier_test_student@riphah.edu.pk"
        test_user = db.query(models.User).filter(models.User.email == test_email).first()
        if not test_user:
            test_user = models.User(
                full_name="Verification Student",
                email=test_email,
                cms_number="CMS-VERIFY-001",
                password_hash=hash_password("VerifyPass123!"),
                role="student",
                department="Computer Science",
                living_situation="University hostel",
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)

        # Ensure student profile exists
        profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == test_user.id).first()
        if not profile:
            profile = models.StudentProfile(
                user_id=test_user.id,
                degree_program="Computer Science",
                faculty_department="Faculty of Computing",
                academic_year="3rd Year",
                academic_level="Undergraduate",
                living_situation="University hostel",
                platforms_used=json.dumps(["WhatsApp", "Discord", "Instagram"]),
                participation_types=json.dumps(["University batch group", "Section group chats"]),
                main_online_activities=json.dumps(["Academic group chats", "Gaming"]),
                online_activity_level="Frequently",
            )
            db.add(profile)
            db.commit()

        # Clean any existing assessment instance for this user to allow clean generation
        existing_instances = db.query(models.AssessmentInstance).filter(
            models.AssessmentInstance.user_id == test_user.id,
            models.AssessmentInstance.stage == "pre",
        ).all()
        for inst in existing_instances:
            # Delete questions & scenarios
            for sc in inst.scenarios:
                db.query(models.AssessmentQuestion).filter(models.AssessmentQuestion.scenario_id == sc.id).delete()
            db.query(models.AssessmentScenario).filter(models.AssessmentScenario.instance_id == inst.id).delete()
            db.delete(inst)
        db.commit()

        # 3. Test Adaptive Scenario Generation
        print("\n--- 3. Testing 3-Scenario (24 Questions) Adaptive Assessment Generation ---")
        instance = generate_scenario_assessment(db=db, user_id=test_user.id, stage="pre")

        assert instance is not None, "Failed to generate assessment instance"
        assert len(instance.scenarios) == 3, f"Expected 3 scenarios, got {len(instance.scenarios)}"

        all_questions = []
        counts = {"Attitude": 0, "SubjectiveNorm": 0, "PBC": 0, "BehavioralIntention": 0}

        for sc_idx, sc in enumerate(instance.scenarios):
            assert len(sc.questions) == 8, f"Scenario {sc_idx + 1} expected 8 questions, got {len(sc.questions)}"
            sc_counts = {"Attitude": 0, "SubjectiveNorm": 0, "PBC": 0, "BehavioralIntention": 0}
            for q in sc.questions:
                all_questions.append(q)
                counts[q.tpb_construct] += 1
                sc_counts[q.tpb_construct] += 1
                options = json.loads(q.options_json)
                assert len(options) == 4, f"Question {q.id} should have 4 options, got {len(options)}"
                scores = {opt["score"] for opt in options}
                assert scores == {0, 1, 2, 3}, f"Question options must have scores 0, 1, 2, 3, got {scores}"

            assert sc_counts == {"Attitude": 2, "SubjectiveNorm": 2, "PBC": 2, "BehavioralIntention": 2}, (
                f"Scenario {sc_idx + 1} construct distribution invalid: {sc_counts}"
            )

        print(f"Generated {len(instance.scenarios)} scenarios with total {len(all_questions)} questions.")
        print(f"Total construct distribution: {counts}")
        assert counts == {"Attitude": 6, "SubjectiveNorm": 6, "PBC": 6, "BehavioralIntention": 6}, (
            f"Expected 6 questions per construct, got {counts}"
        )
        print("[OK] Assessment structure verified: 3 scenarios, 8 questions each (2/construct), 4 options (scores 0-3)!")

        # 4. Test 4-Option (0–3) Scoring Engine & Weak Construct Identification
        print("\n--- 4. Testing Scoring Engine & Weak Construct Identification (<70 Threshold) ---")
        # Simulate:
        # Low Attitude (score 1/3 -> ~33.3% -> weak)
        # High SubjectiveNorm (score 3/3 -> 100% -> not weak)
        # Low PBC (score 1/3 -> ~33.3% -> weak)
        # High BehavioralIntention (score 3/3 -> 100% -> not weak)
        test_responses = []
        for q in all_questions:
            if q.tpb_construct == "Attitude":
                selected_score = 1
            elif q.tpb_construct == "SubjectiveNorm":
                selected_score = 3
            elif q.tpb_construct == "PBC":
                selected_score = 1
            elif q.tpb_construct == "BehavioralIntention":
                selected_score = 3
            else:
                selected_score = 2

            test_responses.append({
                "construct": q.tpb_construct,
                "selected_score": selected_score,
                "is_reversed": q.is_reverse_scored,
            })

        scores = calculate_scores(test_responses)
        overall = calculate_overall(scores)
        weak = identify_weak_constructs(scores)

        print(f"Attitude Score: {scores.attitude:.1f}/100")
        print(f"Subjective Norm Score: {scores.subjective_norm:.1f}/100")
        print(f"PBC Score: {scores.pbc:.1f}/100")
        print(f"Behavioral Intention Score: {scores.behavioral_intention:.1f}/100")
        print(f"Composite Overall Score: {overall:.1f}/100")
        print(f"Identified Weak Constructs (<70): {weak}")

        assert "Attitude" in weak, "Attitude should be weak (<70)"
        assert "PBC" in weak, "PBC should be weak (<70)"
        assert "SubjectiveNorm" not in weak, "SubjectiveNorm should not be weak"
        assert "BehavioralIntention" not in weak, "BehavioralIntention should not be weak"
        print("[OK] Scoring engine and weak construct identification validated successfully!")

        print("\n=== ALL SYSTEM TESTS PASSED CLEANLY ===")
    finally:
        db.close()


if __name__ == "__main__":
    run_tests()
