// Plantillas del blog estatico.
//
// Viven en un .mjs y no en ficheros .html a proposito: con .nojekyll activo,
// cualquier scripts/*.html se serviria tal cual en produccion como pagina
// suelta. Como template literal dentro de un modulo, no se publica nada.

export const SITE = 'https://www.ccodecurso.com';
export const GA4 = 'G-48N09S40ZB';
export const CLARITY = 'uk1m98vjak';

export const CATEGORIES = {
  'claude-code': 'Claude Code',
  'apis': 'APIs de IA',
  'openclaw': 'OpenClaw',
  'video-imagen': 'Video e Imagen',
  'herramientas': 'Herramientas',
};

/** Escapa texto para atributos HTML. */
export const attr = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
           .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Serializa JSON-LD de forma segura dentro de <script>.
 * Sin escapar "<", un "</script>" que venga en el contenido cerraria el bloque
 * antes de tiempo y volcaria el resto del JSON como HTML.
 */
export const jsonld = (obj) =>
  JSON.stringify(obj, null, 2).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

const analytics = () => `    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA4}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA4}');
    </script>
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY}");
    </script>`;

const icons = () => `    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" href="/logo-64.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#3b82f6">`;

const navbar = (active = '') => `    <nav class="navbar">
        <div class="container">
            <div class="nav-content">
                <div class="logo">
                    <a href="/">
                        <div class="logo-icon">
                            <img src="/logo-64.png" alt="Curso Claude Code" width="32" height="32" loading="eager">
                        </div>
                        <span class="logo-text">Curso Claude Code</span>
                    </a>
                </div>
                <button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false">
                    <span></span><span></span><span></span>
                </button>
                <div class="nav-links">
                    <a href="/">Inicio</a>
                    <a href="/blog/"${active === 'blog' ? ' class="active"' : ''}>Blog</a>
                    <a href="/frameworks-agenticos.html">Frameworks Claude Code</a>
                    <a href="/frameworks-construir-agentes.html">Agentes IA</a>
                    <a href="/changelog.html">Changelog</a>
                    <a href="/#formulario" class="btn-nav nav-cta">Descargar Guía Gratis</a>
                </div>
            </div>
        </div>
    </nav>`;

const footer = () => `    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <div class="footer-logo">
                        <div class="logo-icon">
                            <img src="/logo-64.png" alt="Curso Claude Code" width="32" height="32" loading="lazy">
                        </div>
                        <span class="logo-text">Curso Claude Code</span>
                    </div>
                    <p class="footer-description">
                        Formación de Claude Code en español para desarrolladores que ya programan.
                    </p>
                </div>
                <div class="footer-section">
                    <h4 class="footer-title">Enlaces</h4>
                    <ul class="footer-links">
                        <li><a href="/">Inicio</a></li>
                        <li><a href="/blog/">Blog</a></li>
                        <li><a href="/changelog.html">Changelog de Claude Code</a></li>
                        <li><a href="/#formulario">Descargar la guía</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4 class="footer-title">Legal</h4>
                    <ul class="footer-links">
                        <li><a href="/privacidad.html">Política de privacidad</a></li>
                        <li><a href="/terminos.html">Términos y condiciones</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Curso Claude Code. Todos los derechos reservados.</p>
                <p class="footer-note">Claude Code es una marca de Anthropic. Este curso es independiente y no está afiliado oficialmente con Anthropic.</p>
            </div>
        </div>
    </footer>`;

/** Pagina de un articulo, con todo el SEO resuelto en servidor. */
export function postPage({ post, url, dateModified, wordCount, related }) {
  const image = post.image ? `${SITE}/${post.image.replace(/^\//, '')}` : `${SITE}/og-default.png`;
  const category = CATEGORIES[post.category] || 'Claude Code';
  const fecha = new Date(post.date).toLocaleDateString('es-ES',
    { year: 'numeric', month: 'long', day: 'numeric' });

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image,
    author: { '@id': `${SITE}/#organization` },
    publisher: { '@id': `${SITE}/#organization` },
    datePublished: post.date,
    dateModified,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    articleSection: category,
    inLanguage: 'es-ES',
    wordCount,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog/` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE}/#organization`,
    name: 'Curso Claude Code',
    url: `${SITE}/`,
    logo: { '@type': 'ImageObject', url: `${SITE}/logo-512.png`, width: 512, height: 512 },
  };

  const relatedHtml = related.length ? `
            <aside class="post-related">
                <h2>Seguir leyendo</h2>
                <ul>
${related.map(r => `                    <li><a href="/blog/${r.slug}/">${attr(r.title)}</a></li>`).join('\n')}
                </ul>
            </aside>` : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${attr(post.title)} | Curso Claude Code</title>
    <meta name="description" content="${attr(post.excerpt)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">

    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${attr(post.title)}">
    <meta property="og:description" content="${attr(post.excerpt)}">
    <meta property="og:image" content="${image}">
    <meta property="og:locale" content="es_ES">
    <meta property="og:site_name" content="Curso Claude Code">
    <meta property="article:published_time" content="${post.date}">
    <meta property="article:modified_time" content="${dateModified}">
    <meta property="article:section" content="${attr(category)}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${attr(post.title)}">
    <meta name="twitter:description" content="${attr(post.excerpt)}">
    <meta name="twitter:image" content="${image}">

