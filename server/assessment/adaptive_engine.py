"""
assessment/adaptive_engine.py — Prisma Personalized Scenario-Based Assessment Engine.

Implements the Personalized 3-Scenario Assessment Architecture:
  1. Retrieves the student's registration profile (department, year, living, platforms, habits).
  2. Retrieves the student's previous assessment history to prevent repetition across retakes and stages.
  3. Attempts OpenAI generation with the student's full profile, anti-repetition context, and TPB balance.
  4. If OpenAI is unavailable or fails, leverages the Scenario Template Library and Dynamic Generative
     Synthesizer to generate 3 unique, profile-matched, realistic cyberbullying scenarios.
  5. Covers all 4 TPB constructs across each scenario:
     - Attitude (ATT)
     - Subjective Norm (SN)
     - Perceived Behavioural Control (PBC)
     - Behavioural Intention (BI)
  6. Dynamically varies characters, settings, academic contexts, and dialogue so no two students
     receive identical assessments.
  7. Persists the assessment instance and logs to UserScenarioHistory for anti-repetition.
"""

import json
import hashlib
import random
from datetime import datetime
from typing import List, Dict, Optional, Tuple, Set
from sqlalchemy.orm import Session

import models
from config import OPENAI_API_KEY
from assessment.template_library import (
    SCENARIO_TEMPLATES,
    STUDENT_NAMES_FEMALE,
    STUDENT_NAMES_MALE,
    ALL_STUDENT_NAMES,
    DEPARTMENT_ACADEMIC_TASKS,
    LIVING_SETTINGS,
)

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


# ─────────────────────────────────────────────────────────────────────────────
# 1. PROFILE ANALYSIS & CONTEXT RESOLUTION
# ─────────────────────────────────────────────────────────────────────────────

