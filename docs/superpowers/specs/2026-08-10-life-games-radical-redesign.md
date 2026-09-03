# Life Games Radical Redesign

## Scope

Refactor only `/color-life/` and `/life-3d/`. Preserve public routes, standalone HTML delivery, Canvas 2D rendering, no CDN/framework, and the existing Conway Life core behavior.

## Direction

Visual direction: **Laboratory** — nearly black graphite background, vivid red/green/blue colonies, restrained glass HUD, deliberate data typography, and a single high-contrast primary action.

## Shared shell

- Compact top header: route back-link, product label, page title, live state badge.
- Canvas remains the dominant surface with no permanent side panel.
- Bottom status bar uses stable semantic cells for generation/layer, population, and interaction hint.
- Control dock is compact on desktop and becomes a bottom sheet on narrow screens.
- All controls have visible focus, accessible names, minimum 44px touch targets, and keyboard shortcuts where safe.
- Reset is secondary/destructive-looking but not visually dominant; play is the primary action.
- Add a small intro/empty-state label that explains the interaction without covering the simulation.

## Color Life

- Retain sparse infinite world, pan, zoom, click-to-toggle, speed, step, reset.
- Add explicit state label: ready/running/paused.
- Add population delta feedback after each step.
- Make zoom level visible and provide a reset-view action.
- Draw a subtle origin crosshair and soft radial field to improve spatial orientation.

## Life 3D

- Retain sparse snapshots, layer slider, follow mode, rotation, tilt, zoom, step, reset.
- Give the active layer a clear neon outline and stronger directional top/side lighting.
- Add depth rails and layer labels so the history stack reads as a timeline.
- Make follow/manual focus state explicit and preserve manual layer selection.
- Add a compact legend for active layer, history, and camera interaction.

## Code structure

Keep each route standalone but format the document into readable sections: tokens/styles, semantic markup, tested core script, rendering/controller script. Keep `lifeGameCore` exported for the existing Node test harness. Avoid unrelated repository changes.

## Acceptance

- Existing life core tests remain green.
- New tests cover color mix boundaries, sparse generation, state formatting, and 3D layer navigation helpers.
- Inline scripts pass `node --check` after extraction.
- `git diff --check` is clean.
- Both routes return HTTP 200.
- Browser verification exercises play/step/reset, pointer/wheel interaction, and 3D layer/follow controls; if Chromium cannot start, record the concrete blocker rather than claiming visual verification.
