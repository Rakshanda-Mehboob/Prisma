"""
server/assessment/image_variation_config.py

Configuration and variation option lists for per-user scenario image generation.
Only the visual style, palette, angle, and lighting vary between users.
The core narrative meaning, characters, and events remain identical.
"""

# Feature flag to toggle dynamic image generation
ENABLE_DYNAMIC_IMAGE_GENERATION = True

# OpenAI Image Model & Settings
IMAGE_MODEL = "dall-e-3"
IMAGE_SIZE = "1024x1024"
IMAGE_QUALITY = "standard"
IMAGE_TIMEOUT_SECONDS = 30.0
MAX_IMAGE_RETRIES = 1

# ── Fixed Variation Lists ────────────────────────────────────────────────────

ART_STYLES = [
    "Minimalist modern flat vector illustration with clean geometric silhouettes",
    "Contemporary editorial digital illustration with soft paper texture grain",
    "Stylized graphic novel digital cel-shaded illustration with expressive line art",
    "Modern risograph print inspired illustration with layered halftone accents",
    "Semi-flat digital gouache editorial illustration with clean outlines",
    "Soft atmospheric vector scene with subtle gradients and muted shadows",
]

PALETTES = [
    "Warm indigo and amber palette with deep navy accents and soft cream highlights",
    "Sage green and slate blue palette with muted terracotta and warm beige",
    "Teal and coral palette with charcoal undertones and warm ivory base",
    "Dusk violet and dusty rose palette with deep plum shadows and sand accents",
    "Cobalt blue and golden mustard palette with soft ash grey backgrounds",
    "Emerald green and warm beige palette with steel blue shadows and off-white",
    "Muted plum and ochre palette with warm charcoal contrast and soft beige",
    "Modern Scandinavian pastel palette with deep pine green and muted rust accents",
]

COMPOSITIONS = [
    "Eye-level medium-wide shot showing the characters within their immediate campus environment",
    "Slight high-angle shot capturing the student and the digital device context within the room",
    "Side-profile two-shot framing the emotional disconnect between peers",
    "Wide environmental composition emphasizing the spatial tension and surrounding student activity",
    "Medium over-the-shoulder perspective focusing on the social interaction context",
    "Diagonal three-quarter view showing the physical setting and digital atmosphere simultaneously",
]

LIGHTING = [
    "Bright indirect morning daylight streaming through campus library windows",
    "Soft warm late afternoon golden-hour light casting long gentle shadows",
    "Diffused cool indoor fluorescent campus hallway lighting with gentle ambient glow",
    "Warm cozy indoor evening study lighting with soft ambient contrasts",
]

CHARACTER_VARIANTS = [
    "Casual university student attire: simple denim, modest tunic or collared shirt, student backpack",
    "Campus daily wear: lightweight cotton hoodie, casual trousers, canvas shoulder bag",
    "Everyday lecture attire: traditional modest kurta or casual sweater with notebook",
    "Study group wear: relaxed cardigan, tailored trousers, university lanyard",
]

# ── Base Prompt Template ─────────────────────────────────────────────────────

IMAGE_PROMPT_TEMPLATE = (
    "Flat vector editorial illustration for a university cyberbullying awareness course. "
    "Scene: {setting}. {key_action}. Characters: {characters}. Mood: {mood}. "
    "Show on screens: generic social media interface, {objects_on_screen}. "
    "Style: {art_style}. Color palette: {palette}. Composition: {composition}. Lighting: {lighting}. "
    "Diverse young adults in a Pakistani university context, modest everyday clothing: {character_attributes}. "
    "Constraints: no readable text, no letters, no logos, no real brand marks, no real or recognizable people, "
    "no watermark. Not graphic, not violent, no self-harm, no sexual content. Convey distress or tension through "
    "body language and setting only. Safe for students."
)

SIMPLIFIED_RETRY_PROMPT_TEMPLATE = (
    "Clean vector educational illustration of university students in a respectful campus scene: {setting}. "
    "{key_action}. Mood: {mood}. "
    "Style: {art_style}. Color palette: {palette}. "
    "Diverse young adults in modest everyday clothing. "
    "Constraints: no readable text, no words, no logos, no watermarks, safe educational illustration."
)

