# Specification: kVA IT Presentation Card (Executive One-Pager Tear Sheet)

## 1. Overview & Objective

This specification defines the architecture, content structure, visual styling, and automated PDF rendering pipeline for the **kVA IT Presentation Card / Executive One-Pager Tear Sheet** located in `./templates/presentation_card/`.

The primary goal is to provide a modern, high-impact corporate leave-behind and introductory tear sheet targeted at enterprise decision-makers in Mexico (CIOs, CTOs, COOs, VPs of Operations, and Finance leaders). 

- **Primary Language (Iteration 1)**: Spanish (`es-MX`) with neutral business tone tailored to Mexican enterprise governance, regulatory frameworks (CNBV, INAI), and commercial dynamics.
- **Secondary Language**: Modularly extensible to English (`en-US`) via decoupled JSON content files.
- **Physical Output**: Single-page US Letter (8.5 × 11 in) vector PDF generated automatically via headless Playwright/Chromium.

---

## 2. Technical Stack & Architecture

- **Markup & Layout**: Semantic HTML5 with modern CSS Grid and Flexbox.
- **Styling**: Tailwind CSS v4 integrating corporate colors, typography, badges, and print-specific directives.
- **Content Source**: JSON data dictionaries (`data.es.json`, `data.en.json`) injected or read dynamically into the template.
- **Rendering Engine**: Node.js (`render.mjs`) leveraging Playwright's headless Chromium vector PDF engine (`page.pdf()`).
- **Assets**: Embedded vector SVGs for brand logos (`assets/media/logo.svg`), Mexican flag / regional indicators, category icons, and QR code to online portfolio.

### Directory Structure

```text
templates/presentation_card/
├── README.md              # Usage instructions and build commands
├── spec.md                # This specification
├── index.html             # Presentation card template with CSS paged media
├── input.css              # Tailwind v4 directives and print stylesheets
├── data.es.json           # Spanish content (Source of Truth for Iteration 1)
├── data.en.json           # English content (Planned expansion)
└── render.mjs             # Playwright automated PDF generation script
```

---

## 3. Content Structure & Information Architecture

The one-pager is composed of five distinct visual sections engineered to fit cleanly on exactly one US Letter page:

### 3.1 Header & Brand Bar
- **Brand Identity**: kVA IT logo with company title and regional subtitle: *"Socio Estratégico en Transformación Cloud, Analítica Avanzada e Inteligencia Artificial"*.
- **Market Badge**: 🇲🇽 *"Presencia Local en México · Estándares Globales"*.
- **Tagline**: *"Transformamos historia operativa en ventajas competitivas en la nube."*

### 3.2 Executive Pitch & Key Impact Metrics
- **30-Second Elevator Message**: kVA IT is the strategic partner for Mexican enterprises modernizing legacy infrastructure into cloud-native, AI-powered environments with zero downtime.
- **Metrics Callout Grid (3 Columns)**:
  1. **< 5% Riesgo de Falla**: Metodologías comprobadas frente a la tasa promedio de 40% de fracaso en migraciones.
  2. **30% – 50% Ahorro en Infraestructura**: Reducción de costos de mantenimiento de servidores heredados y optimización FinOps.
  3. **3 – 14 Meses Retorno de Inversión**: Proyectos rápidos de analítica y mantenimiento predictivo que financian la transformación.

### 3.3 Core Service Pillars (5 Pillars)
1. **Migración Cloud e Integración de Sistemas Heredados (Legacy)**:
   - Patrón Strangler Fig para transición gradual sin interrupción operativa.
   - Arquitecturas híbridas y multi-cloud (AWS, Azure, GCP) sin ataduras a proveedores (No Vendor Lock-In).
2. **Analítica de Datos y Visualización Ejecutiva**:
   - Monitización de décadas de registros históricos; ingeniería de datos con Spark y data lakes.
   - Dashboards de KPIs en tiempo real y modelos predictivos que sustentan decisiones en días, no semanas.
3. **Productización de Aplicaciones**:
   - Conversión de herramientas internas en productos comerciales SaaS escalables.
   - Arquitectura multi-inquilino (multi-tenant), facturación, cumplimiento y CI/CD automatizado.
4. **Servicios Gestionados Cloud (Managed Services)**:
   - Operaciones, monitoreo proactivo 24/7 y respuesta a incidentes.
   - Seguridad, continuidad del negocio y cumplimiento de normativas locales e internacionales (CNBV, ISO 27001, SOC 2, INAI).
5. **Estrategia e Integración de Inteligencia Artificial (IA)**:
   - Evaluación de madurez y consultoría estratégica en adopción de IA.
   - Soluciones GenAI personalizadas, sistemas RAG empresariales y Pruebas de Concepto (POC) rápidas en 90 días.

### 3.4 Key Differentiators & Engagement Model
- **Extensión de su equipo**: Transferencia activa de conocimiento para crear capacidades internas, no dependencias.
- **Agnósticos a la tecnología**: Recomendaciones basadas en el retorno de inversión y las restricciones del cliente, no en comisiones de proveedores.
- **Compromiso con resultados**: Acompañamiento integral desde la estrategia inicial hasta la operación continua.

### 3.5 Contact Routing & Footer
Structured directory routing prospects by specific need:
- **Alfredo Hernandez** — *Ventas y Consultas Comerciales*
- **Ingri Calzada** — *Ingeniería de Despliegue de IA y Soluciones*
- **Arturo Hernandez** — *Estrategia de TI y Consultoría*
- **Contacto Central**: `anatasidomi@hotmail.com` *(en transición hacia @kvamentescreativas)*
- **Canal Digital / Portafolio**: Enlace al sitio web oficial y código QR vectorizado para acceso móvil inmediato.

---

## 4. Print & Layout Rules

### 4.1 Dimensions & Paged Media
```css
@page {
  size: letter portrait; /* 8.5in x 11in */
  margin: 0;
}

@media print {
  html, body {
    width: 8.5in;
    height: 11in;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

### 4.2 Single-Page Constraint (Strict Hard Gate)
The card must never break onto a second page. All container heights, font scaling, line-heights, and margins are budgeted:
- Maximum container height: `11in` (`1056px` at 96 DPI screen scale).
- Padding: `0.5in` to `0.6in` outer margins.
- Typography scale:
  - Header Title: `text-2xl` / `text-3xl`
  - Section Headings: `text-sm font-bold uppercase tracking-wider`
  - Body Copy: `text-xs leading-relaxed`
  - Metric Big Numbers: `text-2xl font-black`

---

## 5. Rendering Pipeline (`render.mjs`)

The rendering script operates as follows:
1. Compiles `input.css` using Tailwind CLI into an inline or bundled CSS asset.
2. Injects data from `data.es.json` into `index.html`.
3. Launches Chromium in headless mode via Playwright:
   ```javascript
   const browser = await chromium.launch();
   const page = await browser.newPage();
   await page.goto(`file://${resolvedHtmlPath}`, { waitUntil: 'networkidle' });
   await page.pdf({
     path: outputPath,
     format: 'Letter',
     printBackground: true,
     preferCSSPageSize: true
   });
   await browser.close();
   ```
4. Verifies output file generation and logs status.

---

## 6. Validation & Quality Checklist

- [x] Meets ADR-0002 architectural decision.
- [ ] Rendered PDF consists of exactly 1 page.
- [ ] Text remains fully selectable and searchable (no canvas rasterization).
- [ ] SVG assets (logo, QR, icons) render as clean vectors at 300+ DPI.
- [ ] Spanish copy aligns with kVA IT talking points and core value propositions.
- [ ] Build command integrates into `package.json` scripts (`pnpm build:card`).
