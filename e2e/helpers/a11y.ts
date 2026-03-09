import { Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

export interface A11yResult {
  violations: Array<{
    id: string;
    impact: string;
    description: string;
    helpUrl: string;
    nodes: Array<{
      html: string;
      target: string[];
    }>;
  }>;
}

/**
 * Runs an axe-core accessibility audit on the given page/path.
 * Targets WCAG 2.1 Level A and AA criteria.
 */
export async function runAccessibilityAudit(
  page: Page,
  path: string
): Promise<A11yResult> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  return results as unknown as A11yResult;
}

/**
 * Formats violation results into a readable string for test output.
 */
export function formatViolations(violations: A11yResult['violations']): string {
  if (violations.length === 0) {
    return 'No accessibility violations found.';
  }

  return violations
    .map((v) => {
      const nodes = v.nodes
        .map((n) => `    - ${n.target.join(', ')}\n      ${n.html.substring(0, 120)}`)
        .join('\n');
      return `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n  Help: ${v.helpUrl}\n  Elements:\n${nodes}`;
    })
    .join('\n\n');
}
