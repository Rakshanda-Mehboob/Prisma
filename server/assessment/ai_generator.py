"""
assessment/ai_generator.py — Hybrid AI Scenario Generation Engine (v1.1).

Generates dynamic, non-repetitive cyberbullying scenarios grounded in the
Theory of Planned Behavior (TPB): Attitude, Subjective Norm, PBC,
and Behavioral Intention (new in v1.1).

Now features profile-aware personalization:
  - Adapts scenarios to degree program, platforms, social role, experience
  - Generates 3 complete scenario blocks (each covering all 4 TPB constructs)
  - Each scenario block = 1 realistic situation + 8 TPB questions (2 per construct)

Combines:
  1. Vetted core baseline scenarios stored in the database.
  2. Dynamic AI-generated scenarios (using OpenAI API if available,
     and an advanced contextual generative synthesizer).
Persists new scenarios to the database so that IDs, foreign keys, and
psychometric scoring function consistently across pre and post stages.
"""

import json
import os
import random
from typing import List, Optional
try:
    import openai
    from openai import OpenAI
except ImportError:
    openai = None
    OpenAI = None
from sqlalchemy.orm import Session, joinedload

import models
from config import OPENAI_API_KEY

# ── Dynamic Generative Synthesizer Banks ──────────────────────────────────────
# Combinatorial pools ensuring high variability and contextual realism

STUDENT_NAMES = [
    ("Zainab", "female"), ("Hamza", "male"), ("Arooj", "female"), ("Bilal", "male"),
    ("Mahnoor", "female"), ("Usman", "male"), ("Fatima", "female"), ("Danish", "male"),
    ("Laiba", "female"), ("Shahmeer", "male"), ("Hira", "female"), ("Taimoor", "male"),
    ("Rida", "female"), ("Saad", "male"), ("Khadija", "female"), ("Arham", "male"),
    ("Maryam", "female"), ("Faisal", "male"), ("Sana", "female"), ("Arslan", "male"),
]

PLATFORMS = [
    ("a 120-member university WhatsApp batch group", "WhatsApp group"),
    ("an anonymous university confession page on Instagram", "Instagram confession page"),
    ("a departmental Discord server used for gaming and study", "Discord server"),
    ("a shared Google Doc for an assigned group project", "shared Google Doc"),
    ("a TikTok video comments section tagging classmates", "TikTok comments"),
    ("a class Telegram channel where exam notes are exchanged", "Telegram channel"),
    ("a public Twitter/X thread quoting a student presentation", "Twitter/X thread"),
    ("a university Facebook group for student announcements", "university Facebook group"),
    ("a university LMS discussion board for the current course", "LMS discussion board"),
]

# Platform mappings for profile personalization
PLATFORM_MAP = {
    "WhatsApp": ("a 120-member university WhatsApp batch group", "WhatsApp group"),
    "Instagram": ("an anonymous university confession page on Instagram", "Instagram confession page"),
    "Discord": ("a departmental Discord server used for gaming and study", "Discord server"),
    "TikTok": ("a TikTok video comments section tagging classmates", "TikTok comments"),
    "Facebook": ("a university Facebook group for student announcements", "university Facebook group"),
    "University LMS": ("a university LMS discussion board for the current course", "LMS discussion board"),
}

# ── Degree-Specific Context Templates ────────────────────────────────────────
DEGREE_CONTEXTS = {
    "Computer Science": [
        "a group coding assignment",
        "an open-source project collaboration",
        "a hackathon team",
        "a CS Discord study server",
        "a lab report submission group",
    ],
    "Software Engineering": [
        "a software project sprint",
        "a GitHub pull request review thread",
        "an agile team discussion channel",
        "a software design review group",
    ],
    "Information Technology": [
        "a network configuration lab group",
        "a cybersecurity workshop team",
        "a web development project group",
        "a database design collaboration",
    ],
    "Medical Sciences": [
        "a clinical training rotation group",
        "a patient case discussion forum",
        "a medical study circle",
        "a hospital attachment WhatsApp group",
        "a nursing practical session group",
    ],
    "Engineering": [
        "an engineering design project team",
        "a physics lab report group",
        "a CAD design collaboration space",
        "a thesis supervision discussion board",
    ],
    "Business": [
        "a business case study group",
        "a marketing project team",
        "a startup pitch preparation group",
        "a finance assignment discussion channel",
    ],
    "Social Sciences": [
        "a research methodology discussion group",
        "a fieldwork report collaboration",
        "a sociology seminar preparation channel",
        "a psychology case review group",
    ],
}

