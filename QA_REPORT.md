# Canvett — Quality Assurance Report

**Author:** QA pass conducted for Quashie Calvin Nunana
**Date:** 3 September 2026
**System under test:** Canvett — AI-powered recruitment decision-support system (FastAPI backend, React frontend, PostgreSQL)

---

## 1. Summary

A test suite of **131 automated tests** was written and executed against the backend. **All 131 pass.** The suite spans unit, integration, security, regression, validation, and performance testing. Testing was run against a real PostgreSQL database (the schema uses PostgreSQL `ARRAY` columns) with the heavy sentence-transformers model replaced by a deterministic stub so the suite runs fast and offline.

The frontend was additionally verified by a clean production build, its Vitest unit tests (**11/11 passing**), and ESLint — details in §7.4. Two issues were found and corrected during the pass (two backend unit tests asserted the wrong exception type — §5 — and one stale frontend colour test — §7.4). No product defects were found; several hardening recommendations are listed in §6. Usability is covered by a heuristic evaluation and an automated accessibility scan in §7, with a task-based plan for real-user testing (usability cannot be fully automated).

| Test type | File(s) | Tests | Result |
|---|---|---:|---|
| Unit — auth (hashing, JWT, guards, SECRET_KEY policy) | `test_auth.py` | 14 | ✅ pass |
| Unit — duration parsing | `test_duration.py` | 19 | ✅ pass |
| Unit — resume parser | `test_parser.py` | 7 | ✅ pass |
| Unit — CV segmenter | `test_segmenter.py` | 10 | ✅ pass |
| Unit — scoring engine | `test_scoring.py` | 10 | ✅ pass |
| Unit — profile extraction | `test_profile.py` | 7 | ✅ pass |
| Unit — upload validation (security boundary) | `test_validate_upload.py` | 8 | ✅ pass |
| Integration — end-to-end API flows | `test_api_integration.py` | 21 | ✅ pass |
| Security — auth, RBAC, scoping, disclosure | `test_security.py` | 18 | ✅ pass |
| Regression — fixed bugs locked in | `test_regression.py` | 5 | ✅ pass |
| Validation — input & business rules | `test_validation.py` | 9 | ✅ pass |
| Performance — smoke thresholds | `test_performance.py` | 3 | ✅ pass |
| **Total** | | **131** | **✅ all pass** |

---

## 2. Test environment & method

- **Backend under test:** the actual FastAPI app, driven through Starlette's `TestClient` (real HTTP request/response cycle, real routers, real SQLAlchemy).
- **Database:** a throwaway PostgreSQL `canvett_test` database. Each DB-backed test starts from a truncated schema, so tests are isolated and order-independent.
- **NLP model:** `sentence-transformers` is stubbed with a deterministic zero-similarity implementation. This keeps the suite fast and offline. Consequence: the *semantic* skill/relevance path is not exercised for exact score values; integration tests assert response structure, persistence, and the exact-match skill path instead. The semantic maths itself (`calibrate`, weighting) is unit-tested directly.
- **How to reproduce:** see `backend/tests/README.md`.

---

## 3. What each testing type verified

**Unit testing** — isolated functions with no I/O:
- Password hashing is one-way and salted (bcrypt); verification round-trips; wrong passwords rejected.
- JWTs carry the right claims, expire in the future, and fail to decode when tampered.
- Role guards (`require_recruiter`, `require_seeker`) allow the right role and 403 the wrong one.
- Duration parser reads date ranges across separators (hyphen, en-dash, em-dash, "to"), shared-year ranges, open-ended ("Present"), and required-years phrases; ignores garbage and zero/negative ranges.
- Resume parser validates type/size, extracts text from DOCX, and derives a candidate name.
- Segmenter splits a CV into Education / Experience / Skills sections.
- Scoring: exact-match skills, the 50/30/20 weighted total, and the calibration curve.
- Profile heuristics: location and years-of-experience extraction.

**Integration testing** — full flows over HTTP: register → login → `/auth/me`; job create/list/update/delete; the public board and job detail; applying by form and by CV upload; "my applications"; saving/un-saving jobs; candidate ranking; and recruiter-status → seeker-status propagation.

