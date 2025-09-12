const fs = require('fs');
const path = require('path');

// Legge la lista degli articoli
const articlesData = JSON.parse(fs.readFileSync('/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json', 'utf8'));

// Filtra solo gli articoli reali (esclude le pagine di navigazione)
const realArticles = articlesData.filter(article => {
  const filename = article.filename;
  // Esclude pagine con parametri di navigazione
  return !filename.includes('start-') && 
         !filename.includes('length-') && 
         !filename.includes('author-') && 
         !filename.includes('category-') && 
         !filename.includes('month-') && 
         !filename.includes('tag-') &&
         !filename.includes('x5feed') &&
         article.title !== 'Patrick Lavaroni - Addetto stampa' &&
         article.title !== 'Ufficio Stampa Calcetto Manzano' &&
         article.title !== 'News' &&
         article.title !== 'Campionato Serie C - 2024-2025' &&
         article.title !== 'Campionato UNDER 19 - 2024-2025' &&
         article.title !== 'Coppa Italia 2024-2025' &&
         article.title !== 'News Campionato 2025/26' &&
         article.title !== 'All';
});

console.log(`Trovati ${realArticles.length} articoli reali`);

// Ordina per data (più recenti prima)
realArticles.sort((a, b) => {
  const dateA = new Date(a.date.split(' ').reverse().join(' '));
  const dateB = new Date(b.date.split(' ').reverse().join(' '));
  return dateB - dateA;
});

// Genera HTML per ogni articolo
function generateArticleCard(article, index) {
  return `
						<article class="news-card" style="background: #fff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; transition: transform 0.2s;">
							<div class="news-image" style="width: 100%; height: 200px; overflow: hidden; background: #f8fafc; display: flex; align-items: center; justify-content: center;">
								<div class="placeholder-image" style="width: 60px; height: 60px; background: #6b7280; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px;">📰</div>
							</div>
							<div class="news-card-content" style="padding: 1.5rem;">
								<h3 class="news-title" style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600;">
									<a href="blog/${article.filename}" style="color: #1e40af; text-decoration: none;">${article.title}</a>
								</h3>
								<div class="news-meta" style="display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.9em; color: #6b7280; flex-wrap: wrap;">
									<span class="news-author">${article.author}</span>
									<span class="news-category">${article.category}</span>
									<span class="news-date">${article.date}</span>
								</div>
								<p class="news-excerpt" style="margin: 0 0 1rem 0; color: #6b7280; line-height: 1.5;">
									${article.preview}
								</p>
								<a href="blog/${article.filename}" class="news-read-more" style="display: inline-block; background: #f59e0b; color: #1e40af; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">Leggi articolo</a>
							</div>
						</article>`;
}

// Genera la sezione news completa
const newsSection = `
					<section class="news-section" style="padding: 60px 0; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);">
						<div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
							<div class="news-header" style="text-align: center; margin-bottom: 50px;">
								<h2 style="font-size: 2.5rem; font-weight: 700; color: #1e40af; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">Ultime News</h2>
								<p style="font-size: 1.1rem; color: #6b7280; max-width: 600px; margin: 0 auto;">Rimani aggiornato su tutte le novità del Calcetto Manzano 1988</p>
							</div>
							
							<div class="news-search" style="margin-bottom: 40px; text-align: center;">
								<div style="max-width: 500px; margin: 0 auto; position: relative;">
									<input type="text" id="newsSearch" placeholder="Cerca nelle news..." style="width: 100%; padding: 15px 20px; border: 2px solid #e5e7eb; border-radius: 25px; font-size: 16px; outline: none; transition: border-color 0.3s; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
									<div style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #6b7280;">🔍</div>
								</div>
							</div>
							
							<div class="news-grid" id="newsGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;">
								${realArticles.map((article, index) => generateArticleCard(article, index)).join('')}
							</div>
							
							<div class="news-pagination" style="text-align: center; margin-top: 50px;">
								<button id="loadMoreBtn" style="background: #1e40af; color: white; border: none; padding: 15px 30px; border-radius: 25px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
									Carica altri articoli
								</button>
							</div>
						</div>
					</section>`;

// Legge il file news-2025.html esistente
const newsFilePath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/news-2025.html';
let newsContent = fs.readFileSync(newsFilePath, 'utf8');

// Trova la sezione news esistente e la sostituisce
const newsGridStart = newsContent.indexOf('<div class="news-grid"');
const newsGridEnd = newsContent.indexOf('</div>', newsGridStart) + 6;

if (newsGridStart !== -1 && newsGridEnd !== -1) {
  // Genera solo la griglia degli articoli
  const newsGrid = `
							<div class="news-grid" id="newsGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
								${realArticles.map((article, index) => generateArticleCard(article, index)).join('')}
							</div>`;
  
  newsContent = newsContent.substring(0, newsGridStart) + newsGrid + newsContent.substring(newsGridEnd);
} else {
  console.error('Griglia news non trovata nel file');
  process.exit(1);
}

// Aggiunge JavaScript per la ricerca e paginazione
const searchScript = `
		<script>
			document.addEventListener('DOMContentLoaded', function() {
				const searchInput = document.getElementById('newsSearch');
				const newsGrid = document.getElementById('newsGrid');
				const loadMoreBtn = document.getElementById('loadMoreBtn');
				const allNewsItems = Array.from(newsGrid.children);
				let visibleItems = 6;
				let filteredItems = allNewsItems;
				
				// Funzione per mostrare/nascondere articoli
				function updateDisplay() {
					allNewsItems.forEach((item, index) => {
						if (index < visibleItems && filteredItems.includes(item)) {
							item.style.display = 'block';
						} else {
							item.style.display = 'none';
						}
					});
					
					// Mostra/nascondi il pulsante "Carica altri"
					if (visibleItems >= filteredItems.length) {
						loadMoreBtn.style.display = 'none';
					} else {
						loadMoreBtn.style.display = 'inline-block';
					}
				}
				
				// Funzione di ricerca
				function searchNews() {
					const searchTerm = searchInput.value.toLowerCase();
					filteredItems = allNewsItems.filter(item => {
						const title = item.querySelector('.news-title').textContent.toLowerCase();
						const excerpt = item.querySelector('.news-excerpt').textContent.toLowerCase();
						const category = item.querySelector('.news-category').textContent.toLowerCase();
						const author = item.querySelector('.news-author').textContent.toLowerCase();
						
						return title.includes(searchTerm) || 
							   excerpt.includes(searchTerm) || 
							   category.includes(searchTerm) || 
							   author.includes(searchTerm);
					});
					
					visibleItems = 6;
					updateDisplay();
				}
				
				// Event listeners
				searchInput.addEventListener('input', searchNews);
				
				loadMoreBtn.addEventListener('click', function() {
					visibleItems += 6;
					updateDisplay();
				});
				
				// Inizializza la visualizzazione
				updateDisplay();
			});
		</script>`;

// Aggiunge lo script prima della chiusura del body
const bodyEndIndex = newsContent.lastIndexOf('</body>');
if (bodyEndIndex !== -1) {
  newsContent = newsContent.substring(0, bodyEndIndex) + searchScript + newsContent.substring(bodyEndIndex);
}

// Salva il file aggiornato
fs.writeFileSync(newsFilePath, newsContent);

console.log(`Pagina news aggiornata con ${realArticles.length} articoli!`);
console.log('Primi 10 articoli:');
realArticles.slice(0, 10).forEach((article, index) => {
  console.log(`${index + 1}. ${article.title} (${article.filename})`);
});
