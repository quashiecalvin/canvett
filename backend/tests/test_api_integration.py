"""Integration tests: real FastAPI app + PostgreSQL, driven through HTTP.

These exercise whole flows end to end — registration, job posting, the public
board, applying, saved jobs, ranking, and status propagation — the way the
frontend uses the API.
"""
import io

from docx import Document


def _docx_bytes(lines):
    doc = Document()
    for line in lines:
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


class TestAuthFlow:
    def test_register_returns_token_and_user(self, client):
        r = client.post("/auth/register", json={
            "email": "New@User.io", "password": "password123",
            "full_name": "New User", "role": "seeker",
        })
        assert r.status_code == 201
        body = r.json()
        assert body["token_type"] == "bearer"
        assert body["access_token"]
        assert body["user"]["email"] == "new@user.io"  # normalised to lowercase

    def test_login_success(self, client, seeker):
        r = client.post("/auth/login", json={"email": "seeker@mail.io", "password": "password123"})
        assert r.status_code == 200
        assert r.json()["access_token"]

    def test_login_wrong_password(self, client, seeker):
        r = client.post("/auth/login", json={"email": "seeker@mail.io", "password": "nope"})
        assert r.status_code == 401

    def test_duplicate_email_rejected(self, client, seeker):
        r = client.post("/auth/register", json={
            "email": "seeker@mail.io", "password": "password123",
            "full_name": "Copy", "role": "seeker",
        })
        assert r.status_code == 400

    def test_me_returns_current_user(self, client, seeker):
        r = client.get("/auth/me", headers=seeker["auth"])
        assert r.status_code == 200
        assert r.json()["email"] == "seeker@mail.io"

    def test_onboarding_sets_preferences(self, client, seeker):
        r = client.post("/auth/onboarding", json={
            "pref_field": "Engineering", "pref_job_type": "Full-time", "skills": "Python, SQL",
        }, headers=seeker["auth"])
        assert r.status_code == 200
        body = r.json()
        assert body["onboarded"] is True
        assert body["pref_field"] == "Engineering"


class TestJobsCrud:
    def test_create_and_list(self, client, recruiter, job):
        r = client.get("/jobs/", headers=recruiter["auth"])
        assert r.status_code == 200
        assert any(j["title"] == "Backend Engineer" for j in r.json())

    def test_update_job(self, client, recruiter, job):
        body = {
            "title": "Senior Backend Engineer", "department": "Engineering",
            "employment_type": "Full-time", "location": "Remote",
            "description": "Updated.", "required_skills": ["Python"],
            "experience_requirement": "3+ years", "education_requirement": "BSc",
            "status": "Active",
        }
        r = client.put(f"/jobs/{job['id']}", json=body, headers=recruiter["auth"])
        assert r.status_code == 200
        assert r.json()["title"] == "Senior Backend Engineer"

    def test_delete_job(self, client, recruiter, job):
        r = client.delete(f"/jobs/{job['id']}", headers=recruiter["auth"])
        assert r.status_code == 200
        r2 = client.get("/jobs/", headers=recruiter["auth"])
        assert all(j["id"] != job["id"] for j in r2.json())


class TestPublicBoard:
    def test_list_open_jobs_is_public(self, client, job):
        r = client.get("/public/jobs/")
        assert r.status_code == 200
        titles = [j["title"] for j in r.json()]
        assert "Backend Engineer" in titles

    def test_public_detail_shows_company(self, client, job):
        r = client.get(f"/public/jobs/{job['id']}")
        assert r.status_code == 200
        assert r.json()["company"] == "Acme Corp"

    def test_public_detail_404_for_missing(self, client):
        assert client.get("/public/jobs/99999").status_code == 404


