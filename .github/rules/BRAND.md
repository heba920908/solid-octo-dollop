# kVA IT Brand Rule: Color Palette

kVA IT uses a strictly monochrome identity: black background with white type,
supported by neutral grays. This file is the single source of truth for brand
colors across the website, the presentation card, and the logo.

## Palette

All grays are the exact Tailwind CSS `neutral` scale values.

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `black` | `#000000` | `black` | Brand surfaces, header/footer, card service boxes, headings on white |
| `gray-900` | `#171717` | `neutral-900` | Raised surfaces in dark mode |
| `gray-800` | `#262626` | `neutral-800` | Borders and dividers in dark mode |
| `gray-700` | `#404040` | `neutral-700` | Secondary text and links on white |
| `gray-500` | `#737373` | `neutral-500` | Muted text on white |
| `gray-400` | `#a3a3a3` | `neutral-400` | Logo accent line, muted text on black |
| `gray-300` | `#d4d4d4` | `neutral-300` | Rules and borders on white |
| `gray-200` | `#e5e5e5` | `neutral-200` | Screen backdrop around printable surfaces |
| `gray-100` | `#f5f5f5` | `neutral-100` | Light panels on white |
| `white` | `#ffffff` | `white` | Light-mode background, text on black |

## Surface Mappings

| Surface | Background | Foreground | Notes |
|---------|------------|------------|-------|
| Website, light mode | `white` | `black` | Header and footer stay `black` / `white` |
| Website, dark mode | `black` | `white` | Header and footer `black` / `white` |
| Presentation card (print) | `white` page | `black` | Black header band and service boxes; `gray-100` panels |
| Logo (`assets/media/logo.svg`) | `black` | `white` | Accent line `gray-400` |

## Rules

- Do not introduce chromatic colors (reds, blues, greens, etc.) or gradients
  that resolve to them. Only the tokens above are allowed.
- Body text must meet WCAG AA contrast (at least 4.5:1) against its
  background. Do not use `gray-400` or lighter for text on white.
- Prefer the token names over raw hex values in prose; code must use the exact
  hex values listed here.

## Files That Must Mirror This Palette

- [`data/themes/kva-mono.yaml`](../../data/themes/kva-mono.yaml) — HugoBlox theme pack (website).
- [`config/_default/params.yaml`](../../config/_default/params.yaml) — selects the `kva-mono` pack.
- [`templates/presentation_card/input.css`](../../templates/presentation_card/input.css) — `--kva-*` color variables.
- [`templates/presentation_card/spec.md`](../../templates/presentation_card/spec.md) — card palette section.
- [`assets/media/logo.svg`](../../assets/media/logo.svg) — brand logo.

When the palette changes, update this file first, then every file above.