# ── Full 8-Question Scenario Block Templates (per construct, 2 questions each) ─
SCENARIO_BLOCK_TEMPLATES = {
    "Attitude": [
        {
            "questions": [
                {
                    "question": "How do you evaluate {actor}'s behavior in this situation?",
                    "scale_type": "evaluation",  # Harmful ← → Helpful
                    "options": [
                        ("Completely unacceptable — this is harmful digital behavior that causes real emotional damage.", 7),
                        ("Clearly wrong — the behavior disrespects {target} and the broader community.", 6),
                        ("Mostly inappropriate, though the intent may not have been malicious.", 5),
                        ("Uncertain — it depends on context and relationships involved.", 4),
                        ("Somewhat justified given the circumstances.", 3),
                        ("Mostly acceptable — people sometimes react this way online.", 2),
                        ("Completely fine — there is nothing wrong with this behavior.", 1),
                    ],
                },
                {
                    "question": "If you were a bystander witnessing this, how would you describe the harm caused to {target}?",
                    "scale_type": "agreement",
                    "options": [
                        ("Very severe — online harassment like this causes lasting psychological harm.", 7),
                        ("Significant — this kind of behavior is genuinely damaging to wellbeing.", 6),
                        ("Moderate — it would affect {target} but they could manage it.", 5),
                        ("Unclear — it depends on how sensitive {target} is.", 4),
                        ("Minor — most people would brush it off.", 3),
                        ("Very minor — online interactions rarely cause real harm.", 2),
                        ("Non-existent — {target} should not be affected by this.", 1),
                    ],
                },
            ],
        },
    ],
    "SubjectiveNorm": [
        {
            "questions": [
                {
                    "question": "What would the people who matter most to you expect you to do in this situation?",
                    "scale_type": "agreement",
                    "options": [
                        ("They would strongly expect me to speak up or support {target} publicly or privately.", 7),
                        ("They would expect me to take some constructive action, even if small.", 6),
                        ("They would probably expect me to avoid the situation but not participate.", 5),
                        ("They would be neutral — it is my personal choice.", 4),
                        ("They might understand if I stay quiet to avoid drama.", 3),
                        ("They might expect me to go along with the group to maintain relationships.", 2),
                        ("They would expect me to participate along with everyone else.", 1),
                    ],
                },
                {
                    "question": "How do you think most responsible students in your university would respond to this situation?",
                    "scale_type": "agreement",
                    "options": [
                        ("Most responsible students would actively intervene or report this behavior.", 7),
                        ("Most would privately support {target} and discourage the behavior.", 6),
                        ("Most would stay neutral but not participate in the harmful behavior.", 5),
                        ("Reactions would vary — some would help, some would stay silent.", 4),
                        ("Most would be passive and avoid getting involved.", 3),
                        ("Most would go along with the crowd to avoid standing out.", 2),
                        ("Most would participate, as this kind of behavior is normalized in student culture.", 1),
                    ],
                },
            ],
        },
    ],
    "PBC": [
        {
            "questions": [
                {
                    "question": "How confident are you in your ability to intervene or help {target} in this situation?",
                    "scale_type": "agreement",
                    "options": [
                        ("Very confident — I know exactly what to do and have the skills to act safely.", 7),
                        ("Confident — I would take action even if I wasn't sure of the perfect response.", 6),
                        ("Somewhat confident — I would try to help but might hesitate.", 5),
                        ("Unsure — I would want to help but wouldn't know the best approach.", 4),
                        ("Low confidence — I feel I lack the skills or influence to make a difference.", 3),
                        ("Very low confidence — I would probably freeze or avoid getting involved.", 2),
                        ("No confidence — there is nothing I could effectively do.", 1),
                    ],
                },
                {
                    "question": "How capable do you feel in reporting or escalating this situation through appropriate channels?",
                    "scale_type": "agreement",
                    "options": [
                        ("Fully capable — I know exactly how to report this to university authorities and document evidence.", 7),
                        ("Capable — I would know how to find the right reporting channel and take action.", 6),
                        ("Somewhat capable — I would try to report but might need guidance on the process.", 5),
                        ("Uncertain — I'm not sure what reporting channels exist or how they work.", 4),
                        ("Low capability — I don't believe reporting would make a meaningful difference.", 3),
                        ("Very low capability — I lack knowledge about how to escalate this properly.", 2),
                        ("Incapable — I do not feel able to report or escalate this situation.", 1),
                    ],
                },
            ],
        },
    ],
    "BehavioralIntention": [
        {
            "questions": [
                {
                    "question": "If you were to encounter a situation like this in the next month, how likely are you to respond responsibly?",
                    "scale_type": "agreement",
                    "options": [
                        ("Extremely likely — I am fully committed to responding responsibly in all online interactions.", 7),
                        ("Very likely — I intend to take responsible action when I encounter situations like this.", 6),
                        ("Likely — I plan to respond responsibly though I may hesitate in the moment.", 5),
                        ("Uncertain — I'm not sure how I would actually respond.", 4),
                        ("Somewhat unlikely — I might go along with the group depending on the situation.", 3),
                        ("Unlikely — I probably would not intervene or report in this type of situation.", 2),
                        ("Very unlikely — I do not intend to respond differently than the majority.", 1),
                    ],
                },
                {
                    "question": "How strongly do you intend to avoid participating in similar harmful online behaviors in the future?",
                    "scale_type": "agreement",
                    "options": [
                        ("Very strongly — I am fully committed to never participating in or enabling harmful online behavior.", 7),
                        ("Strongly — I intend to actively avoid harmful behavior and encourage others to do the same.", 6),
                        ("Moderately — I plan to avoid participating but may not actively challenge others.", 5),
                        ("Neutral — I haven't made a firm commitment either way.", 4),
                        ("Somewhat weakly — it depends on the social pressure in the moment.", 3),
                        ("Weakly — I would likely go along with the group if pressured.", 2),
                        ("Not at all — I do not have a strong intention to change my online behavior.", 1),
                    ],
                },
            ],
        },
    ],
}

