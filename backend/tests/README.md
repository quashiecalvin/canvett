# Canvett test suite

Two tiers of tests:

- **Unit tests** import service functions directly and never touch a database
  (`test_auth`, `test_duration`, `test_parser`, `test_segmenter`, `test_scoring`,
  `test_profile`, `test_validate_upload`, plus the date/duration regression tests).
- **Integration / security / validation / performance tests** drive the real
  FastAPI app through a `TestClient` against a **PostgreSQL** database. Postgres is
  required because the schema uses PostgreSQL `ARRAY` columns.

## Running the unit tests only

```bash
pip install -r requirements-dev.txt
pytest tests/test_auth.py tests/test_duration.py tests/test_parser.py \
       tests/test_segmenter.py tests/test_scoring.py tests/test_profile.py \
       tests/test_validate_upload.py
```

These run with the default `DATABASE_URL=sqlite://` (never connected) and do not
need Postgres.

## Running the full suite (integration + security + …)

Create a throwaway test database, then point the suite at it:

```bash
createdb canvett_test
DATABASE_URL="postgresql://<user>@localhost:5432/canvett_test" \
SECRET_KEY="anything-for-tests" \
pytest
```

Each DB-backed test starts from a truncated database, so the suite is
self-cleaning and order-independent. **Do not point `DATABASE_URL` at your real
`canvett` database** — the suite truncates every table.

## Notes

- If `sentence-transformers` is not installed, `conftest.py` injects a
  deterministic stub so the scoring stack imports without downloading a model.
  On a machine that has the real package, the stub is a no-op and the real model
  is used. (With the stub, semantic similarity reports 0, so integration tests
  assert structure and the exact-match skill path, not exact semantic scores.)
- Integration tests are skipped automatically when `DATABASE_URL` is not a
  PostgreSQL URL, so `pytest` never errors on a unit-only machine.
