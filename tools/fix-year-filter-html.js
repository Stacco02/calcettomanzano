const fs = require('fs');
const path = require('path');

const newsPagePath = '/Users/andreastacco/Documents/GitHub/calcettomanzano/news-2025.html';

console.log('Correggendo il filtro per anno - aggiungendo HTML mancante...');

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
                                <button class="year-btn" data-year="2025" style="
                                        padding: 0.5rem 1rem;
                                        border: 2px solid var(--c-border);
                                        background: white;
                                        color: var(--c-text);
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-weight: 500;
                                        transition: all 0.2s ease;
                                ">2025</button>
                                <button class="year-btn" data-year="2024" style="
                                        padding: 0.5rem 1rem;
                                        border: 2px solid var(--c-border);
                                        background: white;
                                        color: var(--c-text);
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-weight: 500;
                                        transition: all 0.2s ease;
                                ">2024</button>
                                <button class="year-btn" data-year="2023" style="
                                        padding: 0.5rem 1rem;
                                        border: 2px solid var(--c-border);
                                        background: white;
                                        color: var(--c-text);
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-weight: 500;
                                        transition: all 0.2s ease;
                                ">2023</button>
                                <button class="year-btn" data-year="2022" style="
                                        padding: 0.5rem 1rem;
                                        border: 2px solid var(--c-border);
                                        background: white;
                                        color: var(--c-text);
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-weight: 500;
                                        transition: all 0.2s ease;
                                ">2022</button>
                                <button class="year-btn" data-year="2021" style="
                                        padding: 0.5rem 1rem;
                                        border: 2px solid var(--c-border);
                                        background: white;
                                        color: var(--c-text);
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-weight: 500;
                                        transition: all 0.2s ease;
                                ">2021</button>
                                <button class="year-btn" data-year="2020" style="
                                        padding: 0.5rem 1rem;
                                        border: 2px solid var(--c-border);
                                        background: white;
                                        color: var(--c-text);
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-weight: 500;
                                        transition: all 0.2s ease;
                                ">2020</button>
                        </div>
                </div>
`;

// Inserisce il filtro anno prima della barra di ricerca
const searchBarRegex = /(<div class="search-bar"[^>]*>)/;
newsContent = newsContent.replace(searchBarRegex, yearFilterHTML + '\n\t\t\t\t\t' + '$1');

// Salva la pagina aggiornata
fs.writeFileSync(newsPagePath, newsContent);

console.log('✅ Filtro per anno HTML aggiunto correttamente!');
console.log('📅 Pulsanti anno: Tutti, 2025, 2024, 2023, 2022, 2021, 2020');
console.log('🎯 Posizionato sopra la barra di ricerca');
