document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-lead-form]').forEach(function (form) {
        var success = form.parentElement && form.parentElement.querySelector('[data-lead-success]');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var submitButton = form.querySelector('[type="submit"]');
            var label = submitButton && submitButton.querySelector('.btn-text');
            var original = label ? label.textContent : '';
            if (submitButton) submitButton.disabled = true;
            if (label) label.textContent = 'Enviando...';

            var payload = {
                name: (form.querySelector('[name="name"]') || {}).value || '',
                email: (form.querySelector('[name="email"]') || {}).value || '',
                phone: ((form.querySelector('[name="phone"]') || {}).value || '').trim(),
                role: (form.querySelector('[name="role"]') || {}).value || '',
                newsletter: !!(form.querySelector('[name="newsletter"]') || {}).checked,
                privacidadAceptada: !!(form.querySelector('[name="privacidad"]') || {}).checked,
                politicaVersion: '2026-08-02',
                timestamp: new Date().toISOString(),
                source: form.getAttribute('data-source') || 'Blog Curso Claude Code'
            };

            fetch('https://n8n.josegilarte.es/webhook/lead-claude-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(function (response) {
                    if (!response.ok) throw new Error('Error en la respuesta del servidor');
                    return response.text();
                })
                .then(function () {
                    form.style.display = 'none';
                    if (success) success.style.display = 'block';
                    if (window.posthog) {
                        posthog.identify(payload.email, { name: payload.name, role: payload.role || undefined });
                        posthog.capture('form_submitted', {
                            source: payload.source,
                            role: payload.role || undefined,
                            has_whatsapp: Boolean(payload.phone),
                            newsletter: payload.newsletter
                        });
                    }
                })
                .catch(function () {
                    if (submitButton) submitButton.disabled = false;
                    if (label) label.textContent = original;
                    alert('Hubo un error al enviar el formulario. Por favor, intenta de nuevo.');
                });
        });
    });
});
