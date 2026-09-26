
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

// Wymagane na Render/Heroku i podobnych, żeby ciasteczka "secure" działały poprawnie za proxy
app.set("trust proxy", 1);

app.use(helmet()); // podstawowe nagłówki bezpieczeństwa (CSP, X-Frame-Options itd.)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usuwa z req.body klucze zaczynające się od "$" lub zawierające ".",
// czyli druga warstwa ochrony przed NoSQL injection (pierwsza to ensureString w kontrolerach).
// Własna implementacja - express-mongo-sanitize nie działa z Express 5.
app.use(sanitizeBody);

if (!process.env.SESSION_SECRET) {
    throw new Error(
        "Brak SESSION_SECRET w zmiennych środowiskowych! Wygeneruj losowy ciąg znaków i ustaw go w .env."
    );
}

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production", // wymaga HTTPS na produkcji
            httpOnly: true,
            sameSite: "lax", // podstawowa ochrona przed CSRF
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    })
);

// Ochrona przed brute-force na logowaniu i rejestracji
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Zbyt wiele prób. Spróbuj ponownie za chwilę." }
});
app.use("/api/register", authLimiter);
app.use("/api/login", authLimiter);

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", authRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);

app.use(notFound);
app.use(errorHandler); // ZAWSZE jako ostatni middleware

module.exports = app;
