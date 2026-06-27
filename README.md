# CCAIS website — Astro rebuild

A static rebuild of [ccais.ac.uk](https://www.ccais.ac.uk/) (originally
WordPress) using [Astro](https://astro.build/). All WordPress content (pages,
projects, news, blog posts, events, impact, open source) was exported via the
WP REST API into Markdown content collections, and the original theme
stylesheet is reused so the site keeps the same look and feel. It builds to
static files and deploys to GitHub Pages (see **Deploying** below).

## Getting started

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # static site in dist/ (also builds the Pagefind search index)
```

All images, fonts, video and the original theme CSS are already committed (under
`public/` and `src/styles/`), so a fresh clone builds offline with no dependency
on the old WordPress site — which is now frozen and no longer the source of
truth.

## Structure

- `src/content/` — Markdown content collections (`projects`, `news`, `blog`, `events`, `impacts`, `open-source`). Add a new post by dropping a `.md` file in the right folder. Listing excerpts are derived automatically from the first paragraph of the body (`src/lib/excerpt.ts`); add an `excerpt:` frontmatter field only if you want to override that. Set `imageCredit` (and optionally `imageCreditUrl`) to show a small credit for the header image at the foot of the page.
- `src/data/team.ts` — the **single, hand-maintained source for all team data**: each member's name, role, group, photo, email, website(s) and biography, plus the ordered list of section headings (`groups`) and their accent colours. The team page and the per-person `/author/<slug>/` pages are generated from it. Projects and posts link to people via `author` / `members` slugs in their frontmatter. A project's `members` list may also contain an inline `{ name, url }` entry to credit an external collaborator (e.g. a joint supervisor) who has no CCAIS page — they appear in the project's team line (linked to `url` if given) but aren't added to the team page or given an author page.
- `src/data/` (other) — small JSON config: `newsletter.json` (Mailchimp embed settings), `contact.json` (Web3Forms key), `linkedin.json` (featured posts), `pubs.json` (publications, see below).
- `public/images/team/` — team profile photos referenced from `src/data/team.ts`.
- `src/pages/` — routes. Static pages (About, Vision, Team, …) are `.astro` files; listing/detail pages are generated from the collections. Original WordPress URLs are preserved (including blog posts under `/uncategorised/...`).
- `src/components/` — shared building blocks; `Nav.astro` is the **single** navigation menu used by both header and footer.
- `src/styles/theme.css` — original WordPress theme CSS. `src/styles/supplement.css` — small additions and overrides layered on top; this is where custom, durable CSS belongs (it can't be clobbered by `fetch-assets`).
- `scripts/` — one-off maintenance scripts (see **Maintenance scripts** below).
- `originals/` — full-resolution image masters, archived before optimisation. Kept in the repo but **not deployed**.

## Deliberate changes from the WordPress site

- **Footer links fixed**: the old footer pointed at `/outputs/open-source/` and `/outputs/impact/` while the header used `/open-sources/` and `/impacts/`, and the footer was missing "About CCAIS". Header and footer now share one menu (the header's structure). Redirects in `astro.config.mjs` keep the old footer URLs working.
- **Search** is now [Pagefind](https://pagefind.app/) (static, built at build time) instead of WordPress search. Available at `/search/` after a production build.
- **Cookie banner removed** — the static site sets no tracking cookies, so the GDPR cookie plugin is unnecessary. If you add analytics, reconsider.
- **Newsletter forms** (header bar + above footer) post to **Mailchimp** via its embedded-form endpoint (JSONP, with a honeypot field and an optional list tag). Settings live in `src/data/newsletter.json`; no API key or backend is required.
- **Contact form** posts to **Web3Forms**, which emails each submission to the address tied to the access key in `src/data/contact.json`. No backend is required.

## LinkedIn posts

The homepage "Our socials" section can show official LinkedIn post embeds,
driven by `src/data/linkedin.json`. To feature a post: open it on LinkedIn ->
**...** menu -> **Embed this post** -> copy the iframe `src` URL into the
`posts` array (newest first; a plain post URL also works). The site shows the
first four. Embeds are click-to-load so LinkedIn sets no cookies until a
visitor opts in (their choice is remembered).

## Maintenance scripts

- **`npm run optimize-images`** (`scripts/optimize-images.mjs`) — down-scales and re-compresses oversized images in `public/` in place (longest edge capped at ~1280px). Before touching a file it copies the full-resolution master into `originals/`, and it records sizes in `scripts/.image-optim.json` and skips unchanged files, so it's safe to re-run. Use `-- --dry` to preview.
- **`npm run fetch-project-images`** (`scripts/fetch-project-images.mjs`) — downloads the Unsplash header images for hand-authored project pages into `public/images/projects/` so the site stays self-contained. Add a new `{ url, dest }` entry when a project uses an externally-sourced image; safe to re-run (existing files are skipped).
- **`python3 scripts/update-publications.py`** — regenerates `src/data/pubs.json` (rendered statically at `/outputs/publications/`) from the University of Southampton Pure API (project `520617`). Needs `pip install requests` and university network/VPN access to `api-pure.soton.ac.uk`; commit the updated `pubs.json` and rebuild. Builds themselves need no VPN or network, so CI is unaffected.
- **`npm run fetch-assets`** (`scripts/fetch-assets.mjs`) — *legacy* mirror that originally pulled `/wp-content/...` assets and the full theme CSS from the live WordPress site. The site is now self-contained, so this is rarely needed. It is safe to re-run: existing assets are skipped, and the generated files it derives from WordPress (`src/styles/theme.css`, `src/data/site-assets.json`) are **never overwritten if you've edited them locally** — it warns and writes a `*.fetched` copy for you to diff instead, unless you pass `-- --force`.

## Known gaps / TODO

- **Event dates**: stored in `eventDate` frontmatter (the WP ACF field wasn't public) — worth verifying they're correct.
- **Footer background image**: the original was set inline by WordPress; a brand-purple fallback is used (`.site-footer` in `supplement.css`). Set a `background-image` there if you want the original photo back.

## Deploying (GitHub Pages)

A ready-made workflow (`.github/workflows/deploy.yml`) builds and deploys the
site to GitHub Pages on every push to `main`. Because all assets are committed,
CI needs no access to the old WordPress site.

To reproduce the setup from scratch:

1. Push the project to a GitHub repository (`main` branch).
2. In the repo: Settings -> Pages -> Source = **GitHub Actions**.
3. Push (or run the workflow manually from the Actions tab) — it builds and publishes `dist/`.
4. Custom domain: Settings -> Pages -> Custom domain = `www.ccais.ac.uk` (this matches `site` in `astro.config.mjs`), then point DNS (CNAME `www` -> `<owner>.github.io`) and tick **Enforce HTTPS**.

Important: the site uses root-absolute asset paths (`/wp-content/...`), so it
must be served from a domain root — i.e. with a **custom domain** or an
`<owner>.github.io` repo, not from a `/repo-name/` sub-path. Other static hosts
(Cloudflare Pages, Netlify) work too: build with `npm run build`, output `dist`.
