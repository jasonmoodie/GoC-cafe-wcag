# WCAG 2.1 Accessibility Issues Catalog

This document catalogs all **22 intentional WCAG 2.1 Level A and AA violations** embedded in the Café Canada demo site. Each issue is annotated in the source code with `<!-- A11Y-ISSUE #N -->` HTML comments.

---

## Level A Violations (12 Issues)

### Issue #1 — Missing alt on menu images
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 1.1.1 Non-text Content (Level A) |
| **Page** | Menu (`/menu`) |
| **File** | `src/app/pages/menu/menu.component.html` |
| **Element** | `<img [src]="item.image">` (all menu item images) |
| **Problem** | Images have no `alt` attribute, so screen readers cannot describe them |
| **axe-core Rule** | `image-alt` |
| **Fix** | Add `[alt]="item.name + ' - ' + item.description"` to each `<img>` |

### Issue #2 — Decorative image without empty alt
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 1.1.1 Non-text Content (Level A) |
| **Page** | Home (`/`) |
| **File** | `src/app/pages/home/home.component.html` |
| **Element** | `<img src="assets/images/hero-coffee.svg" class="hero-img">` |
| **Problem** | Decorative hero image has no `alt` attribute (should have `alt=""`) |
| **axe-core Rule** | `image-alt` |
| **Fix** | Add `alt=""` and `role="presentation"` |

### Issue #3 — Form inputs without associated labels
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 1.3.1 Info and Relationships (Level A) |
| **Page** | Order (`/order`) |
| **File** | `src/app/pages/order/order.component.html` |
| **Element** | `<input type="text" id="fullName">`, `<input type="email" id="email">`, `<input type="tel" id="phone">` |
| **Problem** | Uses `<span>` instead of `<label for="...">` for form field labels |
| **axe-core Rule** | `label` |
| **Fix** | Replace `<span>` with `<label for="fullName">`, etc. |

### Issue #4 — Data table without `<th>` header cells
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 1.3.1 Info and Relationships (Level A) |
| **Page** | Menu (`/menu`) |
| **File** | `src/app/pages/menu/menu.component.html` |
| **Element** | Pricing table uses `<td><strong>` instead of `<th>` for column headers |
| **Problem** | Table headers are not programmatically determinable |
| **axe-core Rule** | `td-has-header` / `th-has-data-cells` |
| **Fix** | Replace the first `<tr>` with `<thead><tr><th>` elements |

### Issue #5 — Required fields indicated by colour only
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 1.4.1 Use of Color (Level A) |
| **Page** | Order (`/order`) |
| **File** | `src/app/pages/order/order.component.html` |
| **Element** | `<span class="required-color-only">Full name</span>` |
| **Problem** | Required fields use red text as the only indicator — no asterisk, "required" text, or `aria-required` |
| **axe-core Rule** | Not directly detectable by axe-core (manual check) |
| **Fix** | Add `(required)` text, asterisk, or `aria-required="true"` on the input |

### Issue #6 — Broken skip-to-content link
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 2.4.1 Bypass Blocks (Level A) |
| **Page** | Contact (`/contact`) |
| **File** | `src/app/pages/contact/contact.component.html` |
| **Element** | Skip link targets `#main-content` but the Contact page wraps content in `#contact-content` |
| **Problem** | Skip navigation link does not land on the correct content area |
| **axe-core Rule** | Not directly detectable (custom Playwright test) |
| **Fix** | Use consistent `id="main-content"` or update skip link per page |

### Issue #7 — Generic/duplicate page title
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 2.4.2 Page Titled (Level A) |
| **Page** | About (`/about`) and all pages |
| **File** | `src/index.html` |
| **Element** | `<title>Café Canada - Home</title>` (same for all pages) |
| **Problem** | All pages share the same `<title>` — not unique or descriptive |
| **axe-core Rule** | Not directly detectable per-page (custom Playwright test) |
| **Fix** | Use Angular's `Title` service to set unique titles per route |

### Issue #8 — Non-descriptive link text
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 2.4.4 Link Purpose in Context (Level A) |
| **Page** | Home (`/`) |
| **File** | `src/app/pages/home/home.component.html` |
| **Element** | `<a routerLink="/menu">Click here</a>`, `<a routerLink="/order">Read more</a>` |
| **Problem** | Links use generic text that does not describe the destination |
| **axe-core Rule** | `link-name` (partial detection) |
| **Fix** | Use descriptive text: "View our full menu", "Start your order" |

