# kVA IT Presentation Card (Executive One-Pager)

Professional corporate presentation card and leave-behind tear sheet for **kVA IT**, rendered to print-ready PDF using HTML5, Tailwind CSS v4, and Playwright.

## 📁 Files in This Directory

- `spec.md` — Complete architectural and design specification.
- `index.html` — Semantic HTML5 template designed with CSS Paged Media for US Letter print.
- `input.css` — Tailwind v4 styles and print-specific adjustments.
- `data.es.json` — Spanish content dictionary (kVA IT services, metrics, contact points).
- `render.mjs` — Automated Playwright script generating the PDF output.

## 🚀 Quick Start

### 1. Preview in Browser
Open `index.html` directly in your browser or serve it locally:
```bash
# Preview via Python HTTP server
python3 -m http.server 3000 --directory templates/presentation_card/
```
Open `http://localhost:3000` to inspect the layout and typography.

### 2. Generate PDF
To build the print-ready vector PDF:
```bash
node templates/presentation_card/render.mjs
```
The resulting PDF will be saved to `templates/presentation_card/output/kva-it-onepager-es.pdf`.

## ⚙️ Architectural Decisions
See [ADR-0002: Presentation Card (One-Pager Tear Sheet) PDF Rendering Engine](../../docs/decisions/0002-presentation-card-pdf-rendering-engine.md) for background on why HTML5 + Tailwind + Playwright was selected over LaTeX/Beamer and Typst.
