# Sito C5 Manzano 1988 – Guida rapida

Dominio: https://calcettomanzano.it
Repository: https://github.com/Stacco02/calcettomanzano

## Struttura cartelle
- `images/` – loghi sponsor, icone, elementi grafici
- `gallery/` – foto giocatori, news e galleria
- Pagine: `index.html`, `societa.html`, `prima-squadra.html`, `under.html`, `sponsor.html`, `trasparenza.html`, `safeguarding.html`
- Stili/Script: `style.css`, `scripts.js`

## Aggiornare immagini
1) Carica i file su GitHub (Add file → Upload files) oppure in locale e poi `git push`.
2) Usa nomi senza spazi, es.: `francesco_polidori.jpg`.
3) Sostituisci un file mantenendo lo stesso nome per evitare di toccare l’HTML.

Percorsi tipici:
- Sponsor: `images/nome_logo.png`
- Galleria/News/Rosa: `gallery/nome_foto.jpg`

## Modificare contenuti
- Home (news e galleria): `index.html`
  - Duplica un blocco `<article class="card">...</article>` per una nuova news
- 1a Squadra (rosa + risultati/classifica): `prima-squadra.html`
  - Aggiungi una card giocatore duplicando `<div class="gallery-item">...</div>`
- Sponsor: `sponsor.html`
  - Aggiungi/rimuovi `<div class="sponsor">...</div>` e aggiorna `src`

## Pubblicazione (GitHub Pages)
- Ogni commit su `main` pubblica automaticamente su `calcettomanzano.it`.
- File utili: `CNAME`, `robots.txt`, `sitemap.xml`.

## Modifiche rapide dal browser
1) Apri il file in GitHub → Edit → salva con un commit.
2) Le modifiche sono online in ~30–60 secondi.

## Risoluzione problemi
- Immagine non visibile: controlla percorso e che il file sia in `images/` o `gallery/`.
- Menu mobile: se resta aperto, ricarica la pagina (JS caricato con `defer`).

## Contatti
Per supporto: apri una Issue sul repo o contatta il webmaster indicato nel footer del sito.
