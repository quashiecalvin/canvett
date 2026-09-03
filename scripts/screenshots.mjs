import { chromium } from '@playwright/test'
import fs from 'fs'

const EXEC = process.env.PW_CHROMIUM || undefined
const BASE = 'http://127.0.0.1:5173'
const OUT = process.env.SHOTS_OUT || '/home/claude/shots'
const VIEWPORT = { width: 1440, height: 900 }

const RECRUITER = { email: 'hunter@hunter.io', pw: 'password123' }
const SEEKER = { email: 'ama@yeboah.io', pw: 'password123' }
const NEW_SEEKER = { email: 'new@seeker.io', pw: 'password123' }

const RECRUITER_ROUTES = [
  ['/dashboard', '10-dashboard'],
  ['/jobs', '11-job-postings'],
  ['/ranking?job=1', '12-candidate-ranking'],
  ['/upload?job=1', '13-upload-resumes'],
  ['/analytics', '14-analytics'],
  ['/settings', '15-settings'],
  ['/profile', '16-recruiter-profile'],
]

const SEEKER_ROUTES = [
  ['/seeker/jobs', '20-job-board'],
  ['/seeker/jobs/1', '21-job-detail'],
  ['/seeker/saved', '22-saved-jobs'],
  ['/seeker/applications', '23-my-applications'],
  ['/seeker/profile', '24-seeker-profile'],
  ['/seeker/jobs/6/apply?method=upload', '26-apply-upload'],
]

const SPARE_FORM_JOB = { light: 4, dark: 5 } // Ama hasn't applied to these

let ok = 0, fail = 0

async function login(ctx, { email, pw }) {
  const page = await ctx.newPage()
  await page.goto(BASE + '/login')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Enter your password').fill(pw)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/(dashboard|seeker\/jobs)/, { timeout: 20000 })
  return page
}

async function shot(page, theme, name) {
  try {
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${OUT}/${theme}/${name}.png`, fullPage: true })
    ok++
    console.log('  ✓', theme, name)
  } catch (e) {
    fail++
    console.log('  ✗', theme, name, e.message)
  }
}

async function themedContext(browser, theme) {
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  await ctx.addInitScript(`localStorage.setItem('canvett_theme','${theme}')`)
  return ctx
}

async function run() {
  for (const t of ['light', 'dark', 'auth']) fs.mkdirSync(`${OUT}/${t}`, { recursive: true })
  const browser = await chromium.launch({ executablePath: EXEC, headless: true })

  // --- auth pages (dark by design, captured once) ---
  {
    const ctx = await browser.newContext({ viewport: VIEWPORT })
    const page = await ctx.newPage()
    await page.goto(BASE + '/login'); await shot(page, 'auth', '00-login')
    await page.goto(BASE + '/register'); await shot(page, 'auth', '01-register')
    await ctx.close()
  }

  for (const theme of ['light', 'dark']) {
    console.log(`== ${theme} ==`)

    // Recruiter
    const rc = await themedContext(browser, theme)
    const rp = await login(rc, RECRUITER)
    for (const [route, name] of RECRUITER_ROUTES) {
      await rp.goto(BASE + route)
      await shot(rp, theme, name)
    }
    await rc.close()

    // Seeker
    const sc = await themedContext(browser, theme)
    const sp = await login(sc, SEEKER)
    for (const [route, name] of SEEKER_ROUTES) {
      await sp.goto(BASE + route)
      await shot(sp, theme, name)
    }
    // Apply chooser modal (open on a job detail)
    await sp.goto(BASE + '/seeker/jobs/6')
    await sp.getByRole('button', { name: /apply now/i }).click().catch(() => {})
    await sp.waitForTimeout(500)
    await shot(sp, theme, '25-apply-chooser')
    // Apply form page + receipt
    const spare = SPARE_FORM_JOB[theme]
    await sp.goto(BASE + `/seeker/jobs/${spare}/apply?method=form`)
    await shot(sp, theme, '27-apply-form')
    await sp.getByPlaceholder(/short paragraph/i).fill('Experienced professional applying through the guided form. Comfortable across the required skills for this role.').catch(() => {})
    await sp.getByPlaceholder(/Python, FastAPI/i).fill('Python, SQL, Communication').catch(() => {})
    await sp.getByRole('button', { name: /submit application/i }).click().catch(() => {})
    await sp.getByText(/you're all set/i).waitFor({ timeout: 15000 }).catch(() => {})
    await shot(sp, theme, '28-receipt')
    await sc.close()

    // Onboarding modal (fresh, non-onboarded seeker) — do NOT skip
    const oc = await themedContext(browser, theme)
    const op = await login(oc, NEW_SEEKER)
    await op.waitForTimeout(800)
    await shot(op, theme, '29-onboarding')
    await oc.close()
  }

  await browser.close()
  console.log(`\nDONE: ${ok} shots, ${fail} failed`)
}

run().catch((e) => { console.error(e); process.exit(1) })
