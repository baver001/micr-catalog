# Conway Life Games Design

## Goal
Add two standalone games to micr.fun: a colored Conway Life simulation and a colored 3D history view where each generation is a new layer above the previous one.

## Product behavior
- `/color-life/`: 2D Conway B3/S23, RGB seed cells, neighbor color averaging for births and blending for surviving colonies.
- `/life-3d/`: same colored 2D evolution, with every generation retained as a colored layer on a rotatable canvas and rendered higher than the previous layer.
- Both games support start/pause, single-step, reset, random seed, speed, responsive controls, and a catalog back link.

## Constraints
- Plain self-contained HTML/CSS/JS; no dependencies or CDN.
- Dark micr.fun visual language; touch targets at least 44px.
- Public clean routes and catalog entries.
- Existing source tree remains category-based under `cells/games/`.
- Deploy is separate from git push and must be verified with HTTP checks and browser screenshots.

## Verification
- Node syntax checks on extracted inline JavaScript.
- Deterministic controller tests for Conway next-generation rules and RGB mixing.
- `git diff --check`.
- HTTP 200 for both routes and catalog.
- Chromium smoke test exercises reset/step and checks generation/layer UI.
