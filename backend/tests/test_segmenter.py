from services.segmenter import _match_heading, segment_resume


class TestMatchHeading:
    def test_exact_keyword(self):
        assert _match_heading("Education") == "education"
        assert _match_heading("Skills") == "skills"

    def test_trailing_colon_stripped(self):
        assert _match_heading("Experience:") == "experience"

    def test_prefix_match(self):
        assert _match_heading("Work Experience at Acme") == "experience"
        assert _match_heading("Technical Skills") == "skills"

    def test_long_lines_rejected(self):
        long_line = "Experience " + "x" * 40
        assert _match_heading(long_line) is None

    def test_non_heading_returns_none(self):
        assert _match_heading("Built a web app in React") is None


class TestSegmentResume:
    def test_basic_segmentation(self):
        resume = "\n".join(
            [
                "Education",
                "BSc Computer Science",
                "Experience",
                "Software Engineer at Acme",
                "Skills",
                "Python, SQL",
            ]
        )
        sections = segment_resume(resume)
        assert sections["education"] == "BSc Computer Science"
        assert sections["experience"] == "Software Engineer at Acme"
        assert sections["skills"] == "Python, SQL"

    def test_content_before_first_heading_is_dropped(self):
        resume = "\n".join(["Jane Doe", "jane@example.com", "Skills", "Python"])
        sections = segment_resume(resume)
        assert sections == {"skills": "Python"}

    def test_multiline_section_content(self):
        resume = "\n".join(["Experience", "Role A", "Role B"])
        sections = segment_resume(resume)
        assert sections["experience"] == "Role A\nRole B"

    def test_empty_input(self):
        assert segment_resume("") == {}

    def test_heading_with_no_content_is_omitted(self):
        resume = "\n".join(["Skills", "Python", "Projects"])
        sections = segment_resume(resume)
        assert sections == {"skills": "Python"}
