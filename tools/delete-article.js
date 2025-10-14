#!/usr/bin/env node

/**
 * Delete a published article (blog file, news card, search-index entry, cover image).
 *
 * Usage:
 *   node tools/delete-article.js <slug>
 *
 * Example:
 *   node tools/delete-article.js u19-convocazioni-maccan-prata-c5-c5-manzano-1988-html
 */

const fs = require('fs');
const path = require('path');

const slug = (process.argv[2] || '').trim();
if (!slug) {
  console.error('Usage: node tools/delete-article.js <slug>');
  process.exit(1);
}

const projectRoot = path.resolve(__dirname, '..');
const blogFile = path.join(projectRoot, 'blog', `${slug}.html`);
const newsFile = path.join(projectRoot, 'news-2025.html');
const searchFile = path.join(projectRoot, 'search-index.js');
const coverDir = path.join(projectRoot, 'images', 'covers');

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

if (!fileExists(blogFile)) {
  console.error(`Blog file not found: blog/${slug}.html`);
  process.exit(1);
}

// Delete blog page
fs.unlinkSync(blogFile);
console.log(`✔ Removed blog/${slug}.html`);

// Remove news card
let newsHtml = fs.readFileSync(newsFile, 'utf8');
const cardRegex = new RegExp(
  `<article[^>]*class="news-card"[\\s\\S]*?href="blog/${slug}\\.html[^"]*"[\\s\\S]*?</article>\\s*`,
  'i'
);
if (cardRegex.test(newsHtml)) {
  newsHtml = newsHtml.replace(cardRegex, '');
  fs.writeFileSync(newsFile, newsHtml);
  console.log('✔ Removed card from news-2025.html');
} else {
  console.warn('⚠ Card not found in news-2025.html (check manually).');
}

// Remove entry from search-index.js
let searchJs = fs.readFileSync(searchFile, 'utf8');
const marker = `"filename": "${slug}.html"`;
const markerAlt = `'filename': '${slug}.html'`;
let idx = searchJs.indexOf(marker);
if (idx === -1) idx = searchJs.indexOf(markerAlt);

if (idx !== -1) {
  let start = idx;
  while (start >= 0 && searchJs[start] !== '{') start--;
  if (start < 0) {
    console.warn('⚠ Could not determine entry start in search-index.js');
  } else {
    let end = start;
    let depth = 0;
    let reached = false;
    for (; end < searchJs.length; end++) {
      const char = searchJs[end];
      if (char === '{') depth++;
      if (char === '}') {
        depth--;
        if (depth === 0) {
          end++;
          reached = true;
          break;
        }
      }
    }
    if (!reached) {
      console.warn('⚠ Could not determine entry end in search-index.js');
    } else {
      while (end < searchJs.length && /[\s,]/.test(searchJs[end])) end++;
      searchJs = searchJs.slice(0, start) + searchJs.slice(end);
      fs.writeFileSync(searchFile, searchJs);
      console.log('✔ Removed entry from search-index.js');
    }
  }
} else {
  console.warn('⚠ Entry not found in search-index.js (check manually).');
}

// Remove cover image if present
const possibleExt = ['jpg', 'jpeg', 'png', 'webp'];
let coverRemoved = false;
possibleExt.forEach((ext) => {
  const coverPath = path.join(coverDir, `${slug}.${ext}`);
  if (fileExists(coverPath)) {
    fs.unlinkSync(coverPath);
    console.log(`✔ Removed cover image images/covers/${slug}.${ext}`);
    coverRemoved = true;
  }
});
if (!coverRemoved) {
  console.log('ℹ No dedicated cover image found (nothing to remove).');
}

console.log('Done. Review changes and commit.');
