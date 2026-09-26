
"use strict";

let currentUser = null;
let categories = [];

async function checkUser() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        const data = await res.json();
        const userBar = document.getElementById('userBar');

        if (data.loggedIn) {
            currentUser = data.user;
            userBar.innerHTML = `
                <span>Witaj, <strong>${escapeHtml(data.user.username)}</strong> ${data.user.role === 'admin' ? '<span style="color: var(--accent);">(Admin)</span>' : ''}</span>
                <button id="logoutBtn" class="btn btn-danger">Wyloguj</button>
            `;
            document.getElementById('logoutBtn').addEventListener('click', logout);
        } else {
            userBar.innerHTML = `
                <a href="/login.html" class="btn btn-outline">Zaloguj</a>
                <a href="/register.html" class="btn btn-fill">Zarejestruj</a>
            `;
        }
    } catch (err) {
        console.error("Błąd sprawdzania użytkownika:", err);
    }
}

async function loadCategories() {
    try {
        // Dodałem credentials: 'include' oraz logowanie surowej odpowiedzi
        const res = await fetch('/api/categories', { credentials: 'include' });
        const text = await res.text();
        console.log("Surowa odpowiedź z API kategorii:", text);
        
        categories = JSON.parse(text);
        const select = document.getElementById('category');

        if (!Array.isArray(categories) || categories.length === 0) {
            console.warn("API zwróciło pustą listę kategorii.");
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
        // Dodałem credentials: 'include'
        const res = await fetch('/api/threads', { credentials: 'include' });
        const threads = await res.json();
        const container = document.getElementById('threadsContainer');

        if (threads.length === 0) {
            container.innerHTML = '<p class="empty-state">Brak wątków na forum. Bądź pierwszy i załóż nowy wątek!</p>';
            return;
        }

        container.innerHTML = threads.map(t => {
            const authorName = t.author?.username || 'Nieznany';
            const categoryName = t.category?.name || 'Bez kategorii';
            const date = new Date(t.createdAt);

            return `
                <div class="thread-row" data-id="${t._id}">
                    <div>
                        <div>
                            <span class="badge">${escapeHtml(categoryName)}</span>
                            <a href="/thread.html?id=${t._id}" class="thread-title">${escapeHtml(t.title)}</a>
                        </div>
                        <div class="meta">Autor: <strong>${escapeHtml(authorName)}</strong> &middot; ${date.toLocaleDateString('pl-PL')} ${date.toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'})} &middot; 💬 ${t.replyCount ?? 0}</div>
                    </div>
                    <div style="color: var(--accent); font-weight: bold;"><i class="fas fa-arrow-right"></i></div>
                </div>
            `;
        }).join('');

        attachThreadRowEvents(container);
    } catch (err) {
        console.error("Błąd ładowania wątków:", err);
    }
}

function attachThreadRowEvents(container) {
    container.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const row = e.target.closest('.thread-row');
        if (row) window.location.href = `/thread.html?id=${row.dataset.id}`;
    });
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
    document.getElementById('threadModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('threadModal').style.display = 'none';
}

async function handleCreateThread(e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const content = document.getElementById('content').value;

    const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, content }),
        credentials: 'include' // Dla bezpieczeństwa sesji
    });

    const data = await res.json();

    if (res.ok) {
        closeModal();
        document.getElementById('createThreadForm').reset();
        loadThreads();
    } else {
        alert(data.message || 'Błąd podczas dodawania wątku!');
    }
}

async function logout() {
    await fetch('/api/logout', { credentials: 'include' });
    window.location.reload();
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

function setupStaticListeners() {
    document.getElementById('newThreadBtn').addEventListener('click', openModal);
    document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
    document.getElementById('createThreadForm').addEventListener('submit', handleCreateThread);
}

(async function init() {
    setupStaticListeners();
    await checkUser();
    await loadCategories();
    await loadThreads();
})();
