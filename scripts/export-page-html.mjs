#!/usr/bin/env node
/**
 * Saves the raw HTML of the old WordPress pages into wp-export-html/ so the
 * static Astro pages can replicate their exact section markup (hero images,
 * column layouts, etc. are invisible to text-only scrapers).
 *
 *   node scripts/export-page-html.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = 'https://www.ccais.ac.uk';
const OUT = new URL('../wp-export-html/', import.meta.url).pathname;

const PAGES = {
  'home': '/',
  'about-us': '/about-us/',
  'vision': '/about-us/vision/',
  'applications': '/about-us/applications/',
  'our-partners': '/about-us/our-partners/',
  'our-team': '/about-us/our-team/',
  'seminar-series': '/seminar-series/',
  'join-us': '/join-us/',
  'partner-with-us': '/partner-with-us/',
  'contact-ccais': '/contact-ccais/',
  'publications': '/outputs/publications/',
  'archive-projects': '/projects/',
  'archive-news': '/latest-news/',
  'archive-blog': '/blog/',
  'archive-events': '/events/',
  'single-project': '/projects/evtonomy/',
  'single-blog': '/uncategorised/successful-ccais-summer-internships-2023/'
};

await mkdir(OUT, { recursive: true });

// One complete page (header + footer included) for layout reference
try {
  const res = await fetch(BASE + '/', { redirect: 'follow' });
  await writeFile(`${OUT}full-home.html`, await res.text());
  console.log('  ✓ full-home.html (complete page incl. header/footer)');
} catch (e) { console.warn('  ✗ full page:', String(e)); }
for (const [name, path] of Object.entries(PAGES)) {
  try {
    const res = await fetch(BASE + path, { redirect: 'follow' });
    if (!res.ok) { console.warn(`  ✗ ${path}: HTTP ${res.status}`); continue; }
    let html = await res.text();
    // keep only the interesting part (between header and footer) to keep files small
    const main = html.match(/<main[\s\S]*?<\/main>/);
    await writeFile(`${OUT}${name}.html`, main ? main[0] : html);
    console.log(`  ✓ ${name}.html`);
  } catch (e) {
    console.warn(`  ✗ ${path}:`, String(e));
  }
}
console.log(`\nSaved to wp-export-html/ — these files are inputs for development only (not published).`);
