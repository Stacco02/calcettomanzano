#!/usr/bin/env node
/**
 * Ridimensiona e comprime le foto della cartella gallery/ generando:
 * - gallery/optimized/    -> immagini max 1600px lato lungo (per visualizzazioni full)
 * - gallery/thumbs/       -> anteprime max 800px lato lungo (per griglie/cards)
 *
 * Richiede: npm install sharp globby
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { globby } = require('globby');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'gallery');
const OUT_DIR = path.join(SRC_DIR, 'optimized');
const THUMBS_DIR = path.join(SRC_DIR, 'thumbs');

const SUPPORTED = ['.jpg', '.jpeg', '.png', '.webp'];

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function processImage(file) {
  const ext = path.extname(file).toLowerCase();
  if (!SUPPORTED.includes(ext)) return;

  const name = path.basename(file, ext);
  const baseOutput = name.replace(/[^a-z0-9_-]+/gi, '_');

  const optimizedPath = path.join(OUT_DIR, `${baseOutput}.webp`);
  const thumbPath = path.join(THUMBS_DIR, `${baseOutput}.webp`);

  const buffer = await fs.promises.readFile(file);
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const maxFull = 1600;
  const maxThumb = 800;

  const resizedFull = image.clone().resize({ width: maxFull, height: maxFull, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 });
  const resizedThumb = image.clone().resize({ width: maxThumb, height: maxThumb, fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 });

  await Promise.all([
    resizedFull.toFile(optimizedPath),
    resizedThumb.toFile(thumbPath),
  ]);

  console.log(`✓ ${path.basename(file)} -> ${path.relative(ROOT, optimizedPath)} / ${path.relative(ROOT, thumbPath)} (${metadata.width}x${metadata.height})`);
}

async function main() {
  await ensureDir(OUT_DIR);
  await ensureDir(THUMBS_DIR);

  const files = await globby(SUPPORTED.map(ext => `gallery/**/*${ext}`), {
    cwd: ROOT,
    absolute: true,
    onlyFiles: true,
    ignore: ['gallery/optimized/**', 'gallery/thumbs/**'],
  });

  if (!files.length) {
    console.log('Nessuna immagine trovata in gallery/.');
    return;
  }

  console.log(`Ottimizzo ${files.length} file...`);
  for (const file of files) {
    try {
      await processImage(file);
    } catch (err) {
      console.error(`Errore su ${file}:`, err.message);
    }
  }
  console.log('Fatto.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
