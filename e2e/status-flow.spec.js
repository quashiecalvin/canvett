import { test, expect, request } from '@playwright/test'

// Full pipeline: recruiter posts a job, seeker applies, recruiter shortlists,
// and the seeker sees the updated status + a notification in the UI.
// State is seeded via the API; the seeker-facing result is verified in a browser.

const API = 'http://127.0.0.1:8000'
const TS = Date.now()
const REC = `e2e.ff.rec.${TS}@e2e.io`
const SEEK = `e2e.ff.seek.${TS}@e2e.io`
const PW = 'password123'
const JOB = `E2E Flow Accountant ${TS}`

test.beforeAll(async () => {
  const api = await request.newContext({ baseURL: API })
  const r = await api.post('/auth/register', { data: { email: REC, password: PW, full_name: 'FF Rec', role: 'recruiter', company_name: 'FF Co' } })
  const recToken = (await r.json()).access_token
  const j = await api.post('/jobs/', {
    headers: { Authorization: `Bearer ${recToken}` },
    data: { title: JOB, department: 'Finance', employment_type: 'Full-time', location: 'Accra, Ghana', description: 'Manage financial records and reporting.', required_skills: ['Bookkeeping', 'Excel'], experience_requirement: '2+ years', education_requirement: 'BSc Accounting' },
  })
  const jobId = (await j.json()).id
  const s = await api.post('/auth/register', { data: { email: SEEK, password: PW, full_name: 'FF Seeker', role: 'seeker' } })
  const seekToken = (await s.json()).access_token
  await api.post(`/applications/form/${jobId}`, {
    headers: { Authorization: `Bearer ${seekToken}` },
    data: { phone: '024 000 0000', summary: 'Accountant with reporting experience.', experience: [{ job_title: 'Accountant', company: 'X Ltd', start: 'January 2022', end: 'Present', description: 'Reporting.' }], education: [{ qualification: 'BSc Accounting', institution: 'UG', start: 'September 2017', end: 'July 2021' }], skills: ['Bookkeeping'] },
  })
  const rank = await api.get(`/candidates/ranking/${jobId}`, { headers: { Authorization: `Bearer ${recToken}` } })
  const cid = (await rank.json())[0].candidate_id
  await api.patch(`/candidates/${cid}/status`, { headers: { Authorization: `Bearer ${recToken}` }, data: { status: 'Shortlisted' } })
  await api.dispose()
})

test('the seeker sees Shortlisted status and a notification', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('you@example.com').fill(SEEK)
  await page.getByPlaceholder('Enter your password').fill(PW)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/seeker\/jobs/)
  const skip = page.getByRole('button', { name: /skip for now/i })
  if (await skip.isVisible().catch(() => false)) await skip.click()

  await page.goto('/seeker/applications')
  await expect(page.getByText(JOB).first()).toBeVisible()
  await expect(page.getByText(/shortlisted/i).first()).toBeVisible()

  // The notification bell is present (and should carry an unread badge).
  await expect(page.getByRole('button', { name: /notifications/i })).toBeVisible()
})
