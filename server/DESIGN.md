# Design System: micr.fun

## Design Philosophy
"Under-designed" and geometric. The system is the documentation.

- **Canvas:** Paper-white (`#ffffff`).
- **Geometry:** 9999px (pill) for interactive elements, 12px for cards.
- **Elevation:** 0. Flat layout. No shadows. 1px hairline borders for cards.
- **Brand:** Pure black (`#000000`) for all actions.

## Palette
- **Canvas:** `#ffffff`
- **Soft Surface:** `#fafafa`
- **Surface Dark:** `#171717` (Max pricing/inverted)
- **Hairline:** `#e5e5e5`
- **Hairline Strong:** `#d4d4d4`
- **Primary:** `#000000` (Ink)
- **Ink Deep:** `#090909`
- **Charcoal:** `#525252`
- **Body:** `#737373`
- **Mute:** `#a3a3a3`
- **Terminal Colors:** Red (#ff5f56), Yellow (#ffbd2e), Green (#27c93f)
- **Focus Ring:** `rgba(59,130,246,0.5)`

## Typography
- **Headings:** SF Pro Rounded (500-600 weight)
- **Body:** ui-sans-serif / system-ui
- **Code:** ui-monospace / SFMono-Regular

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| Display XL | 36px | 500 | 1.11 | Hero headline |
| Heading LG | 24px | 600 | 1.33 | Section subheading |
| Body MD | 16px | 400 | 1.5 | Default body |
| Code MD | 16px | 400 | 1.5 | Install snippet |
| Button MD | 14px | 500 | 1.0 | Action labels |

## Layout & Responsive
- **Content Width:** 720px max.
- **Section Rhythm:** 88px (desktop) → 64px (tablet) → 48px (mobile).
- **Interactive:** 9999px border-radius (pill).
- **Cards:** 12px border-radius.
- **Navigation:** Tablet-narrow (768px) hamburger drawer.
- **Pricing Grid:** 3-up (desktop) → 1-up (mobile).
