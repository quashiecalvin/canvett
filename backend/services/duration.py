import re
from datetime import datetime

MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dec": 12,
    "january": 1, "february": 2, "march": 3, "april": 4, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
}

# Matches "Jan 2023 - Mar 2025", "January 2023 to Present", etc.
DATE_RANGE = re.compile(
    r"([a-z]+)\s+(\d{4})\s*(?:-|–|to)\s*([a-z]+\s+\d{4}|present|current)",
    re.IGNORECASE,
)


def _parse_month_year(month_str, year):
    month = MONTHS.get(month_str.strip().lower())
    if month is None:
        return None
    return datetime(int(year), month, 1)


def extract_total_years(experience_text: str):
    if not experience_text:
        return None

    total_months = 0
    found_any = False

    for match in DATE_RANGE.finditer(experience_text):
        start_month_str, start_year, end_part = match.groups()
        start = _parse_month_year(start_month_str, start_year)
        if start is None:
            continue

        end_part = end_part.strip().lower()
        if end_part in ("present", "current"):
            end = datetime.now()
        else:
            parts = end_part.split()
            if len(parts) != 2:
                continue
            end = _parse_month_year(parts[0], parts[1])
            if end is None:
                continue

        months = (end.year - start.year) * 12 + (end.month - start.month)
        if months > 0:
            total_months += months
            found_any = True

    if not found_any:
        return None

    return round(total_months / 12, 1)


def extract_required_years(requirement_text: str):
    if not requirement_text:
        return None
    # Matches "2 years", "2+ years", "1.5 years", "6 months"
    year_match = re.search(r"(\d+(?:\.\d+)?)\s*\+?\s*year", requirement_text, re.IGNORECASE)
    if year_match:
        return float(year_match.group(1))
    month_match = re.search(r"(\d+)\s*\+?\s*month", requirement_text, re.IGNORECASE)
    if month_match:
        return round(int(month_match.group(1)) / 12, 1)
    return None
