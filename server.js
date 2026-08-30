"use strict";

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. POŁĄCZENIE Z BAZĄ MONGO DB
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
    .then(() => console.log("🟢 Połączono pomyślnie z bazą danych MongoDB Atlas!"))
    .catch(err => console.error("🔴 Błąd połączenia z MongoDB:", err));
} else {
    console.warn("⚠️ Brak MONGO_URI w pliku .env!");
}

// 2. SCHEMATY BAZY DANYCH (MODELE MONGOOSE)

// Użytkownicy
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

// Wątki (Tematy na forum)
const threadSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Thread = mongoose.model("Thread", threadSchema);

// Odpowiedzi / Komentarze
const replySchema = new mongoose.Schema({
    threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Reply = mongoose.model("Reply", replySchema);

// 3. MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'super-tajny-klucz-fossspec',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use(express.static(path.join(__dirname, "public")));

// Sprawdzanie czy użytkownik jest zalogowany
function requireAuth(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.status(401).json({ success: false, message: "Musisz być zalogowany!" });
}

// Sprawdzanie czy użytkownik jest Adminem
function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') return next();
    return res.status(403).json({ success: false, message: "Wymagane uprawnienia administratora!" });
}

// 4. API AUTORYZACJI (REJESTRACJA / LOGOWANIE)

// Rejestracja nowego konta
app.post("/api/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Wypełnij wszystkie pola!" });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Użytkownik o takim nicku lub emailu już istnieje!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Pierwszy zarejestrowany użytkownik dostaje rangę Admin, pozostali User
        const count = await User.countDocuments();
        const role = count === 0 ? 'admin' : 'user';

        const user = new User({ username, email, password: hashedPassword, role });
        await user.save();

        req.session.user = { id: user._id, username: user.username, role: user.role };
        res.json({ success: true, message: "Konto utworzone!", user: req.session.user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Błąd serwera przy rejestracji." });
    }
});

// Logowanie
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: "Błędny login lub hasło!" });
        }

        req.session.user = { id: user._id, username: user.username, role: user.role };
        res.json({ success: true, message: "Zalogowano!", user: req.session.user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Błąd logowania." });
    }
});

// Profil zalogowanego
app.get("/api/me", (req, res) => {
    if (req.session && req.session.user) {
        return res.json({ loggedIn: true, user: req.session.user });
    }
    res.json({ loggedIn: false });
});

// Wylogowanie
app.get("/api/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// 5. API FORUM (WĄTKI I ODPOWIEDZI)

// Pobranie wszystkich wątków
app.get("/api/threads", async (req, res) => {
    try {
        const threads = await Thread.find().sort({ createdAt: -1 });
        res.json(threads);
    } catch (err) {
        res.status(500).json({ message: "Błąd pobierania wątków" });
    }
});

// Pobranie konkretnego wątku z odpowiedziami
app.get("/api/threads/:id", async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: "Nie znaleziono wątku" });

        const replies = await Reply.find({ threadId: thread._id }).sort({ createdAt: 1 });
        res.json({ thread, replies });
    } catch (err) {
        res.status(500).json({ message: "Błąd serwera" });
    }
});

// Stworzenie nowego wątku (Wymaga zalogowania)
app.post("/api/threads", requireAuth, async (req, res) => {
    try {
        const { title, category, content } = req.body;
        const thread = new Thread({
            title,
            category,
            content,
            author: req.session.user.username
        });
        await thread.save();
        res.json({ success: true, thread });
    } catch (err) {
        res.status(500).json({ message: "Błąd przy tworzeniu wątku" });
    }
});

// Dodanie odpowiedzi do wątku (Wymaga zalogowania)
app.post("/api/threads/:id/replies", requireAuth, async (req, res) => {
    try {
        const { content } = req.body;
        const reply = new Reply({
            threadId: req.params.id,
            author: req.session.user.username,
            content
        });
        await reply.save();
        res.json({ success: true, reply });
    } catch (err) {
        res.status(500).json({ message: "Błąd przy dodawaniu odpowiedzi" });
    }
});

// Usuwanie wątku (Admin lub Autor)
app.delete("/api/threads/:id", requireAuth, async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) return res.status(404).json({ message: "Nie znaleziono wątku" });

        if (req.session.user.role === 'admin' || req.session.user.username === thread.author) {
            await Thread.findByIdAndDelete(req.params.id);
            await Reply.deleteMany({ threadId: req.params.id });
            return res.json({ success: true });
        }
        res.status(403).json({ message: "Brak uprawnień!" });
    } catch (err) {
        res.status(500).json({ message: "Błąd usuwania" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Foss Spec Forum działa na porcie ${PORT}`);
});
