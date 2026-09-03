# Life 3D Drawing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 3D Life page with a restrained layered simulation where the user can add exactly one colored cube at a time to the current top layer.

**Architecture:** Keep the existing standalone HTML route and `window.lifeGameCore` test seam. Use sparse `Map` snapshots for Conway evolution, a Canvas 2D renderer for the layered 3D projection, and pointer ray-plane math to map clicks/drags to one grid cell on the active top layer. The UI is a small top status strip and bottom control dock; no glow, particles, pulses, eraser, patterns, or brush-size control.

**Tech Stack:** Standalone HTML, CSS, vanilla JavaScript, Canvas 2D, Node `vm` core tests.

## Global Constraints

- Preserve route: `/life-3d/` and file: `cells/games/life-3d/index.html`.
- Preserve `window.lifeGameCore` and existing Conway/color helper contracts.
- Add-only editing: click/drag adds or recolors one cell; no erase operation.
- One cube per pointer position/grid cell; no brush-size setting.
- No bloom, glow, particles, or generation light pulse.
- Canvas remains the dominant surface; controls must not occupy the central simulation area.
- Do not deploy or commit unless separately requested.

---

### Task 1: Test the add-only core contract

**Files:**
- Modify: `tests/life-games.test.js`
- Modify: `cells/games/life-3d/index.html` (`life-core` script only after tests are red)

- [ ] Add assertions for `addCell(map, key, color)` returning a new map, adding one cell, and replacing an existing cell's color without mutating the input.
- [ ] Add assertions for `gridKeyFromPoint(x, y)` rounding to integer grid coordinates.
- [ ] Run `node tests/life-games.test.js`; expected failure should identify the missing exported helper.
- [ ] Implement only the minimal helpers and export them from `lifeGameCore`.
- [ ] Run the test again and confirm all assertions pass.

### Task 2: Implement the minimal add-only 3D game

**Files:**
- Modify: `cells/games/life-3d/index.html`

- [ ] Replace the current visual shell with a nearly black canvas, compact status text, and a bottom dock containing only play/pause, step, restart, speed, and color controls.
- [ ] Keep sparse Conway snapshots and HSV circular color mixing; add a fresh top snapshot when stepping.
- [ ] Make the current top layer the only editable plane.
- [ ] Map pointer click and drag positions to the current layer using the inverse camera projection, add exactly one cell per grid coordinate, and prevent duplicate additions during a drag.
- [ ] Keep mouse/touch camera rotation and wheel zoom, while preventing drawing when the pointer starts on a control.
- [ ] Render cubes with flat standard lighting: top face lighter, side faces darker, older layers more transparent/dim, current layer clearer. Do not use shadow/glow/postprocessing effects.
- [ ] Keep the camera slowly rotating only when not dragging and keep the center area unobstructed.
- [ ] Preserve accessible button labels and touch-friendly controls.

### Task 3: Verify the artifact

**Files:**
- Test: `tests/life-games.test.js`
- Verify: `cells/games/life-3d/index.html`

- [ ] Extract inline scripts and run `node --check` on each extracted script.
- [ ] Run `node tests/life-games.test.js` and the repository's relevant smoke test.
- [ ] Run `git diff --check`.
- [ ] Serve the repository locally and use Chromium/Playwright to verify initial render, pause, step, restart, color selection, and click/drag add behavior; collect page errors and console errors.
- [ ] Verify the route responds with HTTP 200 locally. Report deployment as not performed unless explicitly requested.