### Issue #9 — Form errors not described in text
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 3.3.1 Error Identification (Level A) |
| **Page** | Order (`/order`) |
| **File** | `src/app/pages/order/order.component.html` |
| **Element** | `.input-error` class applies red border only; error summary says "Invalid input" with no details |
| **Problem** | Errors are indicated visually (red border) but not described in text |
| **axe-core Rule** | Not directly detectable (requires form interaction) |
| **Fix** | Add text messages identifying each specific error |

### Issue #10 — Duplicate id attributes
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 4.1.1 Parsing (Level A) |
| **Page** | Menu (`/menu`) |
| **File** | `src/app/pages/menu/menu.component.html` |
| **Element** | Two `<td id="menu-item">` elements in the pricing table |
| **Problem** | Duplicate `id` values violate HTML specification |
| **axe-core Rule** | `duplicate-id` |
| **Fix** | Use unique IDs: `id="menu-item-1"`, `id="menu-item-2"` |

### Issue #11 — Custom button without role or keyboard access
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 4.1.2 Name, Role, Value (Level A) |
| **Page** | Home (`/`) |
| **File** | `src/app/pages/home/home.component.html` |
| **Element** | `<div class="btn-primary" (click)="addToCart()">Add to Cart</div>` |
| **Problem** | A `<div>` is used as a button without `role="button"`, `tabindex="0"`, or keyboard event handler |
| **axe-core Rule** | `button-name` / `interactive-element` (partial) |
| **Fix** | Replace with `<button>` element or add `role="button"` + `tabindex="0"` + keydown handler |

### Issue #12 — Missing labels/instructions on contact form
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 3.3.2 Labels or Instructions (Level A) |
| **Page** | Contact (`/contact`) |
| **File** | `src/app/pages/contact/contact.component.html` |
| **Element** | All `<input>` and `<textarea>` elements use only `placeholder` (no `<label>`) |
| **Problem** | Placeholder text is not a substitute for labels — disappears when typing |
| **axe-core Rule** | `label` |
| **Fix** | Add visible `<label>` elements with `for` attributes |

---

## Level AA Violations (10 Issues)

### Issue #13 — Missing autocomplete on personal inputs
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 1.3.5 Identify Input Purpose (Level AA) |
| **Page** | Order (`/order`), Contact (`/contact`) |
| **File** | `src/app/pages/order/order.component.html`, `src/app/pages/contact/contact.component.html` |
| **Element** | Name, email, and phone inputs |
| **Problem** | Personal information inputs lack `autocomplete` attributes |
| **axe-core Rule** | `autocomplete-valid` (partial — only if present and invalid) |
| **Fix** | Add `autocomplete="name"`, `autocomplete="email"`, `autocomplete="tel"` |

### Issue #14 — Low contrast text
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 1.4.3 Contrast Minimum (Level AA) |
| **Page** | Home (`/`), Menu (`/menu`), Order (`/order`) |
| **File** | `src/styles.scss` |
| **Element** | `.low-contrast-text { color: #999; }` and `.helper-text { color: #999; }` on white background |
| **Problem** | Contrast ratio is approximately 2.8:1 (minimum required: 4.5:1 for normal text) |
| **axe-core Rule** | `color-contrast` |
| **Fix** | Change to `#595959` or darker for 4.5:1 ratio |

### Issue #15 — Image of text used as heading
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 1.4.5 Images of Text (Level AA) |
| **Page** | About (`/about`) |
| **File** | `src/app/pages/about/about.component.html` |
| **Element** | `<img src="assets/images/our-story-heading.svg" class="heading-image">` |
| **Problem** | "Our Story" heading is rendered as an SVG image instead of an HTML text element |
| **axe-core Rule** | Not directly detectable (manual check) |
| **Fix** | Replace with `<h2>Our story</h2>` |

### Issue #16 — Non-descriptive headings
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 2.4.6 Headings and Labels (Level AA) |
| **Page** | Cart (`/cart`) |
| **File** | `src/app/pages/cart/cart.component.html` |
| **Element** | `<h2>Section 1</h2>` and `<h2>Section 2</h2>` |
| **Problem** | Headings do not describe the content they introduce |
| **axe-core Rule** | Not directly detectable (content/semantic check) |
| **Fix** | Use descriptive text: "Your items", "Order summary" |

### Issue #17 — Suppressed focus indicators
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 2.4.7 Focus Visible (Level AA) |
| **Page** | All pages (global) |
| **File** | `src/styles.scss` |
| **Element** | `*:focus { outline: none; }` |
| **Problem** | All focus indicators are removed globally, making keyboard navigation invisible |
| **axe-core Rule** | Not directly detectable by axe-core (custom Playwright test) |
| **Fix** | Remove the rule and add custom visible focus styles |

