const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../blog');

// Header 2025
const header2025 = `		<header class="header" id="top">
			<div class="container nav">
				<a class="brand" href="../index.html" aria-label="C5 Manzano 1988">
					<img src="../images/Manzanologo.png" alt="Logo C5 Manzano 1988" />
					<span>C5 Manzano 1988</span>
				</a>
				<nav class="menu" aria-label="Navigazione principale">
					<a href="../index.html">Home</a>
					<a href="index.html" class="active">News</a>
					<a href="../societa-2025.html">Società</a>
					<a href="../prima-squadra-2025.html">1a Squadra</a>
					<a href="../under-2025.html">Under 21/19</a>
					<a href="../sponsor-2025.html">Sponsor</a>
					<a href="../trasparenza-2025.html">Trasparenza</a>
					<a href="../safeguarding-2025.html">Safeguarding</a>
				</nav>
				<button class="burger" id="burger" aria-label="Apri menu" aria-controls="mobile-panel" aria-expanded="false"><span></span></button>
			</div>
			<div class="mobile-panel" id="mobile-panel" aria-hidden="true">
				<div class="mobile-drawer">
					<nav class="mobile-menu" aria-label="Menu mobile">
						<a href="../index.html">Home</a>
						<a href="index.html" class="active">News</a>
						<a href="../societa-2025.html">Società</a>
						<a href="../prima-squadra-2025.html">1a Squadra</a>
						<a href="../under-2025.html">Under 21/19</a>
						<a href="../sponsor-2025.html">Sponsor</a>
						<a href="../trasparenza-2025.html">Trasparenza</a>
						<a href="../safeguarding-2025.html">Safeguarding</a>
					</nav>
				</div>
			</div>
		</header>`;

// Footer 2025
const footer2025 = `		<footer class="footer">
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
				</div>
				<p class="copyright">© 2003–2025 A.D.S. C5 MANZANO 1988 – Tutti i diritti riservati • <a href="mailto:stacco.andrea02@gmail.com">Contatta webmaster (Andrea Stacco)</a></p>
			</div>
		</footer>`;

function extractArticleInfo(html) {
  // Extract title from <title> tag
  const titleMatch = html.match(/<title>([^<]+)/);
  const title = titleMatch ? titleMatch[1].replace(' - Notizie Calcetto Manzano', '') : 'Articolo';
  
  // Extract content preview
  const contentMatch = html.match(/<div class="article-content">(.*?)<\/div>/s);
  let preview = '';
  if (contentMatch) {
    preview = contentMatch[1]
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
      .substring(0, 150) + '...';
  }
  
  // Extract date from content
  let date = '';
  const dateMatch = html.match(/(\d+ [A-Za-z]+ \d+)/);
  if (dateMatch) {
    date = dateMatch[1];
  }
  
  // Extract author and category from meta
  const authorMatch = html.match(/Pubblicato da <strong>([^<]+)<\/strong>/);
  const author = authorMatch ? authorMatch[1] : '';
  
  const categoryMatch = html.match(/in ([^<]+) ·/);
  const category = categoryMatch ? categoryMatch[1] : '';
  
  // Extract image if present
  let image = '';
  const imageMatch = html.match(/<img[^>]+src="([^"]+)"/);
  if (imageMatch) {
    image = imageMatch[1];
  }
  
  return { title, preview, date, author, category, image };
}

function getAllArticles() {
  const articles = [];
  const files = fs.readdirSync(blogDir);
  
  for (const file of files) {
    if (file.endsWith('.html') && file.includes('?')) {
      const filePath = path.join(blogDir, file);
      try {
        const html = fs.readFileSync(filePath, 'utf8');
        const articleInfo = extractArticleInfo(html);
        if (articleInfo.title && articleInfo.title !== 'Articolo') {
          articles.push({
            ...articleInfo,
            filename: file
          });
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
      }
    }
  }
  
  // Sort by date (newest first)
  return articles.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date) - new Date(a.date);
  });
}

