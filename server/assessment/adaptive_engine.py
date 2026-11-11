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
from sqlalchemy.exc import IntegrityError

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
    raw_platforms = (
        (user_prof.social_media_platforms if user_prof and user_prof.social_media_platforms else None)
        or (student_prof.platforms_used if student_prof and student_prof.platforms_used else None)
    )
    platforms = _safe_json(raw_platforms, ["WhatsApp", "Instagram", "Discord"])

    freq = (
        (user_prof.social_media_frequency if user_prof and user_prof.social_media_frequency else None)
        or (student_prof.online_activity_level if student_prof and student_prof.online_activity_level else "Frequently")
    )

    raw_comm = (
        (user_prof.online_communities if user_prof and user_prof.online_communities else None)
        or (student_prof.participation_types if student_prof and student_prof.participation_types else None)
    )
    communities = _safe_json(raw_comm, ["Group chats", "University communities"])

    raw_patterns = (
        (user_prof.digital_usage_patterns if user_prof and user_prof.digital_usage_patterns else None)
        or (student_prof.main_online_activities if student_prof and student_prof.main_online_activities else None)
    )
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
# 2. STRICT VALIDATION ENGINE (CENTRALIZED)
# ─────────────────────────────────────────────────────────────────────────────

REQUIRED_CATEGORIES = {
    "social_media": "Social Media Interaction",
    "private_group": "Private Group Communication",
    "university_community": "Campus Community Interaction",
}

VALID_CONSTRUCTS = {"Attitude", "SubjectiveNorm", "PBC", "BehavioralIntention"}


def validate_assessment_structure(scenarios: List[Dict]) -> Tuple[bool, str]:
    """
    Strictly validate that generated assessment data satisfies all psychometric
    and structural requirements before persistence:
      1. Exactly 3 distinct scenarios.
      2. Exactly 8 questions per scenario (total 24 questions).
      3. Exactly 2 questions for each TPB construct per scenario:
         - Attitude: 2
         - SubjectiveNorm: 2
         - PBC: 2
         - BehavioralIntention: 2
      4. Exactly 4 options per question with backend scores 0, 1, 2, 3.
      5. Natural, simple English option text (not standard Likert labels).
      6. No empty texts or duplicate questions.
    """
    if not isinstance(scenarios, list) or len(scenarios) != 3:
        return False, f"Expected exactly 3 scenarios, got {len(scenarios) if isinstance(scenarios, list) else type(scenarios)}"

    total_questions = 0
    seen_question_texts: Set[str] = set()

    for s_idx, s in enumerate(scenarios, 1):
        if not isinstance(s, dict):
            return False, f"Scenario {s_idx} is not a valid dictionary"
        
        scenario_text = (s.get("scenario_text") or "").strip()
        if not scenario_text:
            return False, f"Scenario {s_idx} has empty scenario_text"

        questions = s.get("questions")
        if not isinstance(questions, list) or len(questions) != 8:
            return False, f"Scenario {s_idx} must have exactly 8 questions, got {len(questions) if isinstance(questions, list) else type(questions)}"

        construct_counts: Dict[str, int] = {c: 0 for c in VALID_CONSTRUCTS}

        for q_idx, q in enumerate(questions, 1):
            total_questions += 1
            if not isinstance(q, dict):
                return False, f"Scenario {s_idx} Question {q_idx} is not a valid dictionary"

            q_text = (q.get("question_text") or "").strip()
            if not q_text:
                return False, f"Scenario {s_idx} Question {q_idx} has empty question_text"

            norm_text = q_text.lower()
            if norm_text in seen_question_texts:
                return False, f"Duplicate question detected: {q_text[:50]}"
            seen_question_texts.add(norm_text)

            construct = normalize_construct(q.get("tpb_construct", ""))
            if construct not in VALID_CONSTRUCTS:
                return False, f"Invalid TPB construct '{construct}' in Scenario {s_idx} Question {q_idx}"
            construct_counts[construct] += 1

            options = q.get("options")
            if not isinstance(options, list) or len(options) != 4:
                return False, f"Scenario {s_idx} Question {q_idx} must have exactly 4 options, got {len(options) if isinstance(options, list) else 0}"

            scores_found = set()
            for opt_idx, opt in enumerate(options):
                if not isinstance(opt, dict):
                    return False, f"Scenario {s_idx} Question {q_idx} Option {opt_idx} is invalid"
                opt_text = (opt.get("text") or "").strip()
                if not opt_text:
                    return False, f"Scenario {s_idx} Question {q_idx} Option {opt_idx} has empty text"
                score = opt.get("score")
                if score not in (0, 1, 2, 3):
                    return False, f"Scenario {s_idx} Question {q_idx} Option {opt_idx} has invalid score {score}"
                scores_found.add(score)

            if scores_found != {0, 1, 2, 3}:
                return False, f"Scenario {s_idx} Question {q_idx} options must contain scores 0, 1, 2, 3 exactly once"

        # Verify construct distribution: exactly 2 per construct per scenario
        for c, count in construct_counts.items():
            if count != 2:
                return False, f"Scenario {s_idx} must contain exactly 2 questions for '{c}', got {count}"

    if total_questions != 24:
        return False, f"Assessment must contain exactly 24 questions, got {total_questions}"

    return True, "Validation successful"

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

