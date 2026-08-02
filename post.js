// Post.js - Display individual post with automatic SEO and JSON-LD schema

// Get post by slug from URL
async function getPostBySlug() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        window.location.replace('/404.html');
        return null;
    }

    try {
        const post = await loadPostContent(slug);
        return post;
    } catch (error) {
        // Never redirect on a transient load failure. A crawler that hits this
        // would see the article URL turn into a redirect and could drop it from
        // the index. Show an inline error and keep the URL intact.
        console.error(`Error loading post ${slug}:`, error);
        showLoadError();
        return null;
    }
}

// Inline error state — keeps the URL and the page alive.
function showLoadError() {
    const container = document.getElementById('postContent');
    if (!container) return;
    document.getElementById('postImageContainer')?.style.setProperty('display', 'none');
    container.innerHTML = `
        <p>No hemos podido cargar este artículo en este momento.</p>
        <p><a href="/blog.html">Ver todos los artículos del blog</a></p>`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Generate JSON-LD Schema for BlogPosting
function generatePostSchema(post) {
    const currentUrl = canonicalUrlFor(post);
    const postImage = post.image || 'https://www.ccodecurso.com/og-default.png';

    // Extract text from HTML content for word count
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const wordCount = textContent.trim().split(/\s+/).length;

    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "image": postImage,
        "author": {
            "@type": "Organization",
            "name": "Curso Claude Code",
            "url": "https://www.ccodecurso.com/"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Curso Claude Code",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.ccodecurso.com/logo-512.png"
            }
        },
        "datePublished": post.date,
        "dateModified": post.date,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": currentUrl
        },
        "url": currentUrl,
        "keywords": "claude code, curso claude code, tutorial claude code, " + post.slug.replace(/-/g, ', '),
        "articleSection": "Claude Code",
        "inLanguage": "es-ES",
        "wordCount": wordCount
    };

    return schema;
}

// Generate JSON-LD Schema for Breadcrumbs
function generateBreadcrumbSchema(post) {
    const currentUrl = canonicalUrlFor(post);

    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": "https://www.ccodecurso.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://www.ccodecurso.com/blog.html"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": post.title,
                "item": currentUrl
            }
        ]
    };

    return schema;
}

// Canonical URL for a post: always the pre-rendered page at /blog/<slug>/.
//
// This file is now a compatibility layer. post.html?slug=X is the URL Google
// indexed before the blog was pre-rendered, so it stays alive and keeps
// rendering — but it declares /blog/<slug>/ as the canonical version and lets
// Google consolidate at its own pace.
//
// Deliberately a canonical and not a redirect: the old domain already 301s to
// this one, and chaining a JS redirect after that 301 would stack a second
// migration on top of one that has not settled yet.
//
// Never window.location.href either: that made ?slug=X&utm_source=Y
// canonicalise to itself, so every campaign parameter minted a new "canonical".
function canonicalUrlFor(post) {
    return `https://www.ccodecurso.com/blog/${encodeURIComponent(post.slug)}/`;
}

// Update all SEO meta tags
function updateSEOTags(post) {
    const currentUrl = canonicalUrlFor(post);
    const postImage = post.image || 'https://www.ccodecurso.com/og-default.png';

    // Basic SEO
    document.getElementById('postTitle').textContent = `${post.title} | Curso Claude Code`;
    document.getElementById('postDescription').setAttribute('content', post.excerpt);
    document.getElementById('postKeywords').setAttribute('content', `claude code, curso claude code, ${post.slug.replace(/-/g, ', ')}, tutorial claude code español`);
    document.getElementById('postCanonical').setAttribute('href', currentUrl);

    // Open Graph
    document.getElementById('postOgUrl').setAttribute('content', currentUrl);
    document.getElementById('postOgTitle').setAttribute('content', post.title);
    document.getElementById('postOgDescription').setAttribute('content', post.excerpt);
    document.getElementById('postOgImage').setAttribute('content', postImage);
    document.getElementById('postPublishedTime').setAttribute('content', post.date);

    // Twitter Card
    document.getElementById('postTwitterUrl').setAttribute('content', currentUrl);
    document.getElementById('postTwitterTitle').setAttribute('content', post.title);
    document.getElementById('postTwitterDescription').setAttribute('content', post.excerpt);
    document.getElementById('postTwitterImage').setAttribute('content', postImage);

    // JSON-LD Schema - BlogPosting
    const schema = generatePostSchema(post);
    document.getElementById('postSchema').textContent = JSON.stringify(schema, null, 2);

    // JSON-LD Schema - Breadcrumbs
    const breadcrumbSchema = generateBreadcrumbSchema(post);
    document.getElementById('breadcrumbSchema').textContent = JSON.stringify(breadcrumbSchema, null, 2);
}

// Load post content
async function loadPost() {
    const post = await getPostBySlug();
    if (!post) return;

    // Update all SEO tags automatically
    updateSEOTags(post);

    // Update header
    document.getElementById('postDate').textContent = formatDate(post.date);
    if (post.readingTime) {
        document.getElementById('postReadingTime').textContent = post.readingTime;
    } else {
        document.getElementById('postReadingTime').style.display = 'none';
    }
    document.getElementById('postTitleMain').textContent = post.title;
    document.getElementById('postExcerpt').textContent = post.excerpt;

    // Update image
    if (post.image) {
        document.getElementById('postImage').src = post.image;
        document.getElementById('postImage').alt = post.title;
    } else {
        document.getElementById('postImageContainer').style.display = 'none';
    }

    // Update content
    document.getElementById('postContent').innerHTML = post.content;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPost();
});
