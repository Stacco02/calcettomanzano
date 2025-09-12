const fs = require('fs');
const path = require('path');

const newsPagePath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/news-2025.html';
const searchIndexPath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/search-index.js';

console.log('Aggiornando la funzionalità di ricerca...');

// Legge la pagina news
let newsContent = fs.readFileSync(newsPagePath, 'utf8');

// Legge l'indice di ricerca
const searchIndexContent = fs.readFileSync(searchIndexPath, 'utf8');

// Nuova funzione di ricerca potenziata
const enhancedSearchScript = `
                <script src="search-index.js"></script>
                <script>
                        document.addEventListener('DOMContentLoaded', function() {
                                const searchInput = document.getElementById('searchInput');
                                const newsGrid = document.querySelector('.news-grid');
                                const loadMoreBtn = document.getElementById('loadMoreBtn');
                                const noResultsMsg = document.getElementById('noResultsMsg');
                                
                                let allNewsItems = Array.from(newsGrid.querySelectorAll('.news-card'));
                                let filteredItems = [...allNewsItems];
                                let visibleItems = 6;
                                let isSearching = false;

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
                                        if (filteredItems.length === 0 && isSearching) {
                                                if (!noResultsMsg) {
                                                        showNoResultsMessage();
                                                }
                                        } else {
                                                hideNoResultsMessage();
                                        }
                                }

                                // Funzione per mostrare il messaggio "Nessun risultato"
                                function showNoResultsMessage() {
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
                                        noResults.innerHTML = \`
                                                <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                                                <h3 style="margin: 0 0 0.5rem; color: #374151;">Nessun articolo trovato</h3>
                                                <p style="margin: 0;">Prova con parole chiave diverse o controlla l'ortografia</p>
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

                                // Funzione di ricerca potenziata
                                function searchNews() {
                                        const searchTerm = searchInput.value.trim();
                                        
                                        if (searchTerm.length < 2) {
                                                // Se la ricerca è troppo corta, mostra tutti gli articoli
                                                filteredItems = [...allNewsItems];
                                                isSearching = false;
                                                visibleItems = 6;
                                                updateDisplay();
                                                return;
                                        }
                                        
                                        isSearching = true;
                                        
                                        // Usa l'indice di ricerca per trovare gli articoli
                                        const searchResults = window.searchInArticles ? 
                                                window.searchInArticles(searchTerm) : 
                                                performFallbackSearch(searchTerm);
                                        
                                        // Filtra gli elementi DOM corrispondenti
                                        filteredItems = allNewsItems.filter(item => {
                                                const articleLink = item.querySelector('a[href*="blog/"]');
                                                if (!articleLink) return false;
                                                
                                                const href = articleLink.getAttribute('href');
                                                const filename = href.split('/').pop().split('?')[0];
                                                
                                                return searchResults.some(result => result.filename === filename);
                                        });
                                        
                                        visibleItems = 6;
                                        updateDisplay();
                                        
                                        // Mostra il numero di risultati
                                        showSearchResultsCount(searchResults.length, searchTerm);
                                }

                                // Funzione di ricerca di fallback (se l'indice non è disponibile)
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
                                        // Rimuove il conteggio precedente se esiste
                                        const existingCount = document.getElementById('searchResultsCount');
                                        if (existingCount) {
                                                existingCount.remove();
                                        }
                                        
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
                                                countDiv.textContent = \`Trovati \${count} articoli per "\${searchTerm}"\`;
                                                searchInput.parentNode.insertBefore(countDiv, searchInput.parentNode.firstChild);
                                        }
                                }

                                // Funzione per pulire la ricerca
                                function clearSearch() {
                                        searchInput.value = '';
                                        filteredItems = [...allNewsItems];
                                        isSearching = false;
                                        visibleItems = 6;
                                        updateDisplay();
                                        
                                        // Rimuove il conteggio dei risultati
                                        const existingCount = document.getElementById('searchResultsCount');
                                        if (existingCount) {
                                                existingCount.remove();
                                        }
                                }

                                // Event listeners
                                searchInput.addEventListener('input', searchNews);
                                
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
                                });

                                // Inizializza la visualizzazione
                                updateDisplay();
                        });
                </script>
`;

// Sostituisce il vecchio script di ricerca
const oldScriptRegex = /<script>[\s\S]*?searchNews[\s\S]*?<\/script>/g;
newsContent = newsContent.replace(oldScriptRegex, enhancedSearchScript);

// Salva la pagina aggiornata
fs.writeFileSync(newsPagePath, newsContent);

console.log('✅ Funzionalità di ricerca potenziata!');
console.log('🔍 La ricerca ora cerca in:');
console.log('   - Titoli degli articoli');
console.log('   - Contenuto completo degli articoli');
console.log('   - Autori e categorie');
console.log('   - Metadati');
console.log('📊 Aggiunto conteggio risultati e messaggio "Nessun risultato"');
console.log('🧹 Aggiunto pulsante per pulire la ricerca');
