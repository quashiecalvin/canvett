"""Regression tests for specific bugs that were found and fixed.

These lock in the fixes so the bugs can never silently return — the kind of
test that is most valuable to be able to point at in a defence.
"""
from services.duration import extract_total_years


class TestDateParsingRegressions:
    def test_en_dash_shared_year(self):
        # BUG: Word auto-corrects a hyphen to an en-dash, and a range that
        # states the year only once ("November - December 2025") left the start
        # month with no year, so the parser read nothing. Fix: borrow the end
        # year for the start, and accept the en-dash separator.
        assert extract_total_years("November – December 2025") == 0.1

    def test_em_dash_accepted(self):
        assert extract_total_years("Jan 2020 — Jan 2021") == 1.0

    def test_plain_hyphen_still_works(self):
        assert extract_total_years("Jan 2020 - Jan 2021") == 1.0


class TestExperienceInflationRegression:
    def test_example_date_outside_experience_not_counted(self, client=None):
        # BUG: an early CV template placed an example date range under a
        # non-experience area; the scorer counted it as real experience.
        # extract_years only reads the Experience section, so a date sitting
        # under, say, a Skills heading must NOT inflate the total.
        from services.profile import extract_years
        resume = "\n".join([
            "Jane Doe",
            "Skills",
            "Python, SQL   (used Jan 2010 - Jan 2020)",  # stray date, not real experience
            "Education",
            "BSc, Jan 2018 - Jan 2021",
        ])
        # No Experience section at all -> no counted experience.
        assert extract_years(resume) is None


class TestDuplicateApplicationRegression:
    def test_cannot_apply_twice(self, client, seeker, job):
        payload = {"summary": "Python", "skills": ["Python"], "experience": [], "education": []}
        assert client.post(f"/applications/form/{job['id']}", json=payload, headers=seeker["auth"]).status_code == 200
        assert client.post(f"/applications/form/{job['id']}", json=payload, headers=seeker["auth"]).status_code == 400
