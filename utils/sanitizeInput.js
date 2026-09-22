"use strict";

function ensureString(value) {
    if (typeof value !== "string") return null;
    return value.trim();
}

module.exports = { ensureString };
