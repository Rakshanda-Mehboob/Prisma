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
# Distinct per situation type, preserved for backward compatibility
SCENARIO_FALLBACK_IMAGES = {
    0: "/static/scenario_images/fallback_situation_1_social.svg",
    1: "/static/scenario_images/fallback_situation_2_chat.svg",
    2: "/static/scenario_images/fallback_situation_3_academic.svg",
}

# ── 7 Supported Cyberbullying Themes with >= 3 Unique Variants Each ───────────
SUPPORTED_IMAGE_THEMES = [
    "mockery",
    "exclusion",
    "private_info_leak",
    "false_rumour",
    "threats",
    "humiliating_content",
    "general",
]

THEME_FALLBACK_IMAGES = {
    "mockery": [
        "/static/scenario_images/themes/mockery/variant_1.svg",
        "/static/scenario_images/themes/mockery/variant_2.svg",
        "/static/scenario_images/themes/mockery/variant_3.svg",
    ],
    "exclusion": [
        "/static/scenario_images/themes/exclusion/variant_1.svg",
        "/static/scenario_images/themes/exclusion/variant_2.svg",
        "/static/scenario_images/themes/exclusion/variant_3.svg",
    ],
    "private_info_leak": [
        "/static/scenario_images/themes/private_info_leak/variant_1.svg",
        "/static/scenario_images/themes/private_info_leak/variant_2.svg",
        "/static/scenario_images/themes/private_info_leak/variant_3.svg",
    ],
    "false_rumour": [
        "/static/scenario_images/themes/false_rumour/variant_1.svg",
        "/static/scenario_images/themes/false_rumour/variant_2.svg",
        "/static/scenario_images/themes/false_rumour/variant_3.svg",
    ],
    "threats": [
        "/static/scenario_images/themes/threats/variant_1.svg",
        "/static/scenario_images/themes/threats/variant_2.svg",
        "/static/scenario_images/themes/threats/variant_3.svg",
    ],
    "humiliating_content": [
        "/static/scenario_images/themes/humiliating_content/variant_1.svg",
        "/static/scenario_images/themes/humiliating_content/variant_2.svg",
        "/static/scenario_images/themes/humiliating_content/variant_3.svg",
    ],
    "general": [
        "/static/scenario_images/themes/general/variant_1.svg",
        "/static/scenario_images/themes/general/variant_2.svg",
        "/static/scenario_images/themes/general/variant_3.svg",
    ],
}


def detect_scenario_theme(scenario: Optional[object] = None, text: Optional[str] = None, category: Optional[str] = None) -> str:
    """
    Detects or maps a scenario's theme to one of the 7 supported themes.
    Checks explicit attributes, context metadata, categories, and keyword markers.
    """
    # 1. Direct attribute on scenario object or dict
    if scenario is not None:
        if isinstance(scenario, dict):
            direct = scenario.get("image_theme") or scenario.get("image_key")
            if direct and direct.lower() in SUPPORTED_IMAGE_THEMES:
                return direct.lower()
            text = text or scenario.get("scenario_text") or scenario.get("text")
            category = category or scenario.get("category")
        else:
            direct = getattr(scenario, "image_key", None) or getattr(scenario, "image_theme", None)
            if direct and str(direct).lower() in SUPPORTED_IMAGE_THEMES:
                return str(direct).lower()
            # Check user_context_used JSON
            ctx_str = getattr(scenario, "user_context_used", None)
            if ctx_str:
                try:
                    ctx_dict = json.loads(ctx_str) if isinstance(ctx_str, str) else ctx_str
                    ctx_theme = ctx_dict.get("image_theme")
                    if ctx_theme and ctx_theme.lower() in SUPPORTED_IMAGE_THEMES:
                        return ctx_theme.lower()
                except Exception:
                    pass
            text = text or getattr(scenario, "scenario_text", None) or getattr(scenario, "text", None)
            category = category or getattr(scenario, "category", None)

    # 2. Check category mapping
    if category:
        cat_lower = str(category).lower()
        if cat_lower in SUPPORTED_IMAGE_THEMES:
            return cat_lower
        if "mock" in cat_lower or "derogatory" in cat_lower or "comment" in cat_lower:
            return "mockery"
        if "exclu" in cat_lower or "bystander" in cat_lower or "isolate" in cat_lower:
            return "exclusion"
        if "leak" in cat_lower or "private" in cat_lower or "secret" in cat_lower:
            return "private_info_leak"
        if "rumo" in cat_lower or "poll" in cat_lower or "smear" in cat_lower or "slander" in cat_lower:
            return "false_rumour"
        if "threat" in cat_lower or "intimidat" in cat_lower or "aggressive" in cat_lower:
            return "threats"
        if "humiliat" in cat_lower or "meme" in cat_lower or "photo" in cat_lower or "candid" in cat_lower:
            return "humiliating_content"

    # 3. Text heuristic detection
    if text:
        t_lower = str(text).lower()
        if "screenshot" in t_lower and ("private" in t_lower or "confidential" in t_lower or "medical" in t_lower):
            return "private_info_leak"
        if "threat" in t_lower or "warning them" in t_lower or "aggressive" in t_lower or "intimidat" in t_lower:
            return "threats"
        if "meme" in t_lower or "candid" in t_lower or "photo without permission" in t_lower or "humiliat" in t_lower:
            return "humiliating_content"
        if "rumor" in t_lower or "rumour" in t_lower or "cheating" in t_lower or "copied" in t_lower or "poll" in t_lower:
            return "false_rumour"
        if "exclud" in t_lower or "removed" in t_lower or "dropped from" in t_lower or "silent" in t_lower:
            return "exclusion"
        if "mock" in t_lower or "laughing emoji" in t_lower or "sloppy" in t_lower or "ridicul" in t_lower:
            return "mockery"

    return "general"


