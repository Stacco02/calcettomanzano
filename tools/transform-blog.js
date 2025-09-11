#!/usr/bin/env node
/**
 * Batch transform for blog HTML pages to match 2025 site layout.
 * - Adds ../style-2025.css if missing
 * - Injects site header/footer 2025 if missing
 * - Adds ../scripts-2025.js before </body>
 * - Hides legacy X5 header/footer via inline style if present
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');

const header2025 = (
  '\n\t\t<header class="header" id="top">\n\t\t\t<div class="container nav">\n\t\t\t\t<a class="brand" href="../index.html" aria-label="C5 Manzano 1988">\n\t\t\t\t\t<img src="../images/logo_manzano_altezza_80.png" alt="Logo C5 Manzano 1988" />\n\t\t\t\t\t<span>C5 Manzano 1988</span>\n\t\t\t\t</a>\n\t\t\t\t<nav class="menu" aria-label="Navigazione principale">\n\t\t\t\t\t<a href="../index.html">Home</a>\n\t\t\t\t\t<a href="index.html" class="active">News</a>\n\t\t\t\t\t<a href="../societa-2025.html">Società</a>\n\t\t\t\t\t<a href="../prima-squadra-2025.html">1a Squadra</a>\n\t\t\t\t\t<a href="../under-2025.html">Under 21/19</a>\n\t\t\t\t\t<a href="../sponsor-2025.html">Sponsor</a>\n\t\t\t\t\t<a href="../trasparenza-2025.html">Trasparenza</a>\n\t\t\t\t\t<a href="../safeguarding-2025.html">Safeguarding</a>\n\t\t\t\t</nav>\n\t\t\t\t<button class="burger" id="burger" aria-label="Apri menu" aria-controls="mobile-panel" aria-expanded="false"><span></span></button>\n\t\t\t</div>\n\t\t\t<div class="mobile-panel" id="mobile-panel" aria-hidden="true">\n\t\t\t\t<div class="mobile-drawer">\n\t\t\t\t\t<nav class="mobile-menu" aria-label="Menu mobile">\n\t\t\t\t\t\t<a href="../index.html">Home</a>\n\t\t\t\t\t\t<a href="index.html" class="active">News</a>\n\t\t\t\t\t\t<a href="../societa-2025.html">Società</a>\n\t\t\t\t\t\t<a href="../prima-squadra-2025.html">1a Squadra</a>\n\t\t\t\t\t\t<a href="../under-2025.html">Under 21/19</a>\n\t\t\t\t\t\t<a href="../sponsor-2025.html">Sponsor</a>\n\t\t\t\t\t\t<a href="../trasparenza-2025.html">Trasparenza</a>\n\t\t\t\t\t\t<a href="../safeguarding-2025.html">Safeguarding</a>\n\t\t\t\t\t</nav>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</header>\n'
);

const footer2025 = (
  '\n\t\t<footer class="footer">\n\t\t\t<div class="container">\n\t\t\t\t<div class="links">\n\t\t\t\t\t<a href="https://www.divisionecalcioa5.it/" target="_blank" rel="noopener">Divisione Calcio a 5</a>\n\t\t\t\t\t<a href="http://www.regione.fvg.it/rafvg/cms/RAFVG/" target="_blank" rel="noopener">Regione Friuli Venezia Giulia</a>\n\t\t\t\t\t<a href="https://friuliveneziagiulia.lnd.it/it/" target="_blank" rel="noopener">LND – Friuli Venezia Giulia</a>\n\t\t\t\t\t<a href="https://www.calcettomanzano.it/www.comune.manzano.ud.it/hh/index.php?jvs=0&amp;acc=1" target="_blank" rel="noopener">Comune di Manzano (UD)</a>\n\t\t\t\t</div>\n\t\t\t\t<div class="social" aria-label="Social">\n\t\t\t\t\t<a href="https://www.facebook.com/manzano.calcetto.fans/" aria-label="Facebook">Fb</a>\n\t\t\t\t\t<a href="https://www.instagram.com/c5manzano1988/" aria-label="Instagram">Ig</a>\n\t\t\t\t</div>\n\t\t\t\t<p class="copyright">© 2003–2025 A.D.S. C5 MANZANO 1988 – Tutti i diritti riservati • <a href="mailto:robertopit@inwind.it">Contatta webmaster</a></p>\n\t\t\t</div>\n\t\t</footer>\n'
);

function transformHtml(html) {
  let out = html;

  // 1) Add style-2025 if missing
  if (!out.includes('style-2025.css')) {
    out = out.replace(
      /(<meta[^>]*viewport[^>]*>\s*)/i,
      `$1\n\t\t<link rel="stylesheet" href="../style-2025.css" />\n\t\t<style>#imHeaderBg,#imHeader,#imFooterBg,#imFooter{display:none!important}</style>\n`
    );
  }

  // 2) Inject header 2025 after <body>
  if (!out.includes('<header class="header"') && /<body[^>]*>/i.test(out)) {
    out = out.replace(/<body[^>]*>/i, (m) => `${m}${header2025}`);
  }

  // 3) Inject footer 2025 before </body>
  if (!out.includes('<footer class="footer"')) {
    out = out.replace(/\s*<\/body>/i, `${footer2025}\n\t\t<script src="../scripts-2025.js" defer></script>\n\t</body>`);
  }

  // 4) Ensure scripts-2025 present
  if (!out.includes('scripts-2025.js')) {
    out = out.replace(/<\/body>/i, `\t\t<script src="../scripts-2025.js" defer></script>\n\t</body>`);
  }

  return out;
}

function run() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error('Blog directory not found:', BLOG_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(BLOG_DIR)
    .filter((f) => f.toLowerCase().endsWith('.html'))
    .map((f) => path.join(BLOG_DIR, f));

  let changed = 0;
  files.forEach((fp) => {
    const src = fs.readFileSync(fp, 'utf8');
    const out = transformHtml(src);
    if (out !== src) {
      fs.writeFileSync(fp, out, 'utf8');
      changed++;
    }
  });
  console.log(`Transformed ${changed} / ${files.length} blog files.`);
}

run();


