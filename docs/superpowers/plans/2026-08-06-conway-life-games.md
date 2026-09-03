# Conway Life Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two verified colored Conway Life games to micr.fun and publish them at clean routes.

**Architecture:** Two self-contained pages under `cells/games/`, each exposing pure simulation helpers through `window.lifeGame` for deterministic Node tests. The 2D page renders a colored grid; the 3D page stores generation snapshots and projects them onto a rotatable canvas. Catalog metadata and deploy aliases are updated without adding dependencies.

**Tech Stack:** Plain HTML, CSS, Canvas 2D, vanilla JavaScript, Node.js syntax/test scripts, nginx static deployment.

## Global Constraints

- No external dependencies or CDN assets.
- Public routes are `/color-life/` and `/life-3d/`.
- Source files live under `cells/games/`.
- RGB mixing uses arithmetic channel averages of live neighbors.
- 3D generation history is rendered as layers increasing on Z.
- Do not commit or push without explicit request.

---

### Task 1: Add deterministic simulation core and 2D game

**Files:**
- Create: `cells/games/color-life/index.html`
- Create: `tests/life-games.test.js`

- [ ] Add tests for Conway B3/S23 birth/survival and RGB neighbor averaging.
- [ ] Run `node tests/life-games.test.js` and observe the expected missing-helper failure.
- [ ] Implement `nextGeneration`, `averageColors`, reset, step, play/pause, and responsive canvas/grid rendering in `color-life/index.html`.
- [ ] Run the tests and syntax check; expected result is zero failures.

### Task 2: Add colored 3D history game

**Files:**
- Create: `cells/games/life-3d/index.html`

- [ ] Reuse the same B3/S23 and RGB mixing semantics locally so the page is standalone.
- [ ] Store each generation snapshot in `layers`, render each snapshot at a larger Z offset, and support pointer drag rotation plus wheel/pinch-friendly zoom.
- [ ] Add controls and visible generation/layer status.
- [ ] Run Node syntax validation on the inline script.

### Task 3: Register routes and catalog metadata

**Files:**
- Modify: `index.html` APPS and category/color maps.
- Modify: `data/graph.json` with `color-life` and `life-3d` entries.
- Modify: `infra/deploy.sh` clean-route aliases.

- [ ] Add both games to the games category with clean URLs and direct descriptions.
- [ ] Add graph metadata in both languages.
- [ ] Ensure deploy copies both source pages and creates both aliases.
- [ ] Validate JSON and shell syntax.

### Task 4: Deploy and browser-verify

**Files:**
- Create: `data/previews/color-life.png`
- Create: `data/previews/life-3d.png`

- [ ] Run tests, syntax checks, and `git diff --check`.
- [ ] Run `bash infra/deploy.sh`.
- [ ] Verify catalog and both public routes return HTTP 200.
- [ ] Generate real screenshots from the public routes and verify each app responds to a step/reset interaction in Chromium.
- [ ] Report only confirmed local/deployed results.