def is_openai_configured(key: Optional[str] = OPENAI_API_KEY) -> bool:
    """Return True only if key is non-empty, >= 20 chars, and not a placeholder."""
    if not key or not key.strip():
        return False
    k = key.strip().lower()
    if len(k) < 20:
        return False
    if "your" in k and "key" in k:
        return False
    if "your-openai" in k or "your_openai" in k:
        return False
    return True


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
    if not is_openai_configured(OPENAI_API_KEY) or not OpenAI:
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

CRITICAL SCENARIO LANGUAGE & QUALITY RULES:
- Generate scenarios using simple, clear, easy and student-friendly language.
- Do NOT reduce the length, number of lines, or amount of information in the scenarios. Keep scenarios detailed and explainable, NOT short summaries.
- Avoid complex vocabulary, technical terms, academic phrases, or confusing sentence structures (NEVER use words like: "prosocial", "weaponize", "objectify", "normative", "disseminates", "derogatory", "subtle redirection", "affiliate", "dogpiling", "brigade", "sabotage", "acute distress", "human dignity violation", "repute", "cognitive", "dichotomy").
- The scenario should be easy for a university student to read once and understand immediately.
- The user should be able to clearly visualize the situation in their mind while reading the scenario.

SCENARIO WRITING STYLE:
- Write like a real-life situation a university student could experience in everyday life.
- Use natural easy wording storytelling language.
- Include enough context: who is involved, where it happens, what action occurs, and why it matters.
- Keep the emotional and social context clear (peer dynamics, group tension, hesitation to intervene).
- Avoid academic wording; use everyday language throughout.
- EXAMPLE STYLE GUIDELINE:
  * Instead of: "A peer disseminates derogatory comments through a digital communication channel targeting an individual's online identity."
  * Generate: "During a university WhatsApp group discussion, one student starts sharing negative comments about another student's personal posts. Other classmates see these messages, but some students stay silent because they are unsure whether they should say something."

REALISM & ASSESSMENT CALIBRATION:
- Keep scenarios realistic and based on everyday digital experiences (social media, WhatsApp groups, online communities, gaming platforms, university interactions, etc.).
- Do not make scenarios too obvious. The situation should require the student to think and evaluate their response.
- Do not make scenarios extremely difficult or ambiguous.
- Keep the same scenario complexity and assessment value, but make the wording easier to understand.
- Maintain the psychological assessment purpose and ensure scenarios still measure TPB constructs:
  * Attitude: How the student views the behavior — is it harmful, mean, or just harmless fun?
  * Subjective Norms: What close friends, batch mates, or respected peers would expect them to do.
  * Perceived Behavioral Control (PBC): How confident and capable they feel about speaking up, helping, or reporting.
  * Behavioral Intention: What they would realistically do in this situation.

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

