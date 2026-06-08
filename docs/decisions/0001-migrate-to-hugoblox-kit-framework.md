---
status: accepted
contact: "{site owner / lead maintainer}"
date: 2026-06-08
deciders: "{site owner}, {lead maintainer}"
consulted: "{front-end contributor(s)}"
informed: "{stakeholders kept up-to-date}"
---

# Migrate the site from legacy Hugo Blox Builder (Wowchemy) to the HugoBlox `kit` framework

## Context and Problem Statement

The site (`./`) is built on the **legacy Hugo Blox Builder / Wowchemy** framework:
its homepage and résumé are assembled from headless *widget* pages
(`headless: true` + `widget:` front matter) and the Hugo modules
`github.com/HugoBlox/hugo-blox-builder/modules/blox-bootstrap/v5` and
`.../blox-plugin-netlify` (see [go.mod](../../go.mod) and
[config/_default/module.yaml](../../config/_default/module.yaml)).

HugoBlox has since shipped a successor framework, **`kit`**
(`github.com/HugoBlox/kit/modules/blox`), which replaces the widget model with a
declarative **blocks** model (`type: landing` + a `sections:` array of `block:`
entries) and a modern build pipeline (Tailwind CSS v4 + Pagefind). A fully
working reference of this new framework is available at
https://github.com/HugoBlox/hugo-theme-saas-landing-page.

Should we keep maintaining the site on the now-legacy widget framework, or
migrate it to the actively-developed `kit` framework using the
`hugo-theme-saas-landing-page` reference template
as the template?

## Decision Drivers

- **Long-term maintenance**: the legacy `hugo-blox-builder` modules are on a
  maintenance track; `kit` is where active development, new blocks, and security
  fixes land.
- **Authoring model**: declarative blocks in a single `_index.md` are easier to
  reason about and AI-author than many scattered headless widget files.
- **Modern build & features**: Tailwind v4 theming, Pagefind search, and the
  `hugoblox` schema-based `params.yaml` are only available in `kit`.
- **Reference availability**: `hugo-theme-saas-landing-page` already proves the target
  stack builds and provides copy-ready config, blocks, and tooling.
- **Hugo version currency**: target moves from Hugo `0.150.0`/`0.119.0` to
  `0.162.0`.
- **Migration cost & risk**: the legacy `portfolio` widget has no direct block
  equivalent, so projects need a deliberate replacement.

## Considered Options

