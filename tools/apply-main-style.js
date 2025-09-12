const fs = require('fs');
const path = require('path');

const blogDir = '/Users/andreastacco/Documents/GitHub/calcettomanzano/blog';
const articlesListPath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json';

// Legge la lista degli articoli
const articlesList = JSON.parse(fs.readFileSync(articlesListPath, 'utf8'));

console.log(`Applicando lo stile principale a ${articlesList.length} articoli...`);

// Stile principale basato sulla palette del sito
const mainStyle = `
/* Stile principale del sito C5 Manzano 1988 */
:root {
    --c-primary: #0b3f91;
    --c-accent: #ffd21f;
    --c-bg: #ffffff;
    --c-text: #0e0e0e;
    --c-muted: #6b7380;
    --c-border: #e5e7eb;
    --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-5: 24px; --sp-6: 32px;
    --radius: 12px; --radius-sm: 8px; --radius-lg: 18px;
    --shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@700;800&display=swap');

* {
    box-sizing: border-box;
}

html, body {
    margin: 0;
    padding: 0;
    font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    color: var(--c-text);
    background: var(--c-bg);
    line-height: 1.6;
}

body {
    font-size: 16px;
    max-width: 800px;
    margin: 0 auto;
    padding: var(--sp-6) var(--sp-4);
}

h1 {
    font-family: Montserrat, Inter, sans-serif;
    font-weight: 800;
    font-size: clamp(28px, 4vw, 36px);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    line-height: 1.2;
    margin: 0 0 var(--sp-4);
    color: var(--c-primary);
}

.meta {
    color: var(--c-muted);
    margin: 0 0 var(--sp-5);
    font-size: 0.95rem;
    font-weight: 500;
    padding: var(--sp-3) 0;
    border-bottom: 2px solid var(--c-border);
}

.content {
    font-size: 16px;
    line-height: 1.7;
    color: var(--c-text);
}

.content img {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-sm);
    margin: var(--sp-4) 0;
    box-shadow: var(--shadow);
}

.content p {
    margin: var(--sp-4) 0;
}

.content strong {
    color: var(--c-primary);
    font-weight: 600;
}

.content a {
    color: var(--c-primary);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s ease;
}

.content a:hover {
    border-bottom-color: var(--c-primary);
}

/* Stile per i div del contenuto del blog */
.content div[id^="imBlogPost"] {
    font-size: 16px;
    line-height: 1.7;
}

.content div[id^="imBlogPost"] span {
    font-size: inherit;
    line-height: inherit;
}

/* Responsive */
@media (max-width: 768px) {
    body {
        padding: var(--sp-4) var(--sp-3);
    }
    
    h1 {
        font-size: 24px;
    }
    
    .content {
        font-size: 15px;
    }
}

/* Back to news link */
.back-to-news {
    display: inline-block;
    margin-bottom: var(--sp-5);
    padding: var(--sp-2) var(--sp-4);
    background: var(--c-primary);
    color: white;
    text-decoration: none;
    border-radius: var(--radius-sm);
    font-weight: 500;
    font-size: 14px;
    transition: background-color 0.2s ease;
}

.back-to-news:hover {
    background: #0a3579;
    color: white;
}
`;

let updatedCount = 0;

articlesList.forEach(article => {
    const filePath = path.join(blogDir, article.cleanName + '.html');
    
    if (fs.existsSync(filePath)) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Sostituisce il vecchio stile inline con il nuovo stile principale
            content = content.replace(
                /<style>.*?<\/style>/s,
                `<style>${mainStyle}</style>`
            );
            
            // Aggiunge il link "Torna alle news" dopo il titolo
            content = content.replace(
                /(<h1>.*?<\/h1>)/,
                `$1\n  <a href="../news-2025.html" class="back-to-news">← Torna alle News</a>`
            );
            
            // Pulisce il contenuto rimuovendo tag HTML non necessari
            content = content.replace(/<article>/g, '');
            content = content.replace(/<\/article>/g, '');
            
            // Salva il file aggiornato
            fs.writeFileSync(filePath, content);
            updatedCount++;
            console.log(`✅ Aggiornato: ${article.cleanName}.html`);
            
        } catch (error) {
            console.error(`❌ Errore nell'aggiornare ${article.cleanName}.html:`, error.message);
        }
    } else {
        console.log(`⚠️  File non trovato: ${article.cleanName}.html`);
    }
});

console.log(`\n📊 Risultati:`);
console.log(`- Articoli aggiornati: ${updatedCount}`);
console.log(`- Articoli non trovati: ${articlesList.length - updatedCount}`);
console.log(`\n🎨 Stile principale applicato a tutti gli articoli!`);
