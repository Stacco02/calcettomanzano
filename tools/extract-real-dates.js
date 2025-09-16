const fs = require('fs');
const path = require('path');

const newsPagePath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/news-2025.html';
const articlesListPath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json';

console.log('Estrazione delle date reali da ogni articolo...');

// Legge la lista degli articoli
const articlesList = JSON.parse(fs.readFileSync(articlesListPath, 'utf8'));

// Legge la pagina news
let newsContent = fs.readFileSync(newsPagePath, 'utf8');

// Funzione per estrarre la data da un articolo specifico
function extractDateFromArticle(article) {
    const blogDir = '/Users/andreastacco/Documents/GitHub/calcettomanzano/blog';
    const filePath = path.join(blogDir, article.cleanName + '.html');
    
    if (!fs.existsSync(filePath)) {
        console.log(`File non trovato: ${filePath}`);
        return '2025-01-01';
    }
    
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    
    // Cerca la data nel contenuto dell'articolo
    const datePatterns = [
        // Pattern per date italiane: "23 novembre 2024", "15 agosto 2025", etc.
        /(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/gi,
        // Pattern per date abbreviate: "23 nov 2024", "15 ago 2025", etc.
        /(\d{1,2})\s+(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)\s+(\d{4})/gi,
        // Pattern per date con giorno: "Venerdì 23 novembre 2024", "Lunedì 15 agosto 2025", etc.
        /(\w+)\s+(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/gi
    ];
    
    for (const pattern of datePatterns) {
        const match = htmlContent.match(pattern);
        if (match) {
            const dateStr = match[0];
            console.log(`Trovata data in ${article.cleanName}: ${dateStr}`);
            
            // Converte la data in formato ISO
            const monthMap = {
                'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04', 'maggio': '05', 'giugno': '06',
                'luglio': '07', 'agosto': '08', 'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12',
                'gen': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'mag': '05', 'giu': '06',
                'lug': '07', 'ago': '08', 'set': '09', 'ott': '10', 'nov': '11', 'dic': '12'
            };
            
            // Estrae giorno, mese e anno
            const parts = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
            if (parts) {
                const [, day, month, year] = parts;
                const monthNum = monthMap[month.toLowerCase()];
                if (monthNum) {
                    return `${year}-${monthNum}-${day.padStart(2, '0')}`;
                }
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
const articlesWithDates = articlesList.map(article => {
    const date = extractDateFromArticle(article);
    const formattedDate = new Date(date).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return {
        ...article,
        date: date,
        formattedDate: formattedDate,
        year: parseInt(date.split('-')[0])
    };
});

// Ordina per data (più recente prima)
articlesWithDates.sort((a, b) => new Date(b.date) - new Date(a.date));

console.log('\nDate estratte:');
articlesWithDates.slice(0, 10).forEach((article, index) => {
    console.log(`${index + 1}. ${article.title.substring(0, 40)}... - ${article.formattedDate}`);
});

// Sostituisce le date nella pagina news
let updatedContent = newsContent;

// Crea una mappa filename -> data formattata
const filenameToDate = {};
articlesWithDates.forEach(article => {
    filenameToDate[article.filename] = article.formattedDate;
});

// Sostituisce le date in base al filename dell'articolo
Object.keys(filenameToDate).forEach(filename => {
    const date = filenameToDate[filename];
    // Cerca l'articolo specifico e sostituisce la sua data
    const articlePattern = new RegExp(
        `(<a[^>]*href="[^"]*${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"[^>]*>.*?</a>.*?<div[^>]*class="news-meta"[^>]*>.*?<span class="news-date">)16 agosto 2025(</span>.*?</div>.*?</article>)`,
        's'
    );
    
    const newContent = updatedContent.replace(articlePattern, `$1${date}$2`);
    if (newContent !== updatedContent) {
        console.log(`✅ Sostituita data per ${filename}: ${date}`);
        updatedContent = newContent;
    }
});

// Conta quante date sono state sostituite
const replacedCount = (newsContent.match(/16 agosto 2025/g) || []).length;
const finalCount = (updatedContent.match(/16 agosto 2025/g) || []).length;

console.log(`\nDate sostituite: ${replacedCount - finalCount}`);

// Salva la pagina aggiornata
fs.writeFileSync(newsPagePath, updatedContent);

console.log('✅ Date reali estratte e sostituite!');
console.log('📅 Ora ogni articolo ha la sua data specifica');