**Security testing** — see §4.

**Regression testing** — the two real bugs from development are locked in: the en-dash / shared-year date bug, and experience inflation from a stray date outside the Experience section. Plus the duplicate-application guard.

**Validation testing** — the API rejects malformed input before doing work: short passwords, invalid roles, recruiter-without-company, invalid emails, missing fields, invalid candidate status, and empty applications.

**Performance testing** — generous smoke thresholds guard against gross regressions (e.g. an accidental N+1) on the scoring maths and key endpoints. (Not a benchmark; the model is stubbed.)

---

## 4. Security findings — all verified as safe

| Check | Result |
|---|---|
| Unauthenticated access to protected endpoints | Rejected with **401** |
| Garbage / malformed token | Rejected with **401** |
| Tampered token (broken signature) | Rejected with **401** |
| Token forged with a different secret | Rejected with **401** |
| Seeker calling recruiter endpoints (list/create jobs, ranking) | **403** |
| Recruiter calling seeker endpoints (apply, saved jobs) | **403** |
| Recruiter reading/deleting/ranking **another** recruiter's job | **404** (existence not disclosed) |
| Recruiter changing another recruiter's candidate status | **404** |
| Job list scoped to owner only | Verified — no cross-recruiter leakage |
| Password hash in API responses | Never present |
| Password storage | bcrypt hash in DB (`$2…`), never plaintext |
| Rejected status shown to seeker | Never — seeker sees "Under review", never "Rejected" |

This confirms the two-layer model holds: **RBAC** decides *whether* you may call an endpoint, and **data scoping** decides *which rows* you get — and the app returns **404 rather than 403** for another owner's records, so it doesn't even disclose that they exist.

---

## 5. Issue found and fixed during the pass

**Stale unit tests (test defect, not a product defect).** Two pre-existing tests in `test_parser.py` asserted that `parse_resume()` / `parse_resume_bytes()` raise `ValueError` on an unsupported file extension. The code actually raises `UnsupportedFileType` (a subclass of `ResumeParseError`), which the app converts to a clean **400** for the user. The real upload path also rejects bad types earlier via `validate_resume_upload` (which *does* raise `ValueError` → 400), so there is no product bug. The test expectations were simply out of date and were corrected to match the code.

---

## 6. Recommendations (hardening — not failures)

1. **Set a strong `SECRET_KEY` in production. ✅ RESOLVED.** Implemented: when `APP_ENV=production`, the app now fails fast at startup if `SECRET_KEY` is missing or shorter than 32 bytes, so a deploy can never silently run on a weak or throwaway key. In development, if unset, a key is generated once and persisted to `backend/.dev_secret_key` so tokens survive restarts. Locked in by four tests in `test_auth.py` (`TestSecretKeyPolicy`), and documented in `DEPLOYMENT_BRIEF.md`. Remember to set `APP_ENV=production` and a ≥32-byte `SECRET_KEY` on the server.
2. **Global scoring settings.** The `settings` table is a single shared row and its endpoint isn't role-scoped — fine for a single-recruiter demo; per-recruiter settings would be the productionising step. (Already a documented limitation.)
3. **Token in `localStorage`.** Convenient and standard here; an `httpOnly` cookie would harden against XSS. (Already documented.)
4. **Recruiter uploads saved by original filename** could collide; a unique name per upload is the fix. (Already documented.)
5. **Accessibility (see §7):** add programmatic labels / `aria-label` to inputs that currently rely on placeholder text (notably search fields).

---

## 7. Usability & accessibility

Usability testing proper needs **real users** completing tasks — it can't be fully automated. Two things were done here: an automated accessibility scan of the frontend source, and a heuristic (expert) evaluation. A task-based plan for real-user testing follows.

### 7.1 Automated accessibility scan (frontend source, 39 `.jsx` files)

| Signal | Finding |
|---|---|
| `<img>` elements with `alt` text | **14 / 14** — all images have alt text ✅ |
| Icon-only buttons with `aria-label` | 18 `aria-label` usages — icon buttons are largely labelled ✅ |
| `<input>` elements with a programmatic name | **0 / 57** have `aria-label`; 42 `<label>` elements exist ⚠️ |
| Explicit landmark `role=` attributes | 3 ⚠️ (app leans on native elements) |

