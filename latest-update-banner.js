/* ===================================================================
   Latest Update Banner — lee changelog.html y actualiza el banner
   de "Últimas actualizaciones" automáticamente en cada carga.

   Fuente única de verdad: changelog.html (.latest-ver + .latest-change)
   =================================================================== */

(function () {
    'use strict';

    const BANNER_SELECTOR = '#latest-update-banner-text';

    async function updateBanner() {
        const bannerEl = document.querySelector(BANNER_SELECTOR);
        if (!bannerEl) return;

        try {
            const res = await fetch('changelog.html', { cache: 'no-cache' });
            if (!res.ok) return;

            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');

            // Obtener versión: "v2.1.114 — a crash in the permission dialog"
            const verEl = doc.querySelector('.latest-ver');
            if (!verEl) return;

            // Extraer versión (primer segmento antes de —)
            const verText = verEl.textContent.trim();
            const versionMatch = verText.match(/^(v[\d.]+)/);
            const version = versionMatch ? versionMatch[1] : verText.split('—')[0].trim();

            // Extraer lista de cambios (los .latest-change)
            const changes = Array.from(doc.querySelectorAll('.latest-change'))
                .map(el => el.textContent.replace(/•/g, '').trim())
                .filter(Boolean)
                .slice(0, 3); // máx 3 cambios

            // Fecha
            const dateEl = doc.querySelector('.latest-date');
            const date = dateEl ? dateEl.textContent.trim() : '';

            // Construir el texto del banner
            const changesText = changes.length ? changes.join(' · ') : 'Ver novedades';
            bannerEl.innerHTML = `<strong style="color: var(--text-primary);">Últimas actualizaciones:</strong> Claude Code ${version} — ${changesText}`;
            bannerEl.setAttribute('title', date);
        } catch (err) {
            // Silenciosamente mantener el texto de fallback que hay en el HTML
            console.warn('Could not fetch latest changelog:', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateBanner);
    } else {
        updateBanner();
    }
})();
