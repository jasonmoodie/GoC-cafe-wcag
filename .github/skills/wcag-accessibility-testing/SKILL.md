---
name: wcag-accessibility-testing
description: Generate and execute a WCAG 2.1 AA compliance testing suite using Playwright and axe-core. Use this skill when asked to create accessibility tests, audit WCAG compliance, build a11y test plans, or run accessibility checks against web pages.
---

# WCAG 2.1 AA Accessibility Testing Suite Generator

## Purpose

This skill generates a complete WCAG 2.1 AA compliance testing suite using Playwright and `@axe-core/playwright`. It implements a hybrid testing strategy — automated axe-core scans for machine-detectable violations plus custom Playwright DOM checks for criteria axe-core cannot cover.

## When to Use

- User asks to create WCAG 2.1 AA accessibility tests
- User wants to audit a web application for accessibility compliance
- User needs a Playwright-based a11y testing suite
- User asks to run or generate accessibility checks
- User mentions WCAG, a11y testing, or accessibility compliance

## Workflow

### Step 1: Discover the Application

Before writing tests, understand the target application:

1. **Read `package.json`** — identify the framework (Angular, React, etc.) and existing dependencies
2. **Read `ISSUES-CATALOG.md`** if present — it documents known/intentional violations and maps them to WCAG criteria
3. **Identify all routes/pages** — list every navigable page in the application
4. **Note SPA framework** — determines wait strategy and dev server configuration

### Step 2: Classify Tests by Detection Tier

Categorize each WCAG criterion into its detection method:

| Tier | Method | Examples |
|------|--------|----------|
| **Tier 1 — axe-core automated** | `AxeBuilder` full-page and targeted scans | image-alt, label, color-contrast, duplicate-id |
| **Tier 2 — Custom Playwright** | DOM inspection, keyboard simulation, cross-page comparison | skip-link targets, page title uniqueness, nav order consistency, lang attributes, focus visibility, aria-live regions |
| **Tier 3 — Manual review only** | Cannot be automated; document as known gaps | use-of-color (colour-only indicators), images-of-text, error suggestions, non-descriptive headings |

Only Tier 1 and Tier 2 produce test files. Tier 3 should be listed in comments or documentation as out-of-scope for automation.

### Step 3: Implement the Tests

Organize tests by **detection method**, not by WCAG category:

| File | Purpose |
|------|---------|
| `e2e/helpers/a11y.ts` | Shared helper: `runAccessibilityAudit()` and `formatViolations()` |
| `e2e/wcag-audit.spec.ts` | Tier 1 — axe-core automated scans (all pages + targeted sections) |
| `e2e/custom-a11y.spec.ts` | Tier 2 — Custom Playwright checks for criteria axe-core misses |

### Step 4: Validate All Tests

Run the mandatory validation checklist (see below) against every test file.

### Step 5: Execute Tests

Run the tests and generate reports.

## Required: Shared Helper Utility

Create `e2e/helpers/a11y.ts` with reusable functions to avoid duplicated axe-core setup:

```typescript
import { Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

export interface A11yResult {
  violations: Array<{
    id: string;
    impact: string;
    description: string;
    helpUrl: string;
    nodes: Array<{ html: string; target: string[] }>;
  }>;
}

export async function runAccessibilityAudit(page: Page, path: string): Promise<A11yResult> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return results as unknown as A11yResult;
}

export function formatViolations(violations: A11yResult['violations']): string {
  return violations
    .map((v) => {
      const nodes = v.nodes
        .map((n) => `    - ${n.target.join(', ')}\n      ${n.html.substring(0, 120)}`)
        .join('\n');
      return `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n  Help: ${v.helpUrl}\n  Elements:\n${nodes}`;
    })
    .join('\n\n');
}
```

## Test Patterns

### Pattern 1: Page-Loop axe-core Scan (Tier 1)

Use a page array + loop to scan every route — DRY and maintainable:

```typescript
import { test, expect } from '@playwright/test';
import { runAccessibilityAudit, formatViolations } from './helpers/a11y';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Menu', path: '/menu' },
  // ... all routes
];

test.describe('WCAG 2.1 A and AA Accessibility Audit', () => {
  for (const pageInfo of pages) {
    test(`${pageInfo.name} page should have no WCAG 2.1 A/AA violations`, async ({ page }) => {
      const results = await runAccessibilityAudit(page, pageInfo.path);
      if (results.violations.length > 0) {
        console.log(formatViolations(results.violations));
      }
      expect(
        results.violations,
        `Found ${results.violations.length} violation(s) on ${pageInfo.name} page`
      ).toEqual([]);
    });
  }
});
```

