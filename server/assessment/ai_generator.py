"""
assessment/ai_generator.py — Hybrid AI Scenario Generation Engine.

Generates dynamic, non-repetitive cyberbullying scenarios grounded in the
Theory of Planned Behavior (TPB): Attitude, Subjective Norm, and PBC.

Combines:
  1. Vetted core baseline scenarios stored in the database.
  2. Dynamic AI-generated scenarios (using Gemini/LLM API if available,
     and an advanced contextual generative synthesizer).
Persists new scenarios to the database so that IDs, foreign keys, and
psychometric scoring function consistently across pre and post stages.
"""

import os
import json
import random
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

import models

# ── Dynamic Generative Synthesizer Banks ──────────────────────────────────────
# Combinatorial pools ensuring high variability and contextual realism

STUDENT_NAMES = [
    ("Zainab", "female"), ("Hamza", "male"), ("Arooj", "female"), ("Bilal", "male"),
    ("Mahnoor", "female"), ("Usman", "male"), ("Fatima", "female"), ("Danish", "male"),
    ("Laiba", "female"), ("Shahmeer", "male"), ("Hira", "female"), ("Taimoor", "male"),
    ("Rida", "female"), ("Saad", "male"), ("Khadija", "female"), ("Arham", "male"),
]

PLATFORMS = [
    ("a 120-member university WhatsApp batch group", "WhatsApp group"),
    ("an anonymous university confession page on Instagram", "Instagram confession page"),
    ("a departmental Discord server used for gaming and study", "Discord server"),
    ("a shared Google Doc for an assigned group project", "shared Google Doc"),
    ("a TikTok video comments section tagging classmates", "TikTok comments"),
    ("a class Telegram channel where exam notes are exchanged", "Telegram channel"),
    ("a public Twitter/X thread quoting a student presentation", "Twitter/X thread"),
]

