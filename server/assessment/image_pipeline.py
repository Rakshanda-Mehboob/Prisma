"""
server/assessment/image_pipeline.py

Two-step scenario visual image pipeline:
Step 1: Extract semantic scene brief using text model (cached per scenario across users).
Step 2: Generate deterministic per-user image variation prompt and call OpenAI image generation lazily.
Step 3: Fallback handling, content policy retry, and scenario-specific fallback assignment.
"""

import hashlib
import json
import logging
import os
import random
import time
import urllib.request
from pathlib import Path
from typing import Dict, Optional, Tuple

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

import models
from config import OPENAI_API_KEY
from assessment.image_variation_config import (
    ENABLE_DYNAMIC_IMAGE_GENERATION,
    IMAGE_MODEL,
    IMAGE_SIZE,
    IMAGE_QUALITY,
    IMAGE_TIMEOUT_SECONDS,
    MAX_IMAGE_RETRIES,
    ART_STYLES,
    PALETTES,
    COMPOSITIONS,
    LIGHTING,
    CHARACTER_VARIANTS,
    IMAGE_PROMPT_TEMPLATE,
    SIMPLIFIED_RETRY_PROMPT_TEMPLATE,
)

logger = logging.getLogger(__name__)

# Ensure local static directory exists for cached images
STATIC_IMAGE_DIR = Path(__file__).resolve().parent.parent / "static" / "scenario_images"
STATIC_IMAGE_DIR.mkdir(parents=True, exist_ok=True)

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


# ── Curated Scenario-Specific Fallback Vector Assets ──────────────────────────
# Distinct per situation type, never a generic "suspicious link" laptop icon!
SCENARIO_FALLBACK_IMAGES = {
    # Situation 1: Social Media/TikTok/Instagram harassment, parody profile or viral post
    0: "/static/scenario_images/fallback_situation_1_social.svg",
    # Situation 2: Private Backchannel/WhatsApp/Discord exclusion and side-chat mocking
    1: "/static/scenario_images/fallback_situation_2_chat.svg",
    # Situation 3: Campus/LMS/Forum academic dispute, public portal ridicule
    2: "/static/scenario_images/fallback_situation_3_academic.svg",
}


def compute_user_scenario_seed(user_id: int, scenario_id: int, version: int = 1) -> str:
    """Compute a deterministic hash string based on user_id, scenario_id, and version."""
    key = f"{user_id}:{scenario_id}:{version}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def pick_variation_parameters(seed_hex: str) -> Dict[str, str]:
    """
    Deterministically pick variation parameters from fixed config lists using the seed.
    Guarantees that the same seed always selects the exact same combination.
    """
    seed_int = int(seed_hex, 16)
    
    art_style = ART_STYLES[seed_int % len(ART_STYLES)]
    palette = PALETTES[(seed_int >> 4) % len(PALETTES)]
    composition = COMPOSITIONS[(seed_int >> 8) % len(COMPOSITIONS)]
    lighting = LIGHTING[(seed_int >> 12) % len(LIGHTING)]
    character_attributes = CHARACTER_VARIANTS[(seed_int >> 16) % len(CHARACTER_VARIANTS)]

    return {
        "art_style": art_style,
        "palette": palette,
        "composition": composition,
        "lighting": lighting,
        "character_attributes": character_attributes,
    }


