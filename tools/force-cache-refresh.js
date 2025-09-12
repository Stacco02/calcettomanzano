const fs = require('fs');
const path = require('path');

const newsPagePath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/news-2025.html';

// Legge la pagina news
let newsContent = fs.readFileSync(newsPagePath, 'utf8');

console.log('Aggiungendo parametri cache-busting ai link degli articoli...');

// Aggiunge un timestamp ai link degli articoli per forzare il refresh della cache
const timestamp = Date.now();
const linkRegex = /href="blog\/([^"]+\.html)"/g;

newsContent = newsContent.replace(linkRegex, (match, filename) => {
    return `href="blog/${filename}?v=${timestamp}"`;
});

// Salva la pagina aggiornata
fs.writeFileSync(newsPagePath, newsContent);

console.log(`✅ Aggiunto parametro cache-busting v=${timestamp} a tutti i link degli articoli`);
console.log('📄 Pagina news aggiornata!');
