const fs = require('fs');
const path = require('path');

// Directory del blog
const blogDir = '/Users/andreastacco/Documents/GitHub/calcettomanzano/blog';

// Funzione per pulire il nome del file
function cleanFileName(filename) {
  // Rimuove "index.html?" e sostituisce caratteri strani
  let cleanName = filename.replace('index.html?', '');
  cleanName = cleanName.replace(/[^a-zA-Z0-9\-_]/g, '-');
  cleanName = cleanName.replace(/-+/g, '-');
  cleanName = cleanName.replace(/^-|-$/g, '');
  return cleanName;
}

// Funzione per estrarre informazioni dall'articolo
function extractArticleInfo(html) {
  // Estrae il titolo da <h1> (senza classe)
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : 'Articolo senza titolo';
  
  // Estrae autore e categoria dalla meta (cerca pattern diverso)
  const metaMatch = html.match(/<p class="meta"[^>]*>([^<]+)<\/p>/);
  let author = 'Ufficio Stampa Calcetto Manzano';
  let category = 'News';
  let date = 'Data non disponibile';
  
  if (metaMatch) {
    const metaText = metaMatch[1];
    // Cerca pattern come "Pubblicato da X in Y · Data"
    const authorMatch = metaText.match(/Pubblicato da\s+([^·]+)/);
    if (authorMatch) author = authorMatch[1].trim();
    
    const categoryMatch = metaText.match(/in\s+([^·]+)/);
    if (categoryMatch) category = categoryMatch[1].trim();
    
    const dateMatch = metaText.match(/·\s*([^<]+)/);
    if (dateMatch) date = dateMatch[1].trim();
  }
  
  // Estrae il contenuto dal div con id che contiene il testo
  const contentMatch = html.match(/<div[^>]*id="imBlogPost_[^"]*"[^>]*>(.*?)<\/div>/s);
  let content = contentMatch ? contentMatch[1] : '';
  
  // Pulisce il contenuto HTML e rimuove spazi extra
  content = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  
  // Crea un preview più significativo
  let preview = content;
  if (preview.length > 200) {
    preview = preview.substring(0, 200) + '...';
  } else if (preview.length < 50) {
    // Se il contenuto è troppo corto, usa il titolo come preview
    preview = title;
  }
  
  return { title, author, category, date, preview, content };
}

// Legge tutti i file con nomi strani
const files = fs.readdirSync(blogDir).filter(file => file.startsWith('index.html?') && file.endsWith('.html'));

console.log(`Trovati ${files.length} articoli da processare`);

const articles = [];

files.forEach((file, index) => {
  try {
    const filePath = path.join(blogDir, file);
    const html = fs.readFileSync(filePath, 'utf8');
    
    const cleanName = cleanFileName(file);
    const articleInfo = extractArticleInfo(html);
    
    articles.push({
      filename: file, // Usa il nome originale per i link
      cleanName: cleanName,
      ...articleInfo
    });
    
    console.log(`Processato: ${file} -> ${articleInfo.title}`);
    
  } catch (error) {
    console.error(`Errore nel processare ${file}:`, error.message);
  }
});

// Filtra solo gli articoli reali (esclude pagine di navigazione)
const realArticles = articles.filter(article => {
  const filename = article.filename.toLowerCase();
  return !filename.includes('start=') && 
         !filename.includes('length=') && 
         !filename.includes('author=') && 
         !filename.includes('category=') && 
         !filename.includes('month=') && 
         !filename.includes('tag=') &&
         !filename.includes('x5feed') &&
         article.title !== 'Articolo senza titolo' &&
         article.content.length > 10;
});

// Ordina gli articoli per data (più recenti prima)
realArticles.sort((a, b) => {
  const dateA = new Date(a.date.split(' ').reverse().join(' '));
  const dateB = new Date(b.date.split(' ').reverse().join(' '));
  return dateB - dateA;
});

console.log(`\nArticoli totali: ${articles.length}`);
console.log(`Articoli reali: ${realArticles.length}`);
console.log('Primi 10 articoli reali:');
realArticles.slice(0, 10).forEach(article => {
  console.log(`- ${article.filename}: ${article.title}`);
});

// Salva la lista degli articoli per la pagina news
fs.writeFileSync('/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json', JSON.stringify(realArticles, null, 2));
console.log('\nLista articoli salvata in articles-list.json');
