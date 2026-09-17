// Captures the app's EMPTY states with brand-new accounts that have no data:
//   - Seeker: My Applications (empty), Saved Jobs (empty)
//   - Recruiter: Candidate Ranking for a job with no candidates yet
// in both light and dark mode. Self-contained: it registers its own accounts
// through the API. Requires backend on :8000 and the frontend on :5173.
import { chromium } from '@playwright/test'
import fs from 'fs'

const EXEC = process.env.PW_CHROMIUM || undefined
const API = 'http://127.0.0.1:8000'
const BASE = 'http://127.0.0.1:5173'
const OUT = process.env.SHOTS_OUT || '/home/claude/empty-shots'
const VIEWPORT = { width: 1440, height: 900 }
const PW = 'password123'
const TS = Date.now()

const SEEKER = `empty.seeker.${TS}@e2e.io`
const RECRUITER = `empty.rec.${TS}@e2e.io`

let ok = 0, fail = 0
let emptyJobId = null

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

async function seed() {
  // Fresh seeker with NOTHING — mark onboarded so the questionnaire modal
  // doesn't cover the empty pages.
  const s = await api('/auth/register', {
    method: 'POST',
    body: { email: SEEKER, password: PW, full_name: 'Empty Seeker', role: 'seeker' },
  })
  await api('/auth/onboarding', { method: 'POST', token: s.access_token, body: {} })

  // Fresh recruiter with one job but ZERO applicants -> "no candidates" state.
  const r = await api('/auth/register', {
    method: 'POST',
    body: { email: RECRUITER, password: PW, full_name: 'Empty Recruiter', role: 'recruiter', company_name: 'Empty Co' },
  })
  const job = await api('/jobs/', {
    method: 'POST',
    token: r.access_token,
    body: {
      title: 'Frontend Engineer', department: 'Engineering', employment_type: 'Full-time',
      location: 'Accra, Ghana', description: 'A newly posted role with no applicants yet.',
      required_skills: ['React', 'JavaScript', 'CSS'],
      experience_requirement: '2+ years', education_requirement: 'BSc or equivalent',
    },
  })
  emptyJobId = job.id
  console.log('seeded empty seeker + recruiter; empty job id =', emptyJobId)
}

async function login(ctx, email) {
  const page = await ctx.newPage()
  await page.goto(BASE + '/login')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Enter your password').fill(PW)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/(dashboard|seeker\/jobs)/, { timeout: 20000 })
  return page
}

async function shot(page, theme, name) {
  try {
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${OUT}/${theme}/${name}.png`, fullPage: true })
    ok++; console.log('  ✓', theme, name)
  } catch (e) {
    fail++; console.log('  ✗', theme, name, e.message)
  }
}

async function themedContext(browser, theme) {
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  await ctx.addInitScript(`localStorage.setItem('canvett_theme','${theme}')`)
  return ctx
}

async function run() {
  await seed()
  for (const t of ['light', 'dark']) fs.mkdirSync(`${OUT}/${t}`, { recursive: true })
  const browser = await chromium.launch({ executablePath: EXEC, headless: true })

  for (const theme of ['light', 'dark']) {
    console.log(`== ${theme} ==`)

    // Seeker empty states
    const sc = await themedContext(browser, theme)
    const sp = await login(sc, SEEKER)
    await sp.goto(BASE + '/seeker/applications'); await shot(sp, theme, '30-my-applications-empty')
    await sp.goto(BASE + '/seeker/saved'); await shot(sp, theme, '31-saved-jobs-empty')
    await sc.close()

    // Recruiter empty ranking
    const rc = await themedContext(browser, theme)
    const rp = await login(rc, RECRUITER)
    await rp.goto(BASE + `/ranking?job=${emptyJobId}`); await shot(rp, theme, '32-ranking-no-candidates')
    await rc.close()
  }

  await browser.close()
  console.log(`\nDONE: ${ok} shots, ${fail} failed`)
  if (fail) process.exit(1)
}

run().catch((e) => { console.error(e); process.exit(1) })