### Pattern 2: Targeted Section Scan (Tier 1)

Use `AxeBuilder.include()` to scan specific page regions (forms, main content):

```typescript
test('Order page - scan form elements specifically', async ({ page }) => {
  await page.goto('/order');
  await page.waitForLoadState('networkidle');
  const { AxeBuilder } = await import('@axe-core/playwright');
  const results = await new AxeBuilder({ page })
    .include('form')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### Pattern 3: Custom DOM Check (Tier 2)

For criteria axe-core cannot detect — use concise `expect()` with clear messages:

```typescript
test('Skip navigation link should target an existing element', async ({ page }) => {
  // WCAG 2.4.1 - Bypass Blocks
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');

  const skipLink = page.locator('a.skip-nav');
  const href = await skipLink.getAttribute('href');
  expect(href).toBeTruthy();

  const targetId = href!.replace('#', '');
  const targetElement = page.locator(`#${targetId}`);
  expect(
    await targetElement.count(),
    `Skip link target "#${targetId}" should exist on the page`
  ).toBeGreaterThan(0);
});
```

### Pattern 4: Cross-Page Comparison (Tier 2)

For criteria that require comparing state across routes (nav order, titles):

```typescript
test('Navigation order should be consistent across pages', async ({ page }) => {
  // WCAG 3.2.3 - Consistent Navigation
  const getNavOrder = async (route: string): Promise<string[]> => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const navLinks = page.locator('nav a');
    const texts: string[] = [];
    for (let i = 0; i < await navLinks.count(); i++) {
      const text = await navLinks.nth(i).textContent();
      if (text) texts.push(text.trim());
    }
    return texts;
  };

  const homeNav = await getNavOrder('/');
  const contactNav = await getNavOrder('/contact');
  expect(homeNav, 'Navigation order should match between Home and Contact (WCAG 3.2.3)').toEqual(contactNav);
});
```

## Mandatory Test Case Requirements

**Every test case MUST include:**

### 1. WCAG Criterion Reference
- Comment with criterion number and name (e.g., `// WCAG 2.4.1 - Bypass Blocks`)

### 2. Clear Assertion Message
- Every `expect()` must include a descriptive failure message explaining WHAT failed and WHY it matters

### 3. SPA Wait Strategy
- Always call `await page.waitForLoadState('networkidle')` after `page.goto()` — SPA frameworks load content asynchronously

## Validation Checklist

Before considering the task complete, verify EVERY test meets these criteria:

1. **WCAG Reference** — Criterion number appears in a comment
2. **Descriptive Assertion** — `expect()` includes a human-readable failure message
3. **SPA Wait** — `waitForLoadState('networkidle')` follows every `page.goto()`
4. **No Shared State** — Tests are parallelizable; no test depends on another

**If ANY test lacks the above components, the implementation is INCOMPLETE and must be revised.**

## Playwright Configuration

The Playwright config MUST include:

