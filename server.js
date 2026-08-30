"use strict";

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware do obsługi JSON i formularzy
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfiguracja Sesji (Zapamiętywanie zalogowania)
app.use(session({
    secret: process.env.SESSION_SECRET || 'super-tajny-klucz-fossspec',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 godziny
}));

// Serwowanie plików statycznych z public/
app.use(express.static(path.join(__dirname, "public")));

// --- DANE ADMINA ---
// Domyślny admin: login: admin | hasło: admin123 (zaszyfrowane poniżej)
const ADMIN_USER = "admin";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("admin123", 10);

// Middleware sprawdzający czy użytkownik jest zalogowany jako Admin
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    return res.status(401).json({ success: false, message: "Brak dostępu. Zaloguj się!" });
}

// --- ENDPOINTY API ---

// 1. Logowanie
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USER && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
        req.session.isAdmin = true; // Zapisujemy status w sesji
        return res.json({ success: true, message: "Zalogowano pomyślnie!" });
    }

    return res.status(401).json({ success: false, message: "Niepoprawny login lub hasło!" });
});

// 2. Weryfikacja czy jest zalogowany
app.get("/api/check-auth", (req, res) => {
    if (req.session && req.session.isAdmin) {
        return res.json({ loggedIn: true });
    }
    return res.json({ loggedIn: false });
});

// 3. Wylogowanie
app.get("/api/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: "Wylogowano" });
});

// Uruchomienie serwera
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Foss Spec działa na porcie ${PORT}`);
});
