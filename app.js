
"use strict";
const express = require("express");
const session = require("express-session");
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

// Konfiguracja dla proxy (Render/Heroku)
app.set("trust proxy", 1);

// Ulepszona konfiguracja Helmet
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

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    })
);

// Limity zapytań
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Zbyt wiele prób. Spróbuj ponownie za chwilę." }
});
app.use("/api/register", authLimiter);
app.use("/api/login", authLimiter);

// Statyczne pliki
app.use(express.static(path.join(__dirname, "public")));
// Trasy API
app.use("/api/categories", categoryRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", authRoutes); // ZMIENIONE Z POWROTEM NA /api


// Obsługa błędów
app.use(notFound);
app.use(errorHandler);

module.exports = app;
