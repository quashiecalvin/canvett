from datetime import datetime

import pytest

from services.duration import extract_required_years, extract_total_years


class TestExtractTotalYears:
    def test_none_for_empty_input(self):
        assert extract_total_years("") is None
        assert extract_total_years(None) is None

    def test_none_when_no_date_ranges(self):
        assert extract_total_years("Worked on many projects using Python.") is None

    def test_closed_range_with_years_on_both_sides(self):
        assert extract_total_years("Jan 2020 - Jan 2022") == 2.0

    def test_full_month_names(self):
        assert extract_total_years("January 2020 to July 2021") == 1.5

    def test_shared_year_range(self):
        # Start year omitted: borrowed from the end year.
        assert extract_total_years("November - December 2025") == 0.1

    def test_open_ended_range_uses_current_date(self):
        now = datetime.now()
        start = datetime(now.year - 2, now.month, 1)
        text = f"{start.strftime('%b')} {start.year} - Present"
        assert extract_total_years(text) == 2.0

    def test_open_ended_range_without_start_year_is_ignored(self):
        assert extract_total_years("November - Present") is None

    def test_multiple_ranges_are_summed(self):
        text = "Jan 2020 - Jan 2021\nsome role\nMar 2021 - Mar 2022"
        assert extract_total_years(text) == 2.0

    def test_unknown_month_is_ignored(self):
        assert extract_total_years("Foo 2020 - Bar 2022") is None

    def test_zero_or_negative_ranges_are_ignored(self):
        assert extract_total_years("Jan 2022 - Jan 2020") is None
        assert extract_total_years("Jan 2022 - Jan 2022") is None

    def test_to_separator_and_case_insensitivity(self):
        assert extract_total_years("jan 2019 TO jan 2020") == 1.0

    def test_en_dash_separator(self):
        assert extract_total_years("Jan 2019 \u2013 Jan 2020") == 1.0


class TestExtractRequiredYears:
    def test_none_for_empty_input(self):
        assert extract_required_years("") is None
        assert extract_required_years(None) is None

    def test_plain_years(self):
        assert extract_required_years("2 years of experience") == 2.0

    def test_plus_years(self):
        assert extract_required_years("3+ years with Python") == 3.0

    def test_decimal_years(self):
        assert extract_required_years("1.5 years in DevOps") == 1.5

    def test_singular_year(self):
        assert extract_required_years("1 year required") == 1.0

    def test_months_converted_to_years(self):
        assert extract_required_years("6 months of experience") == 0.5

    def test_none_when_no_duration(self):
        assert extract_required_years("Experience with React") is None
