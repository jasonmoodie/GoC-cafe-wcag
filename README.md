# Cafe Canada - WCAG 2.1 Accessibility Demo Site

A deliberately flawed Angular demo site styled after Canada.ca (GCWeb theme) for demonstrating how **GitHub Copilot prompts and skills** combined with **Playwright + axe-core** can detect WCAG 2.1 Level A and AA compliance issues.

## Purpose

This project serves as a training and demonstration tool for:

- Using GitHub Copilot to identify and fix accessibility issues
- Running automated WCAG audits with Playwright and axe-core
- Understanding WCAG 2.1 Level A and AA success criteria
- Following the Canada.ca Content Style Guide and GCWeb design system

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| **Angular 18** (TypeScript) | Frontend framework |
| **Sass (SCSS)** | Styling (superset of CSS) |
| **GCWeb/WET Theme** | Canada.ca design system (close replica) |
| **Playwright** | End-to-end testing framework |
| **axe-core** | Automated accessibility testing engine |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Open in browser
# http://localhost:4200
```

## Running Accessibility Tests

```bash
# Run all WCAG audit tests (expects failures - this is intentional)
npx playwright test

# Run only the axe-core automated scans
npx playwright test wcag-audit

# Run custom accessibility checks (nav consistency, focus, lang attributes)
npx playwright test custom-a11y

# View HTML test report
npx playwright show-report
```

## Demo Walkthrough

### Step 1: Explore the site
Browse the 6 pages to see the coffee shop application styled after Canada.ca

### Step 2: Run the automated audit
```bash
npx playwright test wcag-audit
```
All tests will **fail** because the site contains intentional accessibility issues.

### Step 3: Use GitHub Copilot to analyze
Use Copilot prompts like:
- "Analyze the Playwright test results and explain each WCAG violation"
- "Fix the accessibility issues in the Order page"
- "What WCAG 2.1 AA criteria does this page violate?"

### Step 4: Run custom checks
```bash
npx playwright test custom-a11y
```
These tests catch issues that automated scanning alone cannot detect.

## Site Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero banner, featured drinks, community links |
| Menu | `/menu` | Coffee, tea, pastry, and food listings with pricing table |
| Order | `/order` | Order form with personal info, drink selection, pickup location |
| About | `/about` | Company story, team section, values, French mission statement |
| Contact | `/contact` | Contact form, location addresses, hours of operation |
| Cart | `/cart` | Shopping cart with quantity controls and checkout |

## Intentional Accessibility Issues

This site contains **22 intentional WCAG 2.1 violations** across Level A and AA criteria. See [ISSUES-CATALOG.md](ISSUES-CATALOG.md) for the full annotated catalog with WCAG criterion references, page locations, and expected axe-core detection rules.

## Project Structure

```
src/
  app/
    layout/
      header/          # GCWeb header (GC signature, nav, breadcrumbs)
      footer/          # GCWeb footer (3-band: contextual, main, sub-footer)
    pages/
      home/            # Issues: #2, #8, #11, #14
      menu/            # Issues: #1, #4, #10, #14
      order/           # Issues: #3, #5, #9, #13, #20, #22
      about/           # Issues: #7, #15, #18
      contact/         # Issues: #6, #12, #19
      cart/            # Issues: #16, #21
  styles.scss          # Global styles with issues #17, #22
  index.html           # GCWeb CDN assets
e2e/
  helpers/a11y.ts      # Shared axe-core audit helper
  wcag-audit.spec.ts   # Automated axe-core WCAG scans per page
  custom-a11y.spec.ts  # Manual Playwright checks for criteria axe cannot detect
playwright.config.ts   # Playwright configuration with Angular dev server
```

## Canada.ca Design Compliance

This demo site implements a **close replica** of the GCWeb (Government of Canada Web Experience Toolkit) design:

- Government of Canada signature (red flag + bilingual text)
- Language toggle (English/French)
- Search box
- Navigation bar with consistent menu items
- Breadcrumb trail
- Three-band footer structure
- Canada wordmark in sub-footer

## References

- [WCAG 2.1 Specification](https://www.w3.org/TR/WCAG21/)
- [Canada.ca Content Style Guide](https://design.canada.ca/style-guide/)
- [GCWeb Theme](https://wet-boew.github.io/GCWeb/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
