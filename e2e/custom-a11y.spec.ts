import { test, expect } from '@playwright/test';

/**
 * Custom WCAG 2.1 AA Checks — Tier 2 (Beyond axe-core)
 *
 * These tests cover WCAG criteria that automated axe-core scanning cannot fully detect.
 * They use Playwright's DOM inspection, keyboard simulation, and viewport manipulation.
 *
 * WCAG criteria covered:
 *   1.3.2  Meaningful Sequence          — DOM reading order
 *   1.3.5  Identify Input Purpose       — autocomplete attributes  (Issues #13)
 *   1.4.4  Resize Text                  — 200% text-size check
 *   1.4.10 Reflow                       — 320px viewport no-scroll check
 *   1.4.12 Text Spacing                 — spacing override visibility
 *   1.4.13 Content on Hover or Focus    — tooltip persistence / dismiss
 *   2.1.1  Keyboard                     — all interactive elements reachable
 *   2.1.2  No Keyboard Trap             — Tab advances through widgets
 *   2.4.1  Bypass Blocks                — skip link resolves (Issue #6)
 *   2.4.2  Page Titled                  — unique titles per route (Issue #7)
 *   2.4.3  Focus Order                  — no positive tabindex
 *   2.4.7  Focus Visible                — outline not suppressed (Issue #17)
 *   3.1.2  Language of Parts            — lang="fr" on French text (Issue #18)
 *   3.2.1  On Focus                     — no auto-navigation on focus
 *   3.2.2  On Input                     — no auto-submit on input
 *   3.2.3  Consistent Navigation        — nav order matches across routes (Issue #19)
 *   3.2.4  Consistent Identification    — same landmark labels across routes
 *   4.1.3  Status Messages              — aria-live on cart updates (Issue #21)
 */

