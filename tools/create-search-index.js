const fs = require('fs');
const path = require('path');

const blogDir = '/Users/andreastacco/Documents/GitHub/calcettomanzano/blog';
const articlesListPath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json';

// Legge la lista degli articoli
const articlesList = JSON.parse(fs.readFileSync(articlesListPath, 'utf8'));

console.log(`Creando indice di ricerca per ${articlesList.length} articoli...`);

// Funzione per estrarre il testo pulito da HTML
function extractTextFromHTML(html) {
    // Rimuove i tag HTML e mantiene solo il testo
    let text = html
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    return text;
}

// Funzione per estrarre il contenuto di un articolo
function extractArticleContent(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Estrae il titolo
        const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
        const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        
        // Estrae i metadati
        const metaMatch = content.match(/<p class="meta"[^>]*>(.*?)<\/p>/i);
        const meta = metaMatch ? metaMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        
        // Estrae il contenuto principale
        const contentMatch = content.match(/<div class="content"[^>]*>(.*?)<\/div>/s);
        let articleContent = '';
        if (contentMatch) {
            articleContent = extractTextFromHTML(contentMatch[1]);
        }
        
        // Se non trova il div content, cerca altri contenitori
        if (!articleContent) {
            const blogPostMatch = content.match(/<div id="imBlogPost[^"]*"[^>]*>(.*?)<\/div>/s);
            if (blogPostMatch) {
                articleContent = extractTextFromHTML(blogPostMatch[1]);
            }
        }
        
        return {
            title: title,
            meta: meta,
            content: articleContent,
            fullText: `${title} ${meta} ${articleContent}`.toLowerCase()
        };
        
    } catch (error) {
        console.error(`Errore nel leggere ${filePath}:`, error.message);
        return {
            title: '',
            meta: '',
            content: '',
            fullText: ''
        };
    }
}

// Crea l'indice di ricerca
const searchIndex = [];

articlesList.forEach(article => {
    const filePath = path.join(blogDir, article.cleanName + '.html');
    
    if (fs.existsSync(filePath)) {
        const articleData = extractArticleContent(filePath);
        
        searchIndex.push({
            id: article.cleanName,
            title: articleData.title,
            meta: articleData.meta,
            content: articleData.content,
            fullText: articleData.fullText,
            filename: article.cleanName + '.html'
        });
        
        console.log(`✅ Indicizzato: ${article.cleanName}.html`);
    } else {
        console.log(`⚠️  File non trovato: ${article.cleanName}.html`);
    }
});

// Salva l'indice di ricerca
const indexPath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/search-index.json';
fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));

console.log(`\n📊 Risultati:`);
console.log(`- Articoli indicizzati: ${searchIndex.length}`);
console.log(`- Indice salvato in: ${indexPath}`);

// Crea anche un file JavaScript per l'uso nel browser
const jsIndex = `// Indice di ricerca per gli articoli
const searchIndex = ${JSON.stringify(searchIndex, null, 2)};

// Funzione per cercare negli articoli
function searchInArticles(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) {
        return searchIndex;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const words = term.split(/\s+/);
    
    return searchIndex.filter(article => {
        // Cerca ogni parola nel testo completo
        return words.every(word => article.fullText.includes(word));
    });
}

// Esporta per uso globale
window.searchIndex = searchIndex;
window.searchInArticles = searchInArticles;
`;

fs.writeFileSync('/Users/andreastacco/Documents/GitHub/calcettomanzano/search-index.js', jsIndex);

console.log(`- File JavaScript creato: search-index.js`);
console.log(`\n🔍 Indice di ricerca creato con successo!`);