# ── Core Scenario Situations (varied, context-rich) ───────────────────────────
SITUATION_TEMPLATES = [
    {
        "id": "presentation_mock",
        "context": (
            "{actor} secretly records {target} stumbling over their words during a class presentation "
            "and creates a short video clip with laughing emojis, posting it in {platform}. "
            "Several classmates react with laugh emojis and add mocking comments."
        ),
        "category": "harmful_comments",
    },
    {
        "id": "grade_rumor",
        "context": (
            "After {target} scored the highest marks in a difficult midterm, {actor} starts "
            "spreading unverified rumors on {platform} claiming {target} cheated by manipulating the instructor. "
            "Several classmates join in calling {target} names and questioning their academic integrity."
        ),
        "category": "rumor_spreading",
    },
    {
        "id": "group_exclusion",
        "context": (
            "{target} is excluded from all informal study groups and social circles because an influential classmate "
            "announced on {platform}: 'Whoever collaborates with {target} is off our project team.' "
            "Most students are silently complying with this social boycott."
        ),
        "category": "online_exclusion",
    },
    {
        "id": "meme_harassment",
        "context": (
            "{actor} takes an old, awkward personal photo of {target} and turns it into a meme, "
            "using it repeatedly in {platform} whenever {target} shares an opinion. "
            "The meme is gaining traction and spreading beyond the original group."
        ),
        "category": "humiliating_content",
    },
    {
        "id": "derogatory_poll",
        "context": (
            "An anonymous account creates a poll on {platform} titled 'Who is the most annoying person in our batch?' "
            "with {target} listed as one of the options. The poll is gaining votes rapidly, "
            "and some students are actively sharing it."
        ),
        "category": "harmful_comments",
    },
    {
        "id": "private_screenshot",
        "context": (
            "{actor} takes a screenshot of a private conversation between {target} and a mutual friend "
            "and shares it on {platform} without permission, revealing sensitive personal information. "
            "The post quickly receives comments mocking {target}'s private concerns."
        ),
        "category": "sharing_private_info",
    },
    {
        "id": "threatening_messages",
        "context": (
            "You witness {actor} sending repeated threatening and intimidating direct messages to {target} "
            "in {platform}. {target} has stopped responding and appears visibly distressed in class, "
            "but has not reported the situation to anyone."
        ),
        "category": "threats",
    },
    {
        "id": "group_project_blame",
        "context": (
            "After a group project receives low marks, {actor} publicly posts in {platform} "
            "blaming all the mistakes on {target}, despite {target} contributing equally to the work. "
            "Other group members are either agreeing or staying silent."
        ),
        "category": "harmful_comments",
    },
    {
        "id": "bystander_situation",
        "context": (
            "In {platform}, a group of senior students has been systematically mocking {target}'s "
            "academic questions for several days, calling them 'too basic' and discouraging engagement. "
            "You and several other students have observed this pattern but no one has responded."
        ),
        "category": "bystander",
    },
    {
        "id": "clinical_mistake",
        "context": (
            "{target} makes an error during a practical or lab session and classmates begin "
            "discussing the incident on {platform}, sharing screenshots and making increasingly harsh comments. "
            "The discussion has moved from constructive critique to personal attacks."
        ),
        "category": "harmful_comments",
    },
]


# ── Degree-Specific Situation Adaptation ─────────────────────────────────────

def _adapt_situation_for_degree(situation: dict, degree: str) -> str:
    """
    Adapt the generic situation context to include degree-specific language
    to make scenarios feel realistic for the student's academic background.
    """
    contexts = DEGREE_CONTEXTS.get(degree, [])
    if not contexts:
        return situation["context"]

    context_phrase = random.choice(contexts)
    base = situation["context"]

    # Inject degree context naturally for relevant situations
    if situation["id"] in ("group_project_blame", "presentation_mock"):
        base = base.replace("a group project", context_phrase)
        base = base.replace("a class presentation", f"a class presentation for their {context_phrase}")

    return base


def _pick_platform_for_profile(profile_data: Optional[dict]) -> tuple:
    """
    Select a platform that matches the student's stated platforms_used.
    Falls back to random selection if no profile data available.
    """
    if profile_data and profile_data.get("platforms_used"):
        used = profile_data["platforms_used"]
        for platform_key in used:
            if platform_key in PLATFORM_MAP:
                return PLATFORM_MAP[platform_key]

    return random.choice(PLATFORMS)


