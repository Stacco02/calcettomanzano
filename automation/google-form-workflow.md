# Workflow Google Form → GitHub

Guida per permettere ai redattori di pubblicare articoli senza toccare il codice.

---

## 1. Prerequisiti

- Repo GitHub: `Stacco02/calcettomanzano`, branch `main`.
- Token personale GitHub con permesso `repo` (contenuti in scrittura).
- Account Google che gestisce Form/Foglio e condivide il form ai redattori.

---

## 2. Google Form

1. Crea un nuovo Google Form.
2. Aggiungi le domande (tutte obbligatorie):
   - **Titolo** – risposta breve
   - **Autore** – risposta breve
   - **Testo articolo** – paragrafo (consentire testo lungo)
   - **Cover** – caricamento file (solo immagini, max 1)  
3. Dal tab *Risposte* genera il foglio di lavoro collegato (Google Sheet).

---

## 3. Apps Script

1. Dal foglio collegato apri **Strumenti → Editor di script**.
2. Sostituisci il contenuto con lo script seguente (copiato integralmente):

```javascript
const SP = PropertiesService.getScriptProperties();
const GITHUB = {
  token: SP.getProperty('GITHUB_TOKEN'),
  owner: SP.getProperty('REPO_OWNER') || 'Stacco02',
  repo: SP.getProperty('REPO_NAME') || 'calcettomanzano',
  branch: SP.getProperty('BRANCH') || 'main',
};
const DEFAULT_COVER_PATH = SP.getProperty('DEFAULT_COVER_PATH') || 'images/ArticoloNofoto.jpeg';
const SITE_BASE_URL = SP.getProperty('SITE_BASE_URL') || 'https://calcettomanzano.staccoa.it';

function onFormSubmit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = e.range.getRow();
    const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    const record = mapRecord(headers, values);

    const title = (record['Titolo'] || '').trim();
    const author = (record['Autore'] || '').trim() || 'Ufficio Stampa';
    const body = (record['Testo articolo'] || '').trim();
    const coverValue = (record['Cover'] || '').trim();
    if (!title || !body) throw new Error('Titolo o Testo articolo mancanti');

    const now = new Date();
    const dateIso = Utilities.formatDate(now, 'Europe/Rome', 'yyyy-MM-dd');
    const dateIt = formatItalianLongDate(now);
    const slugBase = slugify(title);
    const slug = `${slugBase}-${Utilities.formatDate(now, 'UTC', 'yyyyMMddHHmmss')}`;
    const blogPath = `blog/${slug}.html`;
    const bust = Date.now().toString();
    const linkHref = `blog/${slug}.html?v=${bust}`;

    let coverPath = DEFAULT_COVER_PATH;
    let hasCustomCover = false;
    if (coverValue) {
      const fileId = extractDriveFileId(coverValue);
      if (fileId) {
        const file = DriveApp.getFileById(fileId);
        const ext = getSafeImageExt(file.getName());
        coverPath = `images/covers/${slug}.${ext}`;
        githubPutBinary(coverPath, file.getBlob(), `[bot] add cover for ${slug}`);
        hasCustomCover = true;
      }
    }

    const siteBase = SITE_BASE_URL.replace(/\/$/, '');
    const articleUrl = `${siteBase}/${blogPath}`;
    const blogHtml = buildBlogHtml({
      title,
      author,
      dateIt,
      body,
      coverPath,
      hasCustomCover,
      articleUrl,
      shareImageUrl: `${siteBase}/${coverPath}`
    });
    githubPutText(blogPath, blogHtml, `[bot] publish blog: ${title}`);

    const newsFile = githubGetFile('news-2025.html');
    let newsHtml = decodeFile(newsFile);
    const cardHtml = buildNewsCardHtml({ title, author, dateIt, linkHref, imageSrc: coverPath });
    newsHtml = insertNewsCard(newsHtml, cardHtml);
    githubPutText('news-2025.html', newsHtml, `[bot] add news card: ${title}`, newsFile.sha);

    const siFile = githubGetFile('search-index.js');
    let siJs = decodeFile(siFile);
    const entry = buildSearchIndexEntry({ slug, title, author, date: dateIso, body });
    siJs = insertSearchIndexEntry(siJs, entry);
    githubPutText('search-index.js', siJs, `[bot] update search-index: ${slug}`, siFile.sha);

    writeBack(sheet, headers, row, {
      Status: 'OK',
      URL: `${SITE_BASE_URL}/${linkHref}`,
      Filename: `${slug}.html`,
    });
  } catch (err) {
    const sheet = e && e.source ? e.source.getActiveSheet() : null;
    if (sheet && e && e.range) {
      writeBack(sheet,
        sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0],
        e.range.getRow(),
        { Status: 'ERROR: ' + err.message });
    }
    throw err;
  }
}

function mapRecord(headers, values) {
  return headers.reduce((acc, h, i) => (acc[h] = values[i], acc), {});
}
function writeBack(sheet, headers, row, obj) {
  Object.keys(obj).forEach(key => {
    let col = headers.indexOf(key) + 1;
    if (col < 1) {
      col = headers.length + 1;
      sheet.getRange(1, col).setValue(key);
      headers.push(key);
    }
    sheet.getRange(row, col).setValue(obj[key]);
  });
}
function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, '-e-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'articolo';
}
function extractDriveFileId(url) {
  const m1 = url.match(/\/d\/([A-Za-z0-9_-]{10,})/);
  if (m1) return m1[1];
  const m2 = url.match(/[?&]id=([A-Za-z0-9_-]{10,})/);
  return m2 ? m2[1] : null;
}
function getSafeImageExt(name) {
  const m = (name || '').toLowerCase().match(/\.(png|jpe?g|webp)$/);
  if (!m) return 'jpg';
  return m[1] === 'jpeg' ? 'jpg' : m[1];
}
function formatItalianLongDate(date) {
  const months = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
function formatMetaDate(date) {
  const wd = ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'][date.getDay()];
  const mon = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'][date.getMonth()];
  const dd = Utilities.formatDate(date, 'Europe/Rome', 'dd');
  return `${wd} ${dd} ${mon} ${date.getFullYear()}`;
}

function applyInlineMarkup(text) {
  const esc = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return esc
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>');
}

function buildBlogHtml({ title, author, dateIt, body, coverPath, hasCustomCover, articleUrl, shareImageUrl }) {
  const esc = t => (t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const paragraphs = body
    .split(/\n\n+/)
    .map(p => `<p>${applyInlineMarkup(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n    ');
  const descriptionRaw = (body.split(/\n\n+/)[0] || title).replace(/[\*\_]/g, '');
  const description = esc(descriptionRaw.replace(/\n/g, ' ').slice(0, 200));
  const cover = hasCustomCover ? `    <img src="../${coverPath}" alt="${esc(title)}" />\n` : '';

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${description}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${esc(shareImageUrl)}">
  <meta property="og:url" content="${esc(articleUrl)}">
  <meta property="og:site_name" content="C5 Manzano 1988">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${esc(shareImageUrl)}">
  <link rel="canonical" href="${esc(articleUrl)}">
  <style>
    :root { --c-primary:#0b3f91; --c-bg:#fff; --c-text:#0e0e0e; --c-muted:#6b7380; --c-border:#e5e7eb; --shadow:0 8px 24px rgba(0,0,0,.08); }
    *{box-sizing:border-box}
    body{margin:0 auto;padding:32px clamp(16px, 6vw, 24px);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--c-text);background:var(--c-bg);line-height:1.6;max-width:800px}
    h1{font-weight:800;font-size:clamp(28px,4vw,36px);text-transform:uppercase;letter-spacing:.03em;margin:0 0 16px;color:var(--c-primary)}
    .meta{color:var(--c-muted);margin:0 0 24px;font-size:.95rem;font-weight:500;padding:8px 0;border-bottom:2px solid var(--c-border)}
    .content img{max-width:100%;max-height:420px;width:100%;height:auto;border-radius:12px;margin:16px 0;object-fit:cover;box-shadow:var(--shadow)}
    .content p{margin:var(--sp-4) 0;text-align:justify;}
  </style>
</head>
<body>
  <h1>${esc(title)}</h1>
  <div class="meta">${esc(author)} — ${esc(dateIt)}</div>
  <div class="content">
${cover}${paragraphs}
  </div>
</body>
</html>`;
}

function buildNewsCardHtml({ title, author, dateIt, linkHref, imageSrc }) {
  const esc = t => (t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `
<article class="news-card" style="background: #fff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; transition: transform 0.2s;">
  <div class="news-image" style="width: 100%; height: 200px; overflow: hidden; background: #f8fafc; display: flex; align-items: center; justify-content: center;">
    <img src="${esc(imageSrc)}" alt="${esc(title)}" style="width: 100%; height: 100%; object-fit: cover;" />
  </div>
  <div class="news-card-content" style="padding: 1.5rem;">
    <h3 class="news-title" style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600;">
      <a href="${esc(linkHref)}" style="color: #1e40af; text-decoration: none;">${esc(title)}</a>
    </h3>
    <div class="news-meta" style="display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.9em; color: #6b7280; flex-wrap: wrap;">
      <span class="news-author">${esc(author)}</span>
      <span class="news-category">News</span>
      <span class="news-date">${esc(dateIt)}</span>
    </div>
    <a href="${esc(linkHref)}" class="news-read-more" style="display: inline-block; background: #f59e0b; color: #1e40af; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">Leggi articolo</a>
  </div>
</article>`.trim();
}
function insertNewsCard(html, card) {
  const pattern = /<div\s+class="news-grid"\s+id="newsGrid"[^>]*>/i;
  const match = html.match(pattern);
  if (!match) return html;
  const idx = match.index + match[0].length;
  return html.slice(0, idx) + '\n' + card + '\n' + html.slice(idx);
}
function buildSearchIndexEntry({ slug, title, author, date, body }) {
  const preview = body.split(/\n+/).join(' ').slice(0, 160);
  return {
    id: slug,
    title,
    meta: `${author} — ${formatMetaDate(new Date(date))}`,
    content: preview,
    fullText: `${title} ${author} ${body}`.toLowerCase(),
    filename: `${slug}.html`,
  };
}
function insertSearchIndexEntry(jsText, entry) {
  const open = jsText.indexOf('const searchIndex = [');
  const close = jsText.lastIndexOf('];');
  if (open === -1 || close === -1) return jsText;
  const before = jsText.slice(0, close);
  const needsComma = !before.trim().endsWith('[');
  const entryJson = JSON.stringify(entry, null, 2);
  const separator = needsComma ? ',\n' : '';
  return `${before}${separator}${entryJson}\n];\n${jsText.slice(close + 3)}`;
}
function decodeFile(file) {
  return Utilities.newBlob(Utilities.base64Decode(file.content)).getDataAsString();
}

function githubHeaders() {
  return {
    'Authorization': 'token ' + GITHUB.token,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}
function githubGetFile(path) {
  const url = `https://api.github.com/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${encodeURIComponent(path)}?ref=${GITHUB.branch}`;
  const res = UrlFetchApp.fetch(url, { method: 'get', headers: githubHeaders(), muteHttpExceptions: true });
  const code = res.getResponseCode();
  if (code === 200) return JSON.parse(res.getContentText());
  if (code === 404) return null;
  throw new Error(`GET ${path} failed: ${code} ${res.getContentText()}`);
}
function githubPutText(path, text, message, sha) {
  const payload = {
    message,
    branch: GITHUB.branch,
    content: Utilities.base64Encode(text, Utilities.Charset.UTF_8),
  };
  if (sha) payload.sha = sha;
  const url = `https://api.github.com/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${encodeURIComponent(path)}`;
  const res = UrlFetchApp.fetch(url, {
    method: 'put',
    headers: githubHeaders(),
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() >= 300) throw new Error(`PUT text ${path} failed: ${res.getResponseCode()} ${res.getContentText()}`);
}
function githubPutBinary(path, blob, message) {
  const payload = {
    message,
    branch: GITHUB.branch,
    content: Utilities.base64Encode(blob.getBytes()),
  };
  const url = `https://api.github.com/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${encodeURIComponent(path)}`;
  const res = UrlFetchApp.fetch(url, {
    method: 'put',
    headers: githubHeaders(),
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() >= 300) throw new Error(`PUT bin ${path} failed: ${res.getResponseCode()} ${res.getContentText()}`);
}
```

3. Salva il progetto (es. `PublishArticleBot`).

---

## 4. Proprietà Script

In Apps Script → **Impostazioni progetto → Proprietà script** inserisci:

| Nome                  | Valore                                      |
| --------------------- | ------------------------------------------- |
| `GITHUB_TOKEN`        | (PAT generato su GitHub)                     |
| `REPO_OWNER`          | `Stacco02`                                   |
| `REPO_NAME`           | `calcettomanzano`                            |
| `BRANCH`              | `main`                                       |
| `DEFAULT_COVER_PATH`  | `images/ArticoloNofoto.jpeg`                 |
| `SITE_BASE_URL`       | `https://calcettomanzano.staccoa.it`         |

---

## 5. Trigger

- Apri l’icona orologio → “Aggiungi trigger”.
- Funzione: `onFormSubmit`
- Origine evento: `Da foglio di lavoro`
- Tipo evento: `All’invio del modulo`
- Salva e autorizza.

---

## 6. Test & Uso

1. Compila il Form come redattore (titolo, autore, testo, cover opzionale).
2. Il foglio ottiene una riga con `Status`, `URL`, `Filename`.
3. Su GitHub compaiono i commit con messaggi `[bot] publish blog: …`, ecc.
4. Dopo il deploy di GitHub Pages, l’articolo è online e appare tra le “Ultime News”.

### Formattazione rapida
- `**testo**` o `__testo__` → grassetto.
- `*testo*` o `_testo_` → corsivo.
- Doppio invio per un nuovo paragrafo.

---

## 7. Manutenzione

- Le cover personalizzate sono salvate in `images/covers/`.
- Per sospendere le pubblicazioni: disattiva il trigger o revoca il token.
- Se rinomini le domande del Form, aggiorna gli header nel foglio o nello script.

---

## 8. Eliminare un articolo rapidamente

Si può rimuovere un articolo con lo script CLI incluso nel repo:

```bash
node tools/delete-article.js <slug>
```

- Usa lo slug del file (es. `u19-convocazioni-maccan-prata-c5-c5-manzano-1988-html`).
- Lo script elimina il file in `blog/`, la card in `news-2025.html`, la relativa voce in `search-index.js` e l’eventuale cover.
- Verifica il diff (`git status`, `git diff`) e **poi** commit/push.

---

Con questi passaggi i redattori possono pubblicare via form, mentre tu hai un modo rapido per rimuovere eventuali articoli. *** End Patch***```json
