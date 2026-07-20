# micr.fun Mobile Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the micr.fun catalog a visual-first mobile Explore surface with reliable full-width controls, large real screenshots, tappable cards, and verified responsive behavior.

**Architecture:** Keep the current single-file catalog implementation in `index.html`; do not introduce a framework or change the catalog data model. The mobile breakpoint will override header layout, filter scrolling, card proportions, and card metadata while preserving the existing desktop grid. Existing PNG previews remain the source of truth and are validated in Chromium.

**Tech Stack:** Static HTML, inline CSS/JavaScript, existing PNG previews, Playwright Chromium verification, no new runtime dependencies.

## Global Constraints

- Preserve the dark minimal micr.fun visual identity.
- Primary surface is **Explore**, not a hero or marketing landing page.
- Real PNG screenshots are required for every active catalog card.
- Mobile cards use one column and the whole card is tappable.
- Mobile search is full width and filters remain one horizontal non-wrapping row.
- Mobile preview target is approximately `16:10` with `object-fit: cover` and `object-position: top center`.
- Touch targets must be at least `44px`.
- Do not introduce a sticky header in this iteration.
- Respect `prefers-reduced-motion`.
- Do not refactor individual applications or add a component framework.

---

### Task 1: Establish the mobile header layout

**Files:**
- Modify: `index.html:50-140` (header, controls, search, and filter CSS)
- Modify: `index.html:393-414` only if semantic wrappers need adjustment

**Interfaces:**
- Consumes: existing `.header`, `.header-top`, `.controls`, `.filters`, `.search-wrap`, `.filter-btn` selectors and current filter JavaScript.
- Produces: a mobile header where the logo is visible, search occupies the full available width, and filters are a single horizontal scroll row.

- [ ] **Step 1: Add the mobile layout rules**

Add inside the existing `@media (max-width: 640px)` block:

```css
.header {
  padding: 16px 16px 8px;
}

.header-top {
  display: block;
  margin-bottom: 0;
}

.header-left {
  min-height: 24px;
  margin-bottom: 14px;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.search-wrap,
.search-wrap input {
  width: 100%;
}

.filters {
  width: calc(100vw - 32px);
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 8px;
  padding: 2px 0 6px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.filters::-webkit-scrollbar {
  display: none;
}

.filter-btn {
  flex: 0 0 auto;
  min-height: 44px;
  padding: 9px 15px;
}

.main {
  padding: 12px 16px 48px;
}
```

Do not change the desktop rules in this step.

- [ ] **Step 2: Verify the header at a narrow viewport**

Run a Playwright assertion against `http://127.0.0.1:4173/` at `390×844` and inspect:

```js
const metrics = await page.evaluate(() => ({
  bodyWidth: document.body.scrollWidth,
  viewportWidth: window.innerWidth,
  searchWidth: document.querySelector('#search').getBoundingClientRect().width,
  filterWrap: getComputedStyle(document.querySelector('.filters')).flexWrap,
  filterOverflow: getComputedStyle(document.querySelector('.filters')).overflowX
}));
```

Expected: `bodyWidth <= viewportWidth`, search width close to `358px`, `filterWrap === 'nowrap'`, and horizontal overflow belongs to `.filters`, not `body`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: make catalog controls mobile-safe"
```

---

### Task 2: Make mobile cards visual-first and fully tappable

**Files:**
- Modify: `index.html:141-240` (grid/card CSS)
- Modify: `index.html:448-480` (card rendering)

**Interfaces:**
- Consumes: existing `renderApps()`, `.app-card`, `.card-preview`, `.card-desc`, `.card-action` markup and `APPS` data.
- Produces: one-column visual cards with large PNG previews, no separate Open button, accessible card links, and description below the preview.

- [ ] **Step 1: Remove the redundant card action from the render template**

In the card template, remove the separate action button line:

```js
<div class="card-action">Открыть <span>→</span></div>
```

Keep the existing click handler only if it is still needed for the card container; otherwise use the card’s existing navigation behavior. The card must remain keyboard accessible; add `tabindex="0"`, `role="link"`, and `aria-label="Открыть ${app.name}"` to the `.app-card` element if it is currently only a `div`.

- [ ] **Step 2: Add the visual-first card rules**

Use these rules for the mobile card layout:

```css
.app-grid {
  grid-template-columns: 1fr;
  gap: 24px;
}