def _pick_situation_for_profile(profile_data: Optional[dict]) -> dict:
    """
    Select a situation template based on student profile:
    - Students with leadership social role → leadership/bystander situations
    - Students with high cyberbullying experience → bystander or supporter situations
    - Medical/clinical students → clinical_mistake situation preferred
    - Less social students → bystander or observer scenarios
    """
    situations = list(SITUATION_TEMPLATES)

    if profile_data:
        degree = profile_data.get("degree_program", "")
        social_role = profile_data.get("social_role", "")
        experience_role = profile_data.get("experience_role", "")

        # Prioritize clinical situation for medical students
        if degree and "Medical" in degree:
            clinical = next((s for s in situations if s["id"] == "clinical_mistake"), None)
            if clinical and random.random() > 0.4:
                return clinical

        # Prioritize bystander situations for observers
        if social_role and "observer" in social_role.lower():
            bystander = [s for s in situations if s["category"] == "bystander"]
            if bystander:
                return random.choice(bystander)

        # For students who have experienced bullying → supporter/witness situations
        if experience_role and experience_role in ("Observer", "Supporter", "Person affected"):
            preferred = [s for s in situations if s["category"] in ("bystander", "threats", "online_exclusion")]
            if preferred:
                return random.choice(preferred)

    return random.choice(situations)


# ── Scenario JSON Schema for OpenAI Structured Output ────────────────────────

SCENARIO_BLOCK_JSON_SCHEMA = {
    "name": "scenario_block_response",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "scenario_text": {
                "type": "string",
                "description": "A realistic, detailed 2-3 sentence cyberbullying incident in a university student context."
            },
            "questions": {
                "type": "array",
                "description": "Exactly 8 TPB questions (2 per construct: Attitude, SubjectiveNorm, PBC, BehavioralIntention).",
                "items": {
                    "type": "object",
                    "properties": {
                        "construct": {"type": "string", "description": "One of: Attitude, SubjectiveNorm, PBC, BehavioralIntention"},
                        "question_text": {"type": "string", "description": "A clear diagnostic question."},
                        "options": {
                            "type": "array",
                            "description": "Exactly 7 calibrated response options (scores 7 down to 1).",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "text": {"type": "string"},
                                    "score": {"type": "integer"}
                                },
                                "required": ["text", "score"],
                                "additionalProperties": False
                            }
                        }
                    },
                    "required": ["construct", "question_text", "options"],
                    "additionalProperties": False
                }
            }
        },
        "required": ["scenario_text", "questions"],
        "additionalProperties": False
    }
}

# Legacy single-scenario schema (kept for backwards compatibility)
SCENARIO_JSON_SCHEMA = {
    "name": "scenario_response",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "scenario_text": {
                "type": "string",
                "description": "A realistic, detailed 2-4 sentence cyberbullying incident in a university student context."
            },
            "question_text": {
                "type": "string",
                "description": "A diagnostic question assessing the student's evaluation, subjective norms, or perceived control."
            },
            "options": {
                "type": "array",
                "description": "Exactly 7 calibrated response options corresponding to scores 7 down to 1.",
                "items": {
                    "type": "object",
                    "properties": {
                        "text": {"type": "string", "description": "The response option text."},
                        "score": {"type": "integer", "description": "Calibrated integer score from 1 to 7."}
                    },
                    "required": ["text", "score"],
                    "additionalProperties": False
                }
            }
        },
        "required": ["scenario_text", "question_text", "options"],
        "additionalProperties": False
    }
}


def _build_profile_context_string(profile_data: Optional[dict]) -> str:
    """
    Build a natural-language profile context string for the AI prompt.
    Used to guide personalized scenario generation without being prescriptive.
    """
    if not profile_data:
        return "No specific student profile provided. Generate a generic university scenario."

    lines = []
    if profile_data.get("degree_program"):
        lines.append(f"- Degree Program: {profile_data['degree_program']}")
    if profile_data.get("academic_year"):
        lines.append(f"- Academic Year: {profile_data['academic_year']}")
    if profile_data.get("learning_environment"):
        lines.append(f"- Learning Environment: {profile_data['learning_environment']}")
    if profile_data.get("platforms_used"):
        lines.append(f"- Frequently Used Platforms: {', '.join(profile_data['platforms_used'])}")
    if profile_data.get("social_role"):
        lines.append(f"- Social Role: {profile_data['social_role']}")
    if profile_data.get("online_activity_level"):
        lines.append(f"- Online Activity Level: {profile_data['online_activity_level']}")
    if profile_data.get("encounter_frequency") and profile_data.get("encounter_frequency") != "Never":
        lines.append(f"- Previous Cyberbullying Encounter Frequency: {profile_data['encounter_frequency']}")

    if not lines:
        return "Generic university student profile."

    return "\n".join(lines)


