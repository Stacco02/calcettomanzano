# Tools

### delete-article.js

Rimuove rapidamente un articolo pubblicato.

```
node tools/delete-article.js <slug>
```

- `<slug>` è il nome del file senza `.html` (es. `u19-convocazioni-maccan-prata-c5-c5-manzano-1988-html`).
- Lo script elimina:
  - `blog/<slug>.html`
  - la card corrispondente in `news-2025.html`
  - l’entry da `search-index.js`
  - l’eventuale cover in `images/covers/<slug>.*`
- Controlla il diff (`git status`, `git diff`) e fai commit/push dopo l’esecuzione.

### build-gallery.js

Rigenera la galleria foto prendendo tutte le immagini presenti nella cartella `gallery/`.

```
node tools/build-gallery.js
```

- Aggiorna automaticamente le ultime 4 foto mostrate in home (`index.html`).
- Ricrea la galleria completa in `galleria-2025.html`.
- Le immagini vengono ordinate per data di modifica (le più recenti prima).
- Dopo aver aggiunto o rimosso foto in `gallery/`, riesegui lo script e verifica le pagine aggiornate.

### fetch-facebook-latest.mjs

Scarica l’ultimo post pubblico della pagina Facebook tramite la Graph API.

```
FB_PAGE_ID=<id_pag> FB_ACCESS_TOKEN=<token> node tools/fetch-facebook-latest.mjs
```

- Serve un token con permessi `pages_read_engagement`.
- Salva l’immagine in `social/facebook-latest.jpg` e aggiorna `social/facebook.json`.
- Il file JSON viene letto dalla home per mostrare l’anteprima del post.

### fetch-instagram-latest.mjs

Recupera l’ultimo contenuto pubblicato sul profilo Instagram collegato (via Instagram Graph API).

```
IG_USER_ID=<id_ig> IG_ACCESS_TOKEN=<token> node tools/fetch-instagram-latest.mjs
```

- L’access token deve avere il permesso `instagram_basic`.
- Il comando salva la cover del post in `social/instagram-latest.jpg` e aggiorna `social/instagram.json`.
- Senza eseguire questo script verrà mostrato il fallback statico nella home.
