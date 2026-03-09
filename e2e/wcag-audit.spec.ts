import { test, expect } from '@playwright/test';
import { runAccessibilityAudit, formatViolations } from './helpers/a11y';

/**
 * WCAG 2.1 Level A and AA Accessibility Audit
 *
 * These tests use axe-core to scan each page for WCAG 2.1 A and AA violations.
 * The demo site intentionally contains ~22 accessibility issues.
 * All tests are EXPECTED TO FAIL to demonstrate how Playwright + axe-core
 * detects compliance issues.
 *
 * Usage with GitHub Copilot:
 *   1. Run `npx playwright test` to see all violations
 *   2. Use Copilot prompts/skills to analyze the violations
 *   3. Ask Copilot to suggest fixes for each WCAG criterion
 */

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Menu', path: '/menu' },
  { name: 'Order', path: '/order' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'Cart', path: '/cart' },
];

test.describe('WCAG 2.1 A and AA Accessibility Audit', () => {
  for (const pageInfo of pages) {
    test(`${pageInfo.name} page should have no WCAG 2.1 A/AA violations`, async ({ page }) => {
      const results = await runAccessibilityAudit(page, pageInfo.path);

      if (results.violations.length > 0) {
        console.log(`\n--- ${pageInfo.name} Page Violations ---`);
        console.log(formatViolations(results.violations));
        console.log(`Total violations: ${results.violations.length}`);
      }

      expect(
        results.violations,
        `Found ${results.violations.length} accessibility violation(s) on ${pageInfo.name} page`
      ).toEqual([]);
    });
  }
});

test.describe('WCAG Audit - Targeted Scans', () => {
  test('Home page - scan only main content area', async ({ page }) => {
    // WCAG 1.1.1, 1.4.3, 2.4.4, 4.1.2 — image alt, contrast, link purpose, name/role/value
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const { AxeBuilder } = await import('@axe-core/playwright');
    const results = await new AxeBuilder({ page })
      .include('#main-content')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('\n--- Home Main Content Violations ---');
      console.log(formatViolations(results.violations as any));
    }

    expect(
      results.violations,
      `Found ${results.violations.length} axe-core violation(s) in #main-content on the Home page`
    ).toEqual([]);
  });

  test('Order page - scan form elements specifically', async ({ page }) => {
    // WCAG 1.3.1, 1.3.5, 1.4.3, 3.3.2 — labels, input purpose, contrast, labels or instructions
    await page.goto('/order');
    await page.waitForLoadState('networkidle');

    const { AxeBuilder } = await import('@axe-core/playwright');
    const results = await new AxeBuilder({ page })
      .include('form')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('\n--- Order Form Violations ---');
      console.log(formatViolations(results.violations as any));
    }

    expect(
      results.violations,
      `Found ${results.violations.length} axe-core violation(s) in the Order form`
    ).toEqual([]);
  });

  test('Contact page - scan form elements specifically', async ({ page }) => {
    // WCAG 1.3.1, 3.3.2 — labels or instructions, info and relationships
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const { AxeBuilder } = await import('@axe-core/playwright');
    const results = await new AxeBuilder({ page })
      .include('form')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('\n--- Contact Form Violations ---');
      console.log(formatViolations(results.violations as any));
    }

    expect(
      results.violations,
      `Found ${results.violations.length} axe-core violation(s) in the Contact form`
    ).toEqual([]);
  });

  test('Menu page - scan table and image elements specifically', async ({ page }) => {
    // WCAG 1.1.1, 1.3.1, 4.1.1 — image alt, table headers, duplicate IDs
    await page.goto('/menu');
    await page.waitForLoadState('networkidle');

    const { AxeBuilder } = await import('@axe-core/playwright');
    const results = await new AxeBuilder({ page })
      .include('main, .container')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('\n--- Menu Page Content Violations ---');
      console.log(formatViolations(results.violations as any));
    }

    expect(
      results.violations,
      `Found ${results.violations.length} axe-core violation(s) in Menu page content`
    ).toEqual([]);
  });
});
