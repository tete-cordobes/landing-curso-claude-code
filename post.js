// Post.js - Display individual post

// Get post by slug from URL
function getPostBySlug() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        window.location.href = 'blog.html';
        return null;
    }

    const posts = localStorage.getItem('blogPosts');
    if (!posts) {
        window.location.href = 'blog.html';
        return null;
    }

    const allPosts = JSON.parse(posts);
    const post = allPosts.find(p => p.slug === slug);

    if (!post) {
        window.location.href = 'blog.html';
        return null;
    }

    return post;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Load post content
function loadPost() {
    const post = getPostBySlug();
    if (!post) return;

    // Update page title and meta
    document.getElementById('postTitle').textContent = `${post.title} | Curso Claude Code`;
    document.getElementById('postDescription').setAttribute('content', post.excerpt);
    document.getElementById('postCanonical').setAttribute('href', window.location.href);

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
