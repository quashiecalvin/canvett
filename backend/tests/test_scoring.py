"""Unit tests for the scoring engine.

The semantic (embedding) path is deterministic under the test stub, which
reports zero similarity, so these tests exercise the exact-match skill path,
the weighting maths, and the calibration function directly.
"""
import pytest

from services.nlp_engine import calibrate
from services.scoring import DEFAULTS, match_skills, score_candidate


class TestCalibrate:
    def test_below_floor_is_zero(self):
        assert calibrate(0.1, floor=0.2, ceiling=0.65) == 0.0

    def test_above_ceiling_is_hundred(self):
        assert calibrate(0.9, floor=0.2, ceiling=0.65) == 100.0

    def test_midpoint_scales_linearly(self):
        # Halfway between floor and ceiling -> 50%.
        mid = (0.2 + 0.65) / 2
        assert calibrate(mid, floor=0.2, ceiling=0.65) == pytest.approx(50.0, abs=0.01)

    def test_at_floor_is_zero(self):
        assert calibrate(0.2) == 0.0


class TestMatchSkills:
    def test_exact_match_case_insensitive(self):
        result = match_skills("Experienced in python and fastapi", ["Python", "FastAPI"])
        assert set(result["matched_skills"]) == {"Python", "FastAPI"}
        assert result["unmatched_skills"] == []
        assert result["skills_score"] == 100.0

    def test_missing_skill_is_unmatched(self):
        result = match_skills("I know Python", ["Python", "Rust"])
        assert result["matched_skills"] == ["Python"]
        assert result["unmatched_skills"] == ["Rust"]
        assert result["skills_score"] == 50.0

    def test_no_required_skills_scores_zero(self):
        result = match_skills("anything", [])
        assert result["skills_score"] == 0
        assert result["matched_skills"] == []


class TestScoreCandidate:
    def test_result_shape_and_ranges(self):
        result = score_candidate(
            resume_text="Jane Doe\nSkills\nPython, FastAPI",
            job_description="Backend role",
            required_skills=["Python", "FastAPI", "Go"],
            experience_requirement="2+ years",
            education_requirement="BSc",
        )
        for key in (
            "overall_score", "skills_score", "experience_score",
            "education_score", "matched_skills", "unmatched_skills",
            "duration_verified",
        ):
            assert key in result
        assert 0 <= result["overall_score"] <= 100
        assert 0 <= result["skills_score"] <= 100
        assert isinstance(result["duration_verified"], bool)

    def test_weighted_overall_matches_formula(self):
        # Two of three skills present -> 66.7 skills. With the zero-similarity
        # stub, experience and education relevance are 0, so overall is purely
        # the weighted skills contribution.
        result = score_candidate(
            resume_text="Skills\nPython FastAPI",
            job_description="Backend",
            required_skills=["Python", "FastAPI", "Go"],
            experience_requirement="2+ years",
        )
        assert result["skills_score"] == pytest.approx(66.7, abs=0.1)
        assert result["experience_score"] == 0
        assert result["education_score"] == 0
        expected = round(result["skills_score"] * DEFAULTS["skills_weight"], 1)
        assert result["overall_score"] == pytest.approx(expected, abs=0.1)

    def test_duration_unverified_when_no_dates(self):
        result = score_candidate(
            resume_text="Skills\nPython",
            job_description="Backend",
            required_skills=["Python"],
            experience_requirement="2+ years",
        )
        # No parseable dates in the resume -> duration cannot be verified.
        assert result["duration_verified"] is False
