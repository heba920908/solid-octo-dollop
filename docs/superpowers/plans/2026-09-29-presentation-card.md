# Presentation Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a bilingual, single-page US Letter kVA IT presentation card as a vector PDF.

**Architecture:** `data.<locale>.json` is the only localized copy source. `render.mjs` compiles Tailwind CSS, validates and injects the selected locale plus a vector QR SVG into `index.html`, then prints with Playwright Chromium. Node tests exercise the actual renderer and inspect its PDF output.

**Tech Stack:** Node.js 22, Tailwind CSS v4, Playwright, qrcode, pdfjs-dist, node:test.

**Spec:** `docs/superpowers/specs/2026-09-29-presentation-card-design.md`

## Global Constraints

- Generate exactly one US Letter portrait page: 8.5 x 11 inches, zero `@page` margin.
- Default locale is Mexican Spanish (`es-MX`); English is selected with `--locale en`.
- Use `https://kvamentescreativas.com` for both the visible portfolio link and QR code.
- Preserve selectable PDF text and vector SVG logo and QR assets.
- Run on Linux/WSL with a project-local Playwright Chromium browser.
- Do not commit generated output or implementation commits without explicit user approval.

## Review Focus

- Long localized copy must be rejected when it overflows the one-page layout.
- An unknown locale must fail before launching Chromium.
- The generated PDF must retain searchable Spanish copy rather than flatten text to an image.
- The QR SVG and visible portfolio URL must use the same configured destination.
- Missing browser dependencies must result in an actionable renderer error.

---

### Task 1: Rendering Dependencies And Data Contract

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `.gitignore`
- Create: `templates/presentation_card/data.es.json`, `templates/presentation_card/data.en.json`, `templates/presentation_card/render.test.mjs`

**Interfaces:**
- Produces: `loadCardData(locale): Promise<object>` from `render.mjs`; each locale object has `locale`, `portfolioUrl`, `pitch`, `metrics`, `services`, `differentiators`, and `contacts`.

- [ ] Add a failing Node test asserting that `loadCardData('es')` loads five services and the configured portfolio URL, and that `loadCardData('fr')` rejects with `Unsupported locale: fr`.
- [ ] Run `node --test templates/presentation_card/render.test.mjs` and confirm it fails because `render.mjs` does not exist.
- [ ] Add `playwright`, `qrcode`, and `pdfjs-dist`, card build/test scripts, ignore generated card assets, localized JSON dictionaries, and the minimal `loadCardData` implementation.
- [ ] Re-run `node --test templates/presentation_card/render.test.mjs` and confirm the data tests pass.

### Task 2: Letter Template And Print Styles

**Files:**
- Create: `templates/presentation_card/index.html`, `templates/presentation_card/input.css`
- Modify: `templates/presentation_card/render.test.mjs`

**Interfaces:**
- Consumes: the Task 1 locale object injected in `window.cardData` and `window.cardQrSvg`.
- Produces: `renderCardDocument(data, qrSvg): string` from `render.mjs` and a semantic document with header, metrics, services, differentiators, and contacts.

- [ ] Add a failing test asserting `renderCardDocument` includes the Spanish pitch, five service cards, the local SVG logo reference, the portfolio URL, and injected QR SVG markup.
- [ ] Run the test and confirm it fails because `renderCardDocument` does not exist.
- [ ] Create the semantic template and Tailwind input stylesheet with `@page`, `@media print`, explicit letter bounds, fixed-size layout, and overflow prevention; implement `renderCardDocument` with safe JSON injection.
- [ ] Re-run the test and confirm it passes.

### Task 3: PDF Renderer And Artifact Assertions

**Files:**
- Modify: `templates/presentation_card/render.mjs`, `templates/presentation_card/render.test.mjs`, `package.json`

**Interfaces:**
- Consumes: `loadCardData(locale)` and `renderCardDocument(data, qrSvg)`.
- Produces: `renderCard({ locale, outputPath }): Promise<string>` and CLI `node render.mjs [--locale es|en]`.

- [ ] Add failing tests that render Spanish and English PDFs to temporary directories, assert one PDF page, assert selectable expected copy, assert output exists, and assert invalid locale rejects without output.
- [ ] Run the tests and confirm they fail because `renderCard` does not exist.
- [ ] Implement QR SVG creation, Tailwind compilation, Playwright rendering with Letter/PDF settings, one-page overflow detection, clear dependency errors, and CLI argument parsing.
- [ ] Re-run the renderer tests and confirm they pass after installing Playwright Chromium.

### Task 4: Usage Documentation And End-To-End Verification

**Files:**
- Modify: `templates/presentation_card/README.md`

**Interfaces:**
- Consumes: `pnpm build:card`, `pnpm build:card -- --locale en`, and `pnpm test:card`.

- [ ] Document dependency installation, Chromium setup, locale-specific generation, test execution, output location, and direct preview.
- [ ] Run `pnpm test:card` and `pnpm build:card`; inspect the resulting PDF page count and selected text programmatically.
