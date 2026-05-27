# Micr-App Standard

Every application on `micr.fun` must adhere to these standards to ensure a consistent, high-end, "under-designed" experience.

## 1. Design Principles (Ollama-Inspired)
- **Palette**: Strictly #000000 (canvas) and #ffffff (ink), with #111111 (soft) and #a3a3a3 (body) for secondary elements.
- **Typography**: System default (`system-ui`) or SF Pro Rounded. Line height 1.5.
- **Constraints**: 
    - No gratuitous animations or high-chroma colors.
    - Borders and dividers must use `#262626` (hairline).
    - All interactive elements should use rounded corners (`12px` for cards, `9999px` for pills/buttons).
- **Layout**: Centered main container (max-width `720px`).

## 2. Structural Requirements
- **Navigation**: Every app must include a standardized "return home" link, placed either in the top-left or bottom-left corner of the viewport.
- **Accessibility**: Standard meta tags (`viewport`, `charset`) are mandatory.

## 3. Technical Integration
- **API**: Apps must communicate with the `micr.fun` backend via `/api/catalog` for listing and future interactions.
- **MCP**: If the app requires agentic management, it must expose metadata compatible with the local MCP server (`mcp-server.js`).