def resolve_student_profile(db: Session, user_id: int) -> Dict:
    """
    Extract and synthesize all available profile parameters for a student.
    Queries UserProfile, StudentProfile, and User to construct a unified profile.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    user_prof = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
    student_prof = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == user_id).first()

    def _safe_json(val, default):
        if not val:
            return default
        if isinstance(val, list):
            return val
        try:
            parsed = json.loads(val)
            return parsed if isinstance(parsed, list) else default
        except Exception:
            return default

    # Academic & Personal context
    dept = (
        (user_prof.department if user_prof and user_prof.department else None)
        or (student_prof.degree_program if student_prof and student_prof.degree_program else None)
        or (user.department if user and user.department else "Computer Science")
    )
    year = (
        (user_prof.academic_year if user_prof and user_prof.academic_year else None)
        or (student_prof.academic_year if student_prof and student_prof.academic_year else "1st Year")
    )
    level = (
        (user_prof.academic_level if user_prof and user_prof.academic_level else None)
        or (student_prof.academic_level if student_prof and student_prof.academic_level else "Undergraduate")
    )
    living = (
        (user_prof.living_situation if user_prof and user_prof.living_situation else None)
        or (student_prof.living_situation if student_prof and student_prof.living_situation else None)
        or (user.living_situation if user and user.living_situation else "University hostel")
    )
    age = user_prof.age_group if user_prof and user_prof.age_group else "19-22"
    gender = user_prof.gender if user_prof and user_prof.gender else "Prefer not to say"

    # Digital Behaviour
    raw_platforms = user_prof.social_media_platforms if user_prof else (student_prof.platforms_used if student_prof else None)
    platforms = _safe_json(raw_platforms, ["WhatsApp", "Instagram", "Discord"])

    freq = (
        (user_prof.social_media_frequency if user_prof and user_prof.social_media_frequency else None)
        or (student_prof.online_activity_level if student_prof and student_prof.online_activity_level else "Frequently")
    )

    raw_comm = user_prof.online_communities if user_prof else None
    communities = _safe_json(raw_comm, ["Group chats", "University communities"])

    raw_patterns = user_prof.digital_usage_patterns if user_prof else (student_prof.main_online_activities if student_prof else None)
    patterns = _safe_json(raw_patterns, ["Academic communication", "Social interaction"])

    return {
        "user_id": user_id,
        "full_name": user.full_name if user else "Student",
        "department": dept,
        "academic_year": year,
        "academic_level": level,
        "living_situation": living,
        "age_group": age,
        "gender": gender,
        "social_media_platforms": platforms,
        "social_media_frequency": freq,
        "online_communities": communities,
        "digital_usage_patterns": patterns,
    }


def normalize_construct(raw: str) -> str:
    """Ensure TPB construct exactly matches database check constraint."""
    cleaned = (raw or "").replace(" ", "").replace("_", "").lower()
    if "attitude" in cleaned:
        return "Attitude"
    elif "subjective" in cleaned or "norm" in cleaned:
        return "SubjectiveNorm"
    elif "control" in cleaned or "pbc" in cleaned or "perceived" in cleaned:
        return "PBC"
    elif "intention" in cleaned or "behavioral" in cleaned:
        return "BehavioralIntention"
    return "Attitude"


# ─────────────────────────────────────────────────────────────────────────────
# 2. USER SCENARIO HISTORY & ANTI-REPETITION TRACKING
# ─────────────────────────────────────────────────────────────────────────────

def get_user_scenario_history(db: Session, user_id: int) -> Tuple[Set[str], List[str]]:
    """
    Retrieve previously shown templates and scenario summaries for this student.
    Returns:
      - previously_used_keys: set of template keys or hashes
      - previous_summaries: list of short text descriptions of past scenarios
    """
    history_records = (
        db.query(models.UserScenarioHistory)
        .filter(models.UserScenarioHistory.user_id == user_id)
        .order_by(models.UserScenarioHistory.shown_at.desc())
        .limit(30)
        .all()
    )

    keys: Set[str] = set()
    summaries: List[str] = []

    for h in history_records:
        if h.template_key:
            keys.add(h.template_key)
        if h.scenario_hash:
            keys.add(h.scenario_hash)
        if h.scenario_summary:
            summaries.append(h.scenario_summary)

    return keys, summaries


def record_scenario_history(
    db: Session,
    user_id: int,
    template_key: Optional[str],
    scenario_text: str,
    stage: str,
    difficulty: int = 1,
) -> models.UserScenarioHistory:
    """
    Record a shown scenario in UserScenarioHistory for anti-repetition tracking.
    """
    sc_hash = hashlib.sha256(scenario_text.strip().encode("utf-8")).hexdigest()
    summary = scenario_text[:120].strip() + "..." if len(scenario_text) > 120 else scenario_text.strip()

    history_entry = models.UserScenarioHistory(
        user_id=user_id,
        template_key=template_key,
        scenario_hash=sc_hash,
        scenario_summary=summary,
        stage=stage,
        difficulty_level=difficulty,
        shown_at=datetime.utcnow(),
    )
    db.add(history_entry)
    return history_entry


# ─────────────────────────────────────────────────────────────────────────────
# 3. OPENAI GENERATION (WITH FULL PROFILE & ANTI-REPETITION CONTEXT)
# ─────────────────────────────────────────────────────────────────────────────

def generate_with_openai(
    profile_data: Dict,
    previously_used_summaries: List[str],
    stage: str = "pre",
) -> Optional[List[Dict]]:
    """
    Call OpenAI to generate exactly 3 unique, personalized cyberbullying scenarios at runtime.
    Strictly enforces:
      - Easy, simple, everyday conversational English (grade 6-8 reading level).
      - Zero psychometric or academic jargon.
      - Authentic Pakistani / South Asian university cultural context.
      - Strong user profile relevance (department, year, living, platforms).
      - Clear narrative coherence (the scenario must make complete, believable sense).
    """
    if not OPENAI_API_KEY or not OPENAI_API_KEY.strip() or "your_openai" in OPENAI_API_KEY.lower():
        return None
    if not OpenAI:
        return None

    dept = profile_data.get("department", "Computer Science")
    year = profile_data.get("academic_year", "2nd Year")
    living = profile_data.get("living_situation", "University hostel")
    platforms_list = profile_data.get("social_media_platforms", ["WhatsApp", "Instagram"])
    platforms_str = ", ".join(platforms_list) if isinstance(platforms_list, list) else str(platforms_list)
    comm_list = profile_data.get("online_communities", ["University batch group", "Section group chats"])
    communities = ", ".join(comm_list) if isinstance(comm_list, list) else str(comm_list)
    pat_list = profile_data.get("digital_usage_patterns", ["Academic group chats", "Social interaction"])
    patterns = ", ".join(pat_list) if isinstance(pat_list, list) else str(pat_list)
    primary_platform = platforms_list[0] if (isinstance(platforms_list, list) and platforms_list) else "WhatsApp"

    prev_context = ""
    if previously_used_summaries:
        bullet_list = "\n".join(f"- {s}" for s in previously_used_summaries[:5])
        prev_context = f"\nPreviously used scenarios for this student (DO NOT REPEAT OR DUPLICATE THESE PLOTS):\n{bullet_list}\n"

    prompt = f"""You are generating an assessment for a university student.