def _build_tpb_block_prompt(stage: str, profile_data: Optional[dict]) -> str:
    """
    Constructs a calibrated, TPB-grounded prompt for generating a full scenario block.
    A block = 1 scenario situation + 8 questions (2 per construct × 4 constructs).
    """
    profile_ctx = _build_profile_context_string(profile_data)
    stage_desc = (
        "Baseline pre-assessment to diagnose initial student beliefs and tendencies."
        if stage == "pre"
        else "Post-intervention assessment evaluating learned intervention skills, ethical responsibility, and confidence."
    )

    return f"""You are an educational psychometrics expert designing a Theory of Planned Behavior (TPB) assessment for a university cyberbullying intervention system called Prisma.

STUDENT PROFILE (use this to make the scenario realistic and relatable):
{profile_ctx}

TASK:
Generate ONE realistic cyberbullying scenario relevant to the student's university context, followed by exactly 8 diagnostic questions — 2 for each of the 4 TPB constructs: Attitude, SubjectiveNorm, PBC, and BehavioralIntention.

ASSESSMENT STAGE: {stage} — {stage_desc}

TPB CONSTRUCT DEFINITIONS:
1. Attitude: Student's personal evaluation of whether the behavior is harmful or acceptable.
   → Questions should ask HOW THEY EVALUATE the behavior (harmful/helpful, wrong/right, acceptable/unacceptable).

2. SubjectiveNorm: Perceived expectations from significant others (friends, peers, teachers).
   → Questions should ask WHAT OTHERS WOULD EXPECT them to do.

3. PBC (Perceived Behavioral Control): Confidence and ability to act appropriately.
   → Questions should ask HOW CAPABLE/CONFIDENT they feel in responding, helping, or reporting.

4. BehavioralIntention: Future willingness to act responsibly.
   → Questions should ask HOW LIKELY/INTENDED their future responsible behavior is.

SCORING (7-point Likert scale per question):
- Score 7: Highest ethical stance — active upstander, maximum confidence, fully committed.
- Score 6: Constructive and supportive response with slight hesitation.
- Score 5: Positive but cautious — some action, moderate confidence.
- Score 4: Neutral, uncertain, ambivalent.
- Score 3: Passive, minimal action, rationalizing.
- Score 2: Conforming to harmful norms, low confidence, weak intention.
- Score 1: Endorsing harm, full passivity, or total helplessness.

REQUIREMENTS:
- Scenario: 2-3 sentences, realistic, fictional, university context, neutral tone (no obvious right answer).
- Questions: One idea per question, simple language, no jargon, non-judgmental.
- Options: Exactly 7 options per question with unique scores 7, 6, 5, 4, 3, 2, 1 (one each).
- Do NOT use real people's names. Use fictional South Asian university names (e.g., Zainab, Hamza, Arooj, Bilal).
- Do NOT generate graphic or traumatizing content. Keep it educational and safe.
- The scenario should NOT have an obvious correct answer — it should be thought-provoking.

Return exactly 8 questions in the array: 2 Attitude, 2 SubjectiveNorm, 2 PBC, 2 BehavioralIntention.
"""


def _build_tpb_prompt(construct: str, stage: str) -> str:
    """
    Legacy single-construct prompt builder (maintained for backwards compatibility).
    Constructs a calibrated, TPB-grounded prompt for OpenAI.
    """
    construct_guidelines = {
        "Attitude": (
            "Focus on the student's personal cognitive and affective ATTITUDE toward cyberbullying. "
            "The scenario should depict an online harassment, exclusion, or digital hostility incident in a university context. "
            "The question must prompt the student to evaluate whether such actions are harmful, unacceptable, or justifiable."
        ),
        "SubjectiveNorm": (
            "Focus on SUBJECTIVE NORMS (perceived peer and social pressure/expectations). "
            "The scenario should highlight what classmates, close friends, or social groups are doing or expecting. "
            "The question must assess what the student believes significant peers expect them to do in response."
        ),
        "PBC": (
            "Focus on PERCEIVED BEHAVIORAL CONTROL (self-efficacy, confidence, and ability to act). "
            "The scenario should depict a challenging cyberbullying situation requiring intervention or support. "
            "The question must assess the student's confidence and perceived capability in intervening, preserving evidence, or supporting the victim."
        ),
        "BehavioralIntention": (
            "Focus on BEHAVIORAL INTENTION (future willingness to act responsibly online). "
            "The scenario should present a situation where the student must consider their future behavior. "
            "The question must assess the student's stated intention to behave responsibly in similar future situations."
        ),
    }

    stage_desc = (
        "Baseline pre-assessment to diagnose initial student beliefs and tendencies."
        if stage == "pre"
        else "Post-intervention assessment evaluating learned intervention skills, ethical responsibility, and confidence."
    )

    guideline = construct_guidelines.get(construct, construct_guidelines["Attitude"])

    return f"""You are an educational psychometrics expert designing assessment scenarios for a university-level cyberbullying intervention system based on the Theory of Planned Behavior (TPB).

TASK:
Generate a single, realistic, fictional cyberbullying scenario, diagnostic question, and exactly 7 calibrated response options.

TARGET SPECIFICATIONS:
- TPB Construct: {construct} ({guideline})
- Assessment Stage: {stage} ({stage_desc})
- Setting: Higher education / university student context (e.g., student WhatsApp batch groups, Discord study channels, Instagram confession accounts, class forums, group projects, TikTok comments, Telegram channels).
- Safety & Content Policy: Entirely fictional scenarios. Non-graphic content. Do NOT use real people's names or real victims. Do NOT reference real-world incidents. Suitable for an educational assessment measuring behavioral decision-making.

SCORING CRITERIA FOR OPTIONS:
Each of the exactly 7 options must represent a distinct level on a 7-point Likert scale:
- Score 7: Highest ethical stance, active upstander behavior, or maximum perceived control/intention.
- Score 6: Constructive and supportive response with mild hesitation or moderate action.
- Score 5: Positive but cautious stance with some action.
- Score 4: Neutral bystander, uncertain, or passive stance avoiding involvement.
- Score 3: Minimizing the harm, rationalizing the bullying, or low confidence to act.
- Score 2: Conforming to harmful norms, very low confidence.
- Score 1: Endorsing/participating in harassment, full peer conformity with bullies, or total helplessness.

REQUIREMENTS:
- Exactly 7 options with unique text.
- Scores must be unique integers: 7, 6, 5, 4, 3, 2, 1 (one of each).
- Return strictly valid JSON adhering to the specified schema.
"""


