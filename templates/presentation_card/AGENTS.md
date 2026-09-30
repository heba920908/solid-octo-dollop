# Presentation Card Development Guide

This directory contains the kVA IT executive one-pager renderer. Read
[`spec.md`](spec.md), [`README.md`](README.md), and ADR-0002 before changing
the card.

## Purpose and Boundaries

- Produce a single US Letter portrait PDF (8.5 x 11 in) with selectable text
  and vector logo/QR assets.
- The default output is Mexican Spanish (`es-MX`); English (`en-US`) must use
  the same layout and data schema.
- The QR code and visible portfolio link must both target
  `https://kvamentescreativas.com`.
- Do not introduce canvas or raster PDF output.
- Keep generated files inside `output/`; this directory is gitignored.

## File Responsibilities

- `data.es.json` and `data.en.json` are the localized source of truth. Keep
  their schemas identical, including contact details and visible labels.
- `index.html` is a semantic renderer template. It is populated at render
  time and is not a direct browser preview.
- `input.css` owns the Letter page size, print color settings, and fixed
  one-page layout budget.
- `render.mjs` validates locale input, compiles Tailwind, creates the SVG QR,
  injects data, detects overflow, and prints the PDF with Playwright. With
  `--preview` it writes the populated HTML instead (no overflow check) and
  serves it on `127.0.0.1:4173` with only `assets/media/` images exposed.
- `render.test.mjs` verifies data contracts, localized document content,
  selectable PDF text, one-page output, and CLI locale forwarding.

## Development Workflow

```sh
pnpm install
pnpm exec playwright install chromium
pnpm test:card
pnpm build:card
pnpm build:card -- --locale en
pnpm preview:card   # populated HTML in output/, served at http://localhost:4173/
```

On Linux/WSL, install the required system browser libraries if Playwright
Chromium cannot launch. Do not replace the Playwright browser with a system
browser symlink.

## Change Rules

- Update both locale files whenever adding, renaming, or removing a visible
  data field. Add a regression assertion before changing renderer behavior.
- Preserve `@page { size: letter portrait; margin: 0; }`, exact print colors,
  and the renderer's overflow check. A layout change that produces a second
  page is a failure.
- Keep externally sourced claims, contact routing, and roles consistent with
  `.github/skills/kva-it/SKILL.md`.
- Use only colors from [`.github/rules/BRAND.md`](../../.github/rules/BRAND.md).
  Reference the `--kva-*` variables in `input.css`; never hard-code other hex
  values. The palette test in `render.test.mjs` enforces this.
- After content or layout changes, run `pnpm test:card` and both locale build
  commands. Inspect the generated PDFs, not `index.html`, for visual review.
- Do not edit `output/` manually or commit its generated PDFs.
