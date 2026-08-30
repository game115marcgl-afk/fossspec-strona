"use strict";

require("dotenv").config(); // Wczytuje zmienne z pliku .env
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// POŁĄCZENIE Z BAZĄ MONGO DB
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
    .then(() => console.log("🟢 Połączono pomyślnie z bazą danych MongoDB Atlas!"))
    .catch(err => console.error("🔴 Błąd połączenia z MongoDB:", err));
} else {
    console.warn("⚠️ Brak MONGO_URI w pliku .env!");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'super-tajny-klucz-fossspec',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(express.static(path.join(__dirname, "public")));

// Uruchomienie serwera
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Foss Spec działa na porcie ${PORT}`);
});
"use strict";

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfiguracja Sesji
app.use(session({
    secret: process.env.SESSION_SECRET || 'super-tajny-klucz-fossspec',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(express.static(path.join(__dirname, "public")));

// --- BAZA DANYCH W PLIKU DATA/ITEMS.JSON ---
const DATA_FILE = path.join(__dirname, "data", "items.json");

function getItems() {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch { return []; }
}

function saveItems(items) {
    const dir = path.join(__dirname, "data");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

// Admin
const ADMIN_USER = "admin";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("admin123", 10);

function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) return next();
    return res.status(401).json({ success: false, message: "Brak dostępu!" });
}

// --- ENDPOINTY ---

// Logowanie
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
        req.session.isAdmin = true;
        return res.json({ success: true });
    }
    return res.status(401).json({ success: false, message: "Błędne dane!" });
});

app.get("/api/check-auth", (req, res) => {
    res.json({ loggedIn: !!(req.session && req.session.isAdmin) });
});

app.get("/api/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// --- API DLA DANYCH (POŁĄCZENIE STRONY Z ADMINEM) ---

// 1. Pobieranie wpisów (dostępne dla każdego w index.html i admin.html)
app.get("/api/items", (req, res) => {
    res.json(getItems());
});

// 2. Dodawanie nowego wpisu (Tylko dla Admina!)
app.post("/api/items", requireAdmin, (req, res) => {
    const { title, category, description } = req.body;
    const items = getItems();
    const newItem = { id: Date.now(), title, category, description, date: new Date().toLocaleDateString('pl-PL') };
    items.unshift(newItem); // dodaje na początek listy
    saveItems(items);
    res.json({ success: true, item: newItem });
});

// 3. Usuwanie wpisu (Tylko dla Admina!)
app.delete("/api/items/:id", requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    let items = getItems();
    items = items.filter(item => item.id !== id);
    saveItems(items);
    res.json({ success: true });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
