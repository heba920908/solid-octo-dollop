# AGENTS.md

Personal portfolio site built with **Hugo** + the **Hugo Blox / Wowchemy** "Starter Portfolio" theme. There is no custom Go/JS application code — the repo is content (Markdown) and YAML configuration. The theme is consumed as a Hugo Module (see [go.mod](go.mod)), so layouts/partials live in the module cache, not this repo.

## Run & build

Use Podman (image build defined in [Dockerfile](Dockerfile), pins Hugo Extended `v0.162.0`); do not assume a local `hugo` binary.

- Dev server: `podman compose up` → http://localhost:1313 (drafts enabled via `-D`).
- One-time cache fix after first run (strips Google Analytics partial from the module cache) — see the [README Dev section](README.md). Run it if the build fails on `google_analytics.html`.
- Netlify is the production build (`hugo --gc --minify`); its Hugo version is pinned separately in [netlify.toml](netlify.toml) — keep it in sync with the Dockerfile when upgrading.

## Local development (without Podman)

Install these tools locally if you prefer not to use Podman:

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | Required for pnpm and Tailwind |
| pnpm | 10.14.0 | `npm install -g pnpm@10.14.0` |
| Go | 1.21+ | Required for Hugo modules |
| Hugo Extended | 0.162.0 | Must be Extended; download from GitHub releases |

```sh
pnpm install     # install JS dependencies (Tailwind, pagefind, etc.)
pnpm dev         # hugo server -D (with fast-render disabled)
pnpm build       # hugo --minify + pagefind indexing → public/
```

> **Important:** Always use the *Extended* variant of Hugo; the standard build cannot compile Tailwind CSS.

## Where things live

- `config/_default/` — all site config (split by concern): [hugo.yaml](config/_default/hugo.yaml) (core), [params.yaml](config/_default/params.yaml) (appearance/SEO/features), [menus.yaml](config/_default/menus.yaml), [module.yaml](config/_default/module.yaml) (theme imports). Edit these, not a single top-level config file.
- `content/home/` — the homepage, assembled from **headless widget pages** (`index.md`, `intro.md`, `portfolio.md`). Each is a section ordered by `weight`.
- `content/project/<slug>/index.md` — portfolio items. The portfolio widget pulls these in and filters them by `tags`.
- `content/about/` — résumé page sections.
- `assets/scss/`, `data/themes/custom.toml` — styling overrides; `static/uploads/` — served as-is.

## Conventions

- **Config & content front matter are YAML** (`---` fenced, 2-space indent). Match the existing key style; many widget options are documented inline in the files via comments.
- Widget pages set `headless: true` and a `widget:` type; don't remove these — they control how the homepage is composed.
- Project filter buttons in [portfolio.md](content/home/portfolio.md) match on the `tags` field of each project. When adding a project tag, add/verify a matching `filter_button` or it won't be filterable.
- This is a published GitHub Blox theme — prefer the documented widget/params options over hand-written layouts. Theme docs: https://docs.hugoblox.com/
- Don't edit theme internals; they're not in this repo. To change layout/behavior, override config in `config/_default/` or add files under `layouts/` / `assets/` to shadow the module.

## Gotchas

- `ignoreFiles` in [hugo.yaml](config/_default/hugo.yaml) excludes notebooks/R Markdown — don't rely on those being rendered.
- `baseURL` and `repository.url`/`org_name` are placeholders/personal values; verify before assuming production URLs.
- Hugo version must stay in sync across [Dockerfile](Dockerfile) and [netlify.toml](netlify.toml). Current pin: `v0.162.0`.

## Testing with Playwright MCP

Use the **Playwright MCP** browser tools (available in GitHub Copilot agent mode) to visually test and validate the site.

### Setup

1. Start the dev server: `pnpm dev` or `podman compose up`.
2. The site is available at http://localhost:1313.

### How to invoke

In a Copilot agent chat session (agent mode, with Playwright MCP configured), describe the test scenario. Examples:

```
Navigate to http://localhost:1313 and take a screenshot to verify the homepage renders correctly.
Click the portfolio filter buttons and confirm the correct projects appear.
Check that all navigation links resolve without 404s.
```

### Available Playwright MCP tools

| Tool | Purpose |
|------|---------|
| `mcp_playwright_browser_navigate` | Go to a URL |
| `mcp_playwright_browser_take_screenshot` | Capture a screenshot |
| `mcp_playwright_browser_snapshot` | Capture accessibility tree (preferred over screenshot for assertions) |
| `mcp_playwright_browser_click` | Click a button or link |
| `mcp_playwright_browser_fill_form` | Fill text fields |
| `mcp_playwright_browser_network_requests` | Inspect network traffic |
| `mcp_playwright_browser_evaluate` | Run JS in the page context |

### Typical test flows

- **Homepage renders**: navigate → snapshot/screenshot, assert hero text and portfolio widget are present.
- **Portfolio filter**: click each filter button, assert the correct project cards are shown.
- **Navigation**: click each nav menu item, assert the correct section/page loads (no 404).
- **Contact / links**: assert external links are not broken (check via network requests or `href` values in snapshot).

### Notes

- The site is static HTML — no backend to stub. Testing focuses on rendering, navigation, and layout.
- Run Playwright MCP tests against the local dev server, not production.
- Screenshots are useful for visual regression; snapshots (accessibility tree) are better for structural assertions.