def get_or_extract_scene_brief(db: Session, scenario: models.AssessmentScenario) -> Dict[str, str]:
    """
    Step 3a: Scene brief extraction.
    Sends the scenario narrative to a fast text model to extract structured visual components:
    { "setting", "characters", "key_action", "mood", "objects_on_screen" }
    Cached in scenario_visual_briefs table so it is generated once per scenario.
    """
    # Check cache first
    cached = db.query(models.ScenarioVisualBrief).filter_by(scenario_id=scenario.id).first()
    if cached:
        return {
            "setting": cached.setting,
            "characters": cached.characters,
            "key_action": cached.key_action,
            "mood": cached.mood,
            "objects_on_screen": cached.objects_on_screen,
        }

    # If OpenAI is unavailable, produce a calibrated semantic fallback brief from scenario context
    brief = _extract_fallback_brief(scenario.scenario_text, scenario.order_index, scenario.category)

    if OPENAI_API_KEY and OpenAI:
        try:
            client = OpenAI(api_key=OPENAI_API_KEY, timeout=15.0)
            system_msg = (
                "You are an art director for a university educational cyberbullying awareness platform. "
                "Extract the core visual scene elements from the given scenario narrative into concise JSON with keys: "
                "setting, characters (generic stylized, no names, no identifiable real people), key_action, mood, objects_on_screen. "
                "Keep descriptions concrete and visual. Respond with JSON only."
            )
            user_msg = f"Scenario narrative:\n\"\"\"\n{scenario.scenario_text}\n\"\"\""

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_msg},
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
            )
            raw = response.choices[0].message.content
            parsed = json.loads(raw)
            if all(k in parsed for k in ("setting", "characters", "key_action", "mood", "objects_on_screen")):
                brief = {k: str(parsed[k]).strip() for k in ("setting", "characters", "key_action", "mood", "objects_on_screen")}
        except Exception as e:
            logger.warning(f"[Image Pipeline] Scene brief extraction via OpenAI failed ({e}); using heuristic brief.")

    # Save to database cache
    try:
        new_brief = models.ScenarioVisualBrief(
            scenario_id=scenario.id,
            setting=brief["setting"],
            characters=brief["characters"],
            key_action=brief["key_action"],
            mood=brief["mood"],
            objects_on_screen=brief["objects_on_screen"],
        )
        db.add(new_brief)
        db.commit()
    except IntegrityError:
        db.rollback()

    return brief


def _extract_fallback_brief(scenario_text: str, order_index: int, category: Optional[str]) -> Dict[str, str]:
    """Heuristic extraction of visual scene components when text API is offline."""
    text_lower = scenario_text.lower()
    if "tiktok" in text_lower or "instagram" in text_lower or "social" in text_lower or order_index == 0:
        return {
            "setting": "A bustling university campus courtyard with students holding smartphones",
            "characters": "A solitary student looking uncomfortable while a distant small group of peers points at a phone",
            "key_action": "A viral parody video circulating on campus social feeds",
            "mood": "Tense, socially awkward, uncomfortable isolation",
            "objects_on_screen": "Generic video stream feed with caricatured avatars and reaction counters",
        }
    elif "whatsapp" in text_lower or "discord" in text_lower or "chat" in text_lower or order_index == 1:
        return {
            "setting": "A university campus computer lab or shared study space",
            "characters": "A student in the foreground studying diligently while peers in the background whisper over an active group chat",
            "key_action": "Exclusionary backchannel messages circulating during a group study session",
            "mood": "Conspiratorial, alienating, uneasy social tension",
            "objects_on_screen": "A private messaging thread with screenshot attachments and rapid text replies",
        }
    else:
        return {
            "setting": "A campus academic lecture hall or library terminal area",
            "characters": "A university student sitting alone at an open laptop reading a harsh course portal comment",
            "key_action": "Disparaging public comments posted on an academic discussion board",
            "mood": "Deflated, disappointed, withdrawn",
            "objects_on_screen": "An academic discussion forum thread with multiple dismissive replies",
        }


def build_scenario_image_prompt(
    brief: Dict[str, str],
    variation: Dict[str, str],
    simplified: bool = False,
) -> Tuple[str, str]:
    """
    Step 3b: Build the final image prompt from the scene brief + variation params.
    Returns (prompt, alt_text).
    """
    if simplified:
        prompt = SIMPLIFIED_RETRY_PROMPT_TEMPLATE.format(
            setting=brief["setting"],
            key_action=brief["key_action"],
            mood=brief["mood"],
            art_style=variation["art_style"],
            palette=variation["palette"],
        )
    else:
        prompt = IMAGE_PROMPT_TEMPLATE.format(
            setting=brief["setting"],
            key_action=brief["key_action"],
            characters=brief["characters"],
            mood=brief["mood"],
            objects_on_screen=brief["objects_on_screen"],
            art_style=variation["art_style"],
            palette=variation["palette"],
            composition=variation["composition"],
            lighting=variation["lighting"],
            character_attributes=variation["character_attributes"],
        )

    alt_text = f"University cyberbullying scenario illustration: {brief['setting']}, depicting {brief['key_action']}."
    return prompt, alt_text