function createNewsPage() {
  const articles = getAllArticles();
  
  const articlesHTML = articles.map(article => `
    <article class="news-card">
      ${article.image ? `<div class="news-image"><img src="${article.image}" alt="${article.title}" /></div>` : ''}
      <div class="news-card-content">
        <h3 class="news-title">
          <a href="${article.filename}">${article.title}</a>
        </h3>
        <div class="news-meta">
          <span class="news-author">${article.author}</span>
          <span class="news-category">${article.category}</span>
          <span class="news-date">${article.date}</span>
        </div>
        <p class="news-preview">${article.preview}</p>
        <a href="${article.filename}" class="news-read-more">Leggi articolo</a>
      </div>
    </article>
  `).join('');

  return `<!DOCTYPE html>
<html lang="it-IT" dir="ltr">
<head>
	<title>News - Calcetto Manzano 1988</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="stylesheet" href="../style-2025.css" />
	<style>
		body { background: var(--c-bg); color: var(--c-text); font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
		.news-container { max-width: 1200px; margin: 0 auto; padding: var(--sp-6); }
		.news-header { text-align: center; margin-bottom: var(--sp-8); }
		.news-title { color: var(--c-primary); margin-bottom: var(--sp-2); }
		.news-subtitle { color: var(--c-muted); font-size: 1.1em; }
		.search-bar { margin-bottom: var(--sp-6); text-align: center; }
		.search-input { padding: 12px 16px; border: 2px solid var(--c-border); border-radius: var(--radius); width: 100%; max-width: 400px; font-size: 16px; }
		.search-input:focus { outline: none; border-color: var(--c-accent); }
		.news-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--sp-6); }
		.news-card { background: #fff; border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; transition: transform 0.2s; }
		.news-card:hover { transform: translateY(-2px); }
		.news-image { width: 100%; height: 200px; overflow: hidden; }
		.news-image img { width: 100%; height: 100%; object-fit: cover; }
		.news-card-content { padding: var(--sp-6); }
		.news-card h3 { margin: 0 0 var(--sp-4) 0; }
		.news-card h3 a { color: var(--c-primary); text-decoration: none; }
		.news-card h3 a:hover { color: var(--c-accent); }
		.news-meta { display: flex; gap: var(--sp-4); margin-bottom: var(--sp-4); font-size: 0.9em; color: var(--c-muted); }
		.news-preview { line-height: 1.6; margin-bottom: var(--sp-4); }
		.news-read-more { display: inline-block; background: var(--c-accent); color: var(--c-primary); padding: 8px 16px; border-radius: var(--radius); text-decoration: none; font-weight: 500; }
		.news-read-more:hover { background: var(--c-primary); color: #fff; }
		.no-results { text-align: center; padding: var(--sp-8); color: var(--c-muted); }
	</style>
</head>
<body>
${header2025}
	<main class="news-container">
		<header class="news-header">
			<h1 class="news-title">NEWS</h1>
			<p class="news-subtitle">Tutti gli articoli dal nostro blog</p>
		</header>
		
		<div class="search-bar">
			<input type="text" id="searchInput" class="search-input" placeholder="Cerca negli articoli..." />
		</div>
		
		<div class="news-grid" id="newsGrid">
			${articlesHTML}
		</div>
		
		<div class="no-results" id="noResults" style="display: none;">
			<p>Nessun articolo trovato per la ricerca effettuata.</p>
		</div>
	</main>
${footer2025}
	<script src="../scripts-2025.js" defer></script>
	<script>
		// Search functionality
		document.getElementById('searchInput').addEventListener('input', function(e) {
			const searchTerm = e.target.value.toLowerCase();
			const articles = document.querySelectorAll('.news-card');
			const noResults = document.getElementById('noResults');
			let visibleCount = 0;
			
			articles.forEach(article => {
				const title = article.querySelector('.news-title').textContent.toLowerCase();
				const preview = article.querySelector('.news-preview').textContent.toLowerCase();
				const author = article.querySelector('.news-author').textContent.toLowerCase();
				const category = article.querySelector('.news-category').textContent.toLowerCase();
				
				const matches = title.includes(searchTerm) || 
							  preview.includes(searchTerm) || 
							  author.includes(searchTerm) || 
							  category.includes(searchTerm);
				
				if (matches) {
					article.style.display = 'block';
					visibleCount++;
				} else {
					article.style.display = 'none';
				}
			});
			
			noResults.style.display = visibleCount === 0 ? 'block' : 'none';
		});
	</script>
</body>
</html>`;
}

console.log('Creating news page...');
const newsPageHTML = createNewsPage();
fs.writeFileSync(path.join(blogDir, 'index.html'), newsPageHTML, 'utf8');
console.log('News page created successfully!');
