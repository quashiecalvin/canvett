import re
from datetime import datetime

MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dec": 12,
    "january": 1, "february": 2, "march": 3, "april": 4, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
}

# Matches date ranges such as:
#   "Jan 2023 - Mar 2025"      (year on both sides)
#   "January 2023 to Present"  (open-ended range)
#   "November - December 2025" (shared year: only stated once, at the end)
# The separator may be a hyphen, en-dash, em-dash or the word "to".
# The start year is optional; when it is missing it is borrowed from the end.
DATE_RANGE = re.compile(
    r"([a-z]+)\s*(\d{4})?\s*(?:-|–|—|to)\s*(?:([a-z]+)\s+(\d{4})|(present|current))",
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
        start_month_str, start_year, end_month_str, end_year, open_ended = match.groups()

        if open_ended:
            end = datetime.now()
            # An open-ended range needs an explicit start year to be meaningful.
            if not start_year:
                continue
            start = _parse_month_year(start_month_str, start_year)
        else:
            # Closed range. If the start year is omitted it is shared with the end.
            effective_start_year = start_year or end_year
            start = _parse_month_year(start_month_str, effective_start_year)
            end = _parse_month_year(end_month_str, end_year)
            if end is None:
                continue

        if start is None:
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