**Takeaway:** images and icon buttons are in good shape. The gap is inputs — 57 inputs but 0 `aria-label`, so any input without an associated `<label>` (e.g. the ⌘K search that uses only placeholder text) has no accessible name for screen readers. **Recommendation:** ensure every input is tied to a `<label htmlFor>` or carries an `aria-label`.

### 7.2 Heuristic evaluation (Nielsen's 10 heuristics)

- **Visibility of system status** — strong: loading states, the parse "receipt", application-status pills, and confirmation screens all keep the user informed.
- **Match with the real world** — strong: plain language ("In review", "Shortlisted"), familiar recruitment vocabulary.
- **User control & freedom** — good: back buttons return to origin; drafts/edits are reversible; the onboarding questionnaire is skippable.
- **Consistency & standards** — strong: one shared design-token system (colours, spacing, radii) across both portals in light and dark mode.
- **Error prevention** — good: schema validation blocks bad input before submission; the apply button reflects an already-applied state.
- **Recognition over recall** — good: tailored recommendations, saved jobs, and status tabs reduce memory load.
- **Aesthetic & minimalist design** — strong: the recent UI pass removed redundancy (e.g. dropped the CV apply stepper).
- **Help users recognise/recover from errors** — good: human-readable 400 messages ("We couldn't read any text from that file…").
- **Flexibility & efficiency** — good: ⌘K search, two apply paths (upload vs guided form).
- **Help & documentation** — the "How Canvett Works" walkthrough covers the system; in-product contextual help is minimal (acceptable for scope).

### 7.3 Suggested real-user usability test plan (for when users are available)

Recruit 5 participants per role. Task-based, think-aloud, measure task success, time-on-task, and errors:

- **Seeker tasks:** complete onboarding; find a relevant role; save it; apply by CV upload; check application status.
- **Recruiter tasks:** post a job; add a company description; upload a referral CV; open the ranking; shortlist a candidate.

Follow with a SUS (System Usability Scale) questionnaire for a comparable score.

---

### 7.4 Frontend build & unit tests

The frontend was checked three ways:

- **Production build** (`npm run build`) — ✅ passes. 2383 modules transform cleanly, confirming there are no broken imports or undefined references across the app (including every screen changed in the recent UI work).
- **Vitest unit tests** (`npm run test`) — ✅ **11/11 pass**. One test (`scoreColor.test.js`) was initially failing because it asserted the old amber colour for the 50–74 score band; the redesign intentionally moved that band to accent-blue (matching `scoreToneClass`), so the **test was stale, not the code** — it was corrected to expect `bg-accent`.
- **ESLint** (`npm run lint`) — 18 errors, 1 warning in app source. First, ESLint was accidentally scanning vendored JavaScript inside the Python `backend/venv` (21 phantom errors); `backend/` is now in the ESLint ignore list. The remaining 18 are code-quality items under strict `react-hooks` rules — 11× `set-state-in-effect` (the common `setState`-inside-`useEffect` pattern, present across the app), 3× unused variables, 3× context fast-refresh notes, and 1× `Date.now()` in a `useMemo`. **None affect the build or behaviour**; they are a good, low-risk cleanup backlog.

## 8. Limitations of this QA pass

- The sentence-transformers model was **stubbed**, so exact semantic-scoring values were not validated (the scoring *maths* and exact-match path were). Real-model scoring quality is best evaluated separately with labelled CV/job pairs.
- The frontend was verified by a clean production build, its Vitest unit tests (11/11), ESLint, and a source-level accessibility scan — but **no browser-level end-to-end automation** (e.g. Playwright driving real screens) was run, so click-through user journeys are not covered by an automated test.
- Usability findings are heuristic, not from real users (see the plan in §7.3).

---

## 9. How to run

See `backend/tests/README.md`. In short: `pip install -r requirements-dev.txt`, create a `canvett_test` database, then run `DATABASE_URL=postgresql://…/canvett_test SECRET_KEY=test pytest`. Unit-only runs need no database.