def generate_and_store_user_image(
    db: Session,
    user_id: int,
    scenario_id: int,
    version: int = 1,
) -> models.UserScenarioImage:
    """
    Main synchronous generation logic:
    Checks if image record already exists; if not, creates pending record, generates image,
    caches PNG file locally, and updates status to ready (or failed with fallback).
    """
    record = (
        db.query(models.UserScenarioImage)
        .filter_by(user_id=user_id, scenario_id=scenario_id, version=version)
        .first()
    )

    if record and record.status == "ready" and record.image_url:
        return record

    scenario = db.query(models.AssessmentScenario).filter_by(id=scenario_id).first()
    if not scenario:
        raise ValueError(f"Scenario id {scenario_id} not found")

    seed_hex = compute_user_scenario_seed(user_id, scenario_id, version)
    variation = pick_variation_parameters(seed_hex)
    brief = get_or_extract_scene_brief(db, scenario)
    prompt, alt_text = build_scenario_image_prompt(brief, variation, simplified=False)

    if not record:
        record = models.UserScenarioImage(
            user_id=user_id,
            scenario_id=scenario_id,
            version=version,
            status="pending",
            seed=seed_hex,
            image_prompt=prompt,
            alt_text=alt_text,
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    # If dynamic generation is disabled by configuration, immediately route to scenario-specific fallback
    if not ENABLE_DYNAMIC_IMAGE_GENERATION or not OPENAI_API_KEY or not OpenAI:
        fallback_url = SCENARIO_FALLBACK_IMAGES.get(scenario.order_index, SCENARIO_FALLBACK_IMAGES[0])
        record.status = "ready"
        record.image_url = fallback_url
        db.commit()
        return record

    # Attempt OpenAI Image Generation with 1 retry on content-policy rejection or error
    remote_url = None
    error_msg = None

    for attempt in range(MAX_IMAGE_RETRIES + 1):
        try:
            curr_prompt = prompt if attempt == 0 else build_scenario_image_prompt(brief, variation, simplified=True)[0]
            client = OpenAI(api_key=OPENAI_API_KEY, timeout=IMAGE_TIMEOUT_SECONDS)
            response = client.images.generate(
                model=IMAGE_MODEL,
                prompt=curr_prompt[:1000],
                size=IMAGE_SIZE,
                quality=IMAGE_QUALITY,
                n=1,
            )
            if response and response.data:
                remote_url = response.data[0].url
                break
        except Exception as e:
            error_msg = f"Attempt {attempt + 1} failed: {type(e).__name__}"
            logger.warning(f"[Image Pipeline] DALL-E generation attempt {attempt + 1} failed for user {user_id}, scenario {scenario_id}: {type(e).__name__}")
            time.sleep(1.0)

    if remote_url:
        # Download and cache locally in STATIC_IMAGE_DIR so URL never expires
        try:
            local_filename = f"user_{user_id}_sc_{scenario_id}_v{version}_{seed_hex[:8]}.png"
            dest_path = STATIC_IMAGE_DIR / local_filename
            urllib.request.urlretrieve(remote_url, str(dest_path))
            record.image_url = f"/static/scenario_images/{local_filename}"
            record.status = "ready"
            record.error_message = None
        except Exception as file_err:
            logger.error(f"[Image Pipeline] Local caching failed ({file_err}); using remote URL.")
            record.image_url = remote_url
            record.status = "ready"
    else:
        # Fallback to scenario-specific vector graphic
        fallback_url = SCENARIO_FALLBACK_IMAGES.get(scenario.order_index, SCENARIO_FALLBACK_IMAGES[0])
        record.image_url = fallback_url
        record.status = "failed"
        record.error_message = error_msg

    db.commit()
    db.refresh(record)
    return record

