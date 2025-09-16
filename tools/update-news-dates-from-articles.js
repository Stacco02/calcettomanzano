/*
  Aggiorna le date nelle card di news-2025.html leggendo la data reale
  dentro ogni articolo in calcettomanzano/blog/*.html

  Logica di estrazione data, in ordine di priorità:
  1) <p class="meta"> … — <giorno_settimana> <DD> <Mese> <YYYY></p>
  2) Prima occorrenza di "DD <mese> YYYY" nel contenuto articolo

  Il formato finale scritto nella preview è: "DD <mese minuscolo> YYYY".
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const NEWS_FILE = path.join(ROOT, 'news-2025.html');

// Mappa mesi ITA: varie forme possibili -> forma lunga standard in minuscolo
const monthMap = {
  // abbreviazioni comuni
  'gen': 'gennaio', 'feb': 'febbraio', 'mar': 'marzo', 'apr': 'aprile',
  'mag': 'maggio', 'giu': 'giugno', 'lug': 'luglio', 'ago': 'agosto',
  'set': 'settembre', 'sett': 'settembre', 'ott': 'ottobre', 'nov': 'novembre', 'dic': 'dicembre',
  // forme lunghe
  'gennaio': 'gennaio', 'febbraio': 'febbraio', 'marzo': 'marzo', 'aprile': 'aprile',
  'maggio': 'maggio', 'giugno': 'giugno', 'luglio': 'luglio', 'agosto': 'agosto',
  'settembre': 'settembre', 'ottobre': 'ottobre', 'novembre': 'novembre', 'dicembre': 'dicembre'
};

// Regex per <p class="meta"> … — Lunedì 13 Mag 2024</p>
const metaDateRe = /<p\s+class=["']meta["'][^>]*>[^<]*?—\s*[^\s<]+\s+(\d{1,2})\s+([A-Za-zÀ-ú]{3,})\s+(\d{4})/i;

// Regex per testi del tipo: 14 giugno 2025
const textDateRe = /\b(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})\b/i;

function normalizeMonth(m) {
  const key = (m || '').toLowerCase().replace(/\./g, '');
  return monthMap[key] || null;
}

function extractDateFromArticle(html) {
  // 1) prova nel contenuto (preferita): prima data testuale DD <mese> YYYY
  let m = html.match(textDateRe);
  if (m) {
    const day = m[1];
    const month = normalizeMonth(m[2]);
    const year = m[3];
    if (month) return `${parseInt(day, 10)} ${month} ${year}`;
  }
  // 2) fallback: data nel meta
  m = html.match(metaDateRe);
  if (m) {
    const day = m[1];
    const month = normalizeMonth(m[2]);
    const year = m[3];
    if (month) return `${parseInt(day, 10)} ${month} ${year}`;
  }
  return null;
}

function buildFileDateMap() {
  const map = new Map(); // filename -> date string
  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!e.name.endsWith('.html')) continue;
    if (e.name.startsWith('index.html')) continue; // ignora vecchie pagine indice
    const full = path.join(BLOG_DIR, e.name);
    try {
      const html = fs.readFileSync(full, 'utf8');
      const date = extractDateFromArticle(html);
      if (date) map.set(e.name, date);
    } catch (err) {
      // ignora file illeggibili
    }
  }
  return map;
}

function updateNewsPage(fileDateMap) {
  let html = fs.readFileSync(NEWS_FILE, 'utf8');

  // Split per articolo, così limitiamo la sostituzione al blocco giusto
  const parts = html.split(/(<article\s+class=\"news-card\"[\s\S]*?<\/article>)/g);
  let updated = 0;
  const newParts = parts.map((block) => {
    if (!block.startsWith('<article')) return block; // non è una card

    // trova il primo href a blog/<filename>
    const m = block.match(/href=\"blog\/([^\"]+)\"/);
    if (!m) return block;
    const filename = m[1].split('?')[0]; // rimuove eventuali query string
    const date = fileDateMap.get(filename);
    if (!date) return block;

    // sostituisci il contenuto di <span class="news-date">...</span>
    const replaced = block.replace(/<span\s+class=\"news-date\">[\s\S]*?<\/span>/, `<span class="news-date">${date}</span>`);
    if (replaced !== block) updated++;
    return replaced;
  });

  const next = newParts.join('');
  if (next !== html) {
    fs.writeFileSync(NEWS_FILE, next);
  }
  return updated;
}

function main() {
  const fileDateMap = buildFileDateMap();
  if (fileDateMap.size === 0) {
    console.log('Nessuna data trovata negli articoli. Nessun aggiornamento.');
    return;
  }
  const updated = updateNewsPage(fileDateMap);
  console.log(`Date aggiornate in ${updated} card su news-2025.html`);
}

if (require.main === module) {
  main();
}
