const fs = require('fs');
const path = require('path');

const newsPagePath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/news-2025.html';
const articlesListPath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json';

console.log('Sistemando le date direttamente nella pagina...');

// Legge la lista degli articoli
const articlesList = JSON.parse(fs.readFileSync(articlesListPath, 'utf8'));

// Legge la pagina news
let newsContent = fs.readFileSync(newsPagePath, 'utf8');

// Funzione per estrarre la data da un articolo
function extractDateFromArticle(article) {
    // Cerca la data nei metadati
    if (article.meta) {
        // Pattern per date italiane: "Venerdì 27 Giu 2025", "Lunedì 15 Gen 2024", etc.
        const dateMatch = article.meta.match(/(\w+)\s+(\d{1,2})\s+(\w{3})\s+(\d{4})/);
        if (dateMatch) {
            const [, dayName, day, month, year] = dateMatch;
            const monthMap = {
                'Gen': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'Mag': '05', 'Giu': '06',
                'Lug': '07', 'Ago': '08', 'Set': '09', 'Ott': '10', 'Nov': '11', 'Dic': '12'
            };
            const monthNum = monthMap[month];
            if (monthNum) {
                return `${year}-${monthNum}-${day.padStart(2, '0')}`;
            }
        }
        
        // Pattern alternativo: "27 giugno 2025"
        const altDateMatch = article.meta.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
        if (altDateMatch) {
            const [, day, month, year] = altDateMatch;
            const monthMap = {
                'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04', 'maggio': '05', 'giugno': '06',
                'luglio': '07', 'agosto': '08', 'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
            };
            const monthNum = monthMap[month.toLowerCase()];
            if (monthNum) {
                return `${year}-${monthNum}-${day.padStart(2, '0')}`;
            }
        }
    }
    
    // Cerca la data nel contenuto
    if (article.content) {
        const contentDateMatch = article.content.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
        if (contentDateMatch) {
            const [, day, month, year] = contentDateMatch;
            const monthMap = {
                'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04', 'maggio': '05', 'giugno': '06',
                'luglio': '07', 'agosto': '08', 'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
            };
            const monthNum = monthMap[month.toLowerCase()];
            if (monthNum) {
                return `${year}-${monthNum}-${day.padStart(2, '0')}`;
            }
        }
    }
    
    // Se non trova nulla, usa l'anno dal titolo o default
    const yearMatch = article.title.match(/(\d{4})/) || article.meta?.match(/(\d{4})/);
    if (yearMatch) {
        return `${yearMatch[1]}-01-01`;
    }
    
    return '2025-01-01'; // Default
}

// Estrae le date per tutti gli articoli
const articlesWithDates = articlesList.map(article => ({
    ...article,
    date: extractDateFromArticle(article),
    year: parseInt(extractDateFromArticle(article).split('-')[0])
}));

console.log('Date estratte:');
articlesWithDates.slice(0, 10).forEach((article, index) => {
    const formattedDate = new Date(article.date).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    console.log(`${index + 1}. ${article.title.substring(0, 40)}... - ${formattedDate}`);
});

// Sostituisce tutte le occorrenze di "Data non disponibile" con le date reali
// Prima crea una mappa dei filename alle date
const filenameToDate = {};
articlesWithDates.forEach(article => {
    const formattedDate = new Date(article.date).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    filenameToDate[article.filename] = formattedDate;
});

// Sostituisce le date usando un approccio più diretto
let updatedContent = newsContent;

// Trova tutti i pattern di "Data non disponibile" e li sostituisce
const datePattern = /<span class="news-date">Data non disponibile<\/span>/g;
let matchCount = 0;

updatedContent = updatedContent.replace(datePattern, (match) => {
    matchCount++;
    // Per ora sostituisce con una data generica, poi la correggeremo con JavaScript
    return '<span class="news-date">Data in caricamento...</span>';
});

console.log(`Sostituiti ${matchCount} "Data non disponibile"`);

// Ora aggiunge JavaScript per aggiornare le date dinamicamente
const dateUpdateScript = `
                <script>
                        // Aggiorna le date degli articoli
                        document.addEventListener('DOMContentLoaded', function() {
                                const articlesData = ${JSON.stringify(articlesWithDates)};
                                
                                // Funzione per formattare la data
                                function formatDate(dateString) {
                                        const date = new Date(dateString);
                                        return date.toLocaleDateString('it-IT', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                        });
                                }
                                
                                // Aggiorna le date di tutti gli articoli
                                const newsCards = document.querySelectorAll('.news-card');
                                newsCards.forEach(card => {
                                        const articleLink = card.querySelector('a[href*="blog/"]');
                                        if (articleLink) {
                                                const href = articleLink.getAttribute('href');
                                                const filename = href.split('/').pop().split('?')[0];
                                                
                                                const articleData = articlesData.find(data => data.filename === filename);
                                                if (articleData) {
                                                        const dateElement = card.querySelector('.news-date');
                                                        if (dateElement) {
                                                                dateElement.textContent = formatDate(articleData.date);
                                                        }
                                                }
                                        }
                                });
                                
                                console.log('Date degli articoli aggiornate');
                        });
                </script>
`;

// Inserisce lo script prima della chiusura del body
const bodyCloseRegex = /<\/body>/;
updatedContent = updatedContent.replace(bodyCloseRegex, dateUpdateScript + '\n\t\t' + '</body>');

// Salva la pagina aggiornata
fs.writeFileSync(newsPagePath, updatedContent);

console.log('✅ Date aggiornate dinamicamente con JavaScript!');
console.log('📅 Le date verranno caricate automaticamente quando la pagina si apre');