CRITICAL WRITING RULE — EASY & SIMPLE WORDS:
- Use clear, simple, everyday English (6th to 8th grade reading level).
- DO NOT use difficult academic words or research jargon (NEVER use words like: "prosocial", "weaponize", "objectify", "normative", "subtle redirection", "affiliate", "dogpiling", "brigade", "sabotage", "acute distress", "human dignity violation", "repute", "cognitive", "dichotomy").
- Sentences must be short, plain, and easy to read so any student understands immediately on the first read.

CULTURAL CONTEXT — PAKISTANI / SOUTH ASIAN UNIVERSITY CAMPUS:
- Setting: A Pakistani / South Asian university campus.
- Names: Use relatable South Asian student names (e.g., Zainab, Hamza, Fatima, Bilal, Usman, Mahnoor, Ayesha, Saad, Hira, Arham, Maryam, Daniyal).
- Campus Realities:
  * Class WhatsApp batch groups and section chats.
  * Class Representative (CR / GCR) messages and notices.
  * Anonymous university confession or meme pages on Instagram.
  * Group project partner disputes, assignments, marks / GPA anxiety, lab submissions.
  * Campus life: canteen/cafeteria candid clips or jokes, library study sessions, university point bus commute, hostel rooms and dining mess.

STUDENT PROFILE (Make scenarios naturally relevant to this student):
- Department / Field of Study: {dept}
- Academic Year: {year}
- Living Situation: {living}
- Social Media Used: {platforms_str} (Activity: {profile_data.get('social_media_frequency', 'Frequently')})
- Digital Groups / Habits: {communities}
- Main Online Activities: {patterns}
{prev_context}

NARRATIVE COHERENCE (The scenario MUST make complete sense):
- Tell a realistic, believable, and coherent story in 3-4 simple sentences.
- Do NOT randomly insert keywords into odd places. The plot must flow naturally and make sense for a student in {dept}.
- For Computer Science / IT: A student's code is leaked and mocked in the batch WhatsApp group, or someone is blamed for a broken group project submission before the deadline.
- For Business / Management: A teammate's presentation slides are mocked in an Instagram story, or someone is excluded from a competition team.
- For Engineering: A lab report calculation mistake is screenshotted and circulated with rude captions.
- For Medical / Health Sciences: Mocking someone's viva answer or practical mistake in a study chat.
- Incorporate their living situation naturally (e.g. hostel floor drama, or rush to catch the university point bus).

REQUIRED STRUCTURE:
Generate exactly 3 distinct scenarios:
1. Scenario 1: A social media situation (e.g. on {primary_platform} — an anonymous confession post, a story poll, or comments mocking a peer).
2. Scenario 2: A private group or chat situation (e.g. a university WhatsApp batch group, section chat, or Discord server).
3. Scenario 3: A campus teamwork or community situation (e.g. group project partner dispute, hostel living, or student society).

FOR EACH SCENARIO, GENERATE EXACTLY 6 QUESTIONS:
Cover all 4 Theory of Planned Behavior (TPB) constructs:
- 1-2 Attitude questions (How the student views the behavior — is it harmful, mean, or just harmless fun?)
- 1-2 SubjectiveNorm questions (What close friends, batch mates, or respected peers would expect them to do)
- 1-2 PBC questions (How confident and capable they feel about speaking up, helping, or reporting)
- 1-2 BehavioralIntention questions (What they would realistically do in this situation)

