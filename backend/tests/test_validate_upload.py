"""Unit tests for resume-upload validation — a security-relevant boundary
(file type, size, and path-traversal defence)."""
import pytest

from services.parser import MAX_RESUME_SIZE, validate_resume_upload


class TestValidateResumeUpload:
    def test_accepts_pdf(self):
        assert validate_resume_upload("cv.pdf", b"data") == "cv.pdf"

    def test_accepts_docx_case_insensitive(self):
        assert validate_resume_upload("Resume.DOCX", b"data") == "Resume.DOCX"

    def test_missing_filename_rejected(self):
        with pytest.raises(ValueError, match="filename is required"):
            validate_resume_upload(None, b"data")

    def test_forward_slash_path_rejected(self):
        with pytest.raises(ValueError, match="Path separators"):
            validate_resume_upload("../../etc/passwd.pdf", b"data")

    def test_backslash_path_rejected(self):
        with pytest.raises(ValueError, match="Path separators"):
            validate_resume_upload("..\\windows\\evil.pdf", b"data")

    def test_unsupported_extension_rejected(self):
        with pytest.raises(ValueError, match="Unsupported file type"):
            validate_resume_upload("malware.exe", b"data")

    def test_oversize_rejected(self):
        big = b"x" * (MAX_RESUME_SIZE + 1)
        with pytest.raises(ValueError, match="5 MB or smaller"):
            validate_resume_upload("cv.pdf", big)

    def test_at_size_limit_allowed(self):
        at_limit = b"x" * MAX_RESUME_SIZE
        assert validate_resume_upload("cv.pdf", at_limit) == "cv.pdf"
