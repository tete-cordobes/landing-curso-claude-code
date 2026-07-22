# Guía de Configuración: Google Analytics & Search Console

## 📊 Parte 1: Google Analytics 4 (GA4)

### Paso 1: Crear cuenta de Google Analytics

1. Ve a: https://analytics.google.com/
2. Inicia sesión con tu cuenta de Google
3. Click en **"Empezar a medir"** o **"Administrar" → "Crear cuenta"**
4. Configura:
   - **Nombre de cuenta**: "Curso Claude Code"
   - **Configuración de datos compartidos**: Marca las opciones que prefieras
   - Click **"Siguiente"**

### Paso 2: Crear propiedad

1. Configura la propiedad:
   - **Nombre de propiedad**: "ccodecurso.com"
   - **Zona horaria**: Selecciona España
   - **Moneda**: EUR (€)
   - Click **"Siguiente"**

2. Detalles del negocio:
   - **Sector**: Educación
   - **Tamaño de la empresa**: (selecciona el apropiado)
   - **Uso de Google Analytics**: Medir la interacción con el sitio web
   - Click **"Crear"**

3. Acepta los términos de servicio

### Paso 3: Configurar flujo de datos

1. Selecciona **"Web"**
2. Configura:
   - **URL del sitio web**: `https://www.ccodecurso.com`
   - **Nombre del flujo**: "Sitio Web Principal"
   - Click **"Crear flujo"**

3. **¡IMPORTANTE!** Verás tu **ID de medición** con formato: `G-XXXXXXXXXX`
   - **CÓPIALO** - lo necesitarás para el siguiente paso

### Paso 4: Instalar el código en tu sitio

Una vez tengas tu `G-XXXXXXXXXX`, agrega este código en **TODAS** tus páginas HTML (`index.html`, `blog.html`, `post-template.html`, `admin.html`):

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
<!-- End Google Analytics -->
```

**Ubicación**: Justo antes de la etiqueta `</head>` en cada página HTML.

**Reemplaza** `G-XXXXXXXXXX` con tu ID real.

### Paso 5: Verificar instalación

1. Ve a tu sitio web: https://www.ccodecurso.com
2. En Google Analytics, ve a **"Informes" → "Tiempo real"**
3. Deberías ver tu visita activa en 1-2 minutos
4. Si no aparece, verifica:
   - Que el código esté antes de `</head>`
   - Que el ID sea correcto
   - Que no haya bloqueadores de ads activos

---

## 🔍 Parte 2: Google Search Console

### Paso 1: Agregar propiedad

1. Ve a: https://search.google.com/search-console/
2. Click en **"Agregar propiedad"**
3. Selecciona **"Prefijo de URL"**
4. Introduce: `https://www.ccodecurso.com`
5. Click **"Continuar"**

### Paso 2: Verificar propiedad (Método 1 - Etiqueta HTML)

Google te mostrará varios métodos. El más simple es **"Etiqueta HTML"**:

1. Google te dará un código como:
```html
<meta name="google-site-verification" content="ABC123DEF456..." />
```

2. Copia ese código completo

3. Agrégalo en el `<head>` de tu `index.html`, justo después de las otras meta tags

4. Sube los cambios a GitHub

5. Espera 1-2 minutos

6. En Search Console, click **"Verificar"**

### Paso 3: Enviar sitemap

Una vez verificado:

1. En el menú izquierdo, click **"Sitemaps"**
2. En "Añadir un nuevo sitemap", introduce: `sitemap.xml`
3. Click **"Enviar"**

Tu sitemap debería aparecer como "Correcto" en 1-2 días.

### Paso 4: Solicitar indexación (IMPORTANTE)

Para acelerar la indexación de Google:

1. En Search Console, ve a **"Inspección de URLs"**
2. Introduce cada URL importante:
   - `https://www.ccodecurso.com/`
   - `https://www.ccodecurso.com/blog.html`
   - Cada post del blog individualmente
3. Click **"Solicitar indexación"**

Repite para todas las páginas importantes. Google las indexará en 1-7 días.

---

## 📈 Parte 3: Eventos personalizados (Avanzado)

### Rastrear clicks en botones CTA

Agrega este código a tu `script.js` para rastrear conversiones:

```javascript
// Rastrear clicks en botón "Acceso Inmediato"
document.querySelectorAll('.cta-button').forEach(button => {
  button.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click_cta', {
        'event_category': 'Engagement',
        'event_label': button.textContent,
        'value': 1
      });
    }
  });
});

// Rastrear scroll al 50%
let scrollTracked = false;
window.addEventListener('scroll', () => {
  const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  if (scrollPercent > 50 && !scrollTracked && typeof gtag !== 'undefined') {
    gtag('event', 'scroll_50_percent', {
      'event_category': 'Engagement',
      'event_label': 'User scrolled 50%'
    });
    scrollTracked = true;
  }
});
```

---

## ✅ Checklist Final

Después de seguir esta guía, verifica:

- [ ] Google Analytics instalado en todas las páginas HTML
- [ ] Visitas apareciendo en "Tiempo real" de GA4
- [ ] Google Search Console verificado
- [ ] Sitemap.xml enviado en Search Console
- [ ] URLs principales solicitadas para indexación
- [ ] Eventos personalizados funcionando (opcional)

---

## 🎯 Próximos pasos

1. **Espera 2-3 días** para que Google indexe tu sitio
2. **Monitorea en Search Console**:
   - Páginas indexadas vs páginas descubiertas
   - Errores de rastreo
   - Rendimiento de búsqueda (clicks, impresiones)
3. **En Google Analytics**:
   - Visitas diarias
   - Páginas más visitadas
   - Tiempo de permanencia
   - Tasa de rebote

---

## 📞 Soporte

Si tienes problemas:
- Documentación GA4: https://support.google.com/analytics/
- Search Console: https://support.google.com/webmasters/
- Comunidad: https://support.google.com/analytics/community

---

**Nota**: Una vez tengas tu ID de Google Analytics (`G-XXXXXXXXXX`), avísame y te ayudo a agregarlo automáticamente a todas las páginas.
