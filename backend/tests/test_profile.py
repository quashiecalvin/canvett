"""Unit tests for the best-effort profile extraction helpers."""
from services.profile import extract_location, extract_years


class TestExtractLocation:
    def test_city_country_line(self):
        resume = "Jane Doe\njane@example.com\nAccra, Ghana\nExperience"
        assert extract_location(resume) == "Accra, Ghana"

    def test_skips_email_and_url_lines(self):
        resume = "Jane Doe\njane@example.com | www.jane.dev\nKumasi, Ghana"
        assert extract_location(resume) == "Kumasi, Ghana"

    def test_none_when_no_location(self):
        assert extract_location("Jane Doe\nSoftware Engineer\nPython developer") is None

    def test_none_for_empty(self):
        assert extract_location("") is None
        assert extract_location(None) is None


class TestExtractYears:
    def test_reads_experience_section_dates(self):
        resume = "\n".join([
            "Jane Doe",
            "Accra, Ghana",
            "Experience",
            "Software Engineer at Acme",
            "Jan 2020 - Jan 2022",
        ])
        assert extract_years(resume) == 2.0

    def test_none_when_no_experience_section(self):
        assert extract_years("Jane Doe\nSkills\nPython") is None

    def test_none_for_empty(self):
        assert extract_years("") is None
        assert extract_years(None) is None
