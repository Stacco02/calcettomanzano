const fs = require('fs');
const path = require('path');

const newsPagePath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/news-2025.html';

console.log('Correggendo l\'estrazione dell\'anno dagli articoli...');

// Legge la pagina news
let newsContent = fs.readFileSync(newsPagePath, 'utf8');

// Nuova funzione JavaScript corretta per l'estrazione dell'anno
const fixedYearExtractionScript = `
                <script src="search-index.js"></script>
                <script>
                        document.addEventListener('DOMContentLoaded', function() {
                                const searchInput = document.getElementById('searchInput');
                                const newsGrid = document.querySelector('.news-grid');
                                const loadMoreBtn = document.getElementById('loadMoreBtn');
                                const yearButtons = document.querySelectorAll('.year-btn');
                                
                                // Carica TUTTI gli articoli all'inizio
                                let allNewsItems = Array.from(newsGrid.querySelectorAll('.news-card'));
                                let filteredItems = [...allNewsItems];
                                let visibleItems = 6;
                                let isSearching = false;
                                let currentYearFilter = 'all';

                                console.log('Articoli totali caricati:', allNewsItems.length);

                                // Funzione per estrarre l'anno da un articolo (migliorata)
                                function getArticleYear(item) {
                                        // Cerca l'anno nel titolo
                                        const title = item.querySelector('.news-title').textContent;
                                        const titleYearMatch = title.match(/(\d{4})/);
                                        if (titleYearMatch) {
                                                const year = parseInt(titleYearMatch[1]);
                                                if (year >= 2020 && year <= 2025) {
                                                        return year;
                                                }
                                        }
                                        
                                        // Cerca l'anno nei metadati (autore/data)
                                        const meta = item.querySelector('.news-author').textContent;
                                        const metaYearMatch = meta.match(/(\d{4})/);
                                        if (metaYearMatch) {
                                                const year = parseInt(metaYearMatch[1]);
                                                if (year >= 2020 && year <= 2025) {
                                                        return year;
                                                }
                                        }
                                        
                                        // Cerca l'anno nel link dell'articolo
                                        const articleLink = item.querySelector('a[href*="blog/"]');
                                        if (articleLink) {
                                                const href = articleLink.getAttribute('href');
                                                const hrefYearMatch = href.match(/(\d{4})/);
                                                if (hrefYearMatch) {
                                                        const year = parseInt(hrefYearMatch[1]);
                                                        if (year >= 2020 && year <= 2025) {
                                                                return year;
                                                        }
                                                }
                                        }
                                        
                                        // Se non trova un anno specifico, prova a dedurlo dal contenuto
                                        // Cerca pattern comuni come "2025", "2024", etc.
                                        const allText = item.textContent;
                                        const yearMatches = allText.match(/\b(202[0-5])\b/g);
                                        if (yearMatches && yearMatches.length > 0) {
                                                // Prende l'anno più recente trovato
                                                const years = yearMatches.map(match => parseInt(match)).filter(year => year >= 2020 && year <= 2025);
                                                if (years.length > 0) {
                                                        return Math.max(...years);
                                                }
                                        }
                                        
                                        // Default: assegna 2025 se non trova nulla
                                        return 2025;
                                }

                                // Funzione per filtrare per anno
                                function filterByYear(year) {
                                        currentYearFilter = year;
                                        console.log('Filtro per anno:', year);
                                        
                                        if (year === 'all') {
                                                filteredItems = [...allNewsItems];
                                        } else {
                                                const targetYear = parseInt(year);
                                                filteredItems = allNewsItems.filter(item => {
                                                        const articleYear = getArticleYear(item);
                                                        console.log('Articolo:', item.querySelector('.news-title').textContent.substring(0, 30), 'Anno trovato:', articleYear);
                                                        return articleYear === targetYear;
                                                });
                                        }
                                        
                                        console.log('Filtrati per anno', year + ':', filteredItems.length, 'articoli');
                                        
                                        // Se c'è una ricerca attiva, riapplica anche quella
                                        if (isSearching && searchInput.value.trim().length >= 2) {
                                                applySearch(searchInput.value.trim());
                                        } else {
                                                visibleItems = 6;
                                                updateDisplay();
                                        }
                                        
                                        updateYearButtons();
                                }

                                // Funzione per aggiornare i pulsanti anno
                                function updateYearButtons() {
                                        yearButtons.forEach(btn => {
                                                btn.classList.remove('active');
                                                if (btn.dataset.year === currentYearFilter) {
                                                        btn.classList.add('active');
                                                }
                                        });
                                }

                                // Funzione per applicare la ricerca
                                function applySearch(searchTerm) {
                                        if (searchTerm.length < 2) {
                                                filteredItems = currentYearFilter === 'all' ? 
                                                        [...allNewsItems] : 
                                                        allNewsItems.filter(item => {
                                                                const articleYear = getArticleYear(item);
                                                                return articleYear === parseInt(currentYearFilter);
                                                        });
                                                isSearching = false;
                                        } else {
                                                isSearching = true;
                                                
                                                // Usa l'indice di ricerca per trovare gli articoli
                                                const searchResults = window.searchInArticles ? 
                                                        window.searchInArticles(searchTerm) : 
                                                        performFallbackSearch(searchTerm);
                                                
                                                // Filtra gli elementi DOM corrispondenti
                                                let searchFiltered = allNewsItems.filter(item => {
                                                        const articleLink = item.querySelector('a[href*="blog/"]');
                                                        if (!articleLink) return false;
                                                        
                                                        const href = articleLink.getAttribute('href');
                                                        const filename = href.split('/').pop().split('?')[0];
                                                        
                                                        return searchResults.some(result => result.filename === filename);
                                                });
                                                
                                                // Applica anche il filtro anno
                                                if (currentYearFilter !== 'all') {
                                                        searchFiltered = searchFiltered.filter(item => {
                                                                const articleYear = getArticleYear(item);
                                                                return articleYear === parseInt(currentYearFilter);
                                                        });
                                                }
                                                
                                                filteredItems = searchFiltered;
                                        }
                                        
                                        visibleItems = 6;
                                        updateDisplay();
                                        
                                        if (isSearching) {
                                                showSearchResultsCount(filteredItems.length, searchTerm);
                                        } else {
                                                hideSearchResultsCount();
                                        }
                                }

                                // Funzione per aggiornare la visualizzazione
                                function updateDisplay() {
                                        const itemsToShow = filteredItems.slice(0, visibleItems);
                                        
                                        // Nasconde tutti gli articoli
                                        allNewsItems.forEach(item => {
                                                item.style.display = 'none';
                                        });
                                        
                                        // Mostra solo gli articoli filtrati
                                        itemsToShow.forEach(item => {
                                                item.style.display = 'block';
                                        });
                                        
                                        // Mostra/nasconde il pulsante "Carica altri"
                                        if (visibleItems >= filteredItems.length) {
                                                loadMoreBtn.style.display = 'none';
                                        } else {
                                                loadMoreBtn.style.display = 'inline-block';
                                        }
                                        
                                        // Mostra/nasconde il messaggio "Nessun risultato"
                                        if (filteredItems.length === 0 && (isSearching || currentYearFilter !== 'all')) {
                                                showNoResultsMessage();
                                        } else {
                                                hideNoResultsMessage();
                                        }
                                        
                                        console.log('Articoli mostrati:', itemsToShow.length, 'di', filteredItems.length);
                                }

                                // Funzione per mostrare il messaggio "Nessun risultato"
                                function showNoResultsMessage() {
                                        if (document.getElementById('noResultsMsg')) return;
                                        
                                        const noResults = document.createElement('div');
                                        noResults.id = 'noResultsMsg';
                                        noResults.style.cssText = \`
                                                text-align: center;
                                                padding: 3rem 1rem;
                                                color: #6b7380;
                                                font-size: 1.1rem;
                                                background: #f9fafb;
                                                border-radius: 12px;
                                                margin: 2rem 0;
                                        \`;
                                        
                                        let message = 'Nessun articolo trovato';
                                        if (currentYearFilter !== 'all' && !isSearching) {
                                                message = \`Nessun articolo trovato per l'anno \${currentYearFilter}\`;
                                        } else if (isSearching) {
                                                message = 'Nessun articolo trovato per la ricerca';
                                        }
                                        
                                        noResults.innerHTML = \`
                                                <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                                                <h3 style="margin: 0 0 0.5rem; color: #374151;">\${message}</h3>
                                                <p style="margin: 0;">Prova con un anno diverso o parole chiave diverse</p>
                                        \`;
                                        newsGrid.appendChild(noResults);
                                }

                                // Funzione per nascondere il messaggio "Nessun risultato"
                                function hideNoResultsMessage() {
                                        const noResults = document.getElementById('noResultsMsg');
                                        if (noResults) {
                                                noResults.remove();
                                        }
                                }

                                // Funzione di ricerca di fallback
                                function performFallbackSearch(searchTerm) {
                                        const term = searchTerm.toLowerCase();
                                        return allNewsItems.filter(item => {
                                                const title = item.querySelector('.news-title').textContent.toLowerCase();
                                                const category = item.querySelector('.news-category').textContent.toLowerCase();
                                                const author = item.querySelector('.news-author').textContent.toLowerCase();
                                                
                                                return title.includes(term) || 
                                                       category.includes(term) || 
                                                       author.includes(term);
                                        });
                                }

                                // Funzione per mostrare il conteggio dei risultati
                                function showSearchResultsCount(count, searchTerm) {
                                        hideSearchResultsCount();
                                        
                                        if (count > 0) {
                                                const countDiv = document.createElement('div');
                                                countDiv.id = 'searchResultsCount';
                                                countDiv.style.cssText = \`
                                                        text-align: center;
                                                        margin: 1rem 0;
                                                        padding: 0.5rem 1rem;
                                                        background: #dbeafe;
                                                        color: #1e40af;
                                                        border-radius: 8px;
                                                        font-weight: 500;
                                                \`;
                                                
                                                let yearText = currentYearFilter !== 'all' ? \` per l'anno \${currentYearFilter}\` : '';
                                                countDiv.textContent = \`Trovati \${count} articoli per "\${searchTerm}"\${yearText}\`;
                                                searchInput.parentNode.insertBefore(countDiv, searchInput.parentNode.firstChild);
                                        }
                                }

                                // Funzione per nascondere il conteggio dei risultati
                                function hideSearchResultsCount() {
                                        const existingCount = document.getElementById('searchResultsCount');
                                        if (existingCount) {
                                                existingCount.remove();
                                        }
                                }

                                // Funzione per pulire la ricerca
                                function clearSearch() {
                                        searchInput.value = '';
                                        applySearch('');
                                        console.log('Ricerca pulita, mostrando tutti gli articoli');
                                }

                                // Event listeners
                                searchInput.addEventListener('input', function() {
                                        applySearch(this.value.trim());
                                });
                                
                                // Event listeners per i pulsanti anno
                                yearButtons.forEach(btn => {
                                        btn.addEventListener('click', function() {
                                                console.log('Cliccato pulsante anno:', this.dataset.year);
                                                filterByYear(this.dataset.year);
                                        });
                                });
                                
                                // Pulsante per pulire la ricerca
                                const clearBtn = document.createElement('button');
                                clearBtn.innerHTML = '✕';
                                clearBtn.style.cssText = \`
                                        position: absolute;
                                        right: 8px;
                                        top: 50%;
                                        transform: translateY(-50%);
                                        background: none;
                                        border: none;
                                        font-size: 18px;
                                        color: #6b7380;
                                        cursor: pointer;
                                        padding: 4px;
                                        border-radius: 4px;
                                \`;
                                clearBtn.addEventListener('click', clearSearch);
                                
                                // Aggiunge il pulsante di pulizia al container della ricerca
                                const searchContainer = searchInput.parentNode;
                                searchContainer.style.position = 'relative';
                                searchContainer.appendChild(clearBtn);

                                loadMoreBtn.addEventListener('click', function() {
                                        visibleItems += 6;
                                        updateDisplay();
                                        console.log('Caricati altri articoli, totale visibili:', visibleItems);
                                });

                                // Inizializza la visualizzazione
                                updateDisplay();
                                
                                // Debug: mostra gli anni di tutti gli articoli
                                console.log('Anni degli articoli:');
                                allNewsItems.forEach((item, index) => {
                                        const year = getArticleYear(item);
                                        const title = item.querySelector('.news-title').textContent.substring(0, 30);
                                        console.log(\`\${index + 1}. \${title}... - Anno: \${year}\`);
                                });
                                
                                // Debug: verifica che l'indice di ricerca sia caricato
                                setTimeout(() => {
                                        if (window.searchInArticles) {
                                                console.log('Indice di ricerca caricato correttamente');
                                        } else {
                                                console.warn('Indice di ricerca non disponibile, usando ricerca di fallback');
                                        }
                                }, 1000);
                        });
                </script>
`;

// Sostituisce il vecchio script
const oldScriptRegex = /<script>[\s\S]*?searchNews[\s\S]*?<\/script>/g;
newsContent = newsContent.replace(oldScriptRegex, fixedYearExtractionScript);

// Salva la pagina aggiornata
fs.writeFileSync(newsPagePath, newsContent);

console.log('✅ Estrazione dell\'anno corretta!');
console.log('🔧 Miglioramenti:');
console.log('   - Estrazione anno migliorata da titolo, metadati e link');
console.log('   - Fallback a 2025 se non trova anno specifico');
console.log('   - Debug logging per verificare il funzionamento');
console.log('   - Range anni limitato a 2020-2025');
