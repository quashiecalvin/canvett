import { test, expect } from '@playwright/test'

// Registers a recruiter through the real UI (exercising the role selector and
// the Terms/Privacy consent gate), lands on the dashboard, reaches the job
// postings area, then signs out. Requires the backend API on :8000.

const TS = Date.now()
const EMAIL = `e2e.rec.ui.${TS}@e2e.io`
const PW = 'password123'

test('a recruiter can register, reach the dashboard, and sign out', async ({ page }) => {
  await page.goto('/register')

  await page.getByRole('radio', { name: /hire talent/i }).click()
  await page.getByLabel('Full name').fill('E2E UI Recruiter')
  await page.getByLabel('Company name').fill('E2E UI Co')
  await page.getByLabel('Email address').fill(EMAIL)
  await page.getByLabel('Password').fill(PW)
  await page.getByRole('checkbox').check()               // Terms/Privacy consent
  await page.getByRole('button', { name: /create .*account/i }).click()

  await expect(page).toHaveURL(/\/dashboard/)

  // Main area is reachable: job postings + the "new job" action.
  await page.goto('/jobs')
  await expect(page.getByRole('button', { name: /new job posting/i })).toBeVisible()

  // Sign out via the account menu.
  await page.getByRole('button', { name: /account menu/i }).click()
  await page.getByRole('button', { name: /sign out/i }).click()
  await expect(page).toHaveURL(/\/login/)
})
