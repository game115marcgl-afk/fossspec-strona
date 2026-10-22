
"use strict";
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo"); // ← DODANE: do trwałego przechowywania sesji
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

// Render wymaga trust proxy dla sesji i ciasteczek
app.set("trust proxy", 1);

app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": ["'self'"],
                "script-src": ["'self'", "'unsafe-inline'"], // Pozwala na nasz inline JS
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

// ✅ POPRAWIONA KONFIGURACJA SESJI
app.use(
    session({
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI, // Upewnij się, że masz to w .env
            collectionName: "sessions",
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true, // Odświeża czas ważności ciasteczka przy każdej aktywności
        cookie: {
            // secure: true jest wymagane na Renderze (HTTPS). 
            // Na localhost możesz tymczasowo dać false, ale production musi być true.
            secure: process.env.NODE_ENV === "production", 
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dni
        }
    })
);

// Limity
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Zbyt wiele prób. Spróbuj ponownie za chwilę." }
});
app.use("/api/register", authLimiter);
app.use("/api/login", authLimiter);

// Statyczne
app.use(express.static(path.join(__dirname, "public")));

// Trasy
app.use("/api/categories", categoryRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