- **Option 1 — Stay on legacy Hugo Blox Builder (Wowchemy).**
- **Option 2 — Migrate to the HugoBlox `kit` framework** (reference:
  https://github.com/HugoBlox/hugo-theme-saas-landing-page).
- **Option 3 — Migrate off Hugo to a JavaScript SSG** (e.g., Astro or Next.js).

## Decision Outcome

Chosen option: **Option 2 — Migrate to the HugoBlox `kit` framework**, because it
keeps us on Hugo (preserving Markdown content ownership and zero-runtime hosting)
while moving onto the actively-maintained framework, and because the
`hugo-theme-saas-landing-page` reference removes most of the unknowns from the
migration.

### Consequences

- Good, because the site moves onto the actively-developed framework (new blocks,
  fixes, docs) instead of a frozen one.
- Good, because content becomes a single declarative `content/_index.md` of
  blocks plus author data, which is simpler to maintain and AI-author.
- Good, because we gain Tailwind v4 theming and built-in Pagefind search.
- Bad, because the build now requires a Node + `pnpm` toolchain (Tailwind,
  Pagefind) on top of Hugo, increasing build complexity and CI surface.
- Bad, because the legacy `portfolio` widget has no drop-in block, so projects
  must be re-implemented (see Validation / migration plan).
- Bad, because custom styling in [data/themes/custom.toml](../../data/themes/custom.toml)
  and [assets/scss/](../../assets/scss/) must be re-expressed in the Tailwind/
  `params.yaml` theme schema.
- Neutral, because `baseURL`, menus, and SEO settings carry over with mostly
  mechanical key renames (e.g., `languageCode` → `locale`).

### Validation

Migration is validated when **all** of the following hold:

1. Local dev (`podman compose up`) serves http://localhost:1313 on Hugo `0.162.0`
   with no module/build errors.
2. The Netlify production command (`pnpm install` → `hugo --gc --minify` →
   `pnpm run pagefind`) completes and produces a search index.
3. Content parity: homepage, the résumé/about page, and every project from
   [content/project/](../../content/project/) render with equivalent information.
4. This ADR's structure conforms to [adr-template.md](adr-template.md) and the
   [README index](README.md) links resolve.

### Migration plan (implementation)

Phased so the ADR + foundation land first and content follows in reviewable steps.
https://github.com/HugoBlox/hugo-theme-saas-landing-page is the reference for
every file below.

**Phase 1 — Framework & tooling swap**
- [go.mod](../../go.mod): `go 1.19`; replace imports with
  `github.com/HugoBlox/kit/modules/blox` and
  `github.com/HugoBlox/kit/modules/integrations/netlify`.
- [config/_default/module.yaml](../../config/_default/module.yaml): mirror the
  reference imports + `mounts:` for `hugo-blox/blox` community/all-access.
- [config/_default/params.yaml](../../config/_default/params.yaml): adopt the
  `hugoblox:` schema (`identity`, `theme`, `typography`, `layout`, `header`,
  `footer`, `seo`).
- [config/_default/hugo.yaml](../../config/_default/hugo.yaml): add
  `build.writeStats: true`; [languages.yaml](../../config/_default/languages.yaml)
  `languageCode` → `locale`; [menus.yaml](../../config/_default/menus.yaml) add a
  `footer` menu.
- Add `package.json`, `pnpm-workspace.yaml`, and `hugoblox.yaml`
  (Hugo `0.162.0`) modeled on the reference.

**Phase 2 — Build tooling**
- [Dockerfile](../../Dockerfile): bump Hugo to `0.162.0`, ensure Node + `pnpm`.
- [docker-compose.yml](../../docker-compose.yml): add the `pnpm install` step.
- [netlify.toml](../../netlify.toml): switch to the multi-step
  `pnpm install` → `hugo --gc --minify` → `pnpm run pagefind` build.

**Phase 3 — Content migration**
- Homepage: consolidate [content/home/](../../content/home/) `index.md`,
  `intro.md`, `portfolio.md` into a single `content/_index.md`
  (`type: landing`, `sections:` of `hero`, `features`, `cta`, …).
- Author: move [content/authors/admin/](../../content/authors/admin/) into
  `data/authors/me.yaml` (`schema: hugoblox/author/v1`) + add
  `content/authors/_content.gotmpl`.
- Résumé/about: map [content/about/](../../content/about/) experience, education,
  accomplishments, and contact into a dedicated `/about` landing page of blocks.
- Projects: re-implement [content/project/](../../content/project/) — see the
  open decision below.
- Styling: port [data/themes/custom.toml](../../data/themes/custom.toml) and
  [assets/scss/](../../assets/scss/) into the Tailwind/`params.yaml` theme schema;
  remove obsolete files.

## Pros and Cons of the Options

### Option 1 — Stay on legacy Hugo Blox Builder (Wowchemy)

Keep `blox-bootstrap/v5` + `blox-plugin-netlify` and the widget content model.

- Good, because there is zero migration effort and the site keeps working today.
- Good, because no new Node/`pnpm` build dependency is introduced.
- Neutral, because existing content and custom SCSS/TOML theming stay as-is.
- Bad, because the framework is on a maintenance track — fewer features/fixes.
- Bad, because we diverge from the actively-developed HugoBlox ecosystem and docs.

### Option 2 — Migrate to the HugoBlox `kit` framework

Adopt `kit/modules/blox` with the blocks model, using
`hugo-theme-saas-landing-page` as the template.

- Good, because it tracks the actively-developed framework and block library.
- Good, because declarative blocks simplify authoring and AI generation.
- Good, because Tailwind v4 theming + Pagefind search come built-in.
- Good, because a working in-repo reference de-risks the migration.
- Neutral, because most config/SEO/menu settings port mechanically.
- Bad, because it adds a Node + `pnpm` build toolchain.
- Bad, because the `portfolio` widget and custom theming need re-implementation.

### Option 3 — Migrate off Hugo to a JavaScript SSG (Astro/Next.js)

Rebuild the site on a JS-based static site generator.

- Good, because of a large component/plugin ecosystem and flexible theming.
- Neutral, because content can remain Markdown/MDX.
- Bad, because it is the highest-effort, full-rewrite option (no HugoBlox reuse).
- Bad, because it introduces a heavier runtime/build and ongoing JS dependency
  maintenance.
- Bad, because it discards the existing in-repo `kit` reference entirely.

## More Information

- Reference implementation: https://github.com/HugoBlox/hugo-theme-saas-landing-page
- HugoBlox docs: https://docs.hugoblox.com/
- HugoBlox `kit`: https://github.com/HugoBlox/kit
- Project/repo conventions: [AGENTS.md](../../AGENTS.md).

### Open decision — project portfolio replacement

The legacy `portfolio` widget (tag filtering via `filter_button`) has no direct
block. Resolve before Phase 3 projects work:

1. **A dedicated `/projects` landing page** built from existing blocks
   (e.g., `features`/`cards`). *Recommended* — lowest custom-template risk.
2. Projects as **blog posts** with category/tag filtering.
3. A **custom Hugo block/layout** replicating the filtered grid (highest effort).

This ADR records the framework decision; the project-replacement approach will be
confirmed (and, if significant, captured in a follow-up ADR) when Phase 3 begins.
