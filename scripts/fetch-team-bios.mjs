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

// Member slugs from src/data/team.ts
const teamTs = await readFile(new URL('../src/data/team.ts', import.meta.url), 'utf8');
const slugs = [...teamTs.matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);

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
for (const slug of slugs) {
  // WordPress author slugs sometimes use underscores where team.ts uses
  // hyphens (e.g. ezhilarasi_periyathambi vs ezhilarasi-periyathambi), so try
  // both and keep the first that actually yields bio details.
  const variants = slug.includes('-') ? [slug, slug.replace(/-/g, '_')] : [slug];
  let data = null;
  for (const v of variants) {
    try {
      const res = await fetch(`${BASE}/author/${v}/`, { redirect: 'follow' });
      if (!res.ok) continue;
      const d = extract(await res.text());
      if (Object.keys(d).length) { data = d; break; }
    } catch (e) {
      console.warn(`  ✗ ${slug} (${v}):`, String(e));
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
