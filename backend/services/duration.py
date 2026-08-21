import re
from datetime import datetime

MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dec": 12,
    "january": 1, "february": 2, "march": 3, "april": 4, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
}

_MONTH_NAMES = "|".join(sorted(MONTHS, key=len, reverse=True))

# Matches date ranges such as:
#   "Jan 2023 - Mar 2025"      (year on both sides)
#   "January 2023 to Present"  (open-ended range)
#   "November - December 2025" (shared year: only stated once, at the end)
# The separator may be a hyphen, en-dash, em-dash or the word "to".
# The start year is optional; when it is missing it is borrowed from the end.
# Both sides must be a recognised month name, so prose either side of a
# separator ("Analyst - Accra 2024") is not mistaken for a date.
DATE_RANGE = re.compile(
    rf"\b({_MONTH_NAMES})\.?\s*(\d{{4}})?\s*(?:[-–—]|\bto\b)\s*"
    rf"(?:({_MONTH_NAMES})\.?\s+(\d{{4}})|(present|current))\b",
    re.IGNORECASE,
)


def _parse_month_year(month_str, year):
    month = MONTHS.get(month_str.strip().lower())
    if month is None:
        return None
    return datetime(int(year), month, 1)


def _spans(experience_text: str):
    """Yield a (start, end) datetime for every date range in the text."""
    for match in DATE_RANGE.finditer(experience_text):
        start_month_str, start_year, end_month_str, end_year, open_ended = match.groups()

        if open_ended:
            # An open-ended range needs an explicit start year to be meaningful.
            if not start_year:
                continue
            start = _parse_month_year(start_month_str, start_year)
            end = datetime.now()
        else:
            end = _parse_month_year(end_month_str, end_year)
            if end is None:
                continue
            # When the start year is omitted it is shared with the end, taking
            # the previous year if the range spans New Year ("December - January 2026").
            start = _parse_month_year(start_month_str, start_year or end_year)
            if start is not None and not start_year and start > end:
                start = start.replace(year=start.year - 1)

        if start is None or end <= start:
            continue

        yield start, end


def _merge(spans):
    """Merge overlapping spans so concurrent roles are not counted twice."""
    merged = []
    for start, end in sorted(spans):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged


def extract_total_years(experience_text: str):
    if not experience_text:
        return None

    spans = _merge(_spans(experience_text))
    if not spans:
        return None

    total_months = sum(
        (end.year - start.year) * 12 + (end.month - start.month)
        for start, end in spans
    )

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
