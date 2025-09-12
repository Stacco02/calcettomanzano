const fs = require('fs');
const path = require('path');

const newsPagePath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/news-2025.html';
const articlesListPath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json';

// Legge la lista degli articoli
const articlesList = JSON.parse(fs.readFileSync(articlesListPath, 'utf8'));

// Legge la pagina news
let newsContent = fs.readFileSync(newsPagePath, 'utf8');

console.log(`Aggiornando i link nella pagina news per ${articlesList.length} articoli...`);

// Aggiorna ogni link
articlesList.forEach(article => {
    const oldLink = `blog/${article.filename}`;
    const newLink = `blog/${article.cleanName}.html`;
    
    if (newsContent.includes(oldLink)) {
        newsContent = newsContent.replace(new RegExp(oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newLink);
        console.log(`✅ Aggiornato: ${oldLink} → ${newLink}`);
    }
});

// Aggiunge un timestamp per forzare il refresh della cache
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
newsContent = newsContent.replace(
    /<meta name="cache-timestamp" content="[^"]*">/,
    `<meta name="cache-timestamp" content="${timestamp}">`
);

// Salva la pagina aggiornata
fs.writeFileSync(newsPagePath, newsContent);

console.log(`\n📄 Pagina news aggiornata con i nuovi link!`);
console.log(`🕒 Timestamp cache aggiornato: ${timestamp}`);
