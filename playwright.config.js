import { defineConfig } from '@playwright/test'

// End-to-end tests drive the real app in a browser.
// They require the backend API running on http://127.0.0.1:8000 and will
// start (or reuse) the Vite dev server on http://127.0.0.1:5173.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    // PW_CHROMIUM lets CI point at a pre-installed browser; unset locally so
    // Playwright uses its own managed browser.
    launchOptions: { executablePath: process.env.PW_CHROMIUM || undefined },
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
