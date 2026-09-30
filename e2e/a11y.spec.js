import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Automated accessibility scan of the public pages. Fails on serious/critical
// WCAG 2 A/AA violations. Requires @axe-core/playwright (a dev dependency).
for (const path of ['/login', '/register', '/about', '/privacy']) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact))
    expect(serious, JSON.stringify(serious.map((v) => v.id), null, 2)).toEqual([])
  })
}
