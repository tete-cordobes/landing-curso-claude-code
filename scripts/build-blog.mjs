#!/usr/bin/env node
/**
 * Genera el blog estatico a partir de posts/*.json.
 *
 * Por que existe: post.html?slug=X servia un shell de 6 KB con el mismo <title>
 * para los 26 articulos, sin H1, sin description, con el canonical vacio y el
 * JSON-LD vacio. Todo lo rellenaba JavaScript despues de un fetch. GitHub Pages
 * ignora el query string, asi que la unica forma de servir HTML real por
 * articulo es un fichero por articulo.
 *
 * Es el UNICO escritor de blog/, sitemap.xml y posts/index.json.
 * posts/<slug>.json es la fuente y no se toca nunca.
 *
 * Uso:  node scripts/build-blog.mjs [--check]
 *       --check  no escribe nada, solo dice si algo cambiaria (para CI/PR)
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { postPage, blogIndexPage, SITE } from './templates.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = join(ROOT, 'posts');
const BLOG_DIR = join(ROOT, 'blog');
const CHECK_ONLY = process.argv.includes('--check');

// Paginas estaticas que tambien entran en el sitemap. changelog y las dos de
// frameworks estaban fuera pese a ser el contenido HTML mas sustancial del sitio.
const STATIC_PAGES = [
  { loc: '/',                                  priority: '1.0', changefreq: 'weekly'  },
  { loc: '/blog/',                             priority: '0.9', changefreq: 'daily'   },
  { loc: '/changelog.html',                    priority: '0.8', changefreq: 'daily'   },
  { loc: '/frameworks-agenticos.html',         priority: '0.8', changefreq: 'monthly' },
  { loc: '/frameworks-construir-agentes.html', priority: '0.8', changefreq: 'monthly' },
  { loc: '/privacidad.html',                   priority: '0.2', changefreq: 'yearly'  },
  { loc: '/terminos.html',                     priority: '0.2', changefreq: 'yearly'  },
];

let changed = 0;

/** Escribe solo si el contenido difiere: sin esto, CI commitea ruido en cada ejecucion. */
function writeIfChanged(path, content) {
  if (existsSync(path) && readFileSync(path, 'utf8') === content) return false;
  if (!CHECK_ONLY) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, 'utf8');
  }
  changed++;
  console.log(`  ${CHECK_ONLY ? 'cambiaria' : 'escrito'}: ${path.replace(ROOT + '/', '')}`);
  return true;
}

/** Fecha del ultimo commit que toco el fichero. Requiere fetch-depth: 0 en CI. */
function gitLastModified(file, fallback) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file],
      { cwd: ROOT, encoding: 'utf8' }).trim();
    return out || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Reescribe los enlaces internos al esquema nuevo.
 * Son 183 repartidos por el contenido de los posts: hacerlo aqui y no en los
 * JSON mantiene una sola fuente de verdad y permite cambiar de esquema de URL
 * sin tocar el contenido.
 */
function rewriteInternalLinks(html) {
  return html
    .replace(/(?:\.?\/)?post(?:-template)?\.html\?slug=([a-z0-9-]+)/g, '/blog/$1/')
    .replace(/href="\/?blog\.html"/g, 'href="/blog/"');
}

/** Carga diferida en todas las imagenes del contenido: no habia ni una en el repo. */
function lazyImages(html) {
  return html.replace(/<img\b(?![^>]*\bloading=)/g, '<img loading="lazy" decoding="async"');
}

const stripTags = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------- carga

const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');

const posts = files.map(f => {
  const path = join(POSTS_DIR, f);
  const post = JSON.parse(readFileSync(path, 'utf8'));
  post.__file = `posts/${f}`;
  post.__slug = post.slug || f.replace(/\.json$/, '');
  return post;
}).filter(p => {
  if (p.draft) { console.log(`  omitido (draft): ${p.__slug}`); return false; }
  if (!p.title || !p.content) { console.warn(`  AVISO: ${p.__slug} sin title o content, se omite`); return false; }
  return true;
}).sort((a, b) => new Date(b.date) - new Date(a.date));

console.log(`\nposts: ${posts.length}\n`);

// ------------------------------------------------------- paginas de post

const seen = new Set();
for (const post of posts) {
  const slug = post.__slug;
  if (seen.has(slug)) throw new Error(`slug duplicado: ${slug}`);
  seen.add(slug);

  const url = `${SITE}/blog/${slug}/`;
  const content = lazyImages(rewriteInternalLinks(post.content));

  // Relacionados: misma categoria primero, y si no llega, los mas recientes.
  const related = [
    ...posts.filter(p => p.__slug !== slug && p.category === post.category),
    ...posts.filter(p => p.__slug !== slug && p.category !== post.category),
  ].slice(0, 3).map(p => ({ slug: p.__slug, title: p.title }));

  const html = postPage({
    post: { ...post, slug, content },
    url,
    dateModified: gitLastModified(post.__file, post.date),
    wordCount: stripTags(content).split(' ').filter(Boolean).length,
    related,
  });

  writeIfChanged(join(BLOG_DIR, slug, 'index.html'), html);
}

// Limpia articulos que ya no existen en posts/
if (existsSync(BLOG_DIR)) {
  for (const dir of readdirSync(BLOG_DIR, { withFileTypes: true })) {
    if (dir.isDirectory() && !seen.has(dir.name)) {
      console.log(`  ${CHECK_ONLY ? 'borraria' : 'borrado'}: blog/${dir.name}/`);
      if (!CHECK_ONLY) rmSync(join(BLOG_DIR, dir.name), { recursive: true, force: true });
      changed++;
    }
  }
}

// ------------------------------------------------------- listado del blog

writeIfChanged(join(BLOG_DIR, 'index.html'), blogIndexPage({
  posts: posts.map(p => ({ ...p, slug: p.__slug })),
  url: `${SITE}/blog/`,
}));

// ------------------------------------------------------- posts/index.json
// Se regenera desde los ficheros reales. La version anterior leia index.json
// para reconstruir index.json (un post nuevo nunca entraba) y su .map()
// descartaba category, rompiendo en silencio los filtros del listado.

writeIfChanged(join(POSTS_DIR, 'index.json'), JSON.stringify({
  posts: posts.map(p => ({
    slug: p.__slug,
    title: p.title,
    excerpt: p.excerpt || '',
    image: p.image || '',
    readingTime: p.readingTime || '',
    date: p.date,
    category: p.category || '',
  })),
  categories: [...new Set(posts.map(p => p.category).filter(Boolean))].sort(),
}, null, 2) + '\n');

// ------------------------------------------------------------- sitemap
// lastmod siempre de git, nunca new Date(): un sitemap donde todo cambia cada
// dia deja de ser una senal util y Google lo descuenta.

const urls = [
  ...STATIC_PAGES.map(p => ({
    loc: SITE + p.loc,
    lastmod: gitLastModified(p.loc === '/' ? 'index.html' : p.loc.slice(1), null),
    changefreq: p.changefreq,
    priority: p.priority,
  })),
  ...posts.map(p => ({
    loc: `${SITE}/blog/${p.__slug}/`,
    lastmod: gitLastModified(p.__file, p.date),
    changefreq: 'monthly',
    priority: '0.7',
  })),
];

writeIfChanged(join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `
    <lastmod>${String(u.lastmod).slice(0, 10)}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`);

console.log(`\n${changed === 0 ? 'sin cambios' : `${changed} fichero(s) ${CHECK_ONLY ? 'cambiarian' : 'actualizados'}`}`);
console.log(`sitemap: ${urls.length} URLs\n`);

if (CHECK_ONLY && changed > 0) process.exit(1);
