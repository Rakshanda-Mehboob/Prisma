import json
import uuid
import urllib.request
import urllib.parse

BASE_URL = "http://127.0.0.1:8000"

def api_post(endpoint, data=None, json_body=None, headers=None):
    url = f"{BASE_URL}{endpoint}"
    h = headers.copy() if headers else {}
    if json_body is not None:
        body_bytes = json.dumps(json_body).encode("utf-8")
        h["Content-Type"] = "application/json"
    elif data is not None:
        body_bytes = urllib.parse.urlencode(data).encode("utf-8")
        h["Content-Type"] = "application/x-www-form-urlencoded"
    else:
        body_bytes = None
    req = urllib.request.Request(url, data=body_bytes, headers=h, method="POST")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def api_get(endpoint, headers=None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, headers=headers or {}, method="GET")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def run_test():
    # 1. Register a student with rich personalized context
    unique_suffix = str(uuid.uuid4())[:8]
    email = f"student_{unique_suffix}@riphah.edu.pk"
    reg_payload = {
        "full_name": "Hamza Tariq",
        "email": email,
        "cms_number": f"CMS-{unique_suffix.upper()}",
        "password": "Password123!",
        "age_group": "20–22",
        "gender": "Male",
        "university": "Riphah International University",
        "department": "Software Engineering",
        "academic_level": "Undergraduate",
        "academic_year": "2nd Year",
        "living_situation": "University hostel",
        "platforms_used": ["Instagram", "WhatsApp", "Discord", "Reddit"],
        "social_media_platforms": ["Instagram", "WhatsApp", "Discord", "Reddit"],
        "online_activity_level": "Frequently",
        "social_media_frequency": "Frequently",
        "digital_usage_patterns": ["Academic communication", "Gaming communities", "Social interaction"],
        "online_communities": ["Group chats", "University communities", "Gaming communities"],
        "main_interaction_with": "Classmates",
        "university_groups_participation": "Yes"
    }

    print(f"Registering student: {email}")
    status, user_data = api_post("/auth/register", json_body=reg_payload)
    assert status == 201, f"Registration failed: {user_data}"
    print("Registered successfully. User ID:", user_data["id"])

    # 2. Login to get token
    status, login_data = api_post(
        "/auth/login",
        json_body={"email": email, "password": "Password123!"}
    )
    assert status == 200, f"Login failed: {login_data}"
    token = login_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Logged in. Access token received.")

    # 3. Check User Profile Endpoint
    status, profile_data = api_get("/auth/user-profile", headers=headers)
    assert status == 200, f"Get profile failed: {profile_data}"
    print("UserProfile retrieved:")
    print(f" - Department: {profile_data.get('department')}")
    print(f" - Living: {profile_data.get('living_situation')}")
    print(f" - Platforms: {profile_data.get('social_media_platforms')}")
    print(f" - Patterns: {profile_data.get('digital_usage_patterns')}")

    # 4. Fetch Pre-Assessment Adaptive Scenarios (GET /assessment/pre)
    print("Generating/fetching adaptive pre-assessment scenarios...")
    status, assessment_data = api_get("/assessment/pre", headers=headers)
    assert status == 200, f"Get assessment failed: {assessment_data}"
    scenarios = assessment_data.get("scenarios", [])
    print(f"Assessment instance ID: {assessment_data.get('id')}, Scenarios received: {len(scenarios)}")
    assert len(scenarios) == 3, f"Expected 3 scenarios, got {len(scenarios)}"

    total_questions = 0
    for idx, s in enumerate(scenarios, 1):
        questions = s.get("questions", [])
        assert len(questions) > 0, f"Scenario {idx} has no questions!"
        total_questions += len(questions)
        for q in questions:
            assert len(q.get("options", [])) > 0, f"Question {q.get('id')} has no options!"
            # Options should not contain scores (Task 4)
            for opt in q["options"]:
                assert "score" not in opt, f"Option should not contain 'score': {opt}"
                assert "index" in opt, f"Option missing 'index': {opt}"

    print(f"Total questions across 3 scenarios: {total_questions}")

    # 5. Submit responses (POST /assessment/pre)
    print("Submitting answers for all questions...")
    answers = []
    for sc in scenarios:
        for q in sc.get("questions", []):
            # Select option index 0
            answers.append({"question_id": q["id"], "selected_option": 0})

    submit_payload = {"answers": answers}
    status, result = api_post("/assessment/pre", headers=headers, json_body=submit_payload)
    assert status == 201, f"Submit failed: {result}"
    print("Pre-assessment submitted successfully!")
    print(f" - Attitude score: {result.get('attitude_score')}%")
    print(f" - Subjective Norm score: {result.get('subjective_norm_score')}%")
    print(f" - PBC score: {result.get('pbc_score')}%")
    print(f" - Behavioral Intention score: {result.get('behavioral_intention_score')}%")
    print(f" - Overall composite: {result.get('overall_score')}%")
    print(f" - Weak constructs identified: {result.get('weak_constructs')}")

    print("\nALL ADAPTIVE ASSESSMENT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_test()