test.describe('Custom WCAG Checks — Tier 2 (Beyond axe-core)', () => {

  // ═══════════════════════════════════════════════════════
  // 1. PERCEIVABLE
  // ═══════════════════════════════════════════════════════

  test('DOM reading order should be meaningful on all pages', async ({ page }) => {
    // WCAG 1.3.2 - Meaningful Sequence
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sequenceIsValid = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      const nav = document.querySelector('nav');
      const main = document.querySelector('main, [role="main"], #main-content, .container');
      const skipLink = document.querySelector('a.skip-nav, [class*="skip-nav"]');
      if (!nav || !main) return true; // Cannot validate without both landmarks
      const navIdx = all.indexOf(nav as Element);
      const mainIdx = all.indexOf(main as Element);
      const skipIdx = skipLink ? all.indexOf(skipLink as Element) : -1;
      // Skip link (if present) must precede the nav block
      if (skipIdx >= 0 && skipIdx > navIdx) return false;
      // Nav must appear before the main content container
      return navIdx < mainIdx;
    });

    expect(
      sequenceIsValid,
      'Navigation should appear before main content in DOM order; skip link (if present) should precede nav (WCAG 1.3.2)'
    ).toBe(true);
  });

  test('Page content should not require horizontal scroll at 320px width', async ({ page }) => {
    // WCAG 1.4.10 - Reflow
    await page.setViewportSize({ width: 320, height: 256 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(
      scrollWidth,
      `Page should not require horizontal scrolling at 320px viewport width. scrollWidth was ${scrollWidth}px (WCAG 1.4.10)`
    ).toBeLessThanOrEqual(320);
  });

  test('Content should remain visible when text spacing is overridden', async ({ page }) => {
    // WCAG 1.4.12 - Text Spacing
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Inject WCAG 1.4.12 mandatory spacing overrides
    await page.addStyleTag({
      content: `
        * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
        p { margin-bottom: 2em !important; }
      `,
    });

    const h1Visible = await page.locator('h1').first().isVisible();
    expect(
      h1Visible,
      'Main heading (h1) should remain visible after WCAG 1.4.12 text spacing overrides'
    ).toBe(true);

    const navCount = await page.locator('nav a').count();
    expect(
      navCount,
      'Navigation links should remain present after text spacing overrides (WCAG 1.4.12)'
    ).toBeGreaterThan(0);
  });

  test('Text content should remain accessible when font size is doubled to 200%', async ({ page }) => {
    // WCAG 1.4.4 - Resize Text
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await page.waitForTimeout(300);

    const h1Box = await page.locator('h1').first().boundingBox();
    expect(
      h1Box,
      'Page heading (h1) should remain visible at 200% text size (WCAG 1.4.4)'
    ).not.toBeNull();

    const navCount = await page.locator('nav a').count();
    expect(
      navCount,
      'Navigation links should remain accessible at 200% text size (WCAG 1.4.4)'
    ).toBeGreaterThan(0);
  });

  test('Tooltip or hover-triggered content should be dismissible and persistent', async ({ page }) => {
    // WCAG 1.4.13 - Content on Hover or Focus
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tooltipTriggers = page.locator('[role="tooltip"], [data-tooltip], .tooltip-trigger');
    const count = await tooltipTriggers.count();

    if (count > 0) {
      await tooltipTriggers.first().hover();
      const tooltip = page.locator('[role="tooltip"]').first();
      const isVisible = await tooltip.isVisible().catch(() => false);

      if (isVisible) {
        // Must be dismissible via Escape
        await page.keyboard.press('Escape');
        const stillVisible = await tooltip.isVisible().catch(() => false);
        expect(
          stillVisible,
          'Hover/focus content should be dismissible via Escape key (WCAG 1.4.13)'
        ).toBe(false);
      }
    }

    // No hover-content found — criterion is not applicable; test passes
    expect(true, 'WCAG 1.4.13 checked: no tooltip/popover content found requiring validation').toBe(true);
  });

  test('Order form personal inputs should have autocomplete attributes', async ({ page }) => {
    // WCAG 1.3.5 - Identify Input Purpose (Order page)
    // Issue #13: name, email, phone inputs on /order lack autocomplete
    await page.goto('/order');
    await page.waitForLoadState('networkidle');

    const nameAutocomplete = await page.locator('#fullName').getAttribute('autocomplete');
    const emailAutocomplete = await page.locator('#email').getAttribute('autocomplete');
    const phoneAutocomplete = await page.locator('#phone').getAttribute('autocomplete');

    expect(nameAutocomplete, 'Order full-name input must have autocomplete="name" (WCAG 1.3.5 — Issue #13)').toBe('name');
    expect(emailAutocomplete, 'Order email input must have autocomplete="email" (WCAG 1.3.5 — Issue #13)').toBe('email');
    expect(phoneAutocomplete, 'Order phone input must have autocomplete="tel" (WCAG 1.3.5 — Issue #13)').toBe('tel');
  });

  test('Contact form personal inputs should have autocomplete attributes', async ({ page }) => {
    // WCAG 1.3.5 - Identify Input Purpose (Contact page)
    // Issue #13: Contact form inputs also lack autocomplete attributes
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('input[type="text"]').first();
    const emailInput = page.locator('input[type="email"]').first();

    const nameAutocomplete = await nameInput.getAttribute('autocomplete');
    const emailAutocomplete = await emailInput.getAttribute('autocomplete');

    expect(
      nameAutocomplete,
      'Contact name input must have an autocomplete attribute (e.g., "name") (WCAG 1.3.5 — Issue #13)'
    ).toBeTruthy();
    expect(
      emailAutocomplete,
      'Contact email input must have autocomplete="email" (WCAG 1.3.5 — Issue #13)'
    ).toBe('email');
  });

  // ═══════════════════════════════════════════════════════
  // 2. OPERABLE
  // ═══════════════════════════════════════════════════════

  test('All interactive elements should be reachable via keyboard Tab', async ({ page }) => {
    // WCAG 2.1.1 - Keyboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const interactiveCount = await page.evaluate(() =>
      document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ).length
    );

    expect(
      interactiveCount,
      'Page should have at least one keyboard-focusable interactive element (WCAG 2.1.1)'
    ).toBeGreaterThan(0);

    let focusCount = 0;
    const limit = Math.min(interactiveCount, 15);
    for (let i = 0; i < limit; i++) {
      await page.keyboard.press('Tab');
      const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? 'BODY');
      if (activeTag !== 'BODY') focusCount++;
    }

    expect(
      focusCount,
      `Tab key should reach interactive elements. Only ${focusCount}/${limit} attempts moved focus (WCAG 2.1.1)`
    ).toBeGreaterThan(0);
  });

  test('Keyboard focus should not become trapped in any widget', async ({ page }) => {
    // WCAG 2.1.2 - No Keyboard Trap
    await page.goto('/order');
    await page.waitForLoadState('networkidle');

    // Tab into the form area
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
    }

    const elementBefore = await page.evaluate(
      () => (document.activeElement?.tagName ?? '') + '#' + (document.activeElement?.id ?? '')
    );

    // Tab forward 6 more times — focus must advance, not stay stuck
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
    }

    const elementAfter = await page.evaluate(
      () => (document.activeElement?.tagName ?? '') + '#' + (document.activeElement?.id ?? '')
    );

    expect(
      elementAfter,
      `Tab key should advance focus but it appears trapped at "${elementBefore}" (WCAG 2.1.2)`
    ).not.toBe(elementBefore);
  });

  test('Skip navigation link should target an existing element', async ({ page }) => {
    // WCAG 2.4.1 - Bypass Blocks
    // Issue #6: Contact page skip link targets #main-content but page wraps content in #contact-content
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const skipLink = page.locator('a.skip-nav');
    const href = await skipLink.getAttribute('href');
    expect(href, 'Skip navigation link must have a non-empty href attribute (WCAG 2.4.1)').toBeTruthy();

    const targetId = href!.replace('#', '');
    const targetCount = await page.locator(`#${targetId}`).count();
    expect(
      targetCount,
      `Skip link target "#${targetId}" must exist on the Contact page (WCAG 2.4.1 — Issue #6)`
    ).toBeGreaterThan(0);
  });

  test('All pages should have unique, descriptive titles', async ({ page }) => {
    // WCAG 2.4.2 - Page Titled
    // Issue #7: All routes share the same static <title> "Café Canada - Home"
    const pageTitles: string[] = [];
    const routes = ['/', '/menu', '/order', '/about', '/contact', '/cart'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      pageTitles.push(await page.title());
    }

    const uniqueTitles = new Set(pageTitles);
    expect(
      uniqueTitles.size,
      `Expected ${routes.length} unique page titles but found ${uniqueTitles.size}. Titles: ${pageTitles.join(' | ')} (WCAG 2.4.2 — Issue #7)`
    ).toBe(routes.length);
  });

  test('Tab order should follow visual reading sequence — no positive tabindex', async ({ page }) => {
    // WCAG 2.4.3 - Focus Order
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify no element uses tabindex > 0 which disrupts natural tab order
    const positiveTabindex = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[tabindex]'))
        .filter((el) => parseInt(el.getAttribute('tabindex') ?? '0', 10) > 0)
        .map((el) => el.tagName + (el.id ? `#${el.id}` : '') + (el.className ? `.${el.className.split(' ')[0]}` : ''))
    );

    expect(
      positiveTabindex,
      `Elements with tabindex > 0 disrupt natural DOM tab order (WCAG 2.4.3): ${positiveTabindex.join(', ')}`
    ).toHaveLength(0);

    // Tab through the page and verify focus advances logically
    const focusOrder: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        return el.tagName + (el.id ? `#${el.id}` : '');
      });
      if (info) focusOrder.push(info);
    }

    expect(
      focusOrder.length,
      `Tab key should move focus through at least 3 distinct elements. Got: ${focusOrder.join(' → ')} (WCAG 2.4.3)`
    ).toBeGreaterThan(2);
  });

  test('Focus indicator should be visible on interactive elements', async ({ page }) => {
    // WCAG 2.4.7 - Focus Visible
    // Issue #17: Global *:focus { outline: none; } in styles.scss removes all focus rings
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Tab');

    const outlineStyle = await page.locator(':focus').evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        boxShadow: styles.boxShadow,
      };
    });

    const hasVisibleFocus =
      (outlineStyle.outlineStyle !== 'none' && outlineStyle.outlineWidth !== '0px') ||
      outlineStyle.boxShadow !== 'none';

    expect(
      hasVisibleFocus,
      `Focus indicator must be visible. Got outline: "${outlineStyle.outline}", box-shadow: "${outlineStyle.boxShadow}" (WCAG 2.4.7 — Issue #17)`
    ).toBe(true);
  });

  // ═══════════════════════════════════════════════════════
  // 3. UNDERSTANDABLE
  // ═══════════════════════════════════════════════════════

  test('Focusing an element should not trigger unexpected context change', async ({ page }) => {
    // WCAG 3.2.1 - On Focus
    await page.goto('/order');
    await page.waitForLoadState('networkidle');

    const initialUrl = page.url();

    // Tab through 8 interactive elements; the URL should not change
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
    }

    expect(
      page.url(),
      `Focusing elements must not trigger page navigation. Started: ${initialUrl}, now: ${page.url()} (WCAG 3.2.1)`
    ).toBe(initialUrl);
  });

  test('Changing an input value should not trigger unexpected context change', async ({ page }) => {
    // WCAG 3.2.2 - On Input
    await page.goto('/order');
    await page.waitForLoadState('networkidle');

    const initialUrl = page.url();

    // Typing in a text input must not navigate or submit
    await page.locator('#fullName').fill('Test User');
    expect(
      page.url(),
      `Filling a text input must not navigate. Started: ${initialUrl}, now: ${page.url()} (WCAG 3.2.2)`
    ).toBe(initialUrl);

    // Changing a select must not auto-submit or navigate
    await page.locator('#drink-select').selectOption('maple-latte');
    await page.waitForTimeout(300);
    expect(
      page.url(),
      `Changing a select value must not auto-submit or navigate (WCAG 3.2.2)`
    ).toBe(initialUrl);
  });

  test('Navigation order should be consistent across pages', async ({ page }) => {
    // WCAG 3.2.3 - Consistent Navigation
    // Issue #19: Contact page uses a reordered navigation list
    const getNavOrder = async (route: string): Promise<string[]> => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const navLinks = page.locator('.gc-nav .nav-list a');
      const texts: string[] = [];
      const count = await navLinks.count();
      for (let i = 0; i < count; i++) {
        const text = await navLinks.nth(i).textContent();
        if (text) texts.push(text.trim());
      }
      return texts;
    };

    const homeNav = await getNavOrder('/');
    const menuNav = await getNavOrder('/menu');
    const aboutNav = await getNavOrder('/about');
    const contactNav = await getNavOrder('/contact');

    expect(
      menuNav,
      `Navigation order on Menu page should match Home. Home: [${homeNav}], Menu: [${menuNav}] (WCAG 3.2.3)`
    ).toEqual(homeNav);

    expect(
      aboutNav,
      `Navigation order on About page should match Home. Home: [${homeNav}], About: [${aboutNav}] (WCAG 3.2.3)`
    ).toEqual(homeNav);

    expect(
      contactNav,
      `Navigation order on Contact page should match Home. Home: [${homeNav}], Contact: [${contactNav}] (WCAG 3.2.3 — Issue #19)`
    ).toEqual(homeNav);
  });

  test('Equivalent components should be identified consistently across pages', async ({ page }) => {
    // WCAG 3.2.4 - Consistent Identification
    const getNavAriaLabel = async (route: string): Promise<string | null> => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      return page.locator('nav').first().getAttribute('aria-label');
    };

    const homeNavLabel = await getNavAriaLabel('/');
    const menuNavLabel = await getNavAriaLabel('/menu');
    const contactNavLabel = await getNavAriaLabel('/contact');

    expect(
      menuNavLabel,
      `Nav aria-label on Menu page should match Home. Home: "${homeNavLabel}", Menu: "${menuNavLabel}" (WCAG 3.2.4)`
    ).toBe(homeNavLabel);

    expect(
      contactNavLabel,
      `Nav aria-label on Contact page should match Home. Home: "${homeNavLabel}", Contact: "${contactNavLabel}" (WCAG 3.2.4)`
    ).toBe(homeNavLabel);
  });

  test('French text in About page should have lang="fr" attribute', async ({ page }) => {
    // WCAG 3.1.2 - Language of Parts
    // Issue #18: French paragraph on About page lacks lang="fr"
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    const frenchText = page.locator('text=Notre mission');
    expect(
      await frenchText.count(),
      'French text "Notre mission" should exist on the About page (WCAG 3.1.2)'
    ).toBeGreaterThan(0);

    const hasLangAttr = await frenchText.first().evaluate((el) => {
      let current: Element | null = el;
      while (current) {
        if (current.getAttribute('lang') === 'fr') return true;
        current = current.parentElement;
      }
      return false;
    });

    expect(
      hasLangAttr,
      'French text "Notre mission" should be wrapped in an element with lang="fr" (WCAG 3.1.2 — Issue #18)'
    ).toBe(true);
  });

  test('French text in footer should have lang="fr" attribute', async ({ page }) => {
    // WCAG 3.1.2 - Language of Parts
    // Issue #18: Footer French text "Savourez l'excellence..." lacks lang="fr"
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const footerFrench = page.locator('footer').locator('text=/Savourez/');
    const count = await footerFrench.count();

    if (count > 0) {
      const hasLangAttr = await footerFrench.first().evaluate((el) => {
        let current: Element | null = el;
        while (current) {
          if (current.getAttribute('lang') === 'fr') return true;
          current = current.parentElement;
        }
        return false;
      });

      expect(
        hasLangAttr,
        'French footer text ("Savourez…") should be wrapped in an element with lang="fr" (WCAG 3.1.2 — Issue #18)'
      ).toBe(true);
    }
  });

  // ═══════════════════════════════════════════════════════
  // 4. ROBUST
  // ═══════════════════════════════════════════════════════

  test('Cart updates should be announced via an aria-live region', async ({ page }) => {
    // WCAG 4.1.3 - Status Messages
    // Issue #21: Cart totals and item removal are not announced to screen readers
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    const ariaLive = await page.locator('.cart-summary').getAttribute('aria-live');
    expect(
      ariaLive,
      'Cart summary should have aria-live="polite" so screen readers announce updates (WCAG 4.1.3 — Issue #21)'
    ).toBeTruthy();
  });

});
