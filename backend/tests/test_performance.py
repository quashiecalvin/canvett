"""Lightweight performance smoke tests.

These are generous upper bounds — a guard against gross regressions (e.g. an
accidental N+1 or a blocking call), not precise benchmarks. Thresholds are
deliberately loose so they don't flake on shared CI hardware.

Note: the semantic-similarity model is stubbed in this suite, so these do NOT
measure real embedding latency; they measure the request/DB path and the
non-ML scoring maths.
"""
import time

from services.scoring import score_candidate


def test_scoring_maths_is_fast():
    resume = "\n".join(["Jane Doe", "Skills", "Python, FastAPI, SQL"] * 20)
    start = time.perf_counter()
    for _ in range(20):
        score_candidate(resume, "Backend", ["Python", "FastAPI", "Go"], "2+ years", "BSc")
    elapsed = time.perf_counter() - start
    assert elapsed < 2.0, f"20 scorings took {elapsed:.2f}s"


def test_public_board_responds_quickly(client, job):
    start = time.perf_counter()
    r = client.get("/public/jobs/")
    elapsed = time.perf_counter() - start
    assert r.status_code == 200
    assert elapsed < 2.0, f"public board took {elapsed:.2f}s"


def test_my_applications_no_gross_slowdown(client, seeker, job):
    client.post(f"/applications/form/{job['id']}",
                json={"summary": "Python", "skills": ["Python"], "experience": [], "education": []},
                headers=seeker["auth"])
    start = time.perf_counter()
    r = client.get("/applications/mine", headers=seeker["auth"])
    elapsed = time.perf_counter() - start
    assert r.status_code == 200
    assert elapsed < 2.0, f"my applications took {elapsed:.2f}s"