NARRATIVE COHERENCE & DETAIL:
- Tell a realistic, believable, and coherent story in detailed sentences that build a vivid scene in the reader's mind.
- Do NOT reduce length or omit details; keep the scenario rich and explainable, not a brief summary.
- Do NOT randomly insert keywords into odd places. The plot must flow naturally and make sense for a student in {dept}.
- For Computer Science / IT: A student's code is leaked and mocked in the batch WhatsApp group, or someone is blamed for a broken group project submission before the deadline.
- For Business / Management: A teammate's presentation slides are mocked in an Instagram story, or someone is excluded from a competition team.
- For Engineering: A lab report calculation mistake is screenshotted and circulated with rude captions.
- For Medical / Health Sciences: Mocking someone's viva answer or practical mistake in a study chat.
- Incorporate their living situation naturally (e.g. hostel floor drama, or rush to catch the university point bus).

REQUIRED STRUCTURE:
Generate exactly 3 distinct scenarios:
1. Scenario 1: A social media situation (category: "Social Media Interaction", e.g. on {primary_platform} — an anonymous confession post, a story poll, or comments mocking a peer).
2. Scenario 2: A private group or chat situation (category: "Private Group Communication", e.g. a university WhatsApp batch group, section chat, or Discord server).
3. Scenario 3: A campus teamwork or community situation (category: "Campus Community Interaction", e.g. group project partner dispute, hostel living, or student society).

