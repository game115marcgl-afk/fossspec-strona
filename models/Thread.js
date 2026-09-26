"use strict";

const urlParams = new URLSearchParams(window.location.search);
const threadId = urlParams.get('id');
let currentUser = null;

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

async function init() {
    const meRes = await fetch('/api/me');
    const meData = await meRes.json();
    currentUser = meData.loggedIn ? meData.user : null;

    if (!currentUser) {
        document.getElementById('replyFormCard').innerHTML = '<p style="color:#888;">Musisz być <a href="/login.html" style="color:#4CAF50">zalogowany</a>, aby dodać odpowiedź.</p>';
    }

    await loadThread();

    const replyForm = document.getElementById('replyForm');
    if (replyForm) replyForm.addEventListener('submit', handleReplySubmit);
}

async function loadThread() {
    const res = await fetch('/api/threads/' + threadId);
    if (!res.ok) {
        document.getElementById('threadContent').innerHTML = '<p style="color:#ff5252">Wątek nie istnieje.</p>';
        return;
    }

    const data = await res.json();
    const thread = data.thread;
    const replies = data.replies;

    const authorName = thread.author?.username || 'Nieznany';
    const categoryName = thread.category?.name || 'Bez kategorii';

    document.getElementById('threadContent').innerHTML = `
        <div>
            <span class="badge">${escapeHtml(categoryName)}</span>
            <h2 style="margin: 0.5rem 0; color: #fff;">${escapeHtml(thread.title)}</h2>
            <small style="color: #888;">Autor: <strong>${escapeHtml(authorName)}</strong> | Data: ${new Date(thread.createdAt).toLocaleString('pl-PL')}</small>
            <div style="margin-top: 1.5rem; line-height: 1.6; white-space: pre-wrap; font-size: 1.05rem;">${escapeHtml(thread.content)}</div>
        </div>
    `;

    const repliesContainer = document.getElementById('repliesContainer');
    if (replies.length === 0) {
        repliesContainer.innerHTML = '<p style="color:#888;">Brak odpowiedzi. Bądź pierwszy!</p>';
    } else {
        repliesContainer.innerHTML = replies.map(r => {
            const replyAuthor = r.author?.username || 'Nieznany';
            return `
                <div class="reply-box">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <strong style="color:#4CAF50">${escapeHtml(replyAuthor)}</strong>
                        <small style="color:#888">${new Date(r.createdAt).toLocaleString('pl-PL')}</small>
                    </div>
                    <div style="white-space: pre-wrap;">${escapeHtml(r.content)}</div>
                </div>
            `;
        }).join('');
    }
}

async function handleReplySubmit(e) {
    e.preventDefault();
    const content = document.getElementById('replyContent').value;

    const res = await fetch(`/api/threads/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });

    const data = await res.json();

    if (res.ok) {
        document.getElementById('replyContent').value = '';
        loadThread();
    } else {
        alert(data.message || 'Błąd podczas wysyłania odpowiedzi!');
    }
}

init();

