import re
from datetime import datetime

MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dec": 12,
    "january": 1, "february": 2, "march": 3, "april": 4, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
}

# Reasonable bounds so stray 4-digit numbers (e.g. "2500 applicants") are not
# mistaken for years.
_MIN_YEAR = 1950
_MAX_YEAR = datetime.now().year + 1

# 1) Month-name ranges: "Jan 2023 - Mar 2025", "January 2023 to Present",
#    "November - December 2025" (shared year stated once at the end).
MONTH_RANGE = re.compile(
    r"([a-z]+)\s*(\d{4})?\s*(?:-|–|—|to)\s*(?:([a-z]+)\s+(\d{4})|(present|current|now))",
    re.IGNORECASE,
)

# 2) Numeric month/year ranges: "03/2021 - 06/2023", "3-2021 to present".
NUMERIC_RANGE = re.compile(
    r"(\d{1,2})[/\-.](\d{4})\s*(?:-|–|—|to)\s*(?:(\d{1,2})[/\-.](\d{4})|(present|current|now))",
    re.IGNORECASE,
)

# 3) Year-only ranges: "2021 - 2024", "2021 to Present". Bare years, no month.
YEAR_RANGE = re.compile(
    r"(?<!\d)(\d{4})\s*(?:-|–|—|to)\s*(?:(\d{4})|(present|current|now))(?!\d)",
    re.IGNORECASE,
)


def _parse_month_year(month_str, year):
    month = MONTHS.get(month_str.strip().lower())
    if month is None:
        return None
    return datetime(int(year), month, 1)


def _valid_year(y):
    return _MIN_YEAR <= y <= _MAX_YEAR


def _collect(pattern, text, handler):
    """Run one pattern and return a list of (span_start, span_end, months)."""
    out = []
    for m in pattern.finditer(text):
        months = handler(m)
        if months and months > 0:
            out.append((m.start(), m.end(), months))
    return out


def _months_between(start, end):
    return (end.year - start.year) * 12 + (end.month - start.month)


def extract_total_years(experience_text: str):
    """Sum the durations of every date range found in the text.

    Recognises month-name ranges, numeric month/year ranges and bare year
    ranges, each optionally ending in "present". Overlapping matches from
    different patterns are counted once. Returns years (rounded to 0.1) or None
    when no parseable range is found.
    """
    if not experience_text:
        return None

    now = datetime.now()

    def month_handler(m):
        s_mon, s_year, e_mon, e_year, open_ended = m.groups()
        if open_ended:
            if not s_year or not _valid_year(int(s_year)):
                return None
            start = _parse_month_year(s_mon, s_year)
            end = now
        else:
            eff_start_year = s_year or e_year
            if not eff_start_year:
                return None
            start = _parse_month_year(s_mon, eff_start_year)
            end = _parse_month_year(e_mon, e_year)
        if start is None or end is None:
            return None
        return _months_between(start, end)

    def numeric_handler(m):
        s_mon, s_year, e_mon, e_year, open_ended = m.groups()
        try:
            sm, sy = int(s_mon), int(s_year)
        except (TypeError, ValueError):
            return None
        if not (1 <= sm <= 12) or not _valid_year(sy):
            return None
        start = datetime(sy, sm, 1)
        if open_ended:
            end = now
        else:
            em, ey = int(e_mon), int(e_year)
            if not (1 <= em <= 12) or not _valid_year(ey):
                return None
            end = datetime(ey, em, 1)
        return _months_between(start, end)

    def year_handler(m):
        s_year, e_year, open_ended = m.groups()
        sy = int(s_year)
        if not _valid_year(sy):
            return None
        ey = now.year if open_ended else int(e_year)
        if not open_ended and not _valid_year(ey):
            return None
        return (ey - sy) * 12

    # Higher-precision patterns first so their spans win on overlap.
    matches = (
        _collect(MONTH_RANGE, experience_text, month_handler)
        + _collect(NUMERIC_RANGE, experience_text, numeric_handler)
        + _collect(YEAR_RANGE, experience_text, year_handler)
    )
    if not matches:
        return None

    # Greedily accept matches that do not overlap an already-accepted span, so a
    # single range picked up by two patterns is only counted once.
    matches.sort(key=lambda t: (t[0], -(t[1] - t[0])))
    accepted_spans = []
    total_months = 0
    for start, end, months in matches:
        if any(start < a_end and end > a_start for a_start, a_end in accepted_spans):
            continue
        accepted_spans.append((start, end))
        total_months += months

    if total_months <= 0:
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
