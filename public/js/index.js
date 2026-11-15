"use strict";

let currentUser = null;
let categories = [];

async function checkUser() {
    try {
        const res = await fetch('/api/me');
        if (!res.ok) return;
        const data = await res.json();
        const userBar = document.getElementById('userBar');
        if (!userBar) return;

        if (data.loggedIn) {
            currentUser = data.user;
            const userRoleBadge = data.user.role === 'admin' ? '<span class="badge-admin">[admin]</span>' : '';
            userBar.innerHTML = `
                <span>Witaj, <strong>${escapeHtml(data.user.username)}</strong>${userRoleBadge}</span>
                <button id="logoutBtn" class="btn btn-danger">Wyloguj</button>
            `;
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.addEventListener('click', logout);
        } else {
            userBar.innerHTML = `
                <a href="/login.html" class="btn btn-outline">Zaloguj</a>
                <a href="/register.html" class="btn btn-fill">Zarejestruj</a>
            `;
        }
    } catch (err) {
        console.error("Błąd sprawdzania użytkownika:", err);
        currentUser = null;
        const userBar = document.getElementById('userBar');
        if (userBar) {
            userBar.innerHTML = `
                <a href="/login.html" class="btn btn-outline">Zaloguj</a>
                <a href="/register.html" class="btn btn-fill">Zarejestruj</a>
            `;
        }
    }
}

async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        categories = await res.json();
        const select = document.getElementById('category');

        if (!Array.isArray(categories) || categories.length === 0) {
            if (select) select.innerHTML = '<option value="" disabled selected>Brak kategorii - skontaktuj się z adminem</option>';
            return;
        }

        if (select) {
            select.innerHTML = '<option value="" disabled selected>Wybierz kategorię...</option>' +
                categories.map(c => `<option value="${c._id}">${c.icon ? c.icon + ' ' : ''}${escapeHtml(c.name)}</option>`).join('');
        }
    } catch (err) {
        console.error("Błąd ładowania kategorii:", err);
    }
}

async function loadThreads() {
    try {
        const container = document.getElementById('threadsContainer');
        if (!container) return;

        if (!currentUser) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>[!] Dostęp ograniczony. Musisz się zalogować, aby przeglądać bufor dyskusji.</p>
                    <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
                        <a href="/login.html" class="btn btn-outline" style="display: inline-block;">Zaloguj</a>
                        <a href="/register.html" class="btn btn-fill" style="display: inline-block;">Zarejestruj</a>
                    </div>
                </div>
            `;
            return;
        }

        const res = await fetch('/api/threads');
        
        if (res.status === 401) {
            container.innerHTML = '<p class="empty-state">Sesja wygasła. Zaloguj się ponownie.</p>';
            return;
        }

        const threads = await res.json();

        if (threads.length === 0) {
            container.innerHTML = '<p class="empty-state">Brak wątków na forum. Bądź pierwszy i załóż nowy wątek!</p>';
            return;
        }

        container.innerHTML = threads.map(t => {
            const authorName = t.author?.username || 'Nieznany';
            const authorId = t.author?._id || t.author;
            const authorRole = t.author?.role === 'admin' ? '<span class="badge-admin">[admin]</span>' : '';
            const categoryName = t.category?.name || 'Bez kategorii';
            const date = new Date(t.createdAt);

            const isAuthor = currentUser && (authorId === currentUser._id || authorId === currentUser.id);
            const isAdmin = currentUser && currentUser.role === 'admin';
            const canDelete = isAuthor || isAdmin;

            const deleteBtnHtml = canDelete 
                ? `<button class="btn btn-danger delete-thread-btn" data-id="${t._id}" style="padding: 2px 8px; font-size: 12px; margin-left: 10px;" title="Usuń wątek"><i class="fas fa-trash"></i> Usuń</button>` 
                : '';

            return `
                <div class="thread-row" data-id="${t._id}">
                    <div style="flex-grow: 1;">
                        <div>
                            <span class="badge">${escapeHtml(categoryName)}</span>
                            <a href="/thread.html?id=${t._id}" class="thread-title">${escapeHtml(t.title)}</a>
                        </div>
                        <div class="meta">Autor: <strong>${escapeHtml(authorName)}</strong>${authorRole} &middot; ${date.toLocaleDateString('pl-PL')} ${date.toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'})} &middot; 💬 ${t.replyCount ?? 0}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${deleteBtnHtml}
                        <div style="color: var(--accent); font-weight: bold;"><i class="fas fa-arrow-right"></i></div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Błąd ładowania wątków:", err);
        const container = document.getElementById('threadsContainer');
        if (container) container.innerHTML = '<p class="empty-state">Błąd podczas ładowania wątków z serwera.</p>';
    }
}

async function handleThreadsContainerClick(e) {
    const deleteBtn = e.target.closest('.delete-thread-btn');
    if (deleteBtn) {
        e.stopPropagation();
        const threadId = deleteBtn.dataset.id;
        
        if (confirm('[?] Czy na pewno chcesz trwale usunąć ten wątek?')) {
            try {
                const res = await fetch(`/api/threads/${threadId}`, { method: 'DELETE' });
                const data = await res.json();
                if (res.ok) {
                    loadThreads();
                } else {
                    alert(data.message || 'Nie udało się usunąć wątku.');
                }
            } catch (err) {
                console.error('Błąd sieci:', err);
                alert('Wystąpił błąd podczas usuwania wątku.');
            }
        }
        return;
    }

    if (e.target.closest('a')) return;
    const row = e.target.closest('.thread-row');
    if (row) window.location.href = `/thread.html?id=${row.dataset.id}`;
}

function openModal() {
    if (!currentUser) {
        alert('Musisz być zalogowany, aby stworzyć wątek!');
        window.location.href = '/login.html';
        return;
    }
    if (categories.length === 0) {
        alert('Brak kategorii na forum - skontaktuj się z administratorem.');
        return;
    }
    const modal = document.getElementById('threadModal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('threadModal');
    if (modal) modal.style.display = 'none';
}

async function handleCreateThread(e) {
    e.preventDefault();
    const titleInput = document.getElementById('title');
    const categorySelect = document.getElementById('category');
    const contentTextarea = document.getElementById('content');

    const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: titleInput ? titleInput.value : '',
            category: categorySelect ? categorySelect.value : '',
            content: contentTextarea ? contentTextarea.value : ''
        })
    });

    const data = await res.json();

    if (res.ok) {
        closeModal();
        const form = document.getElementById('createThreadForm');
        if (form) form.reset();
        loadThreads();
    } else {
        alert(data.message || 'Błąd podczas dodawania wątku!');
    }
}

async function logout() {
    await fetch('/api/logout');
    window.location.reload();
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

function setupStaticListeners() {
    const newThreadBtn = document.getElementById('newThreadBtn');
    if (newThreadBtn) newThreadBtn.addEventListener('click', openModal);

    const cancelModalBtn = document.getElementById('cancelModalBtn');
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    const createThreadForm = document.getElementById('createThreadForm');
    if (createThreadForm) createThreadForm.addEventListener('submit', handleCreateThread);

    const threadsContainer = document.getElementById('threadsContainer');
    if (threadsContainer) threadsContainer.addEventListener('click', handleThreadsContainerClick);
}

// Inicjalizacja z zabezpieczeniem przed zatrzymaniem
(async function init() {
    try {
        setupStaticListeners();
        await checkUser();
        await loadCategories();
        await loadThreads();
    } catch (err) {
        console.error("Krytyczny błąd inicjalizacji:", err);
    }
})();
