const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../blog');

// Header 2025
const header2025 = `		<header class="header" id="top">
			<div class="container nav">
				<a class="brand" href="../index.html" aria-label="C5 Manzano 1988">
					<img src="../images/logo_manzano_altezza_80.png" alt="Logo C5 Manzano 1988" />
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
				<p class="copyright">© 2003–2025 A.D.S. C5 MANZANO 1988 – Tutti i diritti riservati • <a href="mailto:robertopit@inwind.it">Contatta webmaster</a></p>
			</div>
		</footer>`;

function extractArticleContent(html) {
  // Extract title from <title> tag
  const titleMatch = html.match(/<title>([^<]+)/);
  const title = titleMatch ? titleMatch[1].replace(' - Notizie Calcetto Manzano - www.calcettomanzano.it', '') : 'Articolo';
  
  // Extract content from imBlogPostBody
  const contentMatch = html.match(/<div class="imBlogPostBody">(.*?)<\/div>/s);
  let content = '';
  if (contentMatch) {
    content = contentMatch[1]
      .replace(/<div[^>]*>/g, '')
      .replace(/<\/div>/g, '')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<span[^>]*>/g, '')
      .replace(/<\/span>/g, '')
      .replace(/<b>/g, '**')
      .replace(/<\/b>/g, '**')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
  
  // Extract breadcrumb info
  const breadcrumbMatch = html.match(/<div class="imBreadcrumb"[^>]*>(.*?)<\/div>/s);
  let author = '';
  let category = '';
  let date = '';
  
  if (breadcrumbMatch) {
    const breadcrumb = breadcrumbMatch[1];
    const authorMatch = breadcrumb.match(/<strong>([^<]+)<\/strong>/);
    if (authorMatch) author = authorMatch[1];
    
    const categoryMatch = breadcrumb.match(/in <a[^>]*><span>([^<]+)<\/span><\/a>/);
    if (categoryMatch) category = categoryMatch[1];
    
    const dateMatch = breadcrumb.match(/([A-Za-z]+ \d+ [A-Za-z]+ \d+)/);
    if (dateMatch) date = dateMatch[1];
  }
  
  // If no date found in breadcrumb, try to extract from content
  if (!date && content) {
    const contentDateMatch = content.match(/([A-Za-z]+ \(UD\) \d+ [A-Za-z]+ \d+)/);
    if (contentDateMatch) {
      date = contentDateMatch[1].replace('(UD) ', '');
    } else {
      // Try other date patterns in content
      const altDateMatch = content.match(/(\d+ [A-Za-z]+ \d+)/);
      if (altDateMatch) {
        date = altDateMatch[1];
      }
    }
  }
  
  return { title, content, author, category, date };
}

function createCleanArticle(originalHtml, articleData) {
  const { title, content, author, category, date } = articleData;
  
  return `<!DOCTYPE html>
<html lang="it-IT" dir="ltr">
<head>
	<title>${title} - Notizie Calcetto Manzano</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="stylesheet" href="../style-2025.css" />
	<style>
		body { background: var(--c-bg); color: var(--c-text); font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
		.article-container { max-width: 800px; margin: 0 auto; padding: var(--sp-6); background: #fff; border-radius: var(--radius); box-shadow: var(--shadow); }
		.article-title { color: var(--c-primary); margin-bottom: var(--sp-4); }
		.article-meta { color: var(--c-muted); margin-bottom: var(--sp-6); font-size: 0.9em; }
		.article-content { line-height: 1.6; }
		.article-content p { margin-bottom: var(--sp-4); }
	</style>
</head>
<body>
${header2025}
	<main class="article-container">
		<h1 class="article-title">${title}</h1>
		<div class="article-meta">
			Pubblicato da <strong>${author}</strong> in ${category} · ${date || 'Data non disponibile'}
		</div>
		<div class="article-content">
			${content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
		</div>
	</main>
${footer2025}
	<script src="../scripts-2025.js" defer></script>
</body>
</html>`;
}

function processFile(filePath) {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    
    // Skip if it's the main index (list page)
    if (filePath.endsWith('index.html') && !filePath.includes('?')) {
      return;
    }
    
    // Extract article content
    const articleData = extractArticleContent(html);
    
    // Skip if no content found
    if (!articleData.content.trim()) {
      return;
    }
    
    // Create clean article
    const cleanHtml = createCleanArticle(html, articleData);
    
    // Write back
    fs.writeFileSync(filePath, cleanHtml, 'utf8');
    console.log(`Processed: ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let processed = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.html')) {
      processFile(filePath);
      processed++;
    }
  }
  
  return processed;
}

console.log('Starting blog cleanup...');
const processed = processDirectory(blogDir);
console.log(`Processed ${processed} files.`);