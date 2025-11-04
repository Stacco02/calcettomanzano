#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GALLERY_DIR = path.join(ROOT, 'gallery');
const INDEX_FILE = path.join(ROOT, 'index.html');
const GALLERY_PAGE = path.join(ROOT, 'galleria-2025.html');

const VALID_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

function listImages() {
  const files = fs.readdirSync(GALLERY_DIR)
    .filter(name => VALID_EXT.includes(path.extname(name).toLowerCase()))
    .map(name => {
      const stats = fs.statSync(path.join(GALLERY_DIR, name));
      return { name, mtime: stats.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return files;
}

function toAlt(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[_.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\((.*?)\)/g, '$1')
    .trim()
    || 'Foto C5 Manzano';
}

function buildItem(image, indent = '\t\t\t\t\t') {
  const encoded = encodeURIComponent(image.name);
  const alt = escapeHtml(toAlt(image.name));
  return `${indent}<div class="gallery-item"><div class="media"><img loading="lazy" src="gallery/${encoded}" alt="${alt}" /></div></div>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inject(filePath, startMarker, endMarker, markup, indent) {
  const file = fs.readFileSync(filePath, 'utf8');
  const start = file.indexOf(startMarker);
  const end = file.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Markers not found in ${filePath}`);
  }
  const before = file.slice(0, start + startMarker.length);
  const after = file.slice(end);
  const content = markup ? markup.join('\n') + '\n' : '';
  const updated = `${before}\n${content}${indent}${after}`;
  fs.writeFileSync(filePath, updated);
}

function main() {
  const images = listImages();
  if (!images.length) {
    console.warn('Nessuna immagine trovata in gallery/.');
    return;
  }

  const latest = images.slice(0, 3).map(img => buildItem(img));
  const full = images.map(img => buildItem(img));

  inject(INDEX_FILE, '<!-- gallery-latest:start -->', '<!-- gallery-latest:end -->', latest, '\t\t\t\t\t');
  inject(GALLERY_PAGE, '<!-- gallery-full:start -->', '<!-- gallery-full:end -->', full, '\t\t\t\t');

  console.log(`Aggiornata galleria: ${images.length} immagini, ultime ${latest.length} in home.`);
}

main();
