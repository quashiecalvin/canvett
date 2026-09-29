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
            # A short heading line that contains the keyword anywhere counts, so
            # variants like "PROFESSIONAL & PROJECT EXPERIENCE", "CORE
            # COMPETENCIES" or "FEATURED DESIGN PROJECTS" are recognised, not only
            # headings that begin with the exact keyword.
            if kw in cleaned:
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
