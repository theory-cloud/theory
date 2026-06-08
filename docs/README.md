# docs/ — TheoryMCP consumer docs site

This directory is the source of the consumer docs site for **theorymcp.ai** (the platform): a guide to
working with theorymcp.ai namespaces and the agent MCPs they publish. The site itself is **served at
the `theorycloud.ai` apex**. It is built with **Jekyll** and deployed to GitHub Pages by
[`.github/workflows/pages.yml`](../.github/workflows/pages.yml) on every push to `main` that touches
`docs/`.

> This file is repo-internal and excluded from the build (`_config.yml` → `exclude`). The site
> landing page is `index.html`.

## What's site-specific vs shared chrome

The **chrome** is copied verbatim from the other Theory Cloud framework sites (AppTheory /
FaceTheory / TableTheory) so it stays consistent and easy to re-sync:

- `_layouts/`, `_includes/` (except `figure.html`), `assets/`, `search.json`, `Gemfile`, `Gemfile.lock`

The layouts read every site parameter from `site.tabletheory.*` — that key is named `tabletheory` on
**every** Theory Cloud site so the chrome can stay byte-identical. Don't rename it.

The **site-specific** files (edit these):

- `_config.yml` — title, site domain (`https://theorycloud.ai`, root), and the `tabletheory:` parameter block
- `_data/nav.yml` — sidebar groups, linear `order`, and `url_to_id`
- `_data/site-meta.yml` — header nav, footer links, landing quick-start cards
- `_data/hosts.yml` — landing-page host tabs (codex / Claude Code / Antigravity)
- `index.html` — landing page
- `*.md` content under the section folders
- `_includes/figure.html` — Theory-only captioned figure for the concept art
- `assets/img/edu/` — optimized edutainment infographics
- `CNAME` — `theorycloud.ai` (the site host; the platform stays `theorymcp.ai`)

## Information architecture

```
Overview          how-it-works.md · getting-started.md
Connect           connect/index.md · connect/mcp-remote-bridge.md
Use a namespace   use/knowledge.md · use/agents.md
Use an agent MCP  use/memory.md · use/mailbox.md
Integrate         integrate/index.md · integrate/materialize.md · integrate/verify-and-sync.md
Author (gated)    author/index.md · author/compose.md · author/publish.md · author/replicate.md
Reference         reference/tools.md · reference/routes.md · reference/prompts.md · reference/glossary.md
```

Every content page pairs a **how-it-works** explanation with **copyable prompts**. The full prompt
set is collected in `reference/prompts.md`.

## Adding or moving a page

1. Create/rename the markdown file under `docs/` (front matter needs only `title:` and `description:`; `_config.yml` defaults supply the layout and surface accent).
2. Add an entry to `_data/nav.yml` under the right group, **and** add its `id` to `order:` and `url_to_id:`.
3. With `permalink: pretty`, `foo/bar.md` → `/foo/bar/` and `foo/index.md` → `/foo/`.

## Build & preview locally

```bash
cd docs
bundle install
bundle exec jekyll serve --baseurl ""
# open http://127.0.0.1:4000/
```

## Surface accents

Pages are tinted by section via `_config.yml` defaults: `core` (blue) for overview/connect/use-namespace,
`mcp` (violet) for agent-MCP and integrate, `auth` (steel) for authoring. Override per page with
`surface:` in front matter.
