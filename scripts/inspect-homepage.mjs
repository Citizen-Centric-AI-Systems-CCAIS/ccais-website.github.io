#!/usr/bin/env node
/**
 * Prints the original WordPress markup of the homepage "who we are" section
 * (the Prof Stein box) so the Astro version can replicate it exactly.
 *
 *   node scripts/inspect-homepage.mjs
 */
const html = await (await fetch('https://www.ccais.ac.uk/')).text();

function extractSection(cls) {
  const start = html.indexOf(`class="${cls}`);
  if (start < 0) return `(no element with class ${cls} found)`;
  const open = html.lastIndexOf('<', start);
  // crude tag-balanced extraction
  let depth = 0, i = open;
  const tag = html.slice(open + 1, html.indexOf(' ', open)).trim();
  const re = new RegExp(`<${tag}[\\s>]|</${tag}>`, 'g');
  re.lastIndex = open;
  let m, end = -1;
  while ((m = re.exec(html))) {
    m[0].startsWith(`</`) ? depth-- : depth++;
    if (depth === 0) { end = m.index + m[0].length; break; }
  }
  return html.slice(open, end > 0 ? end : open + 4000);
}

console.log('=== .who-we-are-section ===');
console.log(extractSection('who-we-are-section').replace(/\n\s*\n/g, '\n'));
