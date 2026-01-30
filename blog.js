// Blog.js - Load and display blog posts from GitHub

// Store all posts for filtering
let allPosts = [];
let currentCategory = 'all';

// Load and display posts
async function loadPosts() {
    const postsContainer = document.getElementById('blogPosts');
    const noPostsMessage = document.getElementById('noPosts');

    try {
        // Load posts from GitHub
        allPosts = await loadPostsFromGitHub();

        if (allPosts.length === 0) {
            postsContainer.style.display = 'none';
            noPostsMessage.style.display = 'block';
            return;
        }

        // Sort posts by date (newest first)
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Render posts with current filter
        renderPosts(currentCategory);

    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.style.display = 'none';
        noPostsMessage.style.display = 'block';
        noPostsMessage.innerHTML = `
            <div class="no-posts-icon">⚠️</div>
            <h3>Error al cargar los posts</h3>
            <p>No se pudieron cargar los posts desde GitHub. Por favor, inténtalo más tarde.</p>
        `;
    }
}

// Render posts based on category filter
function renderPosts(category) {
    const postsContainer = document.getElementById('blogPosts');
    const noPostsMessage = document.getElementById('noPosts');

    // Filter posts by category
    const filteredPosts = category === 'all'
        ? allPosts
        : allPosts.filter(post => post.category === category);

    if (filteredPosts.length === 0) {
        postsContainer.style.display = 'none';
        noPostsMessage.style.display = 'block';
        noPostsMessage.innerHTML = `
            <div class="no-posts-icon">📝</div>
            <h3>No hay artículos en esta categoría</h3>
            <p>Próximamente nuevos artículos. Únete a la lista de espera para ser notificado.</p>
            <a href="index.html#formulario" class="btn-primary">Unirme a la lista</a>
        `;
        return;
    }

    postsContainer.style.display = 'grid';
    noPostsMessage.style.display = 'none';

    postsContainer.innerHTML = filteredPosts.map(post => `
        <a href="post.html?slug=${post.slug}" class="blog-post-card" data-category="${post.category || 'all'}">
            ${post.image ? `
                <img src="${post.image}" alt="${post.title}" class="blog-post-image">
            ` : `
                <div class="blog-post-image"></div>
            `}
            <div class="blog-post-content">
                <div class="blog-post-meta">
                    <span>${formatDate(post.date)}</span>
                    ${post.readingTime ? `<span>${post.readingTime}</span>` : ''}
                </div>
                <h3 class="blog-post-title">${post.title}</h3>
                <p class="blog-post-excerpt">${post.excerpt}</p>
                <span class="blog-post-read-more">
                    Leer más →
                </span>
            </div>
        </a>
    `).join('');
}

// Initialize filter tags
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-tag');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update current category and render
            currentCategory = button.dataset.category;
            renderPosts(currentCategory);
        });
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Mobile nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Initialize filters and load posts
    initializeFilters();
    loadPosts();
});
