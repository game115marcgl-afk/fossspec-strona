"use strict";
const ActivityLog = require("../models/ActivityLog");

/**
 * Middleware do automatycznego logowania akcji użytkownika
 */
const logActivity = async (req, action, description = "", metadata = {}) => {
    try {
        if (!req.session?.user?.id) return; // Nie loguj anonimowych

        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get("User-Agent") || "Unknown";

        await ActivityLog.create({
            userId: req.session.user.id,
            username: req.session.user.username,
            action,
            description,
            metadata: {
                ipAddress: ip,
                userAgent,
                ...metadata
            }
        });
    } catch (err) {
        console.error("Błąd logowania aktywności:", err.message);
        // Nie przerywamy żądania jeśli logowanie nie zadziała
    }
};

/**
 * Middleware do automatycznego logowania przy każdym żądaniu (opcjonalnie)
 */
const autoLogger = async (req, res, next) => {
    // Loguj tylko zalogowanych użytkowników
    if (req.session?.user?.id) {
        // Możesz tutaj dodać logowanie specyficznych akcji
        // Na razie pomijamy, żeby nie zaśmiecać bazy
    }
    next();
};

module.exports = { logActivity, autoLogger };
