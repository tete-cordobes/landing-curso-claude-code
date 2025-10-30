// GitHub API Helper for Blog Posts Management
// This file handles all GitHub API operations for creating/updating/deleting posts

const GITHUB_CONFIG = {
    owner: 'tete-cordobes',
    repo: 'landing-curso-claude-code',
    branch: 'main',
    postsDir: 'posts'
};

// Get GitHub token from localStorage
function getGitHubToken() {
    const token = localStorage.getItem('githubToken');
    if (!token) {
        throw new Error('No se ha configurado el token de GitHub. Ve a Configuración para añadirlo.');
    }
    return token;
}

// Set GitHub token
function setGitHubToken(token) {
    localStorage.setItem('githubToken', token);
}

// Get file SHA (needed for updates/deletes)
async function getFileSHA(path) {
    const token = getGitHubToken();
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.sha;
        }
        return null;
    } catch (error) {
        console.error('Error getting file SHA:', error);
        return null;
    }
}

// Create or update file in GitHub
async function createOrUpdateFile(path, content, message) {
    const token = getGitHubToken();
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`;

    // Get existing file SHA if it exists
    const sha = await getFileSHA(path);

    const body = {
        message: message,
        content: btoa(unescape(encodeURIComponent(content))), // Base64 encode with UTF-8 support
        branch: GITHUB_CONFIG.branch
    };

    if (sha) {
        body.sha = sha; // Include SHA for updates
    }

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al guardar en GitHub');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating/updating file:', error);
        throw error;
    }
}

// Delete file from GitHub
async function deleteFile(path, message) {
    const token = getGitHubToken();
    const sha = await getFileSHA(path);

    if (!sha) {
        throw new Error('No se pudo encontrar el archivo para eliminar');
    }

    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                sha: sha,
                branch: GITHUB_CONFIG.branch
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar de GitHub');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

// Get file content from GitHub
async function getFileContent(path) {
    const url = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${path}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo');
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting file content:', error);
        throw error;
    }
}

// ===== BLOG POSTS OPERATIONS =====

// Load all posts from GitHub
async function loadPostsFromGitHub() {
    try {
        const index = await getFileContent(`${GITHUB_CONFIG.postsDir}/index.json`);
        console.log(`Loaded ${index.posts.length} posts from GitHub`);
        return index.posts;
    } catch (error) {
        console.error('Error loading posts from GitHub:', error);
        return [];
    }
}

// Load single post content
async function loadPostContent(slug) {
    try {
        return await getFileContent(`${GITHUB_CONFIG.postsDir}/${slug}.json`);
    } catch (error) {
        console.error(`Error loading post ${slug}:`, error);
        throw error;
    }
}

// Save post to GitHub
async function savePostToGitHub(post) {
    try {
        // Save individual post file
        const postPath = `${GITHUB_CONFIG.postsDir}/${post.slug}.json`;
        const postContent = JSON.stringify(post, null, 2);

        await createOrUpdateFile(
            postPath,
            postContent,
            `Update post: ${post.title}`
        );

        // Update index
        await updatePostsIndex();

        console.log(`Post saved to GitHub: ${post.slug}`);
        return true;
    } catch (error) {
        console.error('Error saving post to GitHub:', error);
        throw error;
    }
}

// Delete post from GitHub
async function deletePostFromGitHub(slug) {
    try {
        // Delete post file
        const postPath = `${GITHUB_CONFIG.postsDir}/${slug}.json`;

        await deleteFile(postPath, `Delete post: ${slug}`);

        // Update index
        await updatePostsIndex();

        console.log(`Post deleted from GitHub: ${slug}`);
        return true;
    } catch (error) {
        console.error('Error deleting post from GitHub:', error);
        throw error;
    }
}

// Update posts index.json
async function updatePostsIndex() {
    try {
        // Get all posts
        const posts = await loadPostsFromGitHub();

        // Create new index
        const index = {
            posts: posts.map(post => ({
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt,
                image: post.image || '',
                readingTime: post.readingTime || '',
                date: post.date
            })),
            lastUpdated: new Date().toISOString()
        };

        // Save index
        const indexPath = `${GITHUB_CONFIG.postsDir}/index.json`;
        const indexContent = JSON.stringify(index, null, 2);

        await createOrUpdateFile(
            indexPath,
            indexContent,
            'Update posts index'
        );

        console.log('Posts index updated');
        return true;
    } catch (error) {
        console.error('Error updating posts index:', error);
        // Don't throw error here, index update is not critical
        return false;
    }
}

// Validate GitHub token
async function validateGitHubToken(token) {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const user = await response.json();
            return { valid: true, user: user.login };
        }
        return { valid: false, error: 'Token inválido' };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

// ===== SITEMAP OPERATIONS =====

// Generate sitemap.xml content from posts
function generateSitemapXML(posts) {
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>https://www.claudecodecurso.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.claudecodecurso.com/blog.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    // Add blog posts
    if (posts && posts.length > 0) {
        xml += '\n  <!-- Blog Posts -->';

        posts.forEach(post => {
            const postDate = new Date(post.date).toISOString().split('T')[0];
            xml += `
  <url>
    <loc>https://www.claudecodecurso.com/post-template.html?slug=${post.slug}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
    }

    xml += `
  <!-- Additional posts will be automatically added when published via admin dashboard -->
</urlset>`;

    return xml;
}

// Update sitemap.xml in GitHub
async function updateSitemap() {
    try {
        console.log('Updating sitemap.xml...');

        // Load all posts
        const posts = await loadPostsFromGitHub();

        // Generate sitemap XML
        const sitemapContent = generateSitemapXML(posts);

        // Save to GitHub
        await createOrUpdateFile(
            'sitemap.xml',
            sitemapContent,
            'Update sitemap with blog posts'
        );

        console.log('Sitemap updated successfully');
        return { success: true, postsCount: posts.length };
    } catch (error) {
        console.error('Error updating sitemap:', error);
        return { success: false, error: error.message };
    }
}
