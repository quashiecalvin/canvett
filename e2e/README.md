# End-to-end tests (Playwright)

`seeker-journey.spec.js` drives the real app in a browser: it logs in as a job
seeker, finds a job, applies through the guided form, sees the confirmation
receipt, and confirms the application appears under "My Applications". The test
seeds its own recruiter, job, and seeker through the API, so it is
self-contained and safe to run repeatedly.

## Prerequisites

1. The **backend API** running on `http://127.0.0.1:8000` (against a database you
   don't mind writing test rows into).
2. Frontend dependencies installed and a Playwright browser available:

   ```bash
   npm install
   npx playwright install chromium
   ```

The Playwright config starts (or reuses) the Vite dev server on
`http://127.0.0.1:5173` automatically.

## Run

```bash
npm run e2e            # or: npx playwright test
npx playwright test --ui   # interactive mode
```

## Screenshots

`scripts/screenshots.mjs` captures every page (recruiter + seeker) in light and
dark mode. It expects the backend running with seeded data and the frontend on
`:5173`:

```bash
npm run screenshots    # writes PNGs to ./shots/<theme>/
```

## Notes

- `PW_CHROMIUM` (optional) points Playwright at a pre-installed Chromium binary
  for CI; leave it unset locally so Playwright uses its own managed browser.

## Accessibility & the full test matrix (added)

- `seeker-journey.spec.js` — seeker logs in, finds a job, applies via the form; empty states.
- `recruiter-journey.spec.js` — recruiter **registers through the UI** (role selector + Terms/Privacy consent), reaches the dashboard, signs out.
- `status-flow.spec.js` — recruiter posts → seeker applies → recruiter shortlists → the seeker sees the **Shortlisted** status and a notification.
- `a11y.spec.js` — automated **axe-core** WCAG 2 A/AA scan of the public pages (fails on serious/critical issues).

Install the axe dependency once, then run:

```bash
npm install                 # picks up @axe-core/playwright
npx playwright install      # browser binaries, first run only
npm run e2e                 # backend on :8000 must be running
```

Backend tests (pytest) live in `backend/tests/` — run them with a throwaway Postgres for the integration tests:

```bash
DATABASE_URL=postgresql://postgres@127.0.0.1:5433/canvett_test SECRET_KEY=test pytest
```
