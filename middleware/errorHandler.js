"use strict";
const AppError = require("../utils/AppError");

function notFound(req, res, next) {
    next(new AppError(`Nie znaleziono trasy: ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Błąd serwera";

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Nieprawidłowy identyfikator";
    }

    if (err.code === 11000) {
        statusCode = 400;
        message = "Rekord o takich danych już istnieje";
    }

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    const safeMessage = err.isOperational || statusCode < 500 ? message : "Błąd serwera";

    res.status(statusCode).json({ success: false, message: safeMessage });
}

module.exports = { notFound, errorHandler };
