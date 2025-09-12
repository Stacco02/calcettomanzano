const fs = require('fs');
const path = require('path');

// Directory degli articoli puliti
const blogNewDir = '/Users/andreastacco/Documents/GitHub/calcettomanzano/Blog_new';
// Directory degli articoli convertiti
const blogDir = '/Users/andreastacco/Documents/GitHub/calcettomanzano/blog';

// Legge la lista degli articoli
const articlesData = JSON.parse(fs.readFileSync('/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json', 'utf8'));

console.log(`Aggiornando ${articlesData.length} articoli con contenuto pulito...`);

let updatedCount = 0;

articlesData.forEach(article => {
  try {
    const originalFile = path.join(blogNewDir, article.originalFile);
    const convertedFile = path.join(blogDir, article.filename);
    
    // Verifica che entrambi i file esistano
    if (fs.existsSync(originalFile) && fs.existsSync(convertedFile)) {
      // Legge il contenuto pulito
      const cleanContent = fs.readFileSync(originalFile, 'utf8');
      
      // Estrae il contenuto dal file pulito
      const contentMatch = cleanContent.match(/<div class="content"[^>]*>(.*?)<\/div>/s);
      if (contentMatch) {
        let cleanText = contentMatch[1];
        // Pulisce il contenuto HTML
        cleanText = cleanText.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        
        // Legge l'articolo convertito
        let convertedContent = fs.readFileSync(convertedFile, 'utf8');
        
        // Sostituisce il contenuto nell'articolo convertito
        const newContent = `<p>${cleanText}</p>`;
        convertedContent = convertedContent.replace(
          /<div class="article-content">.*?<\/div>/s,
          `<div class="article-content">\n\t\t\t${newContent}\n\t\t</div>`
        );
        
        // Salva l'articolo aggiornato
        fs.writeFileSync(convertedFile, convertedContent);
        updatedCount++;
        console.log(`Aggiornato: ${article.filename}`);
      }
    }
  } catch (error) {
    console.error(`Errore nell'aggiornare ${article.filename}:`, error.message);
  }
});

console.log(`\nAggiornati ${updatedCount} articoli con contenuto pulito!`);
