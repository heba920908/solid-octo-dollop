# Design Spec: kVA IT Presentation Card (Executive One-Pager Tear Sheet)

**Date**: 2026-09-29  
**Status**: Approved (Brainstorming Phase Complete)  
**Related ADR**: [docs/decisions/0002-presentation-card-pdf-rendering-engine.md](../../decisions/0002-presentation-card-pdf-rendering-engine.md)  
**Template Root**: [templates/presentation_card/](../../../templates/presentation_card/)  

---

## 1. Context & Business Intent

kVA IT is an enterprise IT services firm specializing in cloud transformation, advanced analytics, and AI integration for enterprises in Mexico. 
To support business development, executive introductions, and RFP responses, we require a high-impact corporate presentation card / executive one-pager tear sheet that summarizes:
1. Core services (Legacy to Cloud, Analytics & Big Data, Productization, Managed Services, AI Strategy).
2. Quantified proof metrics (failure rates <5%, 30-50% infrastructure savings, ROI in 3-14 months).
3. Mexico-centric competitive differentiators (local presence, regulatory knowledge of CNBV/INAI, no vendor lock-in).
4. Direct contact routing (Alfredo Hernandez for Sales, Ingri Calzada for AI deployment, Arturo Hernandez for IT consulting).

The first iteration must be delivered in Mexican business Spanish (`es-MX`), structured cleanly so that an English edition (`en-US`) can be generated from localized JSON dictionaries.

---

## 2. Technology & Architecture Choice

Per ADR-0002, we selected **HTML5 + Tailwind CSS v4 + Playwright/Chromium Headless**:
- **Why**: Reuses the repository's native Tailwind v4 and Node.js v22 toolchain without requiring external heavy runtimes like LaTeX/Beamer (~4 GB TeX Live) or new compilers like Typst.
- **Output Quality**: True vector PDF with searchable text, embedded vector SVGs (brand logo and QR code), and precise CSS Paged Media bounds (`@page { size: letter portrait; margin: 0; }`).
- **Automation**: Executed via a Node script `render.mjs` using Playwright's print engine.

---

## 3. Directory Layout

```text
templates/presentation_card/
├── README.md              # Usage instructions and build commands
├── spec.md                # Component specification & layout budget
├── index.html             # Semantic HTML5 template with CSS paged media
├── input.css              # Tailwind v4 directives and print stylesheets
├── data.es.json           # Spanish content (Source of Truth for Iteration 1)
├── data.en.json           # English content (Planned expansion)
└── render.mjs             # Playwright automated PDF generation script
```

---

## 4. Layout Sections & Visual Budget (1-Page Letter)

1. **Header & Brand Banner**:
   - kVA IT Logo (`assets/media/logo.svg`)
   - Tagline: *"Socio Estratégico en Transformación Cloud, Analítica Avanzada e Inteligencia Artificial"*
   - Mexico market badge: 🇲🇽 *"Presencia Local en México · Estándares Globales"*
2. **Executive Value Proposition & ROI Highlights**:
   - 30-second elevator message.
   - Three key metric callouts (<5% failure rate, 30-50% cloud cost reduction, 3-14 month ROI).
3. **Core Service Pillars**:
   - 5 structured cards representing the 5 core service offerings with concise bullet points.
4. **Market Differentiators**:
   - "Extensión de su equipo", "Agnósticos a la tecnología", "Compromiso con resultados medibles".
5. **Contact Routing & Digital Access**:
   - Sales: Alfredo Hernandez
   - AI Solutions: Ingri Calzada
   - IT Strategy: Arturo Hernandez
   - Central Email & Website URL with responsive vector QR code.

---

## 5. Spec Self-Review Checklist

- [x] **Placeholder Scan**: No TODOs, TBDs, or vague requirements. All contacts, metrics, and services align with `.github/skills/kva-it/`.
- [x] **Internal Consistency**: Directory structure, ADR references, and file names match across `docs/decisions/` and `templates/presentation_card/`.
- [x] **Scope Check**: Scoped cleanly to the template design, ADR, and PDF generation pipeline for the presentation card.
- [x] **Ambiguity Check**: Dimensions (US Letter, 8.5 × 11 in), format (single-page vector PDF), primary language (Spanish `es-MX`), and rendering tool (Playwright headless Chromium) are explicitly stated.
