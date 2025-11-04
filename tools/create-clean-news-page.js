const fs = require('fs');

// Legge la lista degli articoli
const articlesData = JSON.parse(fs.readFileSync('/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json', 'utf8'));

// Filtra solo gli articoli reali con contenuto significativo
const realArticles = articlesData.filter(article => {
  const filename = article.filename;
  const isNotNavigation = !filename.includes('start-') && 
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
  
  // Include tutti gli articoli reali, anche se hanno solo la data
  const hasContent = article.content && article.content.length > 10;
  return isNotNavigation && hasContent;
});

// Ordina per data (più recenti prima)
realArticles.sort((a, b) => {
  const dateA = new Date(a.date.split(' ').reverse().join(' '));
  const dateB = new Date(b.date.split(' ').reverse().join(' '));
  return dateB - dateA;
});

console.log(`Trovati ${realArticles.length} articoli con contenuto significativo`);

// Genera HTML per ogni articolo
function generateArticleCard(article) {
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
								<a href="blog/${article.filename}" class="news-read-more" style="display: inline-block; background: #f59e0b; color: #1e40af; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">Leggi articolo</a>
							</div>
						</article>`;
}

// Genera il contenuto completo della pagina
const newsPageContent = `<!DOCTYPE html>
<html lang="it">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>C5 Manzano 1988 – News 2025</title>
		<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
		<meta http-equiv="Pragma" content="no-cache" />
		<meta http-equiv="Expires" content="0" />
		<meta name="description" content="Tutte le news del C5 Manzano 1988." />
		<meta property="og:title" content="C5 Manzano 1988 – News" />
		<meta property="og:description" content="Leggi tutte le notizie e gli articoli dal nostro blog." />
		<link rel="stylesheet" href="style-2025.css" />
		<style>
			/* Stili per la pagina news */
			.news-card:hover { transform: translateY(-2px); }
			.news-card h3 a:hover { color: #f59e0b; }
			.news-read-more:hover { background: #1e40af; color: #fff; }
		</style>
	</head>
	<body>
		<header class="header" id="top">
			<div class="container nav">
				<a class="brand" href="index.html" aria-label="C5 Manzano 1988">
					<img src="images/Manzanologo.png" alt="Logo C5 Manzano 1988" />
					<span>C5 Manzano 1988</span>
				</a>
				<nav class="menu" aria-label="Navigazione principale">
					<a href="index.html">Home</a>
					<a href="news-2025.html" class="active">News</a>
					<a href="societa-2025.html">Società</a>
					<a href="prima-squadra-2025.html">1a Squadra</a>
					<a href="under-2025.html">Under 21/19</a>
					<a href="sponsor-2025.html">Sponsor</a>
					<a href="trasparenza-2025.html">Trasparenza</a>
					<a href="safeguarding-2025.html">Safeguarding</a>
				</nav>
				<button class="burger" id="burger" aria-label="Apri menu" aria-controls="mobile-panel" aria-expanded="false"><span></span></button>
			</div>
			<div class="mobile-panel" id="mobile-panel" aria-hidden="true">
				<div class="mobile-drawer">
					<nav class="mobile-menu" aria-label="Menu mobile">
						<a href="index.html">Home</a>
						<a href="news-2025.html" class="active">News</a>
						<a href="societa-2025.html">Società</a>
						<a href="prima-squadra-2025.html">1a Squadra</a>
						<a href="under-2025.html">Under 21/19</a>
						<a href="sponsor-2025.html">Sponsor</a>
						<a href="trasparenza-2025.html">Trasparenza</a>
						<a href="safeguarding-2025.html">Safeguarding</a>
					</nav>
				</div>
			</div>
		</header>

		<main id="main" class="main">
			<section class="section">
				<div class="container">
					<header style="text-align: center; margin-bottom: 2rem;">
						<h1 style="color: #1e40af; margin-bottom: 0.5rem; font-size: 2.5rem; font-weight: 700;">NEWS</h1>
						<p style="color: #6b7280; font-size: 1.1rem;">Tutti gli articoli dal nostro blog</p>
					</header>
					
					<div class="search-bar" style="margin-bottom: 2rem; text-align: center;">
						<input type="text" id="searchInput" class="search-input" placeholder="Cerca negli articoli..." style="padding: 12px 16px; border: 2px solid #d1d5db; border-radius: 8px; width: 100%; max-width: 400px; font-size: 16px;" />
					</div>
					
					<div class="news-grid" id="newsGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
						${realArticles.map(article => generateArticleCard(article)).join('')}
					</div>
					
					<div class="news-pagination" style="text-align: center; margin-top: 50px;">
						<button id="loadMoreBtn" style="background: #1e40af; color: white; border: none; padding: 15px 30px; border-radius: 25px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
							Carica altri articoli
						</button>
					</div>
					
					<div class="no-results" id="noResults" style="display: none; text-align: center; padding: 2rem; color: #6b7280;">
						<p>Nessun articolo trovato per la ricerca effettuata.</p>
					</div>
				</div>
			</section>
		</main>

		<footer class="footer">
			<div class="container">
				<div class="links">
					<a href="https://www.divisionecalcioa5.it/" target="_blank" rel="noopener">Divisione Calcio a 5</a>
					<a href="http://www.regione.fvg.it/rafvg/cms/RAFVG/" target="_blank" rel="noopener">Regione Friuli Venezia Giulia</a>
					<a href="https://friuliveneziagiulia.lnd.it/it/" target="_blank" rel="noopener">LND – Friuli Venezia Giulia</a>
					<a href="https://www.calcettomanzano.it/www.comune.manzano.ud.it/hh/index.php?jvs=0&acc=1" target="_blank" rel="noopener">Comune di Manzano (UD)</a>
				</div>
				<div class="social" aria-label="Social">
					<a href="https://www.facebook.com/manzano.calcetto.fans/" aria-label="Facebook">Fb</a>
					<a href="https://www.instagram.com/c5manzano1988/" aria-label="Instagram">Ig</a>
					<a href="https://www.youtube.com/channel/UCQZQZQZQZQZQZQZQZQZQZQ" aria-label="YouTube">Yt</a>
				</div>
				<p class="copyright">© 2003–2025 A.D.S. C5 MANZANO 1988 – Tutti i diritti riservati • <a href="mailto:stacco.andrea02@gmail.com">Contatta webmaster (Andrea Stacco)</a></p>
			</div>
		</footer>

		<script src="scripts-2025.js" defer></script>
		<script>
			document.addEventListener('DOMContentLoaded', function() {
				const searchInput = document.getElementById('searchInput');
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
						const category = item.querySelector('.news-category').textContent.toLowerCase();
						const author = item.querySelector('.news-author').textContent.toLowerCase();
						
						return title.includes(searchTerm) || 
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
		</script>
	</body>
</html>`;

// Salva il file
fs.writeFileSync('/Users/andreastacco/Documents/GitHub/calcettomanzano/news-2025.html', newsPageContent);

console.log(`Pagina news creata con ${realArticles.length} articoli!`);
console.log('Primi 10 articoli:');
realArticles.slice(0, 10).forEach((article, index) => {
  console.log(`${index + 1}. ${article.title} (${article.filename})`);
});