1. **Both reporters** — `html` for visual report + `list` for terminal output
2. **webServer block** — auto-starts the dev server (framework-specific)
3. **baseURL** — all tests use relative paths

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:4200',
  },
  webServer: {
    command: 'npx ng serve --port 4200',  // Adjust for framework
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
```

Do NOT pass `--reporter=html` on the CLI — it overrides the config and removes the list reporter.

## Test Execution

### Pre-execution
- Verify `@playwright/test` and `@axe-core/playwright` are in `package.json` (install only if missing)
- Verify the dev server can be started by the config's `webServer` block

### Running Tests
```bash
# All WCAG tests
npx playwright test

# axe-core scans only
npx playwright test wcag-audit

# Custom checks only
npx playwright test custom-a11y
```

### Post-execution
1. Verify the HTML report exists at `playwright-report/index.html`
2. Provide the command: `npx playwright show-report`
3. Report summary: total tests, passing, failing, execution time
4. For failures: which WCAG criteria failed, detection tier, and remediation steps

## Dependencies

- `@playwright/test`
- `@axe-core/playwright`

## Output Files

| File | Description |
|------|-------------|
| `e2e/helpers/a11y.ts` | Shared helper: audit runner and violation formatter |
| `e2e/wcag-audit.spec.ts` | Tier 1 — axe-core automated scans across all routes |
| `e2e/custom-a11y.spec.ts` | Tier 2 — Custom Playwright checks for criteria axe-core misses |
| `playwright.config.ts` | Playwright configuration with webServer and reporters |
| `playwright-report/` | Generated HTML report |

## WCAG 2.1 AA Success Criteria Reference

This is the complete set of WCAG 2.1 Level A and AA success criteria. Use this as the authoritative scope for test generation.

### 1. Perceivable

| # | Criterion | Level | Automatable |
|---|-----------|-------|-------------|
| 1.1.1 | Non-text Content | A | axe-core (`image-alt`, `input-image-alt`, `object-alt`) |
| 1.2.1 | Audio-only and Video-only (Prerecorded) | A | Manual |
| 1.2.2 | Captions (Prerecorded) | A | Manual |
| 1.2.3 | Audio Description or Media Alternative | A | Manual |
| 1.2.4 | Captions (Live) | AA | Manual |
| 1.2.5 | Audio Description (Prerecorded) | AA | Manual |
| 1.3.1 | Info and Relationships | A | axe-core (`label`, `th-has-data-cells`, `list`, `listitem`, `definition-list`) |
| 1.3.2 | Meaningful Sequence | A | Partial — DOM order check |
| 1.3.3 | Sensory Characteristics | A | Manual |
| 1.3.4 | Orientation | AA | Manual |
| 1.3.5 | Identify Input Purpose | AA | Custom — check `autocomplete` attributes |
| 1.4.1 | Use of Color | A | Manual |
| 1.4.2 | Audio Control | A | Manual |
| 1.4.3 | Contrast (Minimum) | AA | axe-core (`color-contrast`) |
| 1.4.4 | Resize Text | AA | Custom — viewport zoom test |
| 1.4.5 | Images of Text | AA | Manual |
| 1.4.10 | Reflow | AA | Custom — 320px viewport test |
| 1.4.11 | Non-text Contrast | AA | Manual (axe-core partial) |
| 1.4.12 | Text Spacing | AA | Custom — inject spacing overrides |
| 1.4.13 | Content on Hover or Focus | AA | Custom — tooltip/popover test |

### 2. Operable

| # | Criterion | Level | Automatable |
|---|-----------|-------|-------------|
| 2.1.1 | Keyboard | A | Custom — tab through all interactive elements |
| 2.1.2 | No Keyboard Trap | A | Custom — tab navigation test |
| 2.1.4 | Character Key Shortcuts | A | Manual |
| 2.2.1 | Timing Adjustable | A | Manual |
| 2.2.2 | Pause, Stop, Hide | A | Manual |
| 2.3.1 | Three Flashes or Below Threshold | A | Manual |
| 2.4.1 | Bypass Blocks | A | Custom — skip link target validation |
| 2.4.2 | Page Titled | A | Custom — unique title per route |
| 2.4.3 | Focus Order | A | Custom — tab order follows visual order |
| 2.4.4 | Link Purpose (In Context) | A | axe-core (`link-name`) |
| 2.4.5 | Multiple Ways | AA | Manual |
| 2.4.6 | Headings and Labels | AA | axe-core partial (`empty-heading`) + Manual |
| 2.4.7 | Focus Visible | AA | Custom — computed style check on `:focus` |
| 2.5.1 | Pointer Gestures | A | Manual |
| 2.5.2 | Pointer Cancellation | A | Manual |
| 2.5.3 | Label in Name | A | axe-core (`label-title-only`) |
| 2.5.4 | Motion Actuation | A | Manual |

### 3. Understandable

| # | Criterion | Level | Automatable |
|---|-----------|-------|-------------|
| 3.1.1 | Language of Page | A | axe-core (`html-has-lang`, `html-lang-valid`) |
| 3.1.2 | Language of Parts | AA | Custom — detect foreign-language text, check `lang` attr |
| 3.2.1 | On Focus | A | Custom — verify no context change on focus |
| 3.2.2 | On Input | A | Custom — verify no unexpected context change |
| 3.2.3 | Consistent Navigation | AA | Custom — compare nav order across routes |
| 3.2.4 | Consistent Identification | AA | Custom — compare component labels across routes |
| 3.3.1 | Error Identification | A | Manual (requires form interaction) |
| 3.3.2 | Labels or Instructions | A | axe-core (`label`) |
| 3.3.3 | Error Suggestion | AA | Manual (requires form interaction) |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | Manual |

### 4. Robust

| # | Criterion | Level | Automatable |
|---|-----------|-------|-------------|
| 4.1.1 | Parsing | A | axe-core (`duplicate-id`) |
| 4.1.2 | Name, Role, Value | A | axe-core (`button-name`, `aria-roles`, `aria-required-attr`) |
| 4.1.3 | Status Messages | AA | Custom — check `aria-live` regions |
