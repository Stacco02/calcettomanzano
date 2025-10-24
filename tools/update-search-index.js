const fs = require('fs');
const path = require('path');

const searchIndexPath = path.join(__dirname, '..', 'search-index.js');
const articlesJsonPath = path.join(__dirname, '..', 'articles-list.json');

const articles = JSON.parse(fs.readFileSync(articlesJsonPath, 'utf8'));

const seen = new Set();
const normalized = articles
  .filter(article => article.cleanName)
  .filter(article => {
    if (seen.has(article.cleanName)) return false;
    seen.add(article.cleanName);
    return true;
  })
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  .map(article => ({
    id: article.cleanName,
    title: article.title,
    meta: `${article.author} — ${article.date}`,
    content: article.preview,
    fullText: (article.content || '').replace(/<[^>]+>/g, '').toLowerCase(),
    filename: `${article.cleanName}.html`
  }));

const content = `// Indice di ricerca per gli articoli\nconst searchIndex = ${JSON.stringify(normalized, null, 2)};\n\n// Funzione per cercare negli articoli\nfunction searchInArticles(searchTerm) {\n    if (!searchTerm || searchTerm.length < 2) {\n        return searchIndex;\n    }\n    const term = searchTerm.toLowerCase().trim();\n    const words = term.split(/\s+/);\n    return searchIndex.filter(article => words.every(word => article.fullText.includes(word)));\n}\n\nwindow.searchIndex = searchIndex;\nwindow.searchInArticles = searchInArticles;\n`;

fs.writeFileSync(searchIndexPath, content);
console.log(`Aggiornato search-index.js con ${normalized.length} articoli`);
