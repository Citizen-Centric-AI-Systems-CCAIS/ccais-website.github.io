#!/usr/bin/env node
/**
 * Downloads the header images used by hand-authored project pages into
 * public/images/projects/, so the site stays fully self-contained (rather than
 * hot-linking the image host). Run once after adding a new entry below:
 *
 *   npm run fetch-project-images
 *
 * Safe to re-run; images that already exist are skipped. Each image's source
 * and licence are recorded next to it here and credited in the project's .md.
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

// dest is relative to the project root; it must match the `image:` path in the
// corresponding project markdown (minus the leading "public").
const IMAGES = [
  {
    project: 'building-physics-for-low-carbon-comfort',
    credit: 'Photo by Nha Chill on Unsplash (Unsplash License)',
    url: 'https://images.unsplash.com/photo-1751945965597-71171ec7a458?auto=format&fit=crop&w=1600&q=70',
    dest: 'public/images/projects/building-physics-for-low-carbon-comfort.jpg'
  },
  {
    project: 'generative-occupants-llm-agents-for-building-simulation',
    credit: 'Photo by Fabian Kleiser on Unsplash (Unsplash License)',
    url: 'https://images.unsplash.com/photo-1745015446589-7ee6f702d8c1?auto=format&fit=crop&w=1600&q=70',
    dest: 'public/images/projects/generative-occupants-llm-agents-for-building-simulation.jpg'
  },
  {
    project: 'news: ccais-at-buildsys-2026',
    credit: 'Photo by David Wirzba on Unsplash (Unsplash License)',
    url: 'https://images.unsplash.com/photo-1558818061-547b1114aa6a?auto=format&fit=crop&w=1600&q=70',
    dest: 'public/images/news/ccais-at-buildsys-2026.jpg'
  },
  {
    project: 'team: stephanie-gauthier',
    credit: 'University of Southampton staff profile photo',
    url: 'https://www.southampton.ac.uk/sites/default/files/styles/max_1300x1300/public/staff/sg1f14-62358.jpg.webp?h=735f7c84&itok=BFUVMP00',
    dest: 'public/images/team/stephanie-gauthier.webp'
  }
];

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

let ok = 0, skip = 0, fail = 0;
for (const { credit, url, dest } of IMAGES) {
  const out = join(ROOT, dest);
  if (await exists(out)) { console.log('  · skip', dest); skip++; continue; }
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, Buffer.from(await res.arrayBuffer()));
    console.log('  ✓', dest, '—', credit);
    ok++;
  } catch (e) {
    console.warn('  ✗', dest, String(e));
    fail++;
  }
}
console.log(`Done: ${ok} downloaded, ${skip} already present, ${fail} failed.`);
if (fail) process.exitCode = 1;
