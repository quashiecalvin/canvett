"""Server-side file-signature validation: a file must actually be a PDF/DOCX,
not merely carry the extension."""
import pytest
from services.parser import validate_resume_upload

PDF = b"%PDF-1.5\n..."
DOCX = b"PK\x03\x04" + b"\x00" * 20


class TestSignatureCheck:
    def test_real_pdf_accepted(self):
        assert validate_resume_upload("cv.pdf", PDF) == "cv.pdf"

    def test_fake_pdf_rejected(self):
        with pytest.raises(ValueError, match="not a valid PDF"):
            validate_resume_upload("cv.pdf", b"this is plain text, not a pdf")

    def test_real_docx_accepted(self):
        assert validate_resume_upload("cv.docx", DOCX) == "cv.docx"

    def test_fake_docx_rejected(self):
        with pytest.raises(ValueError, match="not a valid DOCX"):
            validate_resume_upload("cv.docx", b"<html>not a docx</html>")

    def test_renamed_exe_as_pdf_rejected(self):
        # A binary that isn't a PDF, renamed .pdf, is caught by the signature.
        with pytest.raises(ValueError, match="not a valid PDF"):
            validate_resume_upload("resume.pdf", b"MZ\x90\x00")  # PE/exe header
