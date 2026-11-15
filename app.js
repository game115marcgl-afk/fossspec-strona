"use strict";
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const threadRoutes = require("./routes/threadRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const sanitizeBody = require("./middleware/sanitize");

const app = express();

// Wymagane dla poprawnej obsługi HTTPS i sesji za reverse proxy (np. Render, Nginx)
app.set("trust proxy", 1);

app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": ["'self'"],
                "script-src": ["'self'", "'unsafe-inline'"],
                "connect-src": ["'self'"],
                "img-src": ["'self'", "data:", "https:"],
                "style-src": ["'self'", "https:", "'unsafe-inline'"],
            },
        },
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeBody);

if (!process.env.SESSION_SECRET) {
    throw new Error("Brak SESSION_SECRET w zmiennych środowiskowych!");
}

if (!process.env.MONGO_URI) {
    throw new Error("Brak MONGO_URI w zmiennych środowiskowych!");
}

// Konfiguracja trwałej i stabilnej sesji
app.use(
    session({
        name: "fossspec.sid",
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions",
            ttl: 60 * 60 * 24 * 7, // Czas życia w bazie: 7 dni
            autoRemove: "native"
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true, // Odświeża ważność sesji przy każdym żądaniu
        cookie: {
            secure: "auto", // Automatycznie HTTPS na produkcji (za proxy) i HTTP lokalnie
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dni
        }
    })
);

// Limity prób logowania i rejestracji
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Zbyt wiele prób. Spróbuj ponownie za chwilę." }
});
app.use("/api/register", authLimiter);
app.use("/api/login", authLimiter);

// Serwowanie plików statycznych z katalogu public
app.use(express.static(path.join(__dirname, "public")));

// Trasy API
app.use("/api/categories", categoryRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", authRoutes);

// Obsługa nieznanych zapytań pod /api -> zwraca JSON z błędem 404
app.use("/api/(.*)?", notFound);

// Fallback dla wszystkich pozostałych adresów URL (serwuje front-end SPA)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Globalna obsługa błędów
app.use(errorHandler);

module.exports = app;