def _validate_openai_scenario(data: dict) -> bool:
    """
    Validates that OpenAI returned a complete scenario with exactly 7 unique options
    and calibrated scores 7 through 1.
    """
    if not isinstance(data, dict):
        return False
    scenario_text = data.get("scenario_text")
    question_text = data.get("question_text")
    options = data.get("options")

    if not isinstance(scenario_text, str) or len(scenario_text.strip()) < 20:
        return False
    if not isinstance(question_text, str) or len(question_text.strip()) < 10:
        return False
    if not isinstance(options, list) or len(options) != 7:
        return False

    seen_scores = set()
    seen_texts = set()

    for opt in options:
        if not isinstance(opt, dict):
            return False
        text = opt.get("text")
        score = opt.get("score")
        if not isinstance(text, str) or not text.strip():
            return False
        if not isinstance(score, int) or score not in {1, 2, 3, 4, 5, 6, 7}:
            return False
        seen_scores.add(score)
        seen_texts.add(text.strip().lower())

    if seen_scores != {1, 2, 3, 4, 5, 6, 7}:
        return False
    if len(seen_texts) != 7:
        return False

    return True


def _validate_openai_block(data: dict) -> bool:
    """
    Validates that OpenAI returned a full scenario block with exactly 8 questions,
    2 per TPB construct, each with 7 options.
    """
    if not isinstance(data, dict):
        return False

    scenario_text = data.get("scenario_text")
    questions = data.get("questions")

    if not isinstance(scenario_text, str) or len(scenario_text.strip()) < 20:
        return False
    if not isinstance(questions, list) or len(questions) != 8:
        return False

    construct_counts = {
        "Attitude": 0, "SubjectiveNorm": 0,
        "PBC": 0, "BehavioralIntention": 0
    }

    for q in questions:
        if not isinstance(q, dict):
            return False
        construct = q.get("construct")
        question_text = q.get("question_text")
        options = q.get("options")

        if construct not in construct_counts:
            return False
        construct_counts[construct] += 1

        if not isinstance(question_text, str) or len(question_text.strip()) < 10:
            return False
        if not isinstance(options, list) or len(options) != 7:
            return False

        seen_scores = set()
        for opt in options:
            score = opt.get("score")
            if not isinstance(score, int) or score not in {1, 2, 3, 4, 5, 6, 7}:
                return False
            seen_scores.add(score)
        if seen_scores != {1, 2, 3, 4, 5, 6, 7}:
            return False

    # Each construct must appear exactly twice
    for c, count in construct_counts.items():
        if count != 2:
            return False

    return True


_openai_circuit_open = False

def _call_openai_api(prompt: str, schema: dict) -> Optional[dict]:
    """
    Call OpenAI API using gpt-4o-mini with Structured Outputs for JSON response.
    Safely parses, validates, and returns the scenario data.
    Never exposes API keys in logs or errors.
    Uses circuit breaker pattern to prevent repeated slow/failing calls.
    """
    global _openai_circuit_open
    if _openai_circuit_open:
        return None

    if OpenAI is None or not OPENAI_API_KEY or not OPENAI_API_KEY.strip() or OPENAI_API_KEY in ("your_openai_api_key_here", "YOUR_KEY_HERE"):
        return None

    try:
        client = OpenAI(api_key=OPENAI_API_KEY, timeout=8.0)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an educational psychometrics expert designing assessment scenarios "
                        "for a university cyberbullying intervention system based on the Theory of Planned Behavior."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_schema", "json_schema": schema},
            temperature=0.75,
        )

        content = response.choices[0].message.content
        if not content:
            return None

        text = content.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        parsed = json.loads(text)
        print("[AI Generator] OpenAI scenario block generated successfully.")
        return parsed

    except (openai.AuthenticationError, openai.RateLimitError) as e:
        print(f"[AI Generator] OpenAI {type(e).__name__} encountered. Activating circuit breaker; using local synthesizer.")
        _openai_circuit_open = True
        return None
    except (openai.APITimeoutError, openai.APIConnectionError) as e:
        print(f"[AI Generator] OpenAI connection/timeout ({type(e).__name__}). Activating circuit breaker; using local synthesizer.")
        _openai_circuit_open = True
        return None
    except Exception as e:
        print(f"[AI Generator] OpenAI unavailable ({type(e).__name__}). Activating circuit breaker; using local synthesizer.")
        _openai_circuit_open = True
        return None


