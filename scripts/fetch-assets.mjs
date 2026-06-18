#!/usr/bin/env node
/**
 * Downloads all images, fonts, video and the original theme stylesheet from
 * the live WordPress site into this project, so the static site is fully
 * self-contained. Run once before building:
 *
 *   npm run fetch-assets
 *
 * Safe to re-run; existing files are skipped.
 */
import { mkdir, writeFile, readFile, readdir, access } from 'node:fs/promises';
import { dirname, join, extname } from 'node:path';

const BASE = 'https://www.ccais.ac.uk';
const ROOT = new URL('..', import.meta.url).pathname;
const PUBLIC = join(ROOT, 'public');

// Assets referenced by the theme / layout that don't appear inside content:
const STATIC_ASSETS = [
  // Theme images
  '/wp-content/themes/ccais/img/plus-icon.svg',
  '/wp-content/themes/ccais/img/plus-icon.png',
  '/wp-content/themes/ccais/img/close-button.svg',
  '/wp-content/themes/ccais/img/play-button.svg',
  '/wp-content/themes/ccais/img/menu-item-has-children-arrow.svg',
  '/wp-content/themes/ccais/img/button-after-arrow.svg',
  // Favicon set (RealFaviconGenerator output referenced in the <head>)
  '/wp-content/themes/ccais/img/favicon/favicon.ico',
  '/wp-content/themes/ccais/img/favicon/favicon-16x16.png',
  '/wp-content/themes/ccais/img/favicon/favicon-32x32.png',
  '/wp-content/themes/ccais/img/favicon/apple-touch-icon.png',
  '/wp-content/themes/ccais/img/favicon/site.webmanifest',
  '/wp-content/themes/ccais/img/favicon/android-chrome-192x192.png',
  '/wp-content/themes/ccais/img/favicon/android-chrome-512x512.png',
  '/wp-content/themes/ccais/img/favicon/mstile-150x150.png',
  '/wp-content/themes/ccais/img/favicon/browserconfig.xml',
  // Fonts are self-hosted (Outfit, see public/fonts/); nothing to mirror.
  // Partner card background photos (inline background-image on the partners
  // page, which the homepage-only inline-bg scan below doesn't reach).
  '/wp-content/uploads/2023/11/catapult-image.png',
  '/wp-content/uploads/2023/11/dstl-image.png',
  '/wp-content/uploads/2023/11/ea-image.png',
  '/wp-content/uploads/2023/11/catapul-energy-image-2.jpg',
  '/wp-content/uploads/2023/11/fawley-image.png',
  '/wp-content/uploads/2023/11/ibm-image.png',
  '/wp-content/uploads/2023/11/jag-image.png',
  '/wp-content/uploads/2023/11/siemens-image.png',
  '/wp-content/uploads/2023/11/thales-image.png',
  '/wp-content/uploads/2023/11/utu-image.png',
  // Logos
  '/wp-content/uploads/2023/09/CCAIS-logo-colour.svg',
  '/wp-content/uploads/2024/01/CCAIS-logo-white.svg',
  '/wp-content/uploads/2023/10/CCAIS-logo-stack-white.svg',
  '/wp-content/uploads/2023/10/fixed-logo.svg',
  '/wp-content/uploads/2023/10/UoS-logo-white.svg',
  '/wp-content/uploads/2023/10/UKRI-logo-white.svg',
  // Hero video
  '/wp-content/uploads/2024/02/southampton_ccai_web_edit-1080p.mp4'
];

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function collectReferencedAssets() {
  const urls = new Set(STATIC_ASSETS);
  const rx = /\/wp-content\/[A-Za-z0-9_\-./%()]+?\.(?:png|jpe?g|gif|svg|webp|mp4|pdf|woff2?)/g;
  for (const dir of ['src/content', 'src/pages', 'src/components', 'src/layouts']) {
    try {
      for await (const file of walk(join(ROOT, dir))) {
        const text = await readFile(file, 'utf8');
        for (const m of text.matchAll(rx)) urls.add(decodeURI(m[0]));
      }
    } catch { /* dir may not exist */ }
  }
  return [...urls];
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function download(path, dest) {
  if (await exists(dest)) return 'skip';
  const res = await fetch(BASE + encodeURI(path), { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return 'ok';
}

const assets = await collectReferencedAssets();
console.log(`Fetching ${assets.length} assets from ${BASE} ...`);
let ok = 0, skip = 0, fail = 0;
for (const path of assets) {
  const dest = join(PUBLIC, path);
  try {
    const r = await download(path, dest);
    r === 'skip' ? skip++ : ok++;
    if (r === 'ok') console.log('  ✓', path);
  } catch (e) {
    fail++;
    console.warn('  ✗', path, String(e));
  }
}

// Replace the (partially exported) theme stylesheet with the full original.
try {
  const res = await fetch(`${BASE}/wp-content/themes/ccais/style.css`);
  if (res.ok) {
    let css = await res.text();
    // Theme-relative urls (img/...) must resolve against the theme directory.
    css = css.replaceAll('url("img/', 'url("/wp-content/themes/ccais/img/');
    css = css.replaceAll('url(img/', 'url(/wp-content/themes/ccais/img/');
    // Fonts are loaded via <link> tags in Base.astro; @import here would
    // break the Vite build (absolute/remote imports).
    css = css.replace(/^@import url\(.*$/gm, '');
    // Vite chokes on the missing sourcemap reference
    css = css.replace(/\/\*# sourceMappingURL=.*?\*\//g, '');
    // The original theme used the licensed Gordita webfont. We've swapped it
    // for self-hosted Poppins (see src/styles/fonts.css), so re-apply that
    // substitution here — otherwise this refresh silently reverts the body
    // font to Gordita, whose files are no longer shipped, and text falls
    // back to the browser's default serif.
    css = css.replace(/font-family:\s*Gordita\s*;/gi, 'font-family: "Poppins", sans-serif;');
    await writeFile(join(ROOT, 'src/styles/theme.css'), css);
    console.log('  ✓ src/styles/theme.css replaced with full original stylesheet');
  }
} catch (e) {
  console.warn('  ✗ could not refresh theme.css:', String(e));
}

// Discover inline background images (e.g. the footer artwork) from the live
// site's HTML — these were set by WordPress per-element, not in the CSS.
try {
  const html = await (await fetch(BASE + '/')).text();
  const footerMatch = html.match(/class="site-footer"[^>]*url\(['"]?([^'")]+)['"]?\)/);
  const inlineUrls = [...html.matchAll(/url\(['"]?(\/wp-content\/[^'")]+)['"]?\)/g)].map((m) => m[1]);
  const videoMatch = html.match(/data-video="([^"]+)"/);
  const assets = { footerBackground: '', wwabVideo: videoMatch ? videoMatch[1] : '' };
  if (footerMatch) {
    assets.footerBackground = footerMatch[1].replace(/https?:\/\/(www\.)?ccais\.ac\.uk/, '');
    inlineUrls.push(assets.footerBackground);
    console.log('  ✓ footer background found:', assets.footerBackground);
  } else {
    console.warn('  ! footer background image not found in homepage HTML');
  }
  if (videoMatch) console.log('  ✓ embedded video found:', assets.wwabVideo);
  await writeFile(join(ROOT, 'src/data/site-assets.json'), JSON.stringify(assets, null, 1) + '\n');
  for (const u of [...new Set(inlineUrls)]) {
    try {
      const r = await download(u, join(PUBLIC, u));
      if (r === 'ok') console.log('  ✓', u);
    } catch (e) { console.warn('  ✗', u, String(e)); }
  }
} catch (e) {
  console.warn('  ✗ could not scan homepage for inline backgrounds:', String(e));
}

console.log(`Done: ${ok} downloaded, ${skip} already present, ${fail} failed.`);
if (fail) process.exitCode = 1;
