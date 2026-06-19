#!/usr/bin/env node
/**
 * Down-scales and re-compresses oversized raster images in public/ so the
 * site doesn't ship multi-megapixel originals for images shown small.
 *
 *   npm run optimize-images          # optimise in place
 *   npm run optimize-images -- --dry # report only, write nothing
 *
 * - Caps the longest edge at MAX_DIM (default 1280px; full-width content still
 *   looks crisp, but huge originals are trimmed).
 * - Re-encodes JPEG with mozjpeg and PNG with palette quantisation.
 * - Only rewrites a file if the result is actually smaller.
 * - Records optimised sizes in scripts/.image-optim.json and skips unchanged
 *   files on re-run, so it's safe to run repeatedly without quality loss.
 */
import sharp from 'sharp';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, relative, dirname } from 'node:path';

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const PUBLIC_DIR = args.find((a) => !a.startsWith('-')) || new URL('../public', import.meta.url).pathname;
const MAX_DIM = Number(process.env.MAX_DIM || 1280);
const JPEG_Q = Number(process.env.JPEG_Q || 78);
const MANIFEST = join(PUBLIC_DIR, '..', 'scripts', '.image-optim.json');
// Full-res masters are archived here (mirroring the public/ structure) before
// an image is optimised, so the originals are never lost. Not deployed.
const ORIGINALS_DIR = join(PUBLIC_DIR, '..', 'originals');

const exts = new Set(['.jpg', '.jpeg', '.png']);
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (exts.has(extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

const kb = (n) => Math.round(n / 1024);
let before = 0, after = 0, changed = 0, skipped = 0;

const files = await walk(PUBLIC_DIR);
let processed = 0;
for (const f of files) {
  const rel = relative(PUBLIC_DIR, f);
  if (!DRY && ++processed % 15 === 0) writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  const buf = await readFile(f);
  before += buf.length;

  if (manifest[rel] === buf.length) { after += buf.length; skipped++; continue; }

  let meta;
  try { meta = await sharp(buf, { failOn: 'none' }).metadata(); }
  catch { after += buf.length; skipped++; continue; }

  const longest = Math.max(meta.width || 0, meta.height || 0);
  const needResize = longest > MAX_DIM;

  let pipeline = sharp(buf, { failOn: 'none' }).rotate();
  if (needResize) {
    pipeline = pipeline.resize({
      width: (meta.width || 0) >= (meta.height || 0) ? MAX_DIM : undefined,
      height: (meta.height || 0) > (meta.width || 0) ? MAX_DIM : undefined,
      withoutEnlargement: true,
    });
  }
  const ext = extname(f).toLowerCase();
  pipeline = ext === '.png'
    ? pipeline.png({ compressionLevel: 9, palette: true, quality: 80 })
    : pipeline.jpeg({ quality: JPEG_Q, mozjpeg: true });

  let outBuf;
  try { outBuf = await pipeline.toBuffer(); }
  catch { after += buf.length; skipped++; continue; }

  if (outBuf.length < buf.length) {
    after += outBuf.length;
    changed++;
    if (!DRY) {
      const orig = join(ORIGINALS_DIR, rel);
      if (!existsSync(orig)) { mkdirSync(dirname(orig), { recursive: true }); writeFileSync(orig, buf); }
      await writeFile(f, outBuf);
    }
    manifest[rel] = outBuf.length;
    console.log(`${needResize ? 'resize+recompress' : 'recompress       '}  ${rel}  ${kb(buf.length)}KB -> ${kb(outBuf.length)}KB`);
  } else {
    after += buf.length;
    manifest[rel] = buf.length;
    skipped++;
  }
}

if (!DRY) writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n${DRY ? '[dry] ' : ''}${changed} optimised, ${skipped} unchanged. Total ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB`);
