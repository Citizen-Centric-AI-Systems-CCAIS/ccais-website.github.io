#!/usr/bin/env node
/**
 * Scrapes the old WordPress author pages (https://www.ccais.ac.uk/author/<slug>/)
 * for each team member and writes src/data/team-bios.json with their email,
 * website, biography and authored posts. The /author/<slug>/ pages on the
 * Astro site render this data.
 *
 *   node scripts/fetch-team-bios.mjs
 *
 * Members without an author page on the old site are skipped (their person
 * page still works, just without a biography).
 */
import { readFile, writeFile } from 'node:fs/promises';

const BASE = 'https://www.ccais.ac.uk';
const ROOT = new URL('..', import.meta.url).pathname;

// Members (slug + name) from src/data/team.ts
const teamTs = await readFile(new URL('../src/data/team.ts', import.meta.url), 'utf8');
const members = [...teamTs.matchAll(/slug: '([^']+)',\s*name: '([^']+)'/g)].map((m) => ({ slug: m[1], name: m[2] }));

// The team page links each member to their real author archive, whose slug is
// often a WordPress username (e.g. /author/adrian/) unrelated to the team.ts
// slug. Scrape that name -> author-URL map so we don't have to guess the URL.
const norm = (s) => s.replace(/^(Dr|Professor|Prof|Mr|Ms|Mrs)\.?\s+/i, '').trim().toLowerCase();
let authorLinks = [];
try {
  const teamHtml = await (await fetch(`${BASE}/about-us/our-team/`)).text();
  authorLinks = [...teamHtml.matchAll(/<a[^>]*href="([^"]*\/author\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map((m) => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase() }));
} catch (e) {
  console.warn('  ! could not load team page for author-link map:', String(e));
}

const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&#8217;|&rsquo;/g, '’').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function extract(html) {
  // The author template: <h2>Name</h2> role ... Email/Website/Biography blocks,
  // then "Projects & Blogs" links.
  const main = html.split(/<main[^>]*>/)[1]?.split('</main>')[0] ?? html;
  const out = {};
  const email = main.match(/mailto:([^"']+)/);
  if (email) out.email = email[1].trim();
  const site = main.match(/Website:[\s\S]{0,400}?href="([^"]+)"/i);
  if (site) out.website = site[1];
  const bio = main.match(/Biography:\s*<\/h4>([\s\S]*?)(<h[234]|<div class|$)/i);
  if (bio) {
    out.biography = bio[1]
      .split(/<\/p>/)
      .map(strip)
      .filter(Boolean)
      .join('\n');
  }
  return out;
}

const bios = {};
for (const { slug, name } of members) {
  // Candidate author URLs, best first: the team-page link matched by name
  // (handles username-style slugs like /author/adrian/), then the team.ts slug
  // and its underscore variant (e.g. ezhilarasi_periyathambi).
  const urls = [];
  const link = authorLinks.find((l) => l.text.includes(norm(name)));
  if (link) urls.push(link.href);
  urls.push(`${BASE}/author/${slug}/`);
  if (slug.includes('-')) urls.push(`${BASE}/author/${slug.replace(/-/g, '_')}/`);

  let data = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) continue;
      const d = extract(await res.text());
      if (Object.keys(d).length) { data = d; break; }
    } catch (e) {
      console.warn(`  ✗ ${slug}:`, String(e));
    }
  }
  if (data) {
    bios[slug] = data;
    console.log(`  ✓ ${slug}: ${Object.keys(data).join(', ')}`);
  } else {
    console.log(`  - ${slug}: no author page / no details`);
  }
}

await writeFile(`${ROOT}src/data/team-bios.json`, JSON.stringify(bios, null, 1) + '\n');
console.log(`\nWrote ${Object.keys(bios).length} bios to src/data/team-bios.json — rebuild to publish.`);
