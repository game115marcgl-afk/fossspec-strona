"use strict";

// Zamiennik dla express-mongo-sanitize, który jest niekompatybilny z Express 5
// (próbuje nadpisać req.query, a w Express 5 to pole jest tylko-do-odczytu - patrz
// https://expressjs.com/en/guide/migrating-5.html).
//
// Usuwa z req.body klucze zaczynające się od "$" lub zawierające "." - to typowy
// sposób na NoSQL injection, np. { "username": { "$ne": null } }.
// Druga warstwa ochrony to ensureString() w kontrolerach (utils/sanitizeInput.js).

function stripMongoOperators(value) {
    if (Array.isArray(value)) {
        return value.map(stripMongoOperators);
    }
    if (value && typeof value === "object") {
        const clean = {};
        for (const [key, val] of Object.entries(value)) {
            if (key.startsWith("$") || key.includes(".")) continue; // pomiń niebezpieczny klucz
            clean[key] = stripMongoOperators(val);
        }
        return clean;
    }
    return value;
}

function sanitizeBody(req, res, next) {
    if (req.body && typeof req.body === "object") {
        req.body = stripMongoOperators(req.body);
    }
    next();
}

module.exports = sanitizeBody;