FOR EACH SCENARIO, GENERATE EXACTLY 8 QUESTIONS:
Every scenario must cover all 4 Theory of Planned Behavior (TPB) constructs with EXACTLY TWO questions per construct:
- Exactly 2 Attitude questions (student's personal evaluation: whether the action causes harm vs. harmless fun)
- Exactly 2 SubjectiveNorm questions (perceived social pressure: what close friends, batch mates, or respected peers expect)
- Exactly 2 PBC questions (perceived behavioral control: confidence and capability in speaking up, helping privately, or reporting)
- Exactly 2 BehavioralIntention questions (intended future behavior: what they realistically plan to do in the next few weeks)

ANSWER OPTIONS (SIMPLE EVERYDAY ENGLISH — NO LIKERT LABELS):
- Do NOT use standard Likert labels (NEVER use 'Strongly Agree', 'Agree', 'Disagree', 'Strongly Disagree').
- For EACH question, generate 4 natural, conversational simple English answer options tailored specifically to that question.
- Each option must reflect a realistic thought, feeling, or attitude of a university student.
- Avoid obvious action ladders (do not just say 'ignore', 'laugh', 'help', 'report').
- Avoid making one answer look obviously 'good' or 'correct'.

BACKEND NUMERIC SCORING:
- Each option must have a numeric score in the backend:
  * 0 = Lowest score for the measured construct
  * 1 = Low score
  * 2 = Higher score
  * 3 = Highest score for the measured construct
- Higher scores (adjusted) must always represent the healthier/prosocial TPB direction.
- The 4 scores (0, 1, 2, 3) must each appear exactly once per question.

VISUAL IMAGE PROMPT GENERATION (FOR EVERY SCENARIO):
For every assessment scenario, also generate an image generation prompt.
The image prompt should describe a realistic visual representation of the scenario.

The generated image should:
- Match the scenario context.
- Represent the behaviour being assessed.
- Help users understand the situation before answering questions.
- Make the assessment interactive instead of text-heavy.
- Follow Prisma's professional educational design style.

Avoid:
- Text inside images.
- Logos.
- Watermarks.
- Unrealistic scenes.

Return:
1. scenario_image_prompt
2. scenario_image_alt_text

Output strictly valid JSON with this exact format:
{{
  "scenarios": [
    {{
      "scenario_title": "Suspicious Email Challenge",
      "scenario_text": "...",
      "category": "Social Media Interaction",
      "platform_context": "{primary_platform}",
      "scenario_image_prompt": "Create a modern educational illustration of a university student sitting at a laptop reviewing a suspicious email notification. Show a cybersecurity warning context, digital safety awareness, and a university environment. Professional clean style for an academic behavioural assessment platform. No text inside the image.",
      "scenario_image_alt_text": "University student analyzing a suspicious email on a laptop while considering cybersecurity actions.",
      "questions": [
        {{
          "question_text": "When an anonymous confession page posts a picture of a student with a teasing caption, how do you view that situation?",
          "tpb_construct": "Attitude",
          "is_reverse_scored": false,
          "options": [
            {{"text": "It is just casual campus entertainment that people forget in a few days.", "score": 0}},
            {{"text": "It might be slightly embarrassing, but public social spaces naturally come with occasional teasing.", "score": 1}},
            {{"text": "It crosses personal boundaries because unsolicited public attention can cause genuine anxiety.", "score": 2}},
            {{"text": "It is harmful and humiliating because public ridicule on large student pages deeply affects someone's emotional safety.", "score": 3}}
          ]
        }}
      ]
    }}
  ]
}}"""

    try:
        print(f"[Adaptive Engine] Calling OpenAI gpt-4o-mini for runtime scenario generation (Dept: {dept}, Stage: {stage})...")
        client = OpenAI(api_key=OPENAI_API_KEY, timeout=35.0)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert psychometrician and educational researcher creating university cyberbullying assessment scenarios in a Pakistani/South Asian cultural context based on the Theory of Planned Behavior (TPB). "
                        "You MUST generate exactly 3 scenarios with exactly 8 questions per scenario (total 24 questions). "
                        "Each scenario must contain exactly 2 questions for each of the 4 TPB constructs: Attitude (2), SubjectiveNorm (2), PBC (2), and BehavioralIntention (2). "
                        "Do NOT use standard Strongly Agree/Agree labels. Instead, write 4 natural, conversational simple English answer options for EACH question with backend scores 0, 1, 2, 3. "
                        "Statements and options must be realistic, subtle, personality-sensitive, and avoid socially desirable giveaways. "
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

        if not isinstance(scenarios, list) or len(scenarios) < 3:
            return None

        validated_scenarios = []
        for s in scenarios[:3]:
            scenario_text = (s.get("scenario_text") or s.get("scenario_description") or s.get("description") or "").strip()
            if not scenario_text:
                return None
            questions = s.get("questions")
            if not isinstance(questions, list) or len(questions) != 8:
                return None

            img_prompt = (s.get("scenario_image_prompt") or s.get("image_prompt") or "").strip()
            img_alt = (s.get("scenario_image_alt_text") or s.get("image_alt_text") or "").strip()
            if not img_prompt:
                img_prompt = (
                    f"Create a modern educational illustration showing a university student in an everyday cybersecurity scenario: {scenario_text[:140]}. "
                    f"Show a university environment with digital communication on {primary_platform}, with cybersecurity awareness elements. "
                    "Professional clean style suitable for an academic assessment platform. No text, logos, or watermarks inside the image."
                )
            if not img_alt:
                img_alt = f"University student reviewing an online scenario on {primary_platform} while considering cybersecurity actions."

            cleaned_questions = []
            for q in questions:
                if not isinstance(q, dict):
                    return None
                q_text = (q.get("question_text") or "").strip()
                if not q_text:
                    return None
                opts = q.get("options")
                if not isinstance(opts, list) or len(opts) != 4:
                    return None

                cleaned_opts = []
                for opt in opts:
                    if not isinstance(opt, dict):
                        return None
                    opt_text = (opt.get("text") or "").strip()
                    opt_score = opt.get("score")
                    if not opt_text or opt_score not in (0, 1, 2, 3):
                        return None
                    cleaned_opts.append({"text": opt_text, "score": opt_score})

                c = normalize_construct(q.get("tpb_construct", "Attitude"))
                cleaned_questions.append({
                    "question_text": q_text,
                    "tpb_construct": c,
                    "is_reverse_scored": bool(q.get("is_reverse_scored", False)),
                    "options": cleaned_opts,
                })

            s_clean = {
                "scenario_title": s.get("scenario_title") or s.get("title") or s.get("category", "Cybersecurity Scenario"),
                "scenario_text": scenario_text,
                "category": s.get("category", "Social Media Interaction"),
                "platform_context": s.get("platform_context", primary_platform),
                "image_prompt": img_prompt,
                "image_alt_text": img_alt,
                "questions": cleaned_questions,
            }
            validated_scenarios.append(s_clean)

        # Run strict central validator on the OpenAI generated payload
        is_valid, reason = validate_assessment_structure(validated_scenarios)
        if is_valid:
            print(f"[Adaptive Engine] Successfully generated and strictly validated 3 runtime scenarios via OpenAI (24 items, 8/scenario).")
            return validated_scenarios
        else:
            print(f"[Adaptive Engine] OpenAI output rejected by validator: {reason}. Falling back to template synthesizer.")
            return None
    except Exception as e:
        print(f"[Adaptive Engine] OpenAI runtime generation unavailable or failed: {e}. Falling back to template library synthesizer.")

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

            processed_questions.append({
                "question_text": q_text,
                "tpb_construct": normalize_construct(q.get("tpb_construct", "Attitude")),
                "is_reverse_scored": bool(q.get("is_reverse_scored", False)),
                "options": opts,
            })

        img_prompt = (
            f"Create a modern educational illustration showing a university student in an everyday cybersecurity scenario: {formatted_narrative[:140]}. "
            f"Show a university environment, digital communication on {platform}, and cybersecurity awareness elements. "
            "Professional clean style suitable for an academic assessment platform. No text inside the image."
        )
        img_alt = f"University student reviewing an online scenario on {platform} while considering cybersecurity actions."

        result_scenarios.append({
            "template_key": tpl["template_key"],
            "scenario_title": category_display_map.get(tpl["category"], "Cybersecurity Scenario"),
            "scenario_text": formatted_narrative,
            "category": category_display_map.get(tpl["category"], "Digital Interaction"),
            "platform_context": platform,
            "difficulty_level": tpl.get("difficulty_level", 1),
            "image_prompt": img_prompt,
            "image_alt_text": img_alt,
            "questions": processed_questions,
        })

    # Validate synthesized scenarios
    is_valid, reason = validate_assessment_structure(result_scenarios)
    if not is_valid:
        print(f"[Adaptive Engine] Warning: Synthesized scenario validation warning: {reason}")

    return result_scenarios


# ─────────────────────────────────────────────────────────────────────────────
# 5. VISUAL SCENARIO IMAGE GENERATION WORKFLOW
# ─────────────────────────────────────────────────────────────────────────────

def generate_scenario_image(
    image_prompt: str,
    scenario_order: int = 0,
    user_id: Optional[int] = None,
) -> Optional[str]:
    """
    Image Generation Workflow:
    1. Receives the image_prompt generated by AI or template engine.
    2. Calls OpenAI image generation model (DALL-E) to produce a visual educational illustration.
    3. Downloads and caches the image in server/static/scenario_images so it does not expire.
    4. Returns the accessible image URL path (e.g. '/static/scenario_images/scenario_...png').

    Safety and Reliability Requirements:
    - Never raises an unhandled exception or breaks assessment generation.
    - If DALL-E is unavailable, key is invalid, or quota is reached, gracefully returns None.
    - Assessment generation proceeds seamlessly with text & SVG fallback.
    - Images never affect scoring, TPB evaluation, or assessment results.
    """
    if not is_openai_configured(OPENAI_API_KEY) or not OpenAI or not image_prompt:
        return None

    try:
        print(f"[Adaptive Engine] Generating visual AI scenario illustration for situation {scenario_order + 1}...")
        client = OpenAI(api_key=OPENAI_API_KEY, timeout=40.0)

        remote_url = None
        # Try DALL-E 3 first
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=image_prompt[:1000],
                size="1024x1024",
                quality="standard",
                n=1,
            )
            if response and response.data:
                remote_url = response.data[0].url
        except Exception as e_dalle3:
            print(f"[Adaptive Engine] DALL-E 3 unavailable ({e_dalle3}), attempting DALL-E 2 fallback...")
            try:
                response = client.images.generate(
                    model="dall-e-2",
                    prompt=image_prompt[:950],
                    size="512x512",
                    n=1,
                )
                if response and response.data:
                    remote_url = response.data[0].url
            except Exception as e_dalle2:
                print(f"[Adaptive Engine] DALL-E 2 also unavailable ({e_dalle2}).")

        if not remote_url:
            return None

        # Download and cache locally under server/static/scenario_images
        try:
            import urllib.request
            from pathlib import Path
            import uuid

            static_dir = Path(__file__).resolve().parent.parent / "static" / "scenario_images"
            static_dir.mkdir(parents=True, exist_ok=True)
            filename = f"sc_{user_id or 'anon'}_{scenario_order}_{uuid.uuid4().hex[:8]}.png"
            dest = static_dir / filename
            urllib.request.urlretrieve(remote_url, str(dest))
            print(f"[Adaptive Engine] AI scenario image cached successfully: {dest.name}")
            return f"/static/scenario_images/{filename}"
        except Exception as cache_err:
            print(f"[Adaptive Engine] Could not cache image locally ({cache_err}); using remote URL.")
            return remote_url

    except Exception as err:
        print(f"[Adaptive Engine] OpenAI image generation skipped or failed: {err}. Continuing with text scenario.")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# 6. MAIN ENTRYPOINT: GENERATE & PERSIST ASSESSMENT INSTANCE
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
    if is_openai_configured(OPENAI_API_KEY):
        raw_scenarios = generate_with_openai(profile_data, previous_summaries, stage)

    # 2. Fall back to the diverse Scenario Template Library synthesizer
    if not raw_scenarios or len(raw_scenarios) < 3:
        raw_scenarios = synthesize_scenario_assessment(
            db, profile_data, previously_used_keys, stage
        )

    # 3. Final validation before persistence
    is_valid, reason = validate_assessment_structure(raw_scenarios)
    if not is_valid:
        raise ValueError(f"Assessment validation failed: {reason}")

    # Context summary for internal auditing
    context_used = json.dumps({
        "department": profile_data.get("department"),
        "platforms": profile_data.get("social_media_platforms"),
        "living": profile_data.get("living_situation"),
        "communities": profile_data.get("online_communities"),
        "stage": stage,
    })

    try:
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
            img_prompt = scenario_data.get("image_prompt")
            img_alt = scenario_data.get("image_alt_text")

            # Execute visual image generation workflow (safe & non-blocking)
            img_url = None
            if img_prompt:
                img_url = generate_scenario_image(img_prompt, scenario_order=s_idx, user_id=user_id)

            scenario = models.AssessmentScenario(
                instance_id=instance.id,
                order_index=s_idx,
                title=scenario_data.get("scenario_title") or scenario_data.get("title") or scenario_data.get("category", f"Situation {s_idx + 1}"),
                scenario_text=scenario_data["scenario_text"],
                category=scenario_data.get("category", "Digital Interaction"),
                platform_context=scenario_data.get("platform_context"),
                user_context_used=context_used,
                image_prompt=img_prompt,
                image_url=img_url,
                image_alt_text=img_alt,
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

            # Create questions for this scenario (exactly 8 questions per scenario)
            questions = scenario_data.get("questions", [])
            for q_idx, q_data in enumerate(questions[:8]):
                question = models.AssessmentQuestion(
                    scenario_id=scenario.id,
                    order_index=q_idx,
                    question_text=q_data["question_text"],
                    options_json=json.dumps(q_data["options"]),
                    tpb_construct=normalize_construct(q_data.get("tpb_construct", "Attitude")),
                    is_reverse_scored=bool(q_data.get("is_reverse_scored", False)),
                )
                db.add(question)

        db.commit()
        db.refresh(instance)
        return instance
    except IntegrityError:
        db.rollback()
        existing = (
            db.query(models.AssessmentInstance)
            .filter(models.AssessmentInstance.user_id == user_id, models.AssessmentInstance.stage == stage)
            .order_by(models.AssessmentInstance.id.desc())
            .first()
        )
        if existing:
            return existing
        raise