EVERY QUESTION MUST HAVE EXACTLY 4 ANSWER OPTIONS (scored 1, 3, 5, 7):
Write all options in EASY, EVERYDAY WORDS:
- Score 1 = Joins in, finds it funny, or thinks it is harmless fun
- Score 3 = Passive bystander, ignores it, minds own business
- Score 5 = Helpful private support, checks in on the person, or quietly reports
- Score 7 = Active upstander, speaks up in the chat, asks poster/admin to remove it, and openly supports the peer

Output strictly valid JSON with this exact format:
{{
  "scenarios": [
    {{
      "scenario_text": "...",
      "category": "Social Media Interaction",
      "platform_context": "{primary_platform}",
      "questions": [
        {{
          "question_text": "...",
          "tpb_construct": "Attitude",
          "options": [
            {{"text": "...", "score": 1}},
            {{"text": "...", "score": 3}},
            {{"text": "...", "score": 5}},
            {{"text": "...", "score": 7}}
          ]
        }}
      ]
    }}
  ]
}}"""

    try:
        print(f"[Adaptive Engine] Calling OpenAI gpt-4o-mini for runtime scenario generation (Dept: {dept}, Stage: {stage})...")
        client = OpenAI(api_key=OPENAI_API_KEY, timeout=25.0)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a friendly, student-focused educational guide creating university cyberbullying assessment scenarios in a Pakistani/South Asian cultural context. "
                        "CRITICAL INSTRUCTION: Write in very simple, plain everyday English (grade 6-8 reading level). Avoid all academic and psychometric jargon. "
                        "Ensure scenarios and questions make total narrative sense for the student's department and student life. "
                        "Respond ONLY with valid JSON."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.75,
        )

        content = response.choices[0].message.content
        data = json.loads(content)
        scenarios = data.get("scenarios", [])

        if len(scenarios) >= 3:
            validated = []
            for s in scenarios[:3]:
                if not s.get("scenario_text") or not s.get("questions") or len(s["questions"]) < 4:
                    return None
                cleaned_questions = []
                for q in s["questions"]:
                    c = normalize_construct(q.get("tpb_construct", "Attitude"))
                    opts = q.get("options", [])
                    if len(opts) >= 4:
                        cleaned_questions.append({
                            "question_text": q.get("question_text"),
                            "tpb_construct": c,
                            "options": opts[:4],
                        })
                if len(cleaned_questions) >= 4:
                    s["questions"] = cleaned_questions
                    validated.append(s)

            if len(validated) == 3:
                print(f"[Adaptive Engine] Successfully generated 3 runtime scenarios via OpenAI with simple words and cultural relevance.")
                return validated
    except Exception as e:
        print(f"[Adaptive Engine] OpenAI runtime generation unavailable or failed: {e}. Falling back to easy-word local synthesizer.")

    return None


# ─────────────────────────────────────────────────────────────────────────────
# 4. CONTEXTUAL DYNAMIC GENERATIVE SYNTHESIZER (LIBRARY-BACKED)
# ─────────────────────────────────────────────────────────────────────────────

def _get_random_character_names(used_names: Set[str]) -> Tuple[str, str]:
    """Select a unique target and peer name that haven't been used yet in this assessment."""
    available = [n for n in ALL_STUDENT_NAMES if n not in used_names]
    if len(available) < 2:
        available = ALL_STUDENT_NAMES

    target = random.choice(available)
    used_names.add(target)

    remaining = [n for n in available if n != target]
    peer = random.choice(remaining)
    used_names.add(peer)

    return target, peer


def _get_academic_task_for_dept(department: str) -> str:
    """Retrieve a department-tailored academic course or project context."""
    task_items = DEPARTMENT_ACADEMIC_TASKS.get(department)
    if not task_items:
        for k, v in DEPARTMENT_ACADEMIC_TASKS.items():
            if k.lower() in department.lower() or department.lower() in k.lower():
                task_items = v
                break
    if not task_items:
        task_items = DEPARTMENT_ACADEMIC_TASKS.get("Other", ["their semester coursework"])

    chosen = random.choice(task_items)
    if isinstance(chosen, tuple) or isinstance(chosen, list):
        return chosen[0]
    return str(chosen)


def _match_platform(student_platforms: List[str], template_platforms: List[str]) -> str:
    """Select the best matching platform from student's profile for the given template."""
    common = [p for p in student_platforms if p in template_platforms]
    if common:
        return random.choice(common)
    if student_platforms:
        return random.choice(student_platforms)
    return random.choice(template_platforms) if template_platforms else "WhatsApp"


