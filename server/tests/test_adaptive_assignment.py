"""
tests/test_adaptive_assignment.py — Unit Tests for Adaptive Module Assignment Logic.

Validates the Theory of Planned Behavior (TPB) Construct-to-Module Mapping with 70% threshold:
  - Attitude LOW (0–69%)                       -> Modules 1 & 2
  - Perceived Behavioral Control LOW (0–69%)   -> Module 3
  - Subjective Norms LOW (0–69%)               -> Module 4
  - Multiple constructs LOW                    -> Ordered by lowest score first
  - Constructs HIGH (70–100%)                  -> Completely omitted / hidden
  - All constructs HIGH (70–100%)              -> assigned_modules = [], congratulations message
  - Scores exactly at threshold (70.0)         -> Evaluated as HIGH (>= 70), no intervention
  - Missing / Unreadable scores                -> Safe fallback
"""

import unittest
import sys
import os

# Ensure server module is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from interventions.adaptive_assignment import (
    CONSTRUCT_LOW_THRESHOLD,
    DEFAULT_ADAPTIVE_THRESHOLD,
    calculate_mean_item_scores,
    determine_module_assignments,
    normalize_to_percentage,
)


class TestAdaptiveAssignment(unittest.TestCase):
    def test_default_threshold_value(self):
        """Verify threshold constant is 70.0 percentage."""
        self.assertEqual(CONSTRUCT_LOW_THRESHOLD, 70.0)
        self.assertEqual(DEFAULT_ADAPTIVE_THRESHOLD, 70.0)

    def test_score_normalization(self):
        """Verify normalization to 0–100 percentage."""
        self.assertEqual(normalize_to_percentage(100.0), 100.0)
        self.assertEqual(normalize_to_percentage(70.0), 70.0)
        self.assertEqual(normalize_to_percentage(50.0), 50.0)
        self.assertEqual(normalize_to_percentage(0.0), 0.0)
        # Likert 1-5 scale conversion: 5.0 -> 100%, 1.0 -> 0%, 3.0 -> 50%
        self.assertEqual(normalize_to_percentage(5.0), 100.0)
        self.assertEqual(normalize_to_percentage(1.0), 0.0)
        self.assertEqual(normalize_to_percentage(3.0), 50.0)
        self.assertIsNone(normalize_to_percentage(None))

    def test_prompt_example_pbc_and_attitude_low(self):
        """
        Exact prompt example:
          - Attitude = 62 -> Show Attitude (Modules 1 and 2)
          - Subjective Norm = 81 -> Do NOT show SN (Module 4 omitted)
          - PBC = 58 -> Show PBC (Module 3)
          - Behavioral Intention = 75 -> Do NOT show BI
        Result:
          PBC (58) lowest, Attitude (62) second -> assigned_modules = [3, 1, 2].
          Module 4 is completely omitted.
        """
        scores = {
            "attitude": 62.0,
            "subjective_norm": 81.0,
            "pbc": 58.0,
            "behavioral_intention": 75.0,
        }
        result = determine_module_assignments(scores, threshold=70.0)

        self.assertEqual(result["assigned_modules"], [3, 1, 2])
        self.assertEqual(result["required_module_ids"], [3, 1, 2])
        self.assertEqual(result["optional_module_ids"], [])
        self.assertEqual(result["low_constructs"], ["pbc", "attitude"])
        self.assertIn("subjective_norm", result["high_constructs"])
        self.assertFalse(result["all_constructs_high"])
        self.assertNotIn(4, result["assigned_modules"])

    def test_only_attitude_low(self):
        """Attitude LOW (65 < 70) -> assign Module 1 and Module 2 only."""
        scores = {
            "attitude": 65.0,
            "subjective_norm": 85.0,
            "pbc": 75.0,
            "behavioral_intention": 80.0,
        }
        result = determine_module_assignments(scores, threshold=70.0)

        self.assertEqual(result["assigned_modules"], [1, 2])
        self.assertEqual(result["required_module_ids"], [1, 2])
        self.assertEqual(result["low_constructs"], ["attitude"])
        self.assertNotIn(3, result["assigned_modules"])
        self.assertNotIn(4, result["assigned_modules"])
        self.assertFalse(result["all_constructs_high"])

    def test_only_pbc_low(self):
        """PBC LOW (55 < 70) -> assign Module 3 only."""
        scores = {
            "attitude": 78.0,
            "subjective_norm": 82.0,
            "pbc": 55.0,
            "behavioral_intention": 75.0,
        }
        result = determine_module_assignments(scores, threshold=70.0)

        self.assertEqual(result["assigned_modules"], [3])
        self.assertEqual(result["required_module_ids"], [3])
        self.assertEqual(result["low_constructs"], ["pbc"])
        self.assertNotIn(1, result["assigned_modules"])
        self.assertNotIn(2, result["assigned_modules"])
        self.assertNotIn(4, result["assigned_modules"])

    def test_only_sn_low(self):
        """Subjective Norms LOW (60 < 70) -> assign Module 4 only."""
        scores = {
            "attitude": 72.0,
            "subjective_norm": 60.0,
            "pbc": 75.0,
            "behavioral_intention": 70.0,
        }
        result = determine_module_assignments(scores, threshold=70.0)

        self.assertEqual(result["assigned_modules"], [4])
        self.assertEqual(result["required_module_ids"], [4])
        self.assertEqual(result["low_constructs"], ["subjective_norm"])
        self.assertNotIn(1, result["assigned_modules"])
        self.assertNotIn(2, result["assigned_modules"])
        self.assertNotIn(3, result["assigned_modules"])

    def test_all_constructs_high_congratulations(self):
        """
        All constructs score 70–100:
          - No modules assigned ([]).
          - all_constructs_high = True.
          - Exact congratulations message returned.
        """
        scores = {
            "attitude": 75.0,
            "subjective_norm": 85.0,
            "pbc": 72.0,
            "behavioral_intention": 80.0,
        }
        result = determine_module_assignments(scores, threshold=70.0)

        self.assertEqual(result["assigned_modules"], [])
        self.assertEqual(result["required_module_ids"], [])
        self.assertEqual(result["low_constructs"], [])
        self.assertTrue(result["all_constructs_high"])
        self.assertIn("Congratulations! Your assessment indicates good readiness across all TPB constructs", result["recommendation_reason"])
        self.assertIn("No personalized learning interventions are required at this time", result["recommendation_reason"])
        self.assertEqual(len(result["modules_detail"]), 0)

    def test_scores_exactly_at_threshold_is_high(self):
        """
        Scores exactly at 70.0 are classified as HIGH (>= 70) and do NOT get assigned.
        """
        scores = {
            "attitude": 70.0,
            "subjective_norm": 70.0,
            "pbc": 70.0,
            "behavioral_intention": 70.0,
        }
        result = determine_module_assignments(scores, threshold=70.0)

        self.assertEqual(result["assigned_modules"], [])
        self.assertTrue(result["all_constructs_high"])

    def test_three_constructs_low_order_by_lowest_first(self):
        """
        SN (45) lowest, PBC (52) second, Attitude (65) third:
        Order -> SN (4), PBC (3), Attitude (1, 2) -> [4, 3, 1, 2].
        """
        scores = {
            "attitude": 65.0,
            "subjective_norm": 45.0,
            "pbc": 52.0,
            "behavioral_intention": 70.0,
        }
        result = determine_module_assignments(scores, threshold=70.0)

        self.assertEqual(result["assigned_modules"], [4, 3, 1, 2])
        self.assertEqual(result["low_constructs"], ["subjective_norm", "pbc", "attitude"])

    def test_missing_scores_fallback(self):
        """Missing or None scores fall back to standard sequence."""
        empty_result = determine_module_assignments({})
        self.assertEqual(empty_result["assigned_modules"], [1, 2, 3, 4])
        self.assertTrue(empty_result["is_fallback"])

        none_result = determine_module_assignments({"attitude": None, "pbc": None})
        self.assertEqual(none_result["assigned_modules"], [1, 2, 3, 4])
        self.assertTrue(none_result["is_fallback"])


if __name__ == "__main__":
    unittest.main()
