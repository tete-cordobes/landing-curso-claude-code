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

// Get file content from the site's own origin.
// Deliberately NOT raw.githubusercontent.com: a cross-origin fetch to a third party
// adds CORS, rate limiting and latency to the critical rendering path of every post.
// The same JSON is served from this domain by GitHub Pages.
async function getFileContent(path) {
    const url = `/${path}`;

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

        // posts/index.json, blog/ and sitemap.xml are regenerated by the
        // build-blog workflow that this push triggers.

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

        // posts/index.json, blog/ and sitemap.xml are regenerated by the
        // build-blog workflow that this push triggers.

        console.log(`Post deleted from GitHub: ${slug}`);
        return true;
    } catch (error) {
        console.error('Error deleting post from GitHub:', error);
        throw error;
    }
}

// posts/index.json used to be rebuilt here, with two bugs: it read index.json to
// regenerate index.json (so a new post never entered the index) and its .map()
// dropped the `category` field, silently breaking the filters in blog.js.
// scripts/build-blog.mjs now rebuilds it from the actual posts/*.json files.

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

// ===== SITEMAP =====
//
// sitemap.xml is generated by scripts/build-blog.mjs in CI, which is the single
// writer of sitemap.xml, posts/index.json and blog/. Two writers competing for
// the same file is a bug waiting to happen, so there is deliberately no
// browser-side sitemap generator here any more.
