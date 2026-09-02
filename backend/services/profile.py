"""Best-effort extraction of a candidate's location and years of experience
from parsed resume text. Heuristic — reliable on the standard template,
approximate on arbitrary CVs. Returns None when nothing sensible is found.
"""
import re
from services.segmenter import segment_resume
from services.duration import extract_total_years

_SKIP = ("@", "http", "www.")


def extract_years(resume_text):
    try:
        sections = segment_resume(resume_text or "")
        exp = ""
        if isinstance(sections, dict):
            for k in ("experience", "work_experience", "employment", "work"):
                if sections.get(k):
                    exp = sections[k]
                    break
        years = extract_total_years(exp)
        return round(float(years), 1) if years else None
    except Exception:
        return None


def extract_location(resume_text):
    if not resume_text:
        return None
    for raw in resume_text.splitlines()[:8]:
        line = raw.split("|")[0].strip()
        low = line.lower()
        if not line or line.isupper() or any(t in low for t in _SKIP):
            continue
        parts = [p.strip() for p in line.split(",") if p.strip()]
        if len(parts) >= 2:
            city = re.sub(r"^[0-9\s.\-]+", "", parts[-2]).strip()
            country = re.sub(r"[^A-Za-z .]", "", parts[-1]).strip()
            if city and country and 2 <= len(country) <= 25 and len(city) <= 30 and any(ch.isalpha() for ch in city):
                return f"{city}, {country}"
    return None
