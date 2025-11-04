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
