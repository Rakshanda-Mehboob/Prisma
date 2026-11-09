"""
tests/test_adaptive_assignment.py — Unit Tests for Adaptive Module Assignment Logic.

Validates the Theory of Planned Behavior (TPB) Construct-to-Module Mapping:
  - Attitude LOW                   -> Modules 1 & 2
  - Perceived Behavioral Control LOW -> Module 3
  - Subjective Norms LOW           -> Module 4
  - Multiple constructs LOW        -> Ordered by lowest score first
  - None LOW / Intention only LOW  -> Modules 1, 2, 3, 4 (reinforcement path)
  - Missing / Unreadable scores    -> Modules 1, 2, 3, 4 (safe fallback)
  - Scores exactly at threshold    -> Evaluated as NOT low (>= 4.0)
"""

import unittest
import sys
import os

# Ensure server module is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from interventions.adaptive_assignment import (
    DEFAULT_ADAPTIVE_THRESHOLD,
    calculate_mean_item_scores,
    determine_module_assignments,
    percentage_to_likert_mean,
)


class TestAdaptiveAssignment(unittest.TestCase):
    def test_default_threshold_value(self):
        """Verify single configurable constant is 4.0 on the 1-5 scale."""
        self.assertEqual(DEFAULT_ADAPTIVE_THRESHOLD, 4.0)

    def test_score_conversion(self):
        """Verify conversion of percentage to 1-5 Likert mean item score."""
        self.assertEqual(percentage_to_likert_mean(100.0), 5.0)
        self.assertEqual(percentage_to_likert_mean(75.0), 4.0)
        self.assertEqual(percentage_to_likert_mean(50.0), 3.0)
        self.assertEqual(percentage_to_likert_mean(0.0), 1.0)
        self.assertIsNone(percentage_to_likert_mean(None))

    def test_only_attitude_low(self):
        """Attitude LOW (< 4.0) -> assign Module 1 and Module 2 as REQUIRED."""
        scores = {
            "attitude": 3.2,
            "subjective_norm": 4.5,
            "pbc": 4.2,
            "behavioral_intention": 4.0,
        }
        result = determine_module_assignments(scores, threshold=4.0)

        self.assertEqual(result["assigned_modules"], [1, 2])
        self.assertEqual(result["required_module_ids"], [1, 2])
        self.assertEqual(set(result["optional_module_ids"]), {3, 4})
        self.assertEqual(result["low_constructs"], ["attitude"])
        self.assertFalse(result["is_reinforcement"])
        self.assertFalse(result["is_fallback"])

    def test_only_pbc_low(self):
        """PBC LOW (< 4.0) -> assign Module 3 as REQUIRED."""
        scores = {
            "attitude": 4.2,
            "subjective_norm": 4.5,
            "pbc": 2.8,
            "behavioral_intention": 4.0,
        }
        result = determine_module_assignments(scores, threshold=4.0)

        self.assertEqual(result["assigned_modules"], [3])
        self.assertEqual(result["required_module_ids"], [3])
        self.assertEqual(set(result["optional_module_ids"]), {1, 2, 4})
        self.assertEqual(result["low_constructs"], ["pbc"])
        self.assertFalse(result["is_reinforcement"])

    def test_only_sn_low(self):
        """Subjective Norms LOW (< 4.0) -> assign Module 4 as REQUIRED."""
        scores = {
            "attitude": 4.2,
            "subjective_norm": 2.5,
            "pbc": 4.2,
            "behavioral_intention": 4.0,
        }
        result = determine_module_assignments(scores, threshold=4.0)

        self.assertEqual(result["assigned_modules"], [4])
        self.assertEqual(result["required_module_ids"], [4])
        self.assertEqual(set(result["optional_module_ids"]), {1, 2, 3})
        self.assertEqual(result["low_constructs"], ["subjective_norm"])
        self.assertFalse(result["is_reinforcement"])

    def test_two_constructs_low_pbc_lowest(self):
        """PBC (2.2) lowest, Attitude (3.5) second -> [3, 1, 2]."""
        scores = {
            "attitude": 3.5,
            "subjective_norm": 4.5,
            "pbc": 2.2,
            "behavioral_intention": 4.0,
        }
        result = determine_module_assignments(scores, threshold=4.0)

        self.assertEqual(result["assigned_modules"], [3, 1, 2])
        self.assertEqual(result["required_module_ids"], [3, 1, 2])
        self.assertEqual(result["optional_module_ids"], [4])
        self.assertEqual(result["low_constructs"], ["pbc", "attitude"])

    def test_two_constructs_low_attitude_lowest(self):
        """Attitude (2.0) lowest, PBC (3.0) second -> [1, 2, 3]."""
        scores = {
            "attitude": 2.0,
            "subjective_norm": 4.5,
            "pbc": 3.0,
            "behavioral_intention": 4.0,
        }
        result = determine_module_assignments(scores, threshold=4.0)

        self.assertEqual(result["assigned_modules"], [1, 2, 3])
        self.assertEqual(result["required_module_ids"], [1, 2, 3])
        self.assertEqual(result["optional_module_ids"], [4])
        self.assertEqual(result["low_constructs"], ["attitude", "pbc"])

    def test_three_constructs_low(self):
        """SN (1.8) lowest, PBC (2.5) second, Attitude (3.4) third -> [4, 3, 1, 2]."""
        scores = {
            "attitude": 3.4,
            "subjective_norm": 1.8,
            "pbc": 2.5,
            "behavioral_intention": 3.0,
        }
        result = determine_module_assignments(scores, threshold=4.0)

        self.assertEqual(result["assigned_modules"], [4, 3, 1, 2])
        self.assertEqual(result["required_module_ids"], [4, 3, 1, 2])
        self.assertEqual(result["optional_module_ids"], [])
        self.assertEqual(result["low_constructs"], ["subjective_norm", "pbc", "attitude"])

    def test_none_low_reinforcement_path(self):
        """All constructs >= 4.0 -> assign all four [1, 2, 3, 4] as reinforcement path."""
        scores = {
            "attitude": 4.5,
            "subjective_norm": 4.2,
            "pbc": 4.8,
            "behavioral_intention": 4.5,
        }
        result = determine_module_assignments(scores, threshold=4.0)

        self.assertEqual(result["assigned_modules"], [1, 2, 3, 4])
        self.assertEqual(result["required_module_ids"], [1, 2, 3, 4])
        self.assertEqual(result["optional_module_ids"], [])
        self.assertTrue(result["is_reinforcement"])
        self.assertEqual(result["low_constructs"], [])

    def test_intention_low_predictors_fine(self):
        """
        Intention is low (e.g. 2.0) but Attitude, SN, and PBC are fine (>= 4.0).
        Rule: Treat as no construct LOW (assign all four modules 1, 2, 3, 4).
        """
        scores = {
            "attitude": 4.2,
            "subjective_norm": 4.5,
            "pbc": 4.4,
            "behavioral_intention": 2.0,
        }
        result = determine_module_assignments(scores, threshold=4.0)

        self.assertEqual(result["assigned_modules"], [1, 2, 3, 4])
        self.assertEqual(result["required_module_ids"], [1, 2, 3, 4])
        self.assertTrue(result["is_reinforcement"])
        self.assertEqual(result["low_constructs"], [])

    def test_missing_and_unreadable_scores_fallback(self):
        """Missing or None scores -> fall back to full sequence [1, 2, 3, 4] without crashing."""
        empty_result = determine_module_assignments({})
        self.assertEqual(empty_result["assigned_modules"], [1, 2, 3, 4])
        self.assertTrue(empty_result["is_fallback"])
        self.assertGreater(len(empty_result["recommendation_reason"]), 0)

        none_result = determine_module_assignments({"attitude": None, "pbc": None})
        self.assertEqual(none_result["assigned_modules"], [1, 2, 3, 4])
        self.assertTrue(none_result["is_fallback"])

    def test_scores_exactly_at_threshold(self):
        """
        Scores exactly at 4.0:
        Rule: A construct is 'LOW' if its mean item score is strictly BELOW the threshold.
        Therefore, exactly 4.0 is NOT low -> treated as reinforcement path [1, 2, 3, 4].
        """
        scores = {
            "attitude": 4.0,
            "subjective_norm": 4.0,
            "pbc": 4.0,
            "behavioral_intention": 4.0,
        }
        result = determine_module_assignments(scores, threshold=4.0)

        self.assertEqual(result["assigned_modules"], [1, 2, 3, 4])
        self.assertEqual(result["low_constructs"], [])
        self.assertTrue(result["is_reinforcement"])

    def test_mean_item_scores_from_raw_responses(self):
        """Verify mean item score computation from 0-3 item responses."""
        responses = [
            {"construct": "Attitude", "selected_score": 3},  # 3/3 -> 5.0
            {"construct": "Attitude", "selected_score": 3},  # 3/3 -> 5.0
            {"construct": "PBC", "selected_score": 0},       # 0/3 -> 1.0
            {"construct": "PBC", "selected_score": 1},       # 1/3 -> 2.333
            {"construct": "SubjectiveNorm", "selected_score": 2}, # 2/3 -> 3.667
            {"construct": "SubjectiveNorm", "selected_score": 2}, # 2/3 -> 3.667
        ]
        means = calculate_mean_item_scores(raw_responses=responses)
        self.assertEqual(means["attitude"], 5.0)
        self.assertEqual(round(means["pbc"], 1), 1.7)
        self.assertEqual(round(means["subjective_norm"], 1), 3.7)


if __name__ == "__main__":
    unittest.main()