def select_themed_fallback_image(
    theme: str,
    stage: str = "pre",
    block_number: int = 0,
    scenario_id: int = 0,
    already_used: Optional[set] = None,
) -> str:
    """
    Deterministically selects a themed fallback illustration based on:
    - theme (one of 7 themes)
    - hash of (stage, block_number, scenario_id)
    - stage offset so pre- and post-assessments do not share identical fallback images
    - local exclusion so scenarios within one stage never repeat an image
    """
    norm_theme = theme.lower().strip() if theme else "general"
    if norm_theme not in THEME_FALLBACK_IMAGES:
        norm_theme = "general"

    pool = THEME_FALLBACK_IMAGES[norm_theme]
    if already_used is None:
        already_used = set()

    # Stage-based salt: ensure 'pre' and 'post' have distinct offsets
    stage_salt = 1 if stage.lower() == "post" else 0

    # Deterministic hash
    key_str = f"{stage.lower()}:{block_number}:{scenario_id}:{norm_theme}:{stage_salt}"
    hash_val = int(hashlib.sha256(key_str.encode("utf-8")).hexdigest(), 16)
    start_idx = (hash_val + stage_salt) % len(pool)

    # Pick from the matching theme pool avoiding collisions within the stage
    for offset in range(len(pool)):
        candidate = pool[(start_idx + offset) % len(pool)]
        if candidate not in already_used:
            already_used.add(candidate)
            return candidate

    # If all variants of this theme are exhausted in this stage, borrow an unused one from another pool
    for fallback_theme in ("general", "exclusion", "mockery"):
        for candidate in THEME_FALLBACK_IMAGES[fallback_theme]:
            if candidate not in already_used:
                already_used.add(candidate)
                return candidate

    chosen = pool[start_idx]
    already_used.add(chosen)
    return chosen


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
        reason = (
            "ENABLE_DYNAMIC_IMAGE_GENERATION is False"
            if not ENABLE_DYNAMIC_IMAGE_GENERATION
            else ("OPENAI_API_KEY is not set or empty" if not OPENAI_API_KEY else "OpenAI library not installed")
        )
        stage = getattr(getattr(scenario, "instance", None), "stage", "pre")
        theme = detect_scenario_theme(scenario)
        fallback_url = select_themed_fallback_image(
            theme=theme,
            stage=stage,
            block_number=scenario.order_index,
            scenario_id=scenario.id,
        )
        logger.warning(
            f"[Image Pipeline Fallback] Scenario {scenario_id} (stage={stage}, order={scenario.order_index}, theme={theme}) -> Themed fallback assigned: {fallback_url}. Reason: {reason}"
        )
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
        # Fallback to theme-specific vector graphic
        stage = getattr(getattr(scenario, "instance", None), "stage", "pre")
        theme = detect_scenario_theme(scenario)
        fallback_url = select_themed_fallback_image(
            theme=theme,
            stage=stage,
            block_number=scenario.order_index,
            scenario_id=scenario.id,
        )
        logger.warning(
            f"[Image Pipeline Fallback] Scenario {scenario_id} (stage={stage}, order={scenario.order_index}, theme={theme}) -> Themed fallback assigned: {fallback_url}. Reason: OpenAI image generation failed after retries: {error_msg}"
        )
        record.image_url = fallback_url
        record.status = "failed"
        record.error_message = error_msg

    db.commit()
    db.refresh(record)
    return record

