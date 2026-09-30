# kVA IT Presentation Card (Executive One-Pager)

Professional corporate presentation card and leave-behind tear sheet for **kVA IT**, rendered to a print-ready vector PDF using HTML5, Tailwind CSS v4, and Playwright Chromium.

## Files

- `spec.md` - Complete architectural and design specification.
- `index.html` - Semantic Letter-sized template.
- `input.css` - Tailwind v4 entry point and print styles.
- `data.es.json` - Spanish source-of-truth content.
- `data.en.json` - English localized content with the same schema.
- `render.mjs` - Content injection and PDF renderer.
- `render.test.mjs` - Data, document, and generated-PDF validation.

## Setup

Install project dependencies and Playwright's project-local Chromium browser:

```bash
pnpm install
pnpm exec playwright install chromium
```

On Linux/WSL, install the system libraries requested by Playwright if Chromium cannot launch. Do not replace the Playwright browser with a system-browser symlink.

## Generate And Preview

Build the default Mexican Spanish card:

```bash
pnpm build:card
```

Build the English card:

```bash
pnpm build:card -- --locale en
```

The generated files are written to `templates/presentation_card/output/`:

```text
kva-it-onepager-es.pdf
kva-it-onepager-en.pdf
```

Open the generated PDF in a browser or PDF viewer to inspect the exact print layout, selectable text, and links. `index.html` is a renderer template and is not intended to be opened directly.

For a live HTML preview (useful with browser DevTools), write a fully populated page next to the PDFs and serve it locally:

```bash
pnpm preview:card                  # output/kva-it-onepager-es.html
pnpm preview:card -- --locale en   # output/kva-it-onepager-en.html
```

The command keeps running and serves the page at http://localhost:4173/ (bound to `127.0.0.1`, only the preview page and `assets/media/` images are exposed). Re-run it after changing data or styles; stop it with `Ctrl+C`. The preview skips the overflow check; the PDF remains the source of truth for visual review.

## Test

Run the data, rendering, single-page, and searchable-text checks:

```bash
pnpm test:card
```

## Architecture

See [ADR-0002: Presentation Card (One-Pager Tear Sheet) PDF Rendering Engine](../../docs/decisions/0002-presentation-card-pdf-rendering-engine.md) for the choice of HTML, Tailwind, and Playwright over LaTeX, Typst, and raster output.
