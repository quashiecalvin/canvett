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
