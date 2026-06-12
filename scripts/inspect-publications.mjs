#!/usr/bin/env node
/**
 * Fetches the raw HTML of the live WordPress publications page and reports
 * the scripts / iframes / embeds it uses, so the same mechanism can be wired
 * into src/pages/outputs/publications.astro.
 *
 *   node scripts/inspect-publications.mjs
 *
 * Saves the full HTML to wp-export-publications.html for inspection.
 */
import { writeFile } from 'node:fs/promises';

const url = 'https://www.ccais.ac.uk/outputs/publications/';
const html = await (await fetch(url)).text();
await writeFile(new URL('../wp-export-publications.html', import.meta.url), html);

const grab = (rx) => [...html.matchAll(rx)].map((m) => m[1]);
console.log('Scripts:');
for (const s of grab(/<script[^>]*src="([^"]+)"/g)) console.log('  ', s);
console.log('Iframes:');
for (const s of grab(/<iframe[^>]*src="([^"]+)"/g)) console.log('  ', s);
console.log('Inline scripts mentioning publications/eprints:');
for (const m of html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)) {
  if (/publica|eprint|scholar|orcid|pure/i.test(m[1])) console.log(m[1].slice(0, 500), '\n---');
}
console.log('\nFull HTML saved to wp-export-publications.html');
