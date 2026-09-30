"""Integration: the application status pipeline and its notifications.

Postgres-gated (skips without a real DATABASE_URL, like the other integration
tests). Drives the app end to end via a form application so no file is needed.
"""


def _apply_by_form(client, seeker, job_id):
    payload = {
        "phone": "024 000 0000",
        "summary": "Accountant with several years of experience in financial reporting.",
        "experience": [{
            "job_title": "Accountant", "company": "Sunrise Ltd",
            "start": "January 2022", "end": "Present", "description": "Prepared statements.",
        }],
        "education": [{
            "qualification": "BSc Accounting", "institution": "University of Ghana",
            "start": "September 2017", "end": "July 2021",
        }],
        "skills": ["Bookkeeping", "Financial Reporting"],
    }
    r = client.post(f"/applications/form/{job_id}", json=payload, headers=seeker["auth"])
    assert r.status_code == 200, r.text
    return r.json()


def test_apply_creates_submitted_notification(client, seeker, job):
    _apply_by_form(client, seeker, job["id"])

    notes = client.get("/notifications", headers=seeker["auth"])
    assert notes.status_code == 200
    data = notes.json()
    assert data["unread"] >= 1
    assert any("submitted" in n["title"].lower() for n in data["items"])


def test_status_starts_submitted(client, seeker, job):
    _apply_by_form(client, seeker, job["id"])
    mine = client.get("/applications/mine", headers=seeker["auth"]).json()
    assert mine[0]["status"] == "Submitted"


def test_recruiter_shortlist_propagates_and_notifies(client, recruiter, seeker, job):
    _apply_by_form(client, seeker, job["id"])

    # Recruiter finds the candidate and shortlists them.
    ranking = client.get(f"/candidates/ranking/{job['id']}", headers=recruiter["auth"]).json()
    assert ranking, "expected the application to appear in the ranking"
    cid = ranking[0]["candidate_id"]
    r = client.patch(f"/candidates/{cid}/status", json={"status": "Shortlisted"}, headers=recruiter["auth"])
    assert r.status_code == 200, r.text

    # Seeker's application now reads Shortlisted.
    mine = client.get("/applications/mine", headers=seeker["auth"]).json()
    assert mine[0]["status"] == "Shortlisted"

    # And they were notified of the change.
    items = client.get("/notifications", headers=seeker["auth"]).json()["items"]
    assert any("update" in n["title"].lower() for n in items)


def test_rejected_maps_to_not_selected(client, recruiter, seeker, job):
    _apply_by_form(client, seeker, job["id"])
    cid = client.get(f"/candidates/ranking/{job['id']}", headers=recruiter["auth"]).json()[0]["candidate_id"]
    client.patch(f"/candidates/{cid}/status", json={"status": "Rejected"}, headers=recruiter["auth"])
    mine = client.get("/applications/mine", headers=seeker["auth"]).json()
    assert mine[0]["status"] == "Not selected"


def test_mark_all_notifications_read(client, seeker, job):
    _apply_by_form(client, seeker, job["id"])
    assert client.post("/notifications/read-all", headers=seeker["auth"]).status_code == 204
    data = client.get("/notifications", headers=seeker["auth"]).json()
    assert data["unread"] == 0


def test_seeker_cannot_read_notifications_without_auth(client):
    assert client.get("/notifications").status_code == 401
