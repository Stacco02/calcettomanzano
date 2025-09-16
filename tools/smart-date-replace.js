const fs = require('fs');
const path = require('path');

const newsPagePath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/news-2025.html';
const articlesListPath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json';

console.log('Sostituzione intelligente delle date...');

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

// Ordina per data (più recente prima)
articlesWithDates.sort((a, b) => new Date(b.date) - new Date(a.date));

console.log('Date estratte:');
articlesWithDates.slice(0, 10).forEach((article, index) => {
    const formattedDate = new Date(article.date).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    console.log(`${index + 1}. ${article.title.substring(0, 40)}... - ${formattedDate}`);
});

// Sostituisce le date in base al filename dell'articolo
let updatedContent = newsContent;

// Crea una mappa filename -> data formattata
const filenameToDate = {};
articlesWithDates.forEach(article => {
    const formattedDate = new Date(article.date).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    filenameToDate[article.filename] = formattedDate;
});

// Sostituisce le date in base al filename dell'articolo
Object.keys(filenameToDate).forEach(filename => {
    const date = filenameToDate[filename];
    // Cerca l'articolo specifico e sostituisce la sua data
    const articlePattern = new RegExp(
        `(<a[^>]*href="[^"]*${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"[^>]*>.*?</a>.*?<div[^>]*class="news-meta"[^>]*>.*?<span class="news-date">)23 novembre 2024(</span>.*?</div>.*?</article>)`,
        's'
    );
    
    updatedContent = updatedContent.replace(articlePattern, `$1${date}$2`);
});

// Conta quante date sono state sostituite
const replacedCount = (newsContent.match(/23 novembre 2024/g) || []).length;
const finalCount = (updatedContent.match(/23 novembre 2024/g) || []).length;

console.log(`Date sostituite: ${replacedCount - finalCount}`);

// Salva la pagina aggiornata
fs.writeFileSync(newsPagePath, updatedContent);

console.log('✅ Date sostituite intelligentemente!');
console.log('📅 Ora ogni articolo ha la sua data specifica');
