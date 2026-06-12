# RTK IT Services Website

This repository contains the marketing website for RTK IT Services.

It is a static site built with Hugo + Hugo Blox and is intended to present RTK's IT offering, including:

- IT consulting services
- Cloud migration solutions
- Systems architecture design
- AI Integration and strategy

## Purpose

This site is meant to be a marketing tool for RTK:

- communicate service offerings clearly
- showcase portfolio and case-study style content
- provide a professional web presence for prospective clients

## Tech Stack

- Hugo Extended (static site generator, v0.162.0)
- Hugo Blox modules (configured in `go.mod`)
- Tailwind CSS v4 + `@tailwindcss/typography`
- pnpm (package manager, v10.14.0)
- Podman / Podman Compose (containerised dev environment)
- Netlify for production deployment

## Local Development

### Prerequisites

Install the following tools locally:

| Tool | Minimum version | Install |
|------|----------------|---------|
| Node.js | 20+ | https://nodejs.org or `nvm` |
| pnpm | 10.14.0 | `npm install -g pnpm@10.14.0` |
| Go | 1.21+ | https://go.dev/dl |
| Hugo Extended | 0.162.0 | See below |

Install Hugo Extended:

```sh
# macOS / Linux (replace version/arch as needed)
sudo dnf install hugo
```

> **Note:** Hugo must be the *Extended* variant (required for Tailwind CSS compilation).

### Local dev (Hugo + pnpm)

1. Install JS dependencies:

```sh
pnpm install
```

2. Start the development server (drafts enabled):

```sh
pnpm dev
```

3. Open the site at:

```txt
http://localhost:1313
```

### Podman fallback (no local Hugo binary required)

Use Podman for a fully containerised environment where no local Hugo binary is needed.

1. Start the development server:

```sh
podman compose up
```

2. Open the site at:

```txt
http://localhost:1313
```

3. If the first build fails due to `google_analytics.html`, run the one-time cache fix:

```sh
podman compose run --rm hugo find /tmp/hugo_cache/ -name google_analytics.html -exec rm -v {} \;
podman compose run --rm hugo find /tmp/hugo_cache/ -name main.html -exec sed -i '/google_analytics/d' {} \;
podman compose up
```

## Build

```sh
pnpm build          # runs hugo --minify then pagefind indexing
```

Output is written to `public/`.

## Testing with Playwright MCP

Visual / end-to-end testing uses the **Playwright MCP** tool available in VS Code GitHub Copilot agent mode.

1. Start the dev server (local or Podman).
2. In a Copilot agent chat, instruct it to use the Playwright MCP browser tools against `http://localhost:1313`.

Common agent prompts:

```
Navigate to http://localhost:1313 and take a screenshot of the homepage.
Click the "Portfolio" nav link and verify the portfolio section is visible.
Check that all filter buttons in the portfolio section work correctly.
```

The Playwright MCP tools available in the agent include:
- `mcp_playwright_browser_navigate` — navigate to a URL
- `mcp_playwright_browser_snapshot` — capture accessibility snapshot
- `mcp_playwright_browser_take_screenshot` — capture screenshot
- `mcp_playwright_browser_click` — interact with elements
- `mcp_playwright_browser_fill_form` — fill in form fields
- `mcp_playwright_browser_network_requests` — inspect network traffic

## Deployment

- Netlify build command: `hugo --gc --minify -b $URL`
- Publish directory: `public`
- Netlify config file: `netlify.toml`

## Content Structure

- `content/home/` homepage sections (intro, portfolio widgets)
- `content/project/` service/portfolio entries
- `content/about/` about and supporting pages
- `config/_default/` Hugo and site configuration

## Notes

- Site title and URL are configured in `config/_default/hugo.yaml`.
- SEO/marketing metadata is configured in `config/_default/params.yaml`.
- Keep Hugo versions aligned between Podman image source (`Dockerfile`) and Netlify (`netlify.toml`) when upgrading.