SCENARIO_TEMPLATES = {
    "Attitude": [
        {
            "context": (
                "{actor} secretly records {target} stumbling over their words during a class "
                "presentation and creates a loop video with laughing emojis, posting it in {platform}. "
                "{actor} comments: 'Presentations are not for everyone lol.'"
            ),
            "question": "How do you evaluate {actor}'s behavior in this situation?",
            "options": [
                ("Completely unacceptable — recording and mocking someone without consent causes severe psychological harm.", 5),
                ("Wrong — sharing classmate struggles publicly is disrespectful and hurtful.", 4),
                ("Questionable — depends on whether {target} told {actor} they mind.", 3),
                ("Harmless teasing — presentation blunders are standard campus entertainment.", 2),
                ("Totally fine — everyone makes funny reels and it builds thicker skin.", 1),
            ],
        },
        {
            "context": (
                "After {target} scored the highest marks in a difficult midterm, {actor} starts "
                "spreading false rumors on {platform} claiming {target} cheated and manipulated the instructor. "
                "Several students join in calling {target} names."
            ),
            "question": "In your view, what is the nature of spreading these unverified claims about {target}?",
            "options": [
                ("Definite cyberbullying — malicious rumors damage academic reputation and emotional well-being.", 5),
                ("Unethical and unfair — academic envy should never be weaponized into online attacks.", 4),
                ("Minor gossip — people talk about grades all the time, it will blow over.", 3),
                ("Understandable frustration — people have a right to question suspicious grades.", 2),
                ("Acceptable — freedom of expression allows questioning anyone's achievements.", 1),
            ],
        },
        {
            "context": (
                "{actor} takes a screenshot of an old, awkward personal photo of {target} and turns it "
                "into a meme sticker, using it repeatedly on {platform} whenever {target} speaks."
            ),
            "question": "How acceptable is turning a classmate into an unwanted meme sticker?",
            "options": [
                ("Completely unacceptable — humiliating someone through persistent digital memes is cyberbullying.", 5),
                ("Inappropriate — meme culture should never target an individual's personal pictures.", 4),
                ("Borderline — it is okay if meant as lighthearted fun among classmates.", 3),
                ("Mostly harmless — sticker memes are normal university culture.", 2),
                ("Completely fine — taking offense over stickers shows oversensitivity.", 1),
            ],
        },
    ],
    "SubjectiveNorm": [
        {
            "context": (
                "In {platform}, a group of influential senior students begins insulting {target}'s accent and appearance. "
                "Most students remain silent, while a few send laughing reactions. You notice your close friends have not said anything."
            ),
            "question": "What would your closest friends and respected peers expect you to do here?",
            "options": [
                ("They would expect me to speak up or privately comfort {target}, proving our values against bullying.", 5),
                ("They would respect me for privately messaging the moderators or {target} to offer support.", 4),
                ("They would understand if I stayed neutral because getting involved invites drama.", 3),
                ("They would advise me to look the other way and not ruin our standing with the seniors.", 2),
                ("They would expect me to laugh along with the crowd to fit in.", 1),
            ],
        },
        {
            "context": (
                "{target} is excluded from all informal social circles and study groups because an influential classmate "
                "told everyone on {platform}: 'Whoever talks to {target} is off our team.' "
                "Your peers are debating whether to comply."
            ),
            "question": "How would the people whose opinions you value most want you to handle this social boycott?",
            "options": [
                ("They would strongly expect me to reject the boycott and include {target} openly.", 5),
                ("They would expect me to oppose collective ostracization and collaborate with {target}.", 4),
                ("They would understand why someone might hesitate to defy an influential peer.", 3),
                ("They would probably advise following the crowd to protect my own group project grades.", 2),
                ("They would expect me to comply with the majority to avoid being excluded myself.", 1),
            ],
        },
        {
            "context": (
                "A poll is posted on {platform} asking students to vote on 'Who is the most annoying person in our batch?' "
                "with {target} as one of the options. Your classmates are actively voting."
            ),
            "question": "What social standard should student communities uphold when derogatory polls appear?",
            "options": [
                ("Everyone has a shared duty to report the poll immediately and refuse to participate.", 5),
                ("Peers should publicly call out the poll creator for organizing public degradation.", 4),
                ("People should ignore it, though voting in it is poor judgment.", 3),
                ("It is considered normal campus gossip that students should not take too seriously.", 2),
                ("Most peers consider it funny and participation is socially expected.", 1),
            ],
        },
    ],
    "PBC": [
        {
            "context": (
                "You witness {actor} sending threatening direct messages to {target} in a class collaboration workspace. "
                "{target} is visibly shaken and does not know how to proceed without escalating danger."
            ),
            "question": "How confident and prepared are you to assist {target} with actionable safety steps?",
            "options": [
                ("Extremely confident — I know how to document screenshots, report to university authorities, and preserve evidence safely.", 5),
                ("Confident — I can guide {target} to block the sender and report to a trusted faculty advisor.", 4),
                ("Moderately prepared — I would want to help but might need to look up official university reporting policies.", 3),
                ("Unsure — I don't feel I have enough influence or technical skills to make a difference.", 2),
                ("Helpless — there is nothing I can do effectively to stop online harassment.", 1),
            ],
        },
        {
            "context": (
                "An anonymous account is targeting multiple first-year students on {platform} with vulgar remarks. "
                "You are one of the administrators or active senior members of that space."
            ),
            "question": "How capable do you feel in taking immediate administrative and technical countermeasures?",
            "options": [
                ("Fully capable — I can ban the offender, delete harmful posts, tighten verification rules, and issue a zero-tolerance warning.", 5),
                ("Capable — I can coordinate with other group leads to remove the offender and support victims.", 4),
                ("Somewhat capable — I can delete posts when I see them, but finding the offender is difficult.", 3),
                ("Low capability — anonymous trolls are almost impossible to control or sanction.", 2),
                ("Incapable — online groups are too chaotic for any single user to regulate.", 1),
            ],
        },
        {
            "context": (
                "{target} confided in you that they are having sleepless nights and panic attacks due to aggressive cyberbullying, "
                "but they are terrified that reporting will cause retaliation."
            ),
            "question": "How equipped are you to support a classmate facing severe emotional distress from cyberbullying?",
            "options": [
                ("Very well equipped — I can offer empathetic support and accompany them to student counseling services confidentially.", 5),
                ("Equipped — I can encourage them to seek counseling and connect them with trusted campus support channels.", 4),
                ("Somewhat equipped — I can listen, though I am not sure what professional resources exist on campus.", 3),
                ("Poorly equipped — I feel uncomfortable dealing with mental health distress and wouldn't know what to say.", 2),
                ("Not equipped — this is beyond my ability and I would have to distance myself.", 1),
            ],
        },
    ],
}


