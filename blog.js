// Blog.js - Load and display blog posts

// Get posts from localStorage
function getPosts() {
    const posts = localStorage.getItem('blogPosts');
    return posts ? JSON.parse(posts) : [];
}

// Load and display posts
function loadPosts() {
    const posts = getPosts();
    const postsContainer = document.getElementById('blogPosts');
    const noPostsMessage = document.getElementById('noPosts');

    if (posts.length === 0) {
        postsContainer.style.display = 'none';
        noPostsMessage.style.display = 'block';
        return;
    }

    postsContainer.style.display = 'grid';
    noPostsMessage.style.display = 'none';

    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    postsContainer.innerHTML = posts.map(post => `
        <a href="post-template.html?slug=${post.slug}" class="blog-post-card">
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

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
});
