/* ===================================================================
   Tablas interactivas — click en header para ordenar
   =================================================================== */

(function () {
    'use strict';

    function parseValue(text) {
        if (!text) return { type: 'empty', value: '' };

        const raw = text.trim();

        // Detectar números (incluye "158.000", "54.500", "~0", "2.131")
        const cleanNum = raw.replace(/~/g, '').replace(/\./g, '').replace(/,/g, '.');
        if (/^-?\d+(\.\d+)?$/.test(cleanNum)) {
            return { type: 'number', value: parseFloat(cleanNum) };
        }

        // Detectar patrones tipo "54.500" o "2.131" (miles con punto)
        if (/^\d{1,3}(\.\d{3})+$/.test(raw)) {
            return { type: 'number', value: parseInt(raw.replace(/\./g, ''), 10) };
        }

        // Detectar emojis comunes que usamos como flags (✅ ❌ ⚙️ ⚠️ 🟢 🟡 🔴)
        const emojiRank = {
            '🔴': 3, '❌': 3,
            '🟡': 2, '⚠️': 2, '⚙️': 2,
            '🟢': 1, '✅': 1
        };
        for (const [emoji, rank] of Object.entries(emojiRank)) {
            if (raw.startsWith(emoji)) {
                return { type: 'rank', value: rank, raw };
            }
        }

        // Oficial / Técnica / palabras especiales
        if (/^oficial$/i.test(raw)) {
            return { type: 'number', value: 999999 };
        }

        // Texto plano — ordenable alfabéticamente
        return { type: 'string', value: raw.toLowerCase() };
    }

    function compareRows(a, b, colIndex, direction) {
        const cellA = a.children[colIndex];
        const cellB = b.children[colIndex];

        if (!cellA || !cellB) return 0;

        const valA = parseValue(cellA.textContent);
        const valB = parseValue(cellB.textContent);

        let comparison = 0;

        if (valA.type === 'empty' && valB.type === 'empty') return 0;
        if (valA.type === 'empty') return 1;
        if (valB.type === 'empty') return -1;

        if (valA.type === 'number' && valB.type === 'number') {
            comparison = valA.value - valB.value;
        } else if (valA.type === 'rank' && valB.type === 'rank') {
            comparison = valA.value - valB.value;
        } else {
            comparison = String(valA.value).localeCompare(String(valB.value), 'es', { numeric: true });
        }

        return direction === 'asc' ? comparison : -comparison;
    }

    function makeTableSortable(table) {
        const thead = table.querySelector('thead');
        if (!thead) return;

        const headers = thead.querySelectorAll('th');
        if (headers.length === 0) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        // Estado de ordenación
        let currentSort = { col: -1, direction: 'asc' };

        headers.forEach((th, index) => {
            th.classList.add('sortable');
            th.setAttribute('role', 'button');
            th.setAttribute('tabindex', '0');
            th.setAttribute('aria-label', `Ordenar por ${th.textContent.trim()}`);

            // Añadir indicador de sort
            const indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            indicator.innerHTML = '⇅';
            th.appendChild(indicator);

            const handleSort = () => {
                const rows = Array.from(tbody.querySelectorAll('tr'));

                // Toggle direction si se clickea la misma columna
                if (currentSort.col === index) {
                    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort = { col: index, direction: 'asc' };
                }

                // Limpiar indicadores de otros headers
                headers.forEach((h, i) => {
                    const ind = h.querySelector('.sort-indicator');
                    if (i === index) {
                        ind.innerHTML = currentSort.direction === 'asc' ? '↑' : '↓';
                        h.classList.add('sorted');
                    } else {
                        ind.innerHTML = '⇅';
                        h.classList.remove('sorted');
                    }
                });

                // Ordenar filas
                rows.sort((a, b) => compareRows(a, b, index, currentSort.direction));

                // Reconstruir tbody
                rows.forEach(row => tbody.appendChild(row));
            };

            th.addEventListener('click', handleSort);
            th.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort();
                }
            });
        });
    }

    // === Pill decoration ===
    const pillPatterns = [
        { re: /^✅✅/, cls: 'pill-excellent', emoji: '✅' },
        { re: /^✅/, cls: 'pill-yes', emoji: '✅' },
        { re: /^❌/, cls: 'pill-no', emoji: '❌' },
        { re: /^⚙️/, cls: 'pill-config', emoji: '⚙️' },
        { re: /^⚠️/, cls: 'pill-partial', emoji: '⚠️' },
        { re: /^🟢/, cls: 'pill-good', emoji: '🟢' },
        { re: /^🟡/, cls: 'pill-medium', emoji: '🟡' },
        { re: /^🔴/, cls: 'pill-bad', emoji: '🔴' }
    ];

    function decorateCellAsPill(cell) {
        const text = cell.textContent.trim();
        if (!text) return;

        for (const { re, cls, emoji } of pillPatterns) {
            if (re.test(text)) {
                const label = text.replace(re, '').trim();
                cell.innerHTML = `<span class="pill ${cls}"><span class="pill-emoji">${emoji}</span>${label ? ` ${label}` : ''}</span>`;
                return true;
            }
        }
        return false;
    }

    function decorateTable(table) {
        const cells = table.querySelectorAll('tbody td');
        let pillCount = 0;
        cells.forEach(cell => {
            if (cell === cell.parentElement.firstElementChild) return; // skip first column
            if (decorateCellAsPill(cell)) pillCount++;
        });
        return pillCount;
    }

    function addLegend(table) {
        const legend = document.createElement('div');
        legend.className = 'matrix-legend';
        legend.innerHTML = `
            <span class="matrix-legend-label">Leyenda:</span>
            <span class="pill pill-excellent"><span class="pill-emoji">✅</span> Excelente</span>
            <span class="pill pill-yes"><span class="pill-emoji">✅</span> Sí</span>
            <span class="pill pill-config"><span class="pill-emoji">⚙️</span> Configurable</span>
            <span class="pill pill-partial"><span class="pill-emoji">⚠️</span> Parcial</span>
            <span class="pill pill-no"><span class="pill-emoji">❌</span> No</span>
        `;
        table.parentNode.insertBefore(legend, table);
    }

    function addStickyColumn(table) {
        // Solo para tablas anchas (>6 columnas)
        const headers = table.querySelectorAll('thead th');
        if (headers.length > 6) {
            table.classList.add('has-sticky-col');
        }
    }

    function wrapTable(table) {
        // Envolver la tabla en un div con overflow-x
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        return wrapper;
    }

    // === Link framework names to their H2 anchors ===
    function normalizeSlug(text) {
        return text.trim().toLowerCase()
            .replace(/\*\*/g, '')
            .replace(/\([^)]*\)/g, '')       // strip parenthetical
            .replace(/[—–-].*$/, '')         // strip everything after dash
            .replace(/\s+/g, ' ')
            .trim();
    }

    function buildAnchorMap() {
        const map = new Map();
        document.querySelectorAll('.post-content h2[id]').forEach(h2 => {
            const fullKey = normalizeSlug(h2.textContent);
            if (!fullKey) return;

            // Registrar la clave completa
            map.set(fullKey, h2.id);

            // Registrar versiones parciales: cada prefijo incremental
            // "rita vrataski loop" → también "rita vrataski", "rita"
            const words = fullKey.split(' ').filter(w => w.length >= 3);
            for (let i = 1; i <= words.length; i++) {
                const partial = words.slice(0, i).join(' ');
                if (!map.has(partial)) map.set(partial, h2.id);
            }
        });
        return map;
    }

    function findAnchor(text, anchorMap) {
        const key = normalizeSlug(text);
        if (!key) return null;

        // Match exacto
        if (anchorMap.has(key)) return anchorMap.get(key);

        // Prefix match: probamos progresivamente quitando última palabra
        const words = key.split(' ');
        while (words.length > 0) {
            const tryKey = words.join(' ');
            if (anchorMap.has(tryKey)) return anchorMap.get(tryKey);
            words.pop();
        }
        return null;
    }

    function tryLinkCell(cell, anchorMap, label) {
        if (!cell) return false;
        if (cell.querySelector('a.framework-link')) return false;

        const text = cell.textContent.trim();
        if (!text) return false;

        const anchorId = findAnchor(text, anchorMap);

        if (anchorId) {
            const indicator = cell.querySelector('.sort-indicator');
            let innerHTML = cell.innerHTML;
            if (indicator) {
                innerHTML = innerHTML.replace(indicator.outerHTML, '').trim();
            }
            cell.innerHTML = `<a href="#${anchorId}" class="framework-link" title="Ir a la sección de ${text}">${innerHTML}</a>${indicator ? indicator.outerHTML : ''}`;

            // Si es un TH (header), prevenir que el click en el link dispare el sort
            const link = cell.querySelector('a.framework-link');
            if (link && cell.tagName === 'TH') {
                link.addEventListener('click', e => e.stopPropagation());
            }
            return true;
        }
        return false;
    }

    function linkFrameworkNames(table, anchorMap) {
        // Primera columna de tbody (cada row → firstCell)
        table.querySelectorAll('tbody tr').forEach(row => {
            tryLinkCell(row.children[0], anchorMap);
        });

        // Headers de feature matrix: si el thead tiene >3 columnas y las columnas 2+ son frameworks
        const headers = table.querySelectorAll('thead th');
        if (headers.length > 3) {
            headers.forEach((th, idx) => {
                if (idx === 0) return; // saltar primera (Feature/Framework)
                tryLinkCell(th, anchorMap);
            });
        }
    }

    function init() {
        const tables = document.querySelectorAll('.post-content table');
        let legendAdded = false;
        const anchorMap = buildAnchorMap();

        tables.forEach(table => {
            if (!table.querySelector('thead')) return;

            makeTableSortable(table);

            // Hacer clickableh loh nombreh de frameworkh en primera columna
            linkFrameworkNames(table, anchorMap);

            // Decorar celdas con pills
            const pillCount = decorateTable(table);
            const isFeatureMatrix = pillCount > 5;

            // Envolver en div pa scroll horizontal
            const wrapper = wrapTable(table);

            // Si es feature matrix → sticky column + leyenda (una sola vez)
            if (isFeatureMatrix) {
                addStickyColumn(table);

                if (!legendAdded) {
                    const legend = document.createElement('div');
                    legend.className = 'matrix-legend';
                    legend.innerHTML = `
                        <span class="matrix-legend-label">Leyenda:</span>
                        <span class="pill pill-excellent"><span class="pill-emoji">✅</span> Excelente</span>
                        <span class="pill pill-yes"><span class="pill-emoji">✅</span> Sí</span>
                        <span class="pill pill-config"><span class="pill-emoji">⚙️</span> Configurable</span>
                        <span class="pill pill-partial"><span class="pill-emoji">⚠️</span> Parcial</span>
                        <span class="pill pill-no"><span class="pill-emoji">❌</span> No</span>
                    `;
                    wrapper.parentNode.insertBefore(legend, wrapper);
                    legendAdded = true;
                }
            }

            // Hint de interactividad encima del wrapper
            const hint = document.createElement('div');
            hint.className = 'sortable-table-hint';
            hint.innerHTML = '<span>💡 <strong>Click en cualquier cabecera para ordenar</strong></span>';
            wrapper.parentNode.insertBefore(hint, wrapper);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
