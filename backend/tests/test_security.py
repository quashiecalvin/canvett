"""Security tests: authentication, role-based access control, data scoping
between recruiters, credential hygiene, and information disclosure.
"""
import jwt


class TestAuthenticationRequired:
    def test_protected_endpoint_without_token_401(self, client):
        assert client.get("/auth/me").status_code == 401

    def test_recruiter_endpoint_without_token_401(self, client):
        assert client.get("/jobs/").status_code == 401

    def test_garbage_token_rejected(self, client):
        r = client.get("/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
        assert r.status_code == 401

    def test_tampered_token_rejected(self, client, seeker):
        token = seeker["token"]
        # Flip the signature.
        tampered = token[:-3] + ("aaa" if token[-3:] != "aaa" else "bbb")
        r = client.get("/auth/me", headers={"Authorization": f"Bearer {tampered}"})
        assert r.status_code == 401

    def test_token_signed_with_wrong_secret_rejected(self, client, seeker):
        forged = jwt.encode({"sub": "1", "role": "recruiter"}, "attacker-secret", algorithm="HS256")
        r = client.get("/auth/me", headers={"Authorization": f"Bearer {forged}"})
        assert r.status_code == 401


class TestRoleBasedAccess:
    def test_seeker_cannot_list_jobs(self, client, seeker):
        assert client.get("/jobs/", headers=seeker["auth"]).status_code == 403

    def test_seeker_cannot_create_job(self, client, seeker):
        r = client.post("/jobs/", json={
            "title": "x", "department": "x", "employment_type": "x", "location": "x",
            "description": "x", "required_skills": ["x"],
            "experience_requirement": "x", "education_requirement": "x",
        }, headers=seeker["auth"])
        assert r.status_code == 403

    def test_recruiter_cannot_apply(self, client, recruiter, job):
        r = client.post(f"/applications/form/{job['id']}",
                        json={"summary": "x", "skills": ["Python"], "experience": [], "education": []},
                        headers=recruiter["auth"])
        assert r.status_code == 403

    def test_recruiter_cannot_use_seeker_saved_jobs(self, client, recruiter, job):
        assert client.get("/saved-jobs/", headers=recruiter["auth"]).status_code == 403

    def test_seeker_cannot_read_ranking(self, client, seeker, job):
        assert client.get(f"/candidates/ranking/{job['id']}", headers=seeker["auth"]).status_code == 403


class TestDataScoping:
    """A recruiter must never reach another recruiter's data."""

    def test_recruiter_cannot_read_others_job(self, client, recruiter, recruiter2, job):
        # recruiter2 asks for recruiter1's job by id.
        r = client.get(f"/jobs/{job['id']}", headers=recruiter2["auth"])
        assert r.status_code == 404  # 404 (not 403) so existence isn't disclosed

    def test_recruiter_cannot_delete_others_job(self, client, recruiter, recruiter2, job):
        assert client.delete(f"/jobs/{job['id']}", headers=recruiter2["auth"]).status_code == 404

    def test_recruiter_cannot_rank_others_job(self, client, recruiter, recruiter2, job):
        assert client.get(f"/candidates/ranking/{job['id']}", headers=recruiter2["auth"]).status_code == 404

    def test_job_list_only_shows_own(self, client, recruiter, recruiter2, job):
        # recruiter2 has no jobs of their own.
        assert client.get("/jobs/", headers=recruiter2["auth"]).json() == []

    def test_recruiter_cannot_change_others_candidate_status(self, client, recruiter, recruiter2, seeker, job):
        client.post(f"/applications/form/{job['id']}",
                    json={"summary": "Python", "skills": ["Python"], "experience": [], "education": []},
                    headers=seeker["auth"])
        cand_id = client.get(f"/candidates/ranking/{job['id']}", headers=recruiter["auth"]).json()[0]["candidate_id"]
        r = client.patch(f"/candidates/{cand_id}/status",
                         json={"status": "Shortlisted"}, headers=recruiter2["auth"])
        assert r.status_code == 404


class TestCredentialHygiene:
    def test_password_hash_never_returned(self, client, seeker):
        for body in (
            client.get("/auth/me", headers=seeker["auth"]).json(),
            client.post("/auth/login", json={"email": "seeker@mail.io", "password": "password123"}).json()["user"],
        ):
            assert "password" not in body
            assert "password_hash" not in body

    def test_password_is_hashed_in_db(self, client, seeker):
        from database import connection
        from sqlalchemy import text
        with connection.engine.connect() as conn:
            stored = conn.execute(
                text("SELECT password_hash FROM users WHERE email = :e"),
                {"e": "seeker@mail.io"},
            ).scalar()
        assert stored != "password123"
        assert stored.startswith("$2")  # bcrypt hash marker


class TestInformationDisclosure:
    def test_seeker_never_sees_rejected_status(self, client, recruiter, seeker, job):
        client.post(f"/applications/form/{job['id']}",
                    json={"summary": "Python", "skills": ["Python"], "experience": [], "education": []},
                    headers=seeker["auth"])
        cand_id = client.get(f"/candidates/ranking/{job['id']}", headers=recruiter["auth"]).json()[0]["candidate_id"]
        # Recruiter marks the candidate Rejected internally.
        client.patch(f"/candidates/{cand_id}/status", json={"status": "Rejected"}, headers=recruiter["auth"])
        mine = client.get("/applications/mine", headers=seeker["auth"]).json()
        # The seeker sees "Under review", never "Rejected".
        assert mine[0]["status"] == "Under review"