${icons()}

    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/blog-styles.css">
    <link rel="stylesheet" href="/nav-frameworks.css">
    <link rel="stylesheet" href="/article-enhancements.css">

${analytics()}

    <script type="application/ld+json">
${jsonld(orgSchema)}
    </script>
    <script type="application/ld+json">
${jsonld(articleSchema)}
    </script>
    <script type="application/ld+json">
${jsonld(breadcrumbSchema)}
    </script>
</head>
<body>
${navbar('blog')}

    <article class="post-article">
        <div class="container post-container">
            <nav class="breadcrumbs" aria-label="Migas de pan">
                <a href="/">Inicio</a> › <a href="/blog/">Blog</a> › <span>${attr(post.title)}</span>
            </nav>

            <header class="post-header">
                <div class="post-meta">
                    <span class="post-category">${attr(category)}</span>
                    <time class="post-date" datetime="${post.date}">${fecha}</time>
                    ${post.readingTime ? `<span class="post-reading-time">${attr(post.readingTime)}</span>` : ''}
                </div>
                <h1 class="post-title-main">${attr(post.title)}</h1>
                <p class="post-excerpt">${attr(post.excerpt)}</p>
            </header>
${post.image ? `
            <div class="post-image-container">
                <img src="/${post.image.replace(/^\//, '')}" alt="${attr(post.title)}" loading="lazy" decoding="async">
            </div>` : ''}

            <div class="post-content">
${post.content}
            </div>
${relatedHtml}

            <div class="post-footer">
                <div class="post-cta">
                    <h2>¿Quieres aprender Claude Code en serio?</h2>
                    <p>Descarga gratis la guía de los 10 comandos esenciales y entra en la lista de la formación en español.</p>
                    <a href="/#formulario" class="btn-primary">Descargar la guía gratis</a>
                </div>
            </div>
        </div>
    </article>

${footer()}
</body>
</html>
`;
}

/** Listado del blog, ahora con los enlaces en el HTML servido. */
export function blogIndexPage({ posts, url }) {
  // Mismas clases que generaba blog.js: asi el HTML estatico hereda el CSS
  // existente sin tocar blog-styles.css.
  const cards = posts.map(p => `                <a href="/blog/${p.slug}/" class="blog-post-card" data-category="${attr(p.category || 'all')}">
${p.image
    ? `                    <img src="/${p.image.replace(/^\//, '')}" alt="${attr(p.title)}" class="blog-post-image" loading="lazy" decoding="async" width="1200" height="750">`
    : `                    <div class="blog-post-image"></div>`}
                    <div class="blog-post-content">
                        <div class="blog-post-meta">
                            <span>${attr(CATEGORIES[p.category] || 'Claude Code')}</span>
                            <time datetime="${p.date}">${new Date(p.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                            ${p.readingTime ? `<span>${attr(p.readingTime)}</span>` : ''}
                        </div>
                        <h2 class="blog-post-title">${attr(p.title)}</h2>
                        <p class="blog-post-excerpt">${attr(p.excerpt)}</p>
                        <span class="blog-post-read-more">Leer más →</span>
                    </div>
                </a>`).join('\n');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog de Claude Code',
    description: 'Tutoriales y guías de Claude Code en español.',
    url,
    inLanguage: 'es-ES',
    publisher: { '@id': `${SITE}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((p, i) => ({
        '@type': 'ListItem', position: i + 1,
        url: `${SITE}/blog/${p.slug}/`, name: p.title,
      })),
    },
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog de Claude Code: tutoriales y guías en español | Curso Claude Code</title>
    <meta name="description" content="Guías prácticas de Claude Code y de las APIs de IA en español: instalación, comandos, comparativas y casos de uso reales.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">

    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="Blog de Claude Code: tutoriales y guías en español">
    <meta property="og:description" content="Guías prácticas de Claude Code y de las APIs de IA en español.">
    <meta property="og:image" content="${SITE}/og-default.png">
    <meta property="og:locale" content="es_ES">
    <meta property="og:site_name" content="Curso Claude Code">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${SITE}/og-default.png">

${icons()}

    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/blog-styles.css">
    <link rel="stylesheet" href="/nav-frameworks.css">

${analytics()}

    <script type="application/ld+json">
${jsonld(schema)}
    </script>
</head>
<body>
${navbar('blog')}

    <section class="blog-header">
        <div class="container">
            <h1 class="blog-title">Blog de Claude Code</h1>
            <p class="blog-subtitle">Tutoriales, guías prácticas y comparativas para programar con IA en español.</p>
        </div>
    </section>

    <section class="blog-posts-section">
        <div class="container">
            <div class="blog-posts-grid">
${cards}
            </div>
        </div>
    </section>

${footer()}
</body>
</html>
`;
}
