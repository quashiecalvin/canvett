SECTION_KEYWORDS = {
    "education": ["education", "academic background", "qualifications"],
    "experience": ["experience", "work experience", "employment", "work history", "professional experience"],
    "skills": ["skills", "technical skills", "competencies"],
    "projects": ["projects", "personal projects", "achievements"],
}


def _match_heading(line: str):
    cleaned = line.strip().lower().rstrip(":")
    if len(cleaned) > 40:
        return None
    for section, keywords in SECTION_KEYWORDS.items():
        for kw in keywords:
            if cleaned == kw or cleaned.startswith(kw):
                return section
    return None


def segment_resume(resume_text: str) -> dict:
    sections = {}
    current = None
    buffer = []

    for line in resume_text.split("\n"):
        heading = _match_heading(line)
        if heading:
            if current and buffer:
                sections[current] = "\n".join(buffer).strip()
            current = heading
            buffer = []
        elif current:
            buffer.append(line)

    if current and buffer:
        sections[current] = "\n".join(buffer).strip()

    return sections
