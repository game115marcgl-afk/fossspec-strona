"use strict";

const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

/*
 * Pozwala Expressowi obsługiwać JSON.
 */
app.use(express.json());

/*
 * Udostępniamy pliki znajdujące się
 * w katalogu public/.
 */
app.use(express.static(
    path.join(__dirname, "public")
));

/*
 * Uruchomienie serwera.
 */
app.listen(PORT, "127.0.0.1", () => {
    console.log(
        `Foss Spec działa pod http://127.0.0.1:${PORT}`
    );
});