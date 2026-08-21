import io
import logging

from pypdf import PdfReader
from docx import Document

logger = logging.getLogger(__name__)

SUPPORTED_MESSAGE = "Unsupported file type. Only PDF and DOCX are allowed."


class ResumeParseError(Exception):
    """A resume could not be read. The message is safe to show to the user."""


class UnsupportedFileType(ResumeParseError):
    pass


def parse_pdf(source) -> str:
    try:
        reader = PdfReader(source)
        text = ""
        for page in reader.pages:
            text += (page.extract_text(extraction_mode="layout") or "") + "\n"
    except Exception as err:
        logger.exception("Failed to read PDF resume")
        raise ResumeParseError(
            "We could not read that PDF. It may be corrupted or password protected."
        ) from err
    return text.strip()


def parse_docx(source) -> str:
    try:
        document = Document(source)
        text = ""
        for paragraph in document.paragraphs:
            text += paragraph.text + "\n"
    except Exception as err:
        logger.exception("Failed to read DOCX resume")
        raise ResumeParseError(
            "We could not read that DOCX file. It may be corrupted or not a real Word document."
        ) from err
    return text.strip()


def parse_resume(file_path: str) -> str:
    if file_path.lower().endswith(".pdf"):
        return parse_pdf(file_path)
    elif file_path.lower().endswith(".docx"):
        return parse_docx(file_path)
    else:
        raise UnsupportedFileType(SUPPORTED_MESSAGE)


def parse_resume_bytes(filename: str, contents: bytes) -> str:
    if not contents:
        raise ResumeParseError("That file is empty. Please upload a PDF or DOCX resume.")

    buffer = io.BytesIO(contents)
    if (filename or "").lower().endswith(".pdf"):
        return parse_pdf(buffer)
    elif (filename or "").lower().endswith(".docx"):
        return parse_docx(buffer)
    else:
        raise UnsupportedFileType(SUPPORTED_MESSAGE)


def extract_name(resume_text: str) -> str:
    for line in resume_text.split("\n"):
        cleaned = line.strip()
        if cleaned:
            return cleaned.title()
    return "Unknown Candidate"