def synthesize_scenario_assessment(
    db: Session,
    profile_data: Dict,
    previously_used_keys: Set[str],
    stage: str = "pre",
) -> List[Dict]:
    """
    Select and contextualize exactly 3 distinct scenarios from the Scenario Template Library.
    Guarantees:
      - 1 Social Media scenario
      - 1 Private Group / Messaging scenario
      - 1 University Community / Campus scenario
      - Personalized to department, platforms, living context
      - Anti-repetition: excludes previously shown template keys
      - Dynamic variation in character names, phrasing, settings, and question ordering
      - Balanced coverage of all 4 TPB constructs
    """
    student_platforms = profile_data.get("social_media_platforms", ["WhatsApp", "Instagram"])
    student_dept = profile_data.get("department", "Computer Science")
    student_living = profile_data.get("living_situation", "University hostel")

    def score_template(t: Dict) -> int:
        score = 0
        tpl_platforms = t.get("platforms", [])
        if any(p in student_platforms for p in tpl_platforms):
            score += 4
        tpl_depts = t.get("departments", [])
        if student_dept in tpl_depts or "Any" in tpl_depts:
            score += 3
        tpl_livings = t.get("livings", [])
        if student_living in tpl_livings or "Any" in tpl_livings:
            score += 3
        return score

    categories = ["social_media", "private_group", "university_community"]
    selected_templates = []
    used_template_keys: Set[str] = set()

    for cat in categories:
        candidates = [t for t in SCENARIO_TEMPLATES if t["category"] == cat]
        # Exclude templates already shown to this student
        fresh_candidates = [
            t for t in candidates
            if t["template_key"] not in previously_used_keys and t["template_key"] not in used_template_keys
        ]
        # If all templates have been used by this student, reset exclusion to all candidates in this category
        pool = fresh_candidates if fresh_candidates else candidates

        # Score candidates
        scored = [(score_template(c), c) for c in pool]
        scored.sort(key=lambda x: x[0], reverse=True)

        # Pick randomly among the top-scoring candidates to ensure diversity across similar profiles
        max_score = scored[0][0]
        top_tier = [c for s, c in scored if s >= max_score - 1]
        chosen = random.choice(top_tier)

        selected_templates.append(chosen)
        used_template_keys.add(chosen["template_key"])

    # Fallback to ensure 3 templates
    while len(selected_templates) < 3:
        remaining = [t for t in SCENARIO_TEMPLATES if t["template_key"] not in used_template_keys]
        if not remaining:
            remaining = SCENARIO_TEMPLATES
        chosen = random.choice(remaining)
        selected_templates.append(chosen)
        used_template_keys.add(chosen["template_key"])

    # Instantiate narrative variations with dynamic slots
    used_characters: Set[str] = set()
    result_scenarios = []

    category_display_map = {
        "social_media": "Social Media Interaction",
        "private_group": "Private Group Communication",
        "university_community": "Campus Community Interaction",
    }

    for tpl in selected_templates[:3]:
        target_name, initiator_name = _get_random_character_names(used_characters)
        platform = _match_platform(student_platforms, tpl.get("platforms", []))
        academic_task = _get_academic_task_for_dept(student_dept)

        # Select a narrative variation
        variations = tpl.get("narrative_variations", [])
        raw_narrative = random.choice(variations) if variations else tpl.get("scenario_text", "")

        # Format scenario text with personalized slot values
        formatted_narrative = (
            raw_narrative
            .replace("{target_name}", target_name)
            .replace("{initiator_name}", initiator_name)
            .replace("{platform}", platform)
            .replace("{academic_task}", academic_task)
        )

        # Process questions
        tpl_questions = tpl.get("questions", [])
        processed_questions = []

        for q in tpl_questions:
            q_text = (
                q["question_text"]
                .replace("{target_name}", target_name)
                .replace("{initiator_name}", initiator_name)
                .replace("{platform}", platform)
                .replace("{academic_task}", academic_task)
            )

            # Format and shuffle options
            opts = []
            for opt in q["options"]:
                opt_text = (
                    opt["text"]
                    .replace("{target_name}", target_name)
                    .replace("{initiator_name}", initiator_name)
                    .replace("{platform}", platform)
                    .replace("{academic_task}", academic_task)
                )
                opts.append({"text": opt_text, "score": opt["score"]})

            # Shuffle option order for psychometric fairness
            random.shuffle(opts)

            processed_questions.append({
                "question_text": q_text,
                "tpb_construct": normalize_construct(q.get("tpb_construct", "Attitude")),
                "options": opts,
            })

        # Shuffle question order within the scenario so TPB order varies naturally
        random.shuffle(processed_questions)

        result_scenarios.append({
            "template_key": tpl["template_key"],
            "scenario_text": formatted_narrative,
            "category": category_display_map.get(tpl["category"], "Digital Interaction"),
            "platform_context": platform,
            "difficulty_level": tpl.get("difficulty_level", 1),
            "questions": processed_questions,
        })

    return result_scenarios