# ── Local Synthesizer for Full Scenario Blocks ────────────────────────────────

def _local_synthesize_scenario_block(
    stage: str,
    profile_data: Optional[dict],
    used_situation_ids: Optional[set] = None,
) -> dict:
    """
    Local fallback full scenario block generator.
    Produces 1 situation + 8 TPB questions (2 per construct) without AI.
    Uses profile to select appropriate situation and platform.
    """
    if used_situation_ids is None:
        used_situation_ids = set()

    # Pick situation not yet used in this assessment session
    available = [s for s in SITUATION_TEMPLATES if s["id"] not in used_situation_ids]
    if not available:
        available = list(SITUATION_TEMPLATES)

    # Profile-aware situation selection
    situation = _pick_situation_for_profile(profile_data) if profile_data else random.choice(available)
    # Ensure we don't repeat
    if situation["id"] in used_situation_ids and available:
        situation = random.choice(available)

    used_situation_ids.add(situation["id"])

    # Pick names
    actor_name, _ = random.choice(STUDENT_NAMES)
    target_name, _ = random.choice([n for n in STUDENT_NAMES if n[0] != actor_name])

    # Pick platform (profile-aware)
    platform_full, platform_short = _pick_platform_for_profile(profile_data)

    # Adapt situation for degree
    degree = profile_data.get("degree_program", "") if profile_data else ""
    context = _adapt_situation_for_degree(situation, degree)
    scenario_text = context.format(
        actor=actor_name,
        target=target_name,
        platform=platform_full,
    )

    # Build 8 questions (2 per construct)
    questions = []
    for construct in ["Attitude", "SubjectiveNorm", "PBC", "BehavioralIntention"]:
        template_list = SCENARIO_BLOCK_TEMPLATES[construct]
        tmpl = random.choice(template_list)
        for q_tmpl in tmpl["questions"]:
            q_text = q_tmpl["question"].format(
                actor=actor_name,
                target=target_name,
                platform=platform_short,
            )
            options = []
            for opt_text, score in q_tmpl["options"]:
                options.append({
                    "text": opt_text.format(
                        actor=actor_name,
                        target=target_name,
                        platform=platform_short,
                    ),
                    "score": score,
                })
            questions.append({
                "construct": construct,
                "question_text": q_text,
                "options": options,
            })

    return {
        "scenario_text": scenario_text,
        "questions": questions,
    }


def synthesize_dynamic_scenario(construct: str, stage: str) -> dict:
    """
    Legacy single-construct synthesizer (kept for backwards compatibility).
    Synthesize a dynamic scenario for a given TPB construct and assessment stage.
    1. Attempts OpenAI AI generation via _call_openai_api with a TPB-aware prompt.
    2. Validates schema and converts options into standard format.
    3. Falls back to vetted local generative synthesizer if OpenAI is unavailable or fails.
    """
    prompt = _build_tpb_prompt(construct, stage)
    openai_data = _call_openai_api(prompt, SCENARIO_JSON_SCHEMA)

    if openai_data and _validate_openai_scenario(openai_data):
        options = [(opt["text"].strip(), int(opt["score"])) for opt in openai_data["options"]]
        return {
            "construct": construct,
            "stage": stage,
            "scenario_text": openai_data["scenario_text"].strip(),
            "question_text": openai_data["question_text"].strip(),
            "options": options,
        }

    # Local fallback
    situation = random.choice(SITUATION_TEMPLATES)
    actor_name, _ = random.choice(STUDENT_NAMES)
    target_name, _ = random.choice([n for n in STUDENT_NAMES if n[0] != actor_name])
    platform_full, platform_short = random.choice(PLATFORMS)
    scenario_text = situation["context"].format(
        actor=actor_name, target=target_name, platform=platform_full
    )

    tmpl = random.choice(SCENARIO_BLOCK_TEMPLATES.get(construct, SCENARIO_BLOCK_TEMPLATES["Attitude"]))
    q_tmpl = random.choice(tmpl["questions"])
    question_text = q_tmpl["question"].format(
        actor=actor_name, target=target_name, platform=platform_short
    )
    options = [
        (
            opt_text.format(actor=actor_name, target=target_name, platform=platform_short),
            score
        )
        for opt_text, score in q_tmpl["options"]
    ]

    return {
        "construct": construct,
        "stage": stage,
        "scenario_text": scenario_text,
        "question_text": question_text,
        "options": options,
    }


