"""Input-validation tests: the API must reject malformed or invalid input
with a clear error before doing any work (schema validation and guard checks).
"""


class TestRegistrationValidation:
    def test_short_password_rejected(self, client):
        r = client.post("/auth/register", json={
            "email": "a@b.io", "password": "short", "full_name": "A", "role": "seeker",
        })
        assert r.status_code == 422

    def test_invalid_role_rejected(self, client):
        r = client.post("/auth/register", json={
            "email": "a@b.io", "password": "password123", "full_name": "A", "role": "admin",
        })
        assert r.status_code == 422

    def test_recruiter_without_company_rejected(self, client):
        r = client.post("/auth/register", json={
            "email": "a@b.io", "password": "password123", "full_name": "A", "role": "recruiter",
        })
        assert r.status_code == 422

    def test_invalid_email_rejected(self, client):
        r = client.post("/auth/register", json={
            "email": "not-an-email", "password": "password123", "full_name": "A", "role": "seeker",
        })
        assert r.status_code == 422

    def test_missing_field_rejected(self, client):
        r = client.post("/auth/register", json={"email": "a@b.io", "password": "password123"})
        assert r.status_code == 422


class TestChangePasswordValidation:
    def test_new_password_too_short(self, client, seeker):
        r = client.post("/auth/change-password",
                        json={"current_password": "password123", "new_password": "x"},
                        headers=seeker["auth"])
        assert r.status_code == 422


class TestBusinessRuleValidation:
    def test_invalid_candidate_status_rejected(self, client, recruiter, seeker, job):
        client.post(f"/applications/form/{job['id']}",
                    json={"summary": "Python", "skills": ["Python"], "experience": [], "education": []},
                    headers=seeker["auth"])
        cand_id = client.get(f"/candidates/ranking/{job['id']}", headers=recruiter["auth"]).json()[0]["candidate_id"]
        r = client.patch(f"/candidates/{cand_id}/status",
                         json={"status": "Hired"}, headers=recruiter["auth"])
        assert r.status_code == 400

    def test_empty_form_application_rejected(self, client, seeker, job):
        r = client.post(f"/applications/form/{job['id']}",
                        json={"summary": "", "skills": [], "experience": [], "education": []},
                        headers=seeker["auth"])
        assert r.status_code == 400

    def test_apply_to_missing_job_404(self, client, seeker):
        r = client.post("/applications/form/99999",
                        json={"summary": "x", "skills": ["Python"], "experience": [], "education": []},
                        headers=seeker["auth"])
        assert r.status_code == 404
