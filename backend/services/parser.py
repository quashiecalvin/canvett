import io
from pypdf import PdfReader
from docx import Document


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
