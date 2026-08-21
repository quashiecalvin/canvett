import io

import pytest
from docx import Document

from services.parser import extract_name, parse_resume, parse_resume_bytes


def _docx_bytes(paragraphs):
    document = Document()
    for text in paragraphs:
        document.add_paragraph(text)
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


class TestParseResume:
    def test_unsupported_extension_raises(self):
        with pytest.raises(ValueError, match="Unsupported file type"):
            parse_resume("resume.txt")

    def test_docx_file(self, tmp_path):
        path = tmp_path / "resume.docx"
        path.write_bytes(_docx_bytes(["Jane Doe", "Software Engineer"]))
        assert parse_resume(str(path)) == "Jane Doe\nSoftware Engineer"


class TestParseResumeBytes:
    def test_docx_bytes(self):
        contents = _docx_bytes(["Jane Doe", "Software Engineer"])
        assert parse_resume_bytes("resume.DOCX", contents) == "Jane Doe\nSoftware Engineer"

    def test_unsupported_extension_raises(self):
        with pytest.raises(ValueError, match="Unsupported file type"):
            parse_resume_bytes("resume.rtf", b"data")


class TestExtractName:
    def test_first_non_empty_line_title_cased(self):
        assert extract_name("\n  \njane doe\nEngineer") == "Jane Doe"

    def test_already_capitalised(self):
        assert extract_name("Jane Doe\nEngineer") == "Jane Doe"

    def test_empty_text_returns_placeholder(self):
        assert extract_name("") == "Unknown Candidate"
        assert extract_name("\n\n   \n") == "Unknown Candidate"