### Issue #18 — French text without lang attribute
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 3.1.2 Language of Parts (Level AA) |
| **Page** | Footer (all pages), About (`/about`) |
| **File** | `src/app/layout/footer/footer.component.html`, `src/app/pages/about/about.component.html` |
| **Element** | French paragraph: "Savourez l'excellence canadienne..." and "Notre mission..." |
| **Problem** | French text is not wrapped in an element with `lang="fr"` |
| **axe-core Rule** | `valid-lang` (partial — checks `lang` attribute validity, not missing language changes) |
| **Fix** | Wrap French content in `<span lang="fr">` or `<div lang="fr">` |

### Issue #19 — Inconsistent navigation order
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 3.2.3 Consistent Navigation (Level AA) |
| **Page** | Contact (`/contact`) |
| **File** | `src/app/layout/header/header.component.html` |
| **Element** | Navigation menu items are reordered on the Contact page |
| **Problem** | Nav order is Home→Menu→Order→About→Contact→Cart on most pages but Contact→About→Home→Cart→Order→Menu on the Contact page |
| **axe-core Rule** | Not detectable by axe-core (custom Playwright test) |
| **Fix** | Use consistent navigation order across all pages |

### Issue #20 — Error suggestions not provided
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 3.3.3 Error Suggestion (Level AA) |
| **Page** | Order (`/order`) |
| **File** | `src/app/pages/order/order.component.html` |
| **Element** | Error summary: `<p style="color: #d3080c;">Invalid input</p>` |
| **Problem** | Generic "Invalid input" message with no suggestions for correction |
| **axe-core Rule** | Not directly detectable (requires form interaction) |
| **Fix** | Provide specific messages: "Please enter your full name", "Please enter a valid email address" |

### Issue #21 — Cart updates without aria-live
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 4.1.3 Status Messages (Level AA) |
| **Page** | Cart (`/cart`) |
| **File** | `src/app/pages/cart/cart.component.html`, `src/app/pages/cart/cart.component.ts` |
| **Element** | Cart summary totals and item removal |
| **Problem** | When items are removed or quantities change, screen readers receive no notification |
| **axe-core Rule** | Not directly detectable (requires interaction testing) |
| **Fix** | Add `aria-live="polite"` to the cart summary container |

### Issue #22 — Low contrast input borders
| Property | Value |
|----------|-------|
| **WCAG Criterion** | 1.4.11 Non-text Contrast (Level AA) |
| **Page** | Order (`/order`), Contact (`/contact`) |
| **File** | `src/styles.scss` |
| **Element** | `.form-group input, select, textarea { border: 1px solid #ddd; }` |
| **Problem** | Input border contrast ratio is approximately 1.5:1 against white background (minimum required: 3:1) |
| **axe-core Rule** | Not reliably detected by axe-core (boundary detection) |
| **Fix** | Change border colour to `#767676` or darker for 3:1+ ratio |

---

## Summary by Detection Method

### axe-core Automated Detection (8 issues)
Issues #1, #2, #3, #10, #11, #12, #14 — Detected by running `npx playwright test wcag-audit`

### Custom Playwright Tests (7 issues)
Issues #6, #7, #13, #17, #18, #19, #21 — Detected by running `npx playwright test custom-a11y`

### Manual Review Required (7 issues)
Issues #4, #5, #8, #9, #15, #16, #20, #22 — Require human review or specialized testing tools

---

## WCAG Criteria Coverage

| Criterion | Level | Issues |
|-----------|-------|--------|
| 1.1.1 Non-text Content | A | #1, #2 |
| 1.3.1 Info and Relationships | A | #3, #4 |
| 1.3.5 Identify Input Purpose | AA | #13 |
| 1.4.1 Use of Color | A | #5 |
| 1.4.3 Contrast (Minimum) | AA | #14 |
| 1.4.5 Images of Text | AA | #15 |
| 1.4.11 Non-text Contrast | AA | #22 |
| 2.4.1 Bypass Blocks | A | #6 |
| 2.4.2 Page Titled | A | #7 |
| 2.4.4 Link Purpose | A | #8 |
| 2.4.6 Headings and Labels | AA | #16 |
| 2.4.7 Focus Visible | AA | #17 |
| 3.1.2 Language of Parts | AA | #18 |
| 3.2.3 Consistent Navigation | AA | #19 |
| 3.3.1 Error Identification | A | #9 |
| 3.3.2 Labels or Instructions | A | #12 |
| 3.3.3 Error Suggestion | AA | #20 |
| 4.1.1 Parsing | A | #10 |
| 4.1.2 Name, Role, Value | A | #11 |
| 4.1.3 Status Messages | AA | #21 |
