import os

import pytest

from services.duration import extract_total_years
from services.parser import parse_resume
from services.segmenter import segment_resume

TEMPLATE = os.path.join(
    os.path.dirname(__file__), "..", "..", "public", "Canvett_CV_Template.docx"
)


@pytest.fixture(scope="module")
def template_text():
    if not os.path.exists(TEMPLATE):
        pytest.skip("CV template not present")
    return parse_resume(TEMPLATE)


def test_template_sections_are_recognised(template_text):
    sections = segment_resume(template_text)
    assert sections.get("experience")
    assert sections.get("education")
    assert sections.get("skills")


def test_education_dates_are_not_counted_as_experience(template_text):
    sections = segment_resume(template_text)
    # The template's education block runs Sept 2017 - July 2021; only the two
    # employment entries may contribute to the experience total.
    assert "2017" not in sections["experience"]
    assert extract_total_years(sections["experience"]) < extract_total_years(template_text)
