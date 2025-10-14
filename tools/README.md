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