.app-card {
  min-width: 0;
}

.card-preview {
  height: auto;
  aspect-ratio: 16 / 10;
}

.card-title-overlay {
  padding: 28px 16px 14px;
  background: linear-gradient(transparent, rgba(0,0,0,0.82));
  font-size: 17px;
}

.card-desc {
  padding: 12px 16px 16px;
  font-size: 14px;
  line-height: 1.55;
}
```

Add `:focus-visible` styling with a 2px accent outline and a 3px outline offset. Preserve desktop preview behavior through the existing desktop rules and constrain the new aspect ratio to the mobile media query if desktop proportions regress.

- [ ] **Step 3: Add reduced-motion behavior**

Add:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

- [ ] **Step 4: Verify card rendering**

At `390×844`, assert:

```js
const cards = await page.locator('.app-card').count();
const images = await page.locator('.app-card img').evaluateAll(xs => xs.map(x => ({
  width: x.naturalWidth,
  height: x.naturalHeight,
  alt: x.alt
})));
```

Expected: card count equals the active `APPS` length; every image has `naturalWidth > 1000`, `naturalHeight > 500`, and a non-empty screenshot alt; no card action button exists.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: make catalog cards visual-first on mobile"
```

---

### Task 3: Verify mobile and desktop behavior end-to-end

**Files:**
- Modify: `index.html` only if a verification failure exposes a regression
- Test artifact: `/tmp/micr-fun-mobile-catalog-check.mjs` (do not commit)

**Interfaces:**
- Consumes: the completed catalog page and active PNG previews.
- Produces: deterministic browser verification for mobile layout, desktop grid, card routes, images, console errors, and overflow.

- [ ] **Step 1: Run static checks**

```bash
cd /root/projects/micr.fun
git diff --check
python3 - <<'PY'
from pathlib import Path
import re
s = Path('index.html').read_text()
assert 'id="search"' in s
assert 'class="app-grid"' in s
assert 'prefers-reduced-motion' in s
print('static checks: OK')
PY
```

Expected: `static checks: OK` and no diff errors.

- [ ] **Step 2: Run the browser verification script**

Serve the repository with the existing local static server on port `4173`, then run a Playwright script that:

1. Opens `/` at `390×844` and `1440×900`.
2. Captures `pageerror` events.
3. Asserts HTTP `200`.
4. Asserts mobile body width does not exceed viewport width.
5. Asserts mobile search width is at least viewport width minus `32px`.
6. Asserts filters have `flex-wrap: nowrap` and horizontal overflow.
7. Asserts mobile card preview width/height ratio is between `1.45` and `1.75`.
8. Asserts all active preview images have raster dimensions above `1000×500`.
9. Clicks the first card and confirms navigation changes to its configured URL.
10. Asserts desktop `.app-grid` has three columns at `1440px`.

Expected output:

```text
mobile: OK
images: OK
routes: OK
desktop: OK
console: OK
```

- [ ] **Step 3: Inspect a real mobile screenshot**

Capture the final `390×844` viewport to `/tmp/micr-fun-mobile-final.png` and inspect it visually. Confirm the logo, full-width search, one-row filters, first large screenshot, description, and the beginning of the next card are visible without horizontal clipping.

- [ ] **Step 4: Commit the final verified change**

If Task 3 required a source fix:

```bash
git add index.html
git commit -m "test: verify responsive catalog layout"
```

Otherwise, keep the two feature commits and report the verification output without creating a no-op commit.

- [ ] **Step 5: Push and verify production**

```bash
GIT_SSH_COMMAND='ssh -i /root/.ssh/id_rsa -o IdentitiesOnly=yes' git push origin main
curl -fsS https://micr.fun/ >/dev/null
```

Then repeat the browser assertions against `https://micr.fun/` and confirm the deployed catalog commit matches local `HEAD`.
