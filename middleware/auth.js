"use strict";
const AppError = require("../utils/AppError");

function requireAuth(req, res, next) {
    if (req.session && req.session.user) return next();
    return next(new AppError("Musisz być zalogowany!", 401));
}

function requireAdmin(req, res, next) {
    if (req.session?.user?.role === "admin") return next();
    return next(new AppError("Brak uprawnień!", 403));
}

module.exports = { requireAuth, requireAdmin };
