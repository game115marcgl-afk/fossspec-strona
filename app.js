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

app.use(
    session({
        name: "fossspec.sid",
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions",
            ttl: 60 * 60 * 24 * 7,
            autoRemove: "native"
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            secure: "auto",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    })
);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Zbyt wiele prób. Spróbuj ponownie za chwilę." }
});
app.use("/api/register", authLimiter);
app.use("/api/login", authLimiter);

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/categories", categoryRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", authRoutes);

app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "Nie znaleziono endpointu API." });
});
// Obsługa tylko żądań przeglądarki (HTML) dla ścieżek frontendowych
app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api/")) {
        return next();
    }
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

