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

    function init() {
        // Las tablas del post-content quedan sortables
        const tables = document.querySelectorAll('.post-content table');
        tables.forEach(table => {
            // Asegurarnos de que tenga thead/tbody (pandoc los genera)
            if (!table.querySelector('thead')) return;

            makeTableSortable(table);

            // Indicador visual de que es interactiva
            const wrapper = document.createElement('div');
            wrapper.className = 'sortable-table-hint';
            wrapper.innerHTML = '<span>💡 <strong>Click en cualquier cabecera para ordenar</strong> (estrellas, nombres, features)</span>';
            table.parentNode.insertBefore(wrapper, table);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
