"""
tests/test_scenario_image_pipeline.py

Unit tests for scenario visual image pipeline:
1. Seed determinism (same user + scenario = same seed and same chosen variation options).
2. Different users = different seeds and variation options.
3. Prompt contains scenario-derived content and all constraints (no text, no logos, safe).
4. Fallback returns valid scenario-specific URLs.
"""

import unittest
from assessment.image_pipeline import (
    compute_user_scenario_seed,
    pick_variation_parameters,
    build_scenario_image_prompt,
    SCENARIO_FALLBACK_IMAGES,
)
from assessment.image_variation_config import (
    ART_STYLES,
    PALETTES,
    COMPOSITIONS,
    LIGHTING,
    CHARACTER_VARIANTS,
)


class TestScenarioImagePipeline(unittest.TestCase):

    def test_seed_determinism(self):
        """Verify that the same user and scenario produce an identical seed every time."""
        seed1 = compute_user_scenario_seed(user_id=42, scenario_id=7, version=1)
        seed2 = compute_user_scenario_seed(user_id=42, scenario_id=7, version=1)
        self.assertEqual(seed1, seed2, "Seed must be strictly deterministic for identical user, scenario, and version.")

        # Verify variation parameters are also 100% identical
        var1 = pick_variation_parameters(seed1)
        var2 = pick_variation_parameters(seed2)
        self.assertEqual(var1, var2, "Same seed must pick identical variation parameters.")

    def test_different_users_produce_different_seeds_and_options(self):
        """Verify that different users get different seeds and variation options."""
        seed_user_a = compute_user_scenario_seed(user_id=101, scenario_id=5, version=1)
        seed_user_b = compute_user_scenario_seed(user_id=202, scenario_id=5, version=1)

        self.assertNotEqual(seed_user_a, seed_user_b, "Different users must produce different seeds.")

        var_a = pick_variation_parameters(seed_user_a)
        var_b = pick_variation_parameters(seed_user_b)

        # At least one style attribute should differ between different users
        diffs = [k for k in var_a if var_a[k] != var_b[k]]
        self.assertGreater(len(diffs), 0, f"Different users should receive distinct variation parameters, but found identical: {var_a}")

    def test_prompt_contains_scenario_derived_content_and_constraints(self):
        """Verify prompt builder embeds visual brief elements and strict safety constraints."""
        sample_brief = {
            "setting": "A vibrant university student lounge",
            "characters": "A distraught student looking at a viral video",
            "key_action": "A parody TikTok account circulating student photos",
            "mood": "Tense and socially anxious",
            "objects_on_screen": "Video stream with caricature comments",
        }
        sample_variation = {
            "art_style": ART_STYLES[0],
            "palette": PALETTES[0],
            "composition": COMPOSITIONS[0],
            "lighting": LIGHTING[0],
            "character_attributes": CHARACTER_VARIANTS[0],
        }

        prompt, alt_text = build_scenario_image_prompt(sample_brief, sample_variation, simplified=False)

        # Must contain scene-derived content
        self.assertIn("A vibrant university student lounge", prompt)
        self.assertIn("A parody TikTok account circulating student photos", prompt)
        self.assertIn("Tense and socially anxious", prompt)

        # Must contain chosen variation styles
        self.assertIn(ART_STYLES[0], prompt)
        self.assertIn(PALETTES[0], prompt)

        # Must contain mandatory negative constraints
        self.assertIn("no readable text", prompt)
        self.assertIn("no letters", prompt)
        self.assertIn("no logos", prompt)
        self.assertIn("no real brand marks", prompt)
        self.assertIn("no watermark", prompt)
        self.assertIn("Safe for students", prompt)

    def test_scenario_fallbacks_are_scenario_specific(self):
        """Verify that each of the 3 scenarios maps to a scenario-specific fallback SVG, not a shared generic one."""
        self.assertGreaterEqual(len(SCENARIO_FALLBACK_IMAGES), 3)
        # Each scenario must have a distinct fallback URL
        urls = set(SCENARIO_FALLBACK_IMAGES.values())
        self.assertEqual(len(urls), len(SCENARIO_FALLBACK_IMAGES), "Each scenario must have its own distinct fallback image.")
        for idx, url in SCENARIO_FALLBACK_IMAGES.items():
            self.assertIn("fallback_situation_", url)
            self.assertNotIn("suspicious", url.lower(), "Must not use the old suspicious link generic laptop.")


if __name__ == "__main__":
    unittest.main()
