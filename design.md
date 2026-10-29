# Snip Design System

A quiet, dark interface with a centered product hero, warm light at the top edge, and one prominent rounded URL composer. Use the tokens below for future styling; do not reuse another product's logo or copy.

## Tokens

| Token | Value |
|---|---|
| Background | `#0C0B0D` |
| Surface | `#151316` |
| Raised surface | `#1C191D` |
| Primary text | `#F7F2F1` |
| Muted text | `#B2A7A7` |
| Strong muted text | `#D0C4C3` |
| Border | `rgb(255 242 240 / 11%)` |
| Strong border | `rgb(255 242 240 / 17%)` |
| Accent gradient | `linear-gradient(110deg, #FF796C, #EB79A0 54%, #FFB16D)` |
| Font stack | `"Avenir Next", "Trebuchet MS", sans-serif` |
| Type scale | 11px metadata, 13-14px controls/body, 22px section headings, 46px hero title |
| Spacing | 4, 8, 12, 16, 24, 34, 48, 74px |
| Radii | 5px compact controls, 18px surfaces, 24px composer, 999px URL input/action |
| Shadow | `0 22px 70px rgb(0 0 0 / 28%)`; use restrained warm edge glow on the composer |

## Layout Mapping

- **Page header:** Keep the Snip mark and API status in a restrained top row. Center the title and link count beneath it as the hero.
- **URL form:** Make the input and primary action one large chat-style pill. Use the accent gradient only for the action; retain the URL label and hint.
- **Result notice:** Use a quiet green-tinted surface and a high-contrast short-link anchor.
- **Error notice:** Use a low-saturation coral surface with readable warm text; preserve inline placement.
- **Links table:** Frame it as one rounded, subtly bordered surface with muted column labels and clear hit counts.

## Background and Motion

The top wash is a fixed viewport-wide band, not a child of the centered content column: `position: fixed; top: 0; left: 0; right: 0; pointer-events: none`. Use a soft coral/pink/orange radial wash that fades into the charcoal background. Keep entrance motion brief and disable it for `prefers-reduced-motion`.