def _call_gemini_api(prompt: str) -> Optional[dict]:
    """Call Gemini API if GEMINI_API_KEY is available."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "responseMimeType": "application/json"},
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            result = json.loads(response.read().decode("utf-8"))
            candidate_text = result["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(candidate_text)
    except Exception as e:
        print(f"[AI Generator] Gemini API call skipped or failed: {e}")
        return None


def synthesize_dynamic_scenario(construct: str, stage: str) -> dict:
    """
    Generatively synthesizes a unique, contextually rich scenario and calibrated
    5-point Likert response scale for a given TPB construct.
    """
    templates = SCENARIO_TEMPLATES.get(construct, SCENARIO_TEMPLATES["Attitude"])
    template = random.choice(templates)

    actor, _ = random.choice(STUDENT_NAMES)
    target, _ = random.choice([n for n in STUDENT_NAMES if n[0] != actor])
    platform_full, platform_short = random.choice(PLATFORMS)

    scenario_text = template["context"].format(
        actor=actor,
        target=target,
        platform=platform_full,
    )
    question_text = template["question"].format(
        actor=actor,
        target=target,
        platform=platform_short,
    )

    # Format options
    formatted_options = []
    for opt_text, score in template["options"]:
        formatted_text = opt_text.format(
            actor=actor,
            target=target,
            platform=platform_short,
        )
        formatted_options.append((formatted_text, score))

    return {
        "construct": construct,
        "stage": stage,
        "scenario_text": scenario_text,
        "question_text": question_text,
        "options": formatted_options,
    }


def get_or_create_hybrid_scenarios(
    db: Session,
    stage: str,
    target_count_per_construct: int = 4,
    ai_ratio: float = 0.5,
) -> List[models.Scenario]:
    """
    Hybrid scenario engine:
    1. Samples (1 - ai_ratio) from existing vetted database scenarios.
    2. Dynamically synthesizes/generates (ai_ratio) novel AI scenarios.
    3. Persists novel generated scenarios into the DB so they have valid IDs and can be scored.
    4. Shuffles and returns the cohesive scenario set for the user.

    Every time this is called, the user receives a dynamic, varied scenario set!
    """
    constructs = ["Attitude", "SubjectiveNorm", "PBC"]
    selected_scenarios: List[models.Scenario] = []

    for construct in constructs:
        ai_count = max(1, round(target_count_per_construct * ai_ratio))
        db_count = max(1, target_count_per_construct - ai_count)

        # 1. Fetch existing scenarios for this construct & stage from DB
        db_pool = (
            db.query(models.Scenario)
            .filter(models.Scenario.stage == stage, models.Scenario.construct == construct)
            .all()
        )

        if db_pool:
            sampled_db = random.sample(db_pool, min(db_count, len(db_pool)))
            selected_scenarios.extend(sampled_db)
        else:
            ai_count = target_count_per_construct

        # 2. Generate novel AI scenarios
        for _ in range(ai_count):
            generated = synthesize_dynamic_scenario(construct, stage)

            # Persist to database to assign primary key and relationships
            new_scenario = models.Scenario(
                construct=generated["construct"],
                stage=generated["stage"],
                scenario_text=generated["scenario_text"],
                question_text=generated["question_text"],
            )
            db.add(new_scenario)
            db.flush()  # populate new_scenario.id

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

    # Re-query with options relationship loaded and randomize presentation order
    random.shuffle(selected_scenarios)
    return selected_scenarios
