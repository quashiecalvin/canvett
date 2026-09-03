import { test, expect, request } from '@playwright/test'

// Self-contained: the test seeds its own recruiter + job + seeker through the
// API, then drives the seeker's journey through the real UI in a browser.
// Requires the backend API on http://127.0.0.1:8000.

const API = 'http://127.0.0.1:8000'
const TS = Date.now()
const RECRUITER = `e2e.rec.${TS}@e2e.io`
const SEEKER = `e2e.seeker.${TS}@e2e.io`
const PW = 'password123'
const JOB_TITLE = `E2E Quality Engineer ${TS}`

test.beforeAll(async () => {
  const api = await request.newContext({ baseURL: API })

  const rec = await api.post('/auth/register', {
    data: { email: RECRUITER, password: PW, full_name: 'E2E Recruiter', role: 'recruiter', company_name: 'E2E Test Co' },
  })
  expect(rec.ok(), await rec.text()).toBeTruthy()
  const token = (await rec.json()).access_token

  const job = await api.post('/jobs/', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: JOB_TITLE, department: 'Engineering', employment_type: 'Full-time', location: 'Remote',
      description: 'Own quality across the platform: design and run automated tests.',
      required_skills: ['Python', 'Playwright', 'Testing'],
      experience_requirement: '2+ years', education_requirement: 'BSc or equivalent',
    },
  })
  expect(job.ok(), await job.text()).toBeTruthy()

  const seeker = await api.post('/auth/register', {
    data: { email: SEEKER, password: PW, full_name: 'E2E Seeker', role: 'seeker' },
  })
  expect(seeker.ok(), await seeker.text()).toBeTruthy()

  await api.dispose()
})

test('a seeker can log in, find a job, and apply through the guided form', async ({ page }) => {
  // 1. Log in
  await page.goto('/login')
  await page.getByPlaceholder('you@example.com').fill(SEEKER)
  await page.getByPlaceholder('Enter your password').fill(PW)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/seeker\/jobs/)

  // 2. A brand-new seeker sees the onboarding questionnaire — skip it.
  const skip = page.getByRole('button', { name: /skip for now/i })
  if (await skip.isVisible().catch(() => false)) await skip.click()

  // 3. Find and open the seeded job
  await page.getByText(JOB_TITLE).first().click()
  await expect(page).toHaveURL(/\/seeker\/jobs\/\d+/)
  await expect(page.getByRole('heading', { name: JOB_TITLE })).toBeVisible()

  // 4. Apply -> choose the guided form
  await page.getByRole('button', { name: /apply now/i }).click()
  await page.getByRole('button').filter({ hasText: /fill in a form/i }).click()
  await expect(page).toHaveURL(/\/apply/)

  // 5. Fill and submit
  await page.getByPlaceholder(/short paragraph/i).fill('QA engineer experienced with Python and Playwright automated testing.')
  await page.getByPlaceholder(/Python, FastAPI/i).fill('Python, Playwright, Testing')
  await page.getByRole('button', { name: /submit application/i }).click()

  // 6. Confirmation receipt
  await expect(page.getByText(/you're all set/i)).toBeVisible()

  // 7. The application now shows under "My Applications"
  await page.goto('/seeker/applications')
  await expect(page.getByText(JOB_TITLE).first()).toBeVisible()
})
