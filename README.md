# CCAIS website — Astro rebuild

A static rebuild of [ccais.ac.uk](https://www.ccais.ac.uk/) (WordPress) using
[Astro](https://astro.build/). All WordPress content (pages, projects, news,
blog posts, events, impact, open source) was exported via the WP REST API into
Markdown content collections, and the original theme stylesheet is reused so
the site keeps the same look and feel.

## Getting started

```bash
npm install
npm run fetch-assets   # downloads images/fonts/video + full original CSS from the live site (one-off)
npm run dev            # local dev server at http://localhost:4321
npm run build          # static site in dist/ (also builds the Pagefind search index)
```

`npm run fetch-assets` mirrors every referenced `/wp-content/...` asset into
`public/`, and replaces `src/styles/theme.css` with the complete original
stylesheet (the bundled copy is the exported version; a small reconstructed
supplement in `src/styles/supplement.css` covers the same sections and remains
as a harmless fallback).

## Structure

- `src/content/` — Markdown content collections (`projects`, `news`, `blog`, `events`, `impacts`, `open-source`). Add a new post by dropping a `.md` file in the right folder. Listing excerpts are derived automatically from the first paragraph of the body (`src/lib/excerpt.ts`); add an `excerpt:` frontmatter field only if you want to override that.
- `public/images/team/` — team profile photos used by `src/pages/about-us/our-team.astro`.
- `src/pages/` — routes. Static pages (About, Vision, Team, …) are `.astro` files; listing/detail pages are generated from the collections. Original WordPress URLs are preserved (including blog posts under `/uncategorised/...`).
- `src/components/Nav.astro` — the **single** navigation menu used by both header and footer.
- `src/styles/theme.css` — original WordPress theme CSS; `supplement.css` — small additions.
- `scripts/fetch-assets.mjs` — asset mirror (see above).

## Deliberate changes from the WordPress site

- **Footer links fixed**: the old footer pointed at `/outputs/open-source/` and `/outputs/impact/` while the header used `/open-sources/` and `/impacts/`, and the footer was missing "About CCAIS". Header and footer now share one menu (the header's structure). Redirects in `astro.config.mjs` keep the old footer URLs working.
- **Search** is now [Pagefind](https://pagefind.app/) (static, built at build time) instead of WordPress search. Available at `/search/` after a production build.
- **Cookie banner removed** — the static site sets no tracking cookies, so the GDPR cookie plugin is unnecessary. If you add analytics, reconsider.
- **Newsletter forms** (header bar + above footer) are markup-complete but need an endpoint: point the form `action` at your provider (Mailchimp, Buttondown, …).
- **Contact form** uses Netlify Forms (`data-netlify`); on other hosts swap in Formspree or similar.

## LinkedIn posts

The homepage "Our socials" section can show official LinkedIn post embeds,
driven by `src/data/linkedin.json`. To feature a post: open it on LinkedIn ->
**...** menu -> **Embed this post** -> copy the iframe `src` URL into the
`posts` array (newest first; a plain post URL also works). The site shows the
first four. Embeds are click-to-load so LinkedIn sets no cookies until a
visitor opts in (their choice is remembered).

## Known gaps / TODO

- **Publications page**: rendered statically at build time from `src/data/pubs.json` (the WordPress theme used to load this data in the browser from S3). To refresh the list from the Pure API, run `python3 scripts/update-publications.py` (needs `pip install requests` and university network/VPN access to `api-pure.soton.ac.uk`), commit the updated `pubs.json`, and rebuild. Builds themselves need no VPN or network — safe for CI hooks. The script is a cleaned-up version of the old `update_project_publications.py` (same Pure project ID and output format; fixes a crash when a publication has contributors whose role isn't Author/Editor, and drops the unused YAML output path).
- **Team page photos**: member photos were rendered by a WordPress template (not exposed via the API), so the team page uses styled cards without photos. Add images to `src/pages/about-us/our-team.astro` if wanted.
- **Event dates**: stored in `eventDate` frontmatter (the WP ACF field wasn't public); verify the three event dates.
- **Footer background image**: the original was set inline by WordPress; a brand-purple fallback is used. Set a `background-image` on `.site-footer` if you want the original photo.

## Deploying (GitHub Pages)

A ready-made workflow (`.github/workflows/deploy.yml`) builds and deploys the
site to GitHub Pages on every push to `main`:

1. Run `npm run fetch-assets` once and **commit `public/wp-content/`** so CI
   doesn't depend on the old WordPress site staying up.
2. Push the project to a GitHub repository (`main` branch).
3. In the repo: Settings -> Pages -> Source = **GitHub Actions**.
4. Push (or run the workflow manually from the Actions tab) — the site appears
   at `https://<user>.github.io/<repo>/`.
5. Custom domain: Settings -> Pages -> Custom domain = `www.ccais.ac.uk`,
   then point DNS (CNAME `www` -> `<user>.github.io`) and tick Enforce HTTPS.

Important: the site uses root-absolute asset paths (`/wp-content/...`), so it
must be served from a domain root — i.e. with a **custom domain** or a
`<user>.github.io` repo, not from a `/repo-name/` sub-path. Other static hosts
(Cloudflare Pages, Netlify) work too: build `npm run build`, output `dist`.
