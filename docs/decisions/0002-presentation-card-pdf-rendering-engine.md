---
status: accepted
contact: "Arturo Hernandez"
date: 2026-09-29
deciders: "Arturo Hernandez, Alfredo Hernandez, Ingri Calzada"
consulted: "kVA IT Core Team"
informed: "kVA IT Sales & Technical Stakeholders"
---

# Presentation Card (One-Pager Tear Sheet) PDF Rendering Engine

## Context and Problem Statement

kVA IT requires a professional, high-impact corporate presentation card / executive one-pager tear sheet for client meetings, executive introductions, and RFP attachments in the Mexican enterprise IT market. The artifact must showcase kVA IT's core service pillars (Cloud Migration, Analytics & Data Visualization, Application Productization, Managed Cloud Services, and AI Integration & Strategy), key ROI metrics, market positioning, and contact routing (Alfredo Hernandez, Ingri Calzada, Arturo Hernandez).

The card must be rendered to print-ready, high-resolution vector PDF in a Linux/WSL environment. Historically, LaTeX + Beamer was considered, but modern open-source web and layout visualization tools offer superior developer experience, CSS fidelity, and alignment with our existing website technology stack. 

Which open-source, Linux/WSL-compatible rendering technology should be adopted to generate kVA IT's presentation card PDF?

## Decision Drivers

- **Ecosystem and Asset Synergy**: Reuse of existing project dependencies (Tailwind CSS v4, Node.js runtime, SVG logo and brand assets from `assets/media/`).
- **Linux/WSL Compatibility**: Painless installation and execution in headless Linux and WSL environments without requiring multi-gigabyte monolithic dependencies.
- **Visual Design & Typography Flexibility**: Support for modern layouts (CSS Grid, Flexbox, glassmorphism, corporate branding, Mexican market accent badges) with vector-crisp typography and selectable text.
- **Localization Support**: First-iteration delivery in Mexican Spanish (`es-MX`) targeting C-suite and IT decision makers, with modular capability to output English (`en-US`) versions from structured content.
- **Maintainability & AI Ergonomics**: Declarative, readable markup and data schemas easily editable by developers, automated scripts, and AI agents.

## Considered Options

- **Option 1**: HTML5 + Tailwind CSS v4 + Playwright/Chromium Headless (`render.mjs`)
- **Option 2**: Typst (Modern Rust-based Typesetting Engine)
- **Option 3**: LaTeX + Beamer / TikZ
- **Option 4**: WeasyPrint (Python-based CSS Paged Media engine)
- **Option 5**: HTML5 Canvas rasterization (Node-Canvas / Fabric.js / Puppeteer PNG-to-PDF)

## Decision Outcome

Chosen option: **Option 1: HTML5 + Tailwind CSS v4 + Playwright/Chromium Headless**, because:
1. It directly leverages the repository's existing tech stack (Tailwind CSS v4 and Node.js v22), eliminating the need for foreign toolchains or language environments.
2. Playwright is already established in the repository's guidelines (`AGENTS.md`) for browser-based automation and headless rendering.
3. Modern CSS Paged Media (`@page { size: letter portrait; margin: 0; }`) paired with Chromium's native vector PDF print engine yields exact dimensions, crisp embedded fonts, and selectable text.
4. Content is separated into JSON (`data.es.json`, `data.en.json`), enabling rapid bilingual generation without duplicating layout code.

### Consequences

- **Good**: Zero additional system toolchain overhead—no TeX Live or Rust compilers required.
- **Good**: Full reuse of web design skills, Tailwind classes, and brand SVG assets.
- **Good**: Real-time live browser preview during development before invoking the PDF export.
- **Good**: Perfect vector quality, selectable text, active hyperlinks, and print-color accuracy (`print-color-adjust: exact`).
- **Bad**: Requires a Chromium headless binary managed via Playwright in the Linux/WSL environment.
- **Bad**: Strict CSS Paged Media rules must be maintained to prevent unexpected page breaks across one-page bounds.

## Validation

- **Format Compliance**: Output PDF strictly fits onto exactly one US Letter (8.5 × 11 in) page without overflow or trailing blank pages.
- **Vector Quality Check**: Text is searchable and selectable in standard PDF viewers; SVG logos and QR codes scale cleanly without pixelation.
- **Automation**: Executable via `pnpm build:card` or `node templates/presentation_card/render.mjs`, outputting the compiled PDF to `dist/` or `templates/presentation_card/output/`.
- **Playwright Verification**: Verified in CI and local WSL using headless Chromium print tests.

## Pros and Cons of the Options

### Option 1: HTML5 + Tailwind CSS v4 + Playwright (Chosen)

- Good: Seamless reuse of Tailwind CSS v4 and Node 22 present in the repository.
- Good: Rapid prototyping with instant browser live reload and inspect elements.
- Good: Chromium print-to-PDF engine produces native vector text, paths, and clickable hyperlinks.
- Good: Effortless separation of structure (`index.html`) and content (`data.es.json`).
- Bad: Requires Chromium installation via Playwright.

### Option 2: Typst

- Good: Blazing fast compilation (<0.1s) from a lightweight Rust binary (~30 MB).
- Good: Excellent syntax and mathematical layout engine compared to LaTeX.
- Neutral: Supports modern typography and SVG imports cleanly.
- Bad: Introduces a third language/syntax distinct from HTML/Tailwind web standards.
- Bad: Requires installing and maintaining the external `typst` CLI in WSL/CI.

### Option 3: LaTeX + Beamer / TikZ

- Good: Historic standard for academic and scientific publications with high typographical control.
- Bad: Heavy installation footprint (TeX Live packages consume 3–5 GB of disk space).
- Bad: Complex and arcane syntax for modern web-like card designs, gradients, and flexbox-style layouts.
- Bad: Slow build times and brittle compilation errors.

### Option 4: WeasyPrint

- Good: Converts HTML/CSS to PDF without running a full browser engine.
- Good: Adheres closely to CSS Paged Media specifications.
- Bad: Incomplete support for modern CSS features (modern CSS Grid, newer Tailwind v4 CSS features, advanced SVG filters).
- Bad: Requires Python runtime, Cairo, Pango, and GDK-PixBuf system libraries in WSL.

### Option 5: HTML5 Canvas / Puppeteer Rasterization

- Good: Pixel-level programmatic rendering.
- Bad: Converts vector elements and fonts to raster bitmaps unless complex PDF canvas backends are used.
- Bad: Text is not easily selectable or indexable in the final PDF.
- Bad: Inferior print sharpness compared to browser print engine vector streams.

## More Information

- Template location: `templates/presentation_card/`
- Primary language: Spanish (`es-MX`), with Mexican market positioning (CNBV, INAI, local presence + global standards).
- Implementation plan and technical spec documented in `templates/presentation_card/spec.md`.
