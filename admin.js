// Admin.js - Dashboard functionality

// Check authentication
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const loginTime = sessionStorage.getItem('loginTime');

    // Session expires after 8 hours
    const EIGHT_HOURS = 8 * 60 * 60 * 1000;

    if (!isLoggedIn || !loginTime || (Date.now() - parseInt(loginTime)) > EIGHT_HOURS) {
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

// Logout
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('loginTime');
    window.location.href = 'login.html';
}

// Show tab
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Add active class to button
    event.target.classList.add('active');

    // Reset form if switching to new post tab
    if (tabName === 'new') {
        cancelEdit();
    }

    // Reload posts list if switching to posts tab
    if (tabName === 'posts') {
        loadPostsList();
    }
}

// Get posts from localStorage
function getPosts() {
    const posts = localStorage.getItem('blogPosts');
    return posts ? JSON.parse(posts) : [];
}

// Save posts to localStorage
function savePosts(posts) {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Load posts list
function loadPostsList() {
    const posts = getPosts();
    const container = document.getElementById('postsListContainer');
    const noPostsMessage = document.getElementById('noPostsMessage');

    if (posts.length === 0) {
        container.style.display = 'none';
        noPostsMessage.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    noPostsMessage.style.display = 'none';

    // Sort by date
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = posts.map((post, index) => `
        <div class="post-item">
            <div class="post-item-content">
                <div class="post-item-title">${post.title}</div>
                <div class="post-item-meta">
                    <span>📅 ${formatDate(post.date)}</span>
                    <span>🔗 ${post.slug}</span>
                </div>
            </div>
            <div class="post-item-actions">
                <button class="btn-small btn-edit" onclick="editPost(${index})">✏️ Editar</button>
                <button class="btn-small btn-delete" onclick="deletePost(${index})">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// Edit post
function editPost(index) {
    const posts = getPosts();
    const post = posts[index];

    // Fill form
    document.getElementById('postId').value = index;
    document.getElementById('postTitleInput').value = post.title;
    document.getElementById('postSlug').value = post.slug;
    document.getElementById('postExcerptInput').value = post.excerpt;
    document.getElementById('postImageInput').value = post.image || '';
    document.getElementById('postReadingTimeInput').value = post.readingTime || '';
    document.getElementById('postContentInput').value = post.content;

    // Update form title
    document.getElementById('formTitle').textContent = 'Editar Post';
    document.getElementById('submitBtnText').textContent = 'Actualizar Post';

    // Switch to form tab
    showTab('new');
}

// Cancel edit
function cancelEdit() {
    document.getElementById('postForm').reset();
    document.getElementById('postId').value = '';
    document.getElementById('formTitle').textContent = 'Crear Nuevo Post';
    document.getElementById('submitBtnText').textContent = 'Publicar Post';
}

// Delete post
function deletePost(index) {
    if (!confirm('¿Estás seguro de que quieres eliminar este post?')) {
        return;
    }

    const posts = getPosts();
    posts.splice(index, 1);
    savePosts(posts);
    loadPostsList();
    showToast('Post eliminado correctamente', 'success');
}

// Delete all posts
function deleteAllPosts() {
    if (!confirm('⚠️ ¿Estás SEGURO de que quieres eliminar TODOS los posts? Esta acción no se puede deshacer.')) {
        return;
    }

    if (!confirm('Esta es tu última oportunidad. ¿Eliminar todos los posts?')) {
        return;
    }

    localStorage.removeItem('blogPosts');
    loadPostsList();
    showToast('Todos los posts han sido eliminados', 'success');
}

// Generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Auto-generate slug when title changes
document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('postTitleInput');
    const slugInput = document.getElementById('postSlug');

    if (titleInput && slugInput) {
        titleInput.addEventListener('input', () => {
            // Only auto-generate if slug is empty or matches previous title
            if (!slugInput.dataset.manuallyEdited) {
                slugInput.value = generateSlug(titleInput.value);
            }
        });

        slugInput.addEventListener('input', () => {
            slugInput.dataset.manuallyEdited = 'true';
        });
    }
});

// Submit post form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('postForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const postId = document.getElementById('postId').value;
            const posts = getPosts();

            const postData = {
                title: document.getElementById('postTitleInput').value,
                slug: document.getElementById('postSlug').value,
                excerpt: document.getElementById('postExcerptInput').value,
                image: document.getElementById('postImageInput').value,
                readingTime: document.getElementById('postReadingTimeInput').value,
                content: document.getElementById('postContentInput').value,
                date: postId ? posts[postId].date : new Date().toISOString()
            };

            // Check for duplicate slug
            const duplicateIndex = posts.findIndex((p, i) => p.slug === postData.slug && i !== parseInt(postId || -1));
            if (duplicateIndex !== -1) {
                showToast('Ya existe un post con ese slug. Por favor usa otro.', 'error');
                return;
            }

            if (postId) {
                // Update existing post
                posts[postId] = postData;
                showToast('Post actualizado correctamente', 'success');
            } else {
                // Create new post
                posts.push(postData);
                showToast('Post creado correctamente', 'success');
            }

            savePosts(posts);
            cancelEdit();
            loadPostsList();
            showTab('posts');
        });
    }
});

// Update credentials
document.addEventListener('DOMContentLoaded', () => {
    const credForm = document.getElementById('credentialsForm');
    if (credForm) {
        credForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newUsername = document.getElementById('newUsername').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!newUsername || !newPassword) {
                showToast('Por favor completa todos los campos', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                showToast('Las contraseñas no coinciden', 'error');
                return;
            }

            if (newPassword.length < 6) {
                showToast('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }

            localStorage.setItem('adminUsername', newUsername);
            localStorage.setItem('adminPassword', newPassword);

            showToast('Credenciales actualizadas correctamente. Usa las nuevas credenciales en tu próximo login.', 'success');

            credForm.reset();
        });
    }
});

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    // Show username
    const username = localStorage.getItem('adminUsername') || 'admin';
    document.getElementById('adminUsername').textContent = username;

    // Load posts
    loadPostsList();

    // Create example post if none exist
    const posts = getPosts();
    if (posts.length === 0) {
        const examplePost = {
            title: "Bienvenido al Blog de Claude Code",
            slug: "bienvenido-blog-claude-code",
            excerpt: "Este es tu primer post de ejemplo. Edítalo o elimínalo y comienza a crear tu propio contenido sobre Claude Code.",
            image: "",
            readingTime: "2 min de lectura",
            content: `
                <h2>¡Bienvenido a tu nuevo blog!</h2>
                <p>Este es un post de ejemplo para mostrarte cómo funciona el sistema de blog. Puedes editarlo, eliminarlo o crear nuevos posts desde el dashboard de administración.</p>

                <h3>¿Qué puedes hacer?</h3>
                <ul>
                    <li>Crear nuevos posts con contenido en HTML</li>
                    <li>Editar posts existentes</li>
                    <li>Eliminar posts que ya no necesites</li>
                    <li>Gestionar tu blog de forma sencilla</li>
                </ul>

                <h3>Consejos para empezar</h3>
                <p>Puedes usar HTML en el contenido de tus posts. Aquí tienes algunos ejemplos:</p>
                <ul>
                    <li><strong>&lt;h2&gt; y &lt;h3&gt;</strong> para títulos</li>
                    <li><strong>&lt;p&gt;</strong> para párrafos</li>
                    <li><strong>&lt;ul&gt; y &lt;li&gt;</strong> para listas</li>
                    <li><strong>&lt;strong&gt;</strong> para texto en negrita</li>
                    <li><strong>&lt;code&gt;</strong> para código inline</li>
                </ul>

                <p>¡Ahora es tu turno! Crea contenido increíble sobre Claude Code y comparte tu conocimiento.</p>
            `,
            date: new Date().toISOString()
        };

        savePosts([examplePost]);
        loadPostsList();
    }
});