def generate_personalized_scenario_blocks(
    db: Session,
    stage: str,
    profile_data: Optional[dict] = None,
    num_blocks: int = 3,
) -> List[models.Scenario]:
    """
    Generate N complete scenario blocks, each covering all 4 TPB constructs.

    Each block produces:
      - 1 shared scenario situation (scenario_text)
      - 2 Attitude questions
      - 2 SubjectiveNorm questions
      - 2 PBC questions
      - 2 BehavioralIntention questions

    Total = 3 blocks × 8 questions = 24 scenario items.

    Returns a flat list of Scenario ORM objects (each question is a separate Scenario row
    sharing the same scenario_text for UI grouping).

    Strategy:
      1. Try OpenAI API for full scenario block generation (profile-aware).
      2. Fall back to local synthesizer if OpenAI fails.
    All generated scenarios are persisted to DB with a block_id tag in scenario_text.
    """
    all_scenarios: List[models.Scenario] = []
    used_situation_ids: set = set()

    for block_num in range(num_blocks):
        print(f"[AI Generator] Generating scenario block {block_num + 1}/{num_blocks} for stage={stage}")

        # Try AI generation first
        block_data = None

        if OPENAI_API_KEY and OPENAI_API_KEY.strip() and OPENAI_API_KEY not in ("your_openai_api_key_here", "YOUR_KEY_HERE"):
            prompt = _build_tpb_block_prompt(stage, profile_data)
            raw = _call_openai_api(prompt, SCENARIO_BLOCK_JSON_SCHEMA)
            if raw and _validate_openai_block(raw):
                block_data = raw
                print(f"[AI Generator] Block {block_num + 1}: OpenAI generation successful.")
            else:
                print(f"[AI Generator] Block {block_num + 1}: OpenAI validation failed. Using local fallback.")

        if block_data is None:
            block_data = _local_synthesize_scenario_block(stage, profile_data, used_situation_ids)
            print(f"[AI Generator] Block {block_num + 1}: Local synthesizer used.")

        scenario_text = block_data["scenario_text"].strip()
        questions = block_data["questions"]

        # Persist each question as a Scenario row
        for q in questions:
            construct = q["construct"]
            question_text = q["question_text"].strip()
            options_raw = q["options"]

            scenario = models.Scenario(
                construct=construct,
                stage=stage,
                scenario_text=scenario_text,
                question_text=question_text,
            )
            db.add(scenario)
            db.flush()

            for opt in options_raw:
                score = int(opt["score"])
                text = opt["text"].strip()
                db.add(models.ScenarioOption(
                    scenario_id=scenario.id,
                    option_text=text,
                    score=score,
                ))

            all_scenarios.append(scenario)

    db.commit()

    # Reload with options eager-loaded
    scenario_ids = [s.id for s in all_scenarios]
    loaded = (
        db.query(models.Scenario)
        .options(joinedload(models.Scenario.options))
        .filter(models.Scenario.id.in_(scenario_ids))
        .all()
    )

    return loaded


def get_or_create_hybrid_scenarios(
    db: Session,
    stage: str,
    target_count_per_construct: int = 4,
    ai_ratio: float = 0.5,
) -> List[models.Scenario]:
    """
    Legacy hybrid scenario engine (kept for backwards compatibility with existing routes).
    Now delegates to single-construct synthesize_dynamic_scenario when DB pool is insufficient.
    For new profile-aware generation, use generate_personalized_scenario_blocks() directly.
    """
    constructs = ["Attitude", "SubjectiveNorm", "PBC", "BehavioralIntention"]
    selected_scenarios: List[models.Scenario] = []

    for construct in constructs:
        db_pool = (
            db.query(models.Scenario)
            .options(joinedload(models.Scenario.options))
            .filter(models.Scenario.stage == stage, models.Scenario.construct == construct)
            .all()
        )

        if len(db_pool) >= target_count_per_construct:
            selected_scenarios.extend(random.sample(db_pool, target_count_per_construct))
        else:
            selected_scenarios.extend(db_pool)
            needed = target_count_per_construct - len(db_pool)

            for _ in range(needed):
                generated = synthesize_dynamic_scenario(construct, stage)
                new_scenario = models.Scenario(
                    construct=generated["construct"],
                    stage=generated["stage"],
                    scenario_text=generated["scenario_text"],
                    question_text=generated["question_text"],
                )
                db.add(new_scenario)
                db.flush()

                for opt_text, score in generated["options"]:
                    db.add(
                        models.ScenarioOption(
                            scenario_id=new_scenario.id,
                            option_text=opt_text,
                            score=score,
                        )
                    )
                selected_scenarios.append(new_scenario)
            db.commit()

    random.shuffle(selected_scenarios)
    return selected_scenarios