# ─────────────────────────────────────────────────────────────────────────────
# 5. MAIN ENTRYPOINT: GENERATE & PERSIST ASSESSMENT INSTANCE
# ─────────────────────────────────────────────────────────────────────────────

def generate_scenario_assessment(
    db: Session,
    user_id: int,
    stage: str = "pre",
) -> models.AssessmentInstance:
    """
    Generate a complete, personalized scenario-based assessment for a student.

    1. Resolves the student's registration profile.
    2. Retrieves previous scenario history to prevent repetition across retakes.
    3. Attempts OpenAI generation with the student's profile context.
    4. Falls back to the contextual Scenario Template Library synthesizer.
    5. Persists AssessmentInstance → 3 AssessmentScenarios → 6 AssessmentQuestions each.
    6. Logs generated scenarios in UserScenarioHistory.
    7. Returns the populated AssessmentInstance ORM object.
    """
    profile_data = resolve_student_profile(db, user_id)
    previously_used_keys, previous_summaries = get_user_scenario_history(db, user_id)

    # 1. Try OpenAI first if configured
    raw_scenarios = None
    if OPENAI_API_KEY and OPENAI_API_KEY.strip():
        raw_scenarios = generate_with_openai(profile_data, previous_summaries, stage)

    # 2. Fall back to the diverse Scenario Template Library synthesizer
    if not raw_scenarios or len(raw_scenarios) < 3:
        raw_scenarios = synthesize_scenario_assessment(
            db, profile_data, previously_used_keys, stage
        )

    # Context summary for internal auditing
    context_used = json.dumps({
        "department": profile_data.get("department"),
        "platforms": profile_data.get("social_media_platforms"),
        "living": profile_data.get("living_situation"),
        "communities": profile_data.get("online_communities"),
        "stage": stage,
    })

    # Create top-level AssessmentInstance
    instance = models.AssessmentInstance(
        user_id=user_id,
        stage=stage,
        status="generated",
    )
    db.add(instance)
    db.flush()

    # Create 3 scenarios with questions and record history
    for s_idx, scenario_data in enumerate(raw_scenarios[:3]):
        scenario = models.AssessmentScenario(
            instance_id=instance.id,
            order_index=s_idx,
            scenario_text=scenario_data["scenario_text"],
            category=scenario_data.get("category", "Digital Interaction"),
            platform_context=scenario_data.get("platform_context"),
            user_context_used=context_used,
        )
        db.add(scenario)
        db.flush()

        # Record in UserScenarioHistory for anti-repetition tracking
        template_key = scenario_data.get("template_key")
        record_scenario_history(
            db=db,
            user_id=user_id,
            template_key=template_key,
            scenario_text=scenario_data["scenario_text"],
            stage=stage,
            difficulty=scenario_data.get("difficulty_level", 1),
        )

        # Create questions for this scenario
        questions = scenario_data.get("questions", [])
        for q_idx, q_data in enumerate(questions[:6]):
            question = models.AssessmentQuestion(
                scenario_id=scenario.id,
                order_index=q_idx,
                question_text=q_data["question_text"],
                options_json=json.dumps(q_data["options"]),
                tpb_construct=normalize_construct(q_data.get("tpb_construct", "Attitude")),
            )
            db.add(question)

    db.commit()
    db.refresh(instance)
    return instance