class TestApplyFlow:
    def test_apply_by_form_creates_application(self, client, seeker, job):
        r = client.post(f"/applications/form/{job['id']}", json={
            "summary": "Backend engineer with Python and FastAPI.",
            "skills": ["Python", "FastAPI"],
            "experience": [{"job_title": "Engineer", "company": "X",
                            "start": "Jan 2020", "end": "Jan 2023", "description": "APIs"}],
            "education": [],
        }, headers=seeker["auth"])
        assert r.status_code == 200, r.text
        body = r.json()
        assert "application_id" in body
        assert "Python" in body["matched_skills"]

    def test_apply_by_upload_docx(self, client, seeker, job):
        contents = _docx_bytes(["Sam Seeker", "Skills", "Python, FastAPI, PostgreSQL"])
        r = client.post(
            f"/applications/upload/{job['id']}",
            files={"file": ("cv.docx", contents,
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
            headers=seeker["auth"],
        )
        assert r.status_code == 200, r.text
        assert r.json()["application_id"]

    def test_duplicate_application_rejected(self, client, seeker, job):
        payload = {"summary": "x", "skills": ["Python"], "experience": [], "education": []}
        first = client.post(f"/applications/form/{job['id']}", json=payload, headers=seeker["auth"])
        assert first.status_code == 200
        second = client.post(f"/applications/form/{job['id']}", json=payload, headers=seeker["auth"])
        assert second.status_code == 400

    def test_my_applications_lists_it(self, client, seeker, job):
        client.post(f"/applications/form/{job['id']}",
                    json={"summary": "x", "skills": ["Python"], "experience": [], "education": []},
                    headers=seeker["auth"])
        r = client.get("/applications/mine", headers=seeker["auth"])
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) == 1
        assert rows[0]["job_title"] == "Backend Engineer"
        assert rows[0]["company"] == "Acme Corp"
        assert rows[0]["status"] == "Under review"


class TestSavedJobs:
    def test_save_list_unsave(self, client, seeker, job):
        assert client.post(f"/saved-jobs/{job['id']}", headers=seeker["auth"]).status_code == 200
        listed = client.get("/saved-jobs/", headers=seeker["auth"]).json()
        assert len(listed) == 1 and listed[0]["job_id"] == job["id"]
        assert client.delete(f"/saved-jobs/{job['id']}", headers=seeker["auth"]).status_code == 200
        assert client.get("/saved-jobs/", headers=seeker["auth"]).json() == []

    def test_saving_twice_is_idempotent(self, client, seeker, job):
        client.post(f"/saved-jobs/{job['id']}", headers=seeker["auth"])
        client.post(f"/saved-jobs/{job['id']}", headers=seeker["auth"])
        assert len(client.get("/saved-jobs/", headers=seeker["auth"]).json()) == 1

    def test_save_missing_job_404(self, client, seeker):
        assert client.post("/saved-jobs/99999", headers=seeker["auth"]).status_code == 404


class TestRankingAndStatus:
    def _apply(self, client, seeker, job):
        return client.post(
            f"/applications/form/{job['id']}",
            json={"summary": "Python FastAPI engineer", "skills": ["Python", "FastAPI"],
                  "experience": [], "education": []},
            headers=seeker["auth"],
        )

    def test_ranking_shows_applicant(self, client, recruiter, seeker, job):
        self._apply(client, seeker, job)
        r = client.get(f"/candidates/ranking/{job['id']}", headers=recruiter["auth"])
        assert r.status_code == 200
        ranked = r.json()
        assert len(ranked) == 1
        assert ranked[0]["source"] == "portal"

    def test_shortlist_propagates_to_seeker(self, client, recruiter, seeker, job):
        self._apply(client, seeker, job)
        cand_id = client.get(f"/candidates/ranking/{job['id']}", headers=recruiter["auth"]).json()[0]["candidate_id"]
        upd = client.patch(f"/candidates/{cand_id}/status",
                           json={"status": "Shortlisted"}, headers=recruiter["auth"])
        assert upd.status_code == 200
        mine = client.get("/applications/mine", headers=seeker["auth"]).json()
        assert mine[0]["status"] == "Shortlisted"
