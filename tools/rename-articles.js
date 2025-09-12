const fs = require('fs');
const path = require('path');

const blogDir = '/Users/andreastacco/Documents/GitHub/calcettomanzano/blog';
const articlesListPath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json';

// Legge la lista degli articoli
const articlesList = JSON.parse(fs.readFileSync(articlesListPath, 'utf8'));

console.log(`Trovati ${articlesList.length} articoli da rinominare...`);

let renamedCount = 0;
const renameMap = {};

articlesList.forEach(article => {
    const oldFileName = article.filename;
    const newFileName = article.cleanName + '.html';
    
    const oldPath = path.join(blogDir, oldFileName);
    const newPath = path.join(blogDir, newFileName);
    
    if (fs.existsSync(oldPath)) {
        try {
            fs.renameSync(oldPath, newPath);
            renameMap[oldFileName] = newFileName;
            renamedCount++;
            console.log(`✅ Rinominato: ${oldFileName} → ${newFileName}`);
        } catch (error) {
            console.error(`❌ Errore nel rinominare ${oldFileName}:`, error.message);
        }
    } else {
        console.log(`⚠️  File non trovato: ${oldFileName}`);
    }
});

console.log(`\n📊 Risultati:`);
console.log(`- File rinominati: ${renamedCount}`);
console.log(`- File non trovati: ${articlesList.length - renamedCount}`);

// Salva la mappa dei rinominamenti per aggiornare i link
fs.writeFileSync('/Users/andreastacco/Documents/GitHub/calcettomanzano/rename-map.json', JSON.stringify(renameMap, null, 2));
console.log(`\n💾 Mappa dei rinominamenti salvata in rename-map.json`);
