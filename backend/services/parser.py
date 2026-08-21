import io
import os

from pypdf import PdfReader
from docx import Document

ALLOWED_RESUME_EXTENSIONS = {".pdf", ".docx"}
MAX_RESUME_SIZE = 5 * 1024 * 1024


def validate_resume_upload(filename: str | None, contents: bytes) -> str:
    if not filename:
        raise ValueError("A PDF or DOCX filename is required.")

    sanitized_filename = os.path.basename(filename.replace("\\", "/"))
    if sanitized_filename != filename:
        raise ValueError("Path separators are not allowed in filenames.")

    extension = os.path.splitext(sanitized_filename)[1].lower()
    if extension not in ALLOWED_RESUME_EXTENSIONS:
        raise ValueError("Unsupported file type. Only PDF and DOCX are allowed.")

    if len(contents) > MAX_RESUME_SIZE:
        raise ValueError("Resume files must be 5 MB or smaller.")

    return sanitized_filename


def parse_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += (page.extract_text(extraction_mode="layout") or "") + "\n"
    return text.strip()


def parse_docx(file_path: str) -> str:
    document = Document(file_path)
    text = ""
    for paragraph in document.paragraphs:
        text += paragraph.text + "\n"
    return text.strip()


def parse_resume(file_path: str) -> str:
    if file_path.lower().endswith(".pdf"):
        return parse_pdf(file_path)
    elif file_path.lower().endswith(".docx"):
        return parse_docx(file_path)
    else:
        raise ValueError("Unsupported file type. Only PDF and DOCX are allowed.")


def parse_resume_bytes(filename: str, contents: bytes) -> str:
    buffer = io.BytesIO(contents)
    if filename.lower().endswith(".pdf"):
        return parse_pdf(buffer)
    elif filename.lower().endswith(".docx"):
        return parse_docx(buffer)
    else:
        raise ValueError("Unsupported file type. Only PDF and DOCX are allowed.")


def extract_name(resume_text: str) -> str:
    for line in resume_text.split("\n"):
        cleaned = line.strip()
        if cleaned:
            return cleaned.title()
    return "Unknown Candidate"
