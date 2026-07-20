# micr.fun Mobile Catalog Design

## Status

Approved by Pavel for planning on 2026-07-20.

## Goal

Redesign the micr.fun catalog for mobile as a visual discovery surface. Real page screenshots are the primary visual signal; the header and controls must become compact and reliable on narrow screens.

## Surface

The primary surface is **Explore**: users browse an open catalog, compare applications visually, and open the item that interests them.

## Scope

### In scope

- Mobile catalog header and controls.
- One-column mobile card layout.
- Large browser-rendered PNG previews.
- Card interaction and metadata hierarchy.
- Responsive behavior at desktop widths.
- Loading, missing-image, empty-search, focus, and reduced-motion states.
- Browser-backed verification at mobile and desktop viewports.

### Out of scope

- Redesigning the individual applications.
- Changing the catalog data model.
- Creating new categories or applications.
- Replacing the current dark visual identity.
- Introducing a sticky header in the first implementation.

## Mobile composition

```text
[ logo                         ]

[ search input, full width     ]

[ All ][ Games ][ Tools ][ ... ] →

┌─────────────────────────────┐
│                             │
│       REAL SCREENSHOT       │
│                             │
│  Name                       │
└─────────────────────────────┘
Description

┌─────────────────────────────┐
│       top of next card      │
```

The selected composition is a vertical card stack with a small visible peek of the following card. This communicates continuation without adding a bottom navigation bar or extra controls.

## Header

- Keep the logo at the top with reduced vertical padding.
- Move search to its own full-width row on mobile.
- Keep category filters in one horizontal non-wrapping scroll row.
- Do not allow filters or search to overflow the viewport.
- Remove the large empty vertical gap before the first result.
- Do not make the header sticky in the first iteration; preserve maximum usable viewport height.

## Cards

- Mobile uses one column.
- Preview is nearly full width with an approximate `16:10` aspect ratio.
- Use the real PNG preview for every active catalog entry.
- Use `object-fit: cover` and `object-position: top center`.
- Add a restrained bottom gradient behind the title overlay.
- Make the entire card tappable.
- Remove the separate “Open” button.
- Put the description below the preview with readable spacing.
- Use `20–24px` vertical spacing between cards.
- Preserve a three-column desktop grid, but increase desktop preview height rather than changing the overall desktop composition.

## Visual language

- Preserve the existing dark minimal identity.
- Real screenshots are the dominant visual element.
- Do not add decorative gradients, icon grids, or unnecessary badges.
- Prefer whitespace and hierarchy over additional UI containers.
- Keep typography quiet and legible; do not introduce an oversized hero treatment.
- Hover interaction on desktop remains limited to a subtle border/background change.

## States

- **Loading:** neutral shimmer or restrained placeholder in the preview area.
- **Missing preview:** do not leave an empty broken-image card; show a neutral fallback state. Active catalog entries using fallback instead of PNG fail validation.
- **Empty search:** compact “Nothing found” state.
- **Focus:** visible keyboard focus outline for filters, search, and cards.
- **Reduced motion:** disable hover transforms and shimmer under `prefers-reduced-motion`.

## Accessibility

- Preview alt text uses the format `Screenshot: [actual application name]`.
- Interactive targets are at least `44px`.
- Text remains readable over the preview gradient.
- Filters remain semantic buttons.
- Each card has a clear accessible name and keyboard focus behavior.

## Responsive rules

- Mobile breakpoint: existing `640px` boundary may be retained if it remains stable after testing.
- Below the mobile breakpoint: one column, full-width search, horizontal filter scroller, large previews.
- Above the mobile breakpoint: preserve the existing centered max-width container and desktop grid.
- The implementation must be tested at a narrow phone viewport and a desktop viewport; no horizontal page overflow is permitted.

## Verification criteria

1. Catalog returns HTTP 200.
2. At the target mobile viewport, the logo, search, filters, and first card all fit within the viewport width.
3. Filters do not wrap into a vertical stack and search is not clipped.
4. Every active card is tappable and reaches its intended route.
5. Every active card preview loads a PNG with non-zero raster dimensions.
6. No page errors or console exceptions occur during catalog load.
7. Desktop layout retains a three-column grid and does not regress.
8. `prefers-reduced-motion` removes non-essential animation.
9. `git diff --check` and relevant syntax checks pass.

## Implementation boundary

The first implementation should be limited to the active catalog page (`index.html`) and its existing preview assets. Do not refactor individual applications or introduce a component framework for this redesign.
