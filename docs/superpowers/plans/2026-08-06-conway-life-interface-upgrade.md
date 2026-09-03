# Conway Life Interface Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make both Conway games infinite, compact, vivid, and easier to control, with a focused/lit active layer in 3D.

**Architecture:** Keep both pages standalone. Replace finite arrays with sparse world-coordinate maps and camera transforms. Share the same tested color-mixing contract in each page: circular HSV hue averaging, preserved saturation, and normalized brightness.

**Tech Stack:** Vanilla HTML/CSS/JS, Canvas 2D, Pointer Events, no dependencies.

## Global Constraints

- Public routes remain `/color-life/` and `/life-3d/`.
- No CDN or framework.
- Controls float over the playfield and remain compact.
- Color mixing must remain vivid rather than gray.
- 3D must focus the active layer and visibly apply directional lighting.

---

### Task 1: Extend simulation tests

**Files:** `tests/life-games.test.js`

- [ ] Add failing assertions for `mixColors`, sparse `stepSparse`, and coordinate keys.
- [ ] Run `node tests/life-games.test.js`; expected failure is missing new helpers.

### Task 2: Rewrite the 2D game

**File:** `cells/games/color-life/index.html`

- [ ] Implement sparse infinite world, pan/zoom camera, viewport-only rendering, and compact overlay controls.
- [ ] Implement vivid HSV mixing and world-coordinate cell placement.
- [ ] Run unit tests and inline syntax checks.

### Task 3: Rewrite the 3D game

**File:** `cells/games/life-3d/index.html`

- [ ] Implement sparse generation snapshots and active-layer focus tracking.
- [ ] Implement drag rotation, zoom, layer slider, follow toggle, directional lighting, top/side faces, shadows, and active-layer emphasis.
- [ ] Run unit tests and inline syntax checks.

### Task 4: Deploy and verify

- [ ] Generate fresh previews.
- [ ] Deploy with `bash infra/deploy.sh`.
- [ ] Verify HTTP 200, browser controls, panning/zooming, active-layer focus and catalog previews.
- [ ] Run final tests and `git diff --check`.
