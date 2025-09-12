const fs = require('fs');
const path = require('path');

const newsPagePath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/news-2025.html';
const articlesListPath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json';

console.log('Aggiungendo filtro per anno...');

// Legge la lista degli articoli per estrarre gli anni
const articlesList = JSON.parse(fs.readFileSync(articlesListPath, 'utf8'));

// Estrae gli anni unici dagli articoli
const years = new Set();
articlesList.forEach(article => {
    // Cerca l'anno nel titolo o nei metadati
    const yearMatch = article.title.match(/(\d{4})/) || 
                     article.meta?.match(/(\d{4})/) || 
                     article.content?.match(/(\d{4})/);
    
    if (yearMatch) {
        years.add(parseInt(yearMatch[1]));
    }
});

// Aggiunge anni comuni se non trovati
const currentYear = new Date().getFullYear();
for (let year = currentYear; year >= 2020; year--) {
    years.add(year);
}

const sortedYears = Array.from(years).sort((a, b) => b - a);

console.log('Anni trovati:', sortedYears);

// Legge la pagina news
let newsContent = fs.readFileSync(newsPagePath, 'utf8');

// HTML per il filtro anno
const yearFilterHTML = `
                <div class="year-filter-container" style="margin-bottom: 2rem;">
                        <div class="year-filter" style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; justify-content: center;">
                                <span style="font-weight: 600; color: var(--c-text); margin-right: 1rem;">Filtra per anno:</span>
                                <button class="year-btn active" data-year="all" style="
                                        padding: 0.5rem 1rem;
                                        border: 2px solid var(--c-primary);
                                        background: var(--c-primary);
                                        color: white;
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-weight: 500;
                                        transition: all 0.2s ease;
                                ">Tutti</button>
                                ${sortedYears.map(year => `
                                        <button class="year-btn" data-year="${year}" style="
                                                padding: 0.5rem 1rem;
                                                border: 2px solid var(--c-border);
                                                background: white;
                                                color: var(--c-text);
                                                border-radius: 8px;
                                                cursor: pointer;
                                                font-weight: 500;
                                                transition: all 0.2s ease;
                                        ">${year}</button>
                                `).join('')}
                        </div>
                </div>
`;

// Inserisce il filtro anno prima della barra di ricerca
const searchSectionRegex = /(<div class="news-search"[^>]*>)/;
newsContent = newsContent.replace(searchSectionRegex, yearFilterHTML + '\n\t\t\t\t' + '$1');

// Aggiunge gli stili CSS per il filtro
const yearFilterCSS = `
                        /* Stili per il filtro anno */
                        .year-btn:hover {
                                background: var(--c-primary) !important;
                                color: white !important;
                                border-color: var(--c-primary) !important;
                        }
                        
                        .year-btn.active {
                                background: var(--c-primary) !important;
                                color: white !important;
                                border-color: var(--c-primary) !important;
                        }
                        
                        .year-filter-container {
                                background: #f8fafc;
                                padding: 1.5rem;
                                border-radius: 12px;
                                border: 1px solid var(--c-border);
                        }
                        
                        @media (max-width: 768px) {
                                .year-filter {
                                        flex-direction: column;
                                        align-items: stretch;
                                }
                                
                                .year-filter span {
                                        text-align: center;
                                        margin-right: 0 !important;
                                        margin-bottom: 1rem;
                                }
                                
                                .year-btn {
                                        text-align: center;
                                }
                        }
`;

// Inserisce gli stili CSS
const styleRegex = /(<\/style>)/;
newsContent = newsContent.replace(styleRegex, yearFilterCSS + '\n\t\t\t' + '$1');

// Aggiorna il JavaScript per includere il filtro anno
const updatedSearchScript = `
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

                                // Funzione per estrarre l'anno da un articolo
                                function getArticleYear(item) {
                                        const title = item.querySelector('.news-title').textContent;
                                        const meta = item.querySelector('.news-author').textContent;
                                        
                                        // Cerca l'anno nel titolo o nei metadati
                                        const yearMatch = title.match(/(\d{4})/) || meta.match(/(\d{4})/);
                                        return yearMatch ? parseInt(yearMatch[1]) : null;
                                }

                                // Funzione per filtrare per anno
                                function filterByYear(year) {
                                        currentYearFilter = year;
                                        
                                        if (year === 'all') {
                                                filteredItems = [...allNewsItems];
                                        } else {
                                                filteredItems = allNewsItems.filter(item => {
                                                        const articleYear = getArticleYear(item);
                                                        return articleYear === parseInt(year);
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
newsContent = newsContent.replace(oldScriptRegex, updatedSearchScript);

// Salva la pagina aggiornata
fs.writeFileSync(newsPagePath, newsContent);

console.log('✅ Filtro per anno aggiunto!');
console.log('📅 Anni disponibili:', sortedYears.join(', '));
console.log('🎯 Funzionalità:');
console.log('   - Filtro per anno sopra la barra di ricerca');
console.log('   - Combinazione filtro anno + ricerca');
console.log('   - Design responsive per mobile');
console.log('   - Pulsante "Tutti" per vedere tutti gli articoli');
