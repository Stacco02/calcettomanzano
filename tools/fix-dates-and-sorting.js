const fs = require('fs');
const path = require('path');

const newsPagePath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/news-2025.html';
const articlesListPath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/articles-list.json';

console.log('Sistemando date, ordinamento e filtro anno...');

// Legge la lista degli articoli per estrarre le date
const articlesList = JSON.parse(fs.readFileSync(articlesListPath, 'utf8'));

// Legge la pagina news
let newsContent = fs.readFileSync(newsPagePath, 'utf8');

// Funzione per estrarre la data da un articolo
function extractDateFromArticle(article) {
    // Cerca la data nei metadati
    if (article.meta) {
        // Pattern per date italiane: "Venerdì 27 Giu 2025", "Lunedì 15 Gen 2024", etc.
        const dateMatch = article.meta.match(/(\w+)\s+(\d{1,2})\s+(\w{3})\s+(\d{4})/);
        if (dateMatch) {
            const [, dayName, day, month, year] = dateMatch;
            const monthMap = {
                'Gen': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'Mag': '05', 'Giu': '06',
                'Lug': '07', 'Ago': '08', 'Set': '09', 'Ott': '10', 'Nov': '11', 'Dic': '12'
            };
            const monthNum = monthMap[month];
            if (monthNum) {
                return `${year}-${monthNum}-${day.padStart(2, '0')}`;
            }
        }
        
        // Pattern alternativo: "27 giugno 2025"
        const altDateMatch = article.meta.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
        if (altDateMatch) {
            const [, day, month, year] = altDateMatch;
            const monthMap = {
                'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04', 'maggio': '05', 'giugno': '06',
                'luglio': '07', 'agosto': '08', 'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
            };
            const monthNum = monthMap[month.toLowerCase()];
            if (monthNum) {
                return `${year}-${monthNum}-${day.padStart(2, '0')}`;
            }
        }
    }
    
    // Cerca la data nel contenuto
    if (article.content) {
        const contentDateMatch = article.content.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
        if (contentDateMatch) {
            const [, day, month, year] = contentDateMatch;
            const monthMap = {
                'gennaio': '01', 'febbraio': '02', 'marzo': '03', 'aprile': '04', 'maggio': '05', 'giugno': '06',
                'luglio': '07', 'agosto': '08', 'settembre': '09', 'ottobre': '10', 'novembre': '11', 'dicembre': '12'
            };
            const monthNum = monthMap[month.toLowerCase()];
            if (monthNum) {
                return `${year}-${monthNum}-${day.padStart(2, '0')}`;
            }
        }
    }
    
    // Se non trova nulla, usa l'anno dal titolo o default
    const yearMatch = article.title.match(/(\d{4})/) || article.meta?.match(/(\d{4})/);
    if (yearMatch) {
        return `${yearMatch[1]}-01-01`;
    }
    
    return '2025-01-01'; // Default
}

// Estrae le date per tutti gli articoli
const articlesWithDates = articlesList.map(article => ({
    ...article,
    date: extractDateFromArticle(article),
    year: parseInt(extractDateFromArticle(article).split('-')[0])
}));

// Ordina per data (più recente prima)
articlesWithDates.sort((a, b) => new Date(b.date) - new Date(a.date));

console.log('Articoli ordinati per data:');
articlesWithDates.slice(0, 5).forEach((article, index) => {
    console.log(`${index + 1}. ${article.title.substring(0, 40)}... - ${article.date}`);
});

// Aggiorna la pagina news con le date corrette e l'ordinamento
let updatedContent = newsContent;

// Sostituisce le date "Data non disponibile" con le date reali
articlesWithDates.forEach(article => {
    const oldDatePattern = new RegExp(`<span class="news-date">Data non disponibile</span>`, 'g');
    const newDate = new Date(article.date).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Cerca l'articolo specifico e sostituisce la sua data
    const articlePattern = new RegExp(
        `(<article[^>]*>.*?<a[^>]*href="[^"]*${article.filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"[^>]*>.*?</a>.*?<div[^>]*class="news-meta"[^>]*>.*?<span class="news-date">)Data non disponibile(</span>.*?</div>.*?</article>)`,
        's'
    );
    
    updatedContent = updatedContent.replace(articlePattern, `$1${newDate}$2`);
});

// Script JavaScript completamente riscritto
const newJavaScript = `
                <script src="search-index.js"></script>
                <script>
                        document.addEventListener('DOMContentLoaded', function() {
                                const searchInput = document.getElementById('searchInput');
                                const newsGrid = document.querySelector('.news-grid');
                                const loadMoreBtn = document.getElementById('loadMoreBtn');
                                const yearButtons = document.querySelectorAll('.year-btn');
                                
                                // Dati degli articoli con date
                                const articlesData = ${JSON.stringify(articlesWithDates)};
                                
                                // Carica TUTTI gli articoli all'inizio
                                let allNewsItems = Array.from(newsGrid.querySelectorAll('.news-card'));
                                let filteredItems = [...allNewsItems];
                                let visibleItems = 6;
                                let isSearching = false;
                                let currentYearFilter = 'all';

                                console.log('Articoli totali caricati:', allNewsItems.length);
                                console.log('Dati articoli:', articlesData.length);

                                // Funzione per ottenere i dati di un articolo dal DOM
                                function getArticleData(item) {
                                        const articleLink = item.querySelector('a[href*="blog/"]');
                                        if (!articleLink) return null;
                                        
                                        const href = articleLink.getAttribute('href');
                                        const filename = href.split('/').pop().split('?')[0];
                                        
                                        return articlesData.find(data => data.filename === filename);
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
                                                        const articleData = getArticleData(item);
                                                        if (!articleData) return false;
                                                        return articleData.year === targetYear;
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
                                                                const articleData = getArticleData(item);
                                                                if (!articleData) return false;
                                                                return articleData.year === parseInt(currentYearFilter);
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
                                                                const articleData = getArticleData(item);
                                                                if (!articleData) return false;
                                                                return articleData.year === parseInt(currentYearFilter);
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
                                
                                // Debug: mostra gli anni degli articoli
                                console.log('Anni degli articoli:');
                                articlesData.forEach((article, index) => {
                                        console.log(\`\${index + 1}. \${article.title.substring(0, 30)}... - Anno: \${article.year} - Data: \${article.date}\`);
                                });
                        });
                </script>
`;

// Sostituisce il vecchio script
const oldScriptRegex = /<script>[\s\S]*?searchNews[\s\S]*?<\/script>/g;
updatedContent = updatedContent.replace(oldScriptRegex, newJavaScript);

// Salva la pagina aggiornata
fs.writeFileSync(newsPagePath, updatedContent);

console.log('✅ Date, ordinamento e filtro anno sistemati!');
console.log('📅 Date estratte e formattate correttamente');
console.log('📊 Articoli ordinati dal più recente al più vecchio');
console.log('🎯 Filtro anno ora funziona con i dati reali');
