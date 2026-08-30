"use strict";

const express = require("express");
const path = require("path");

const app = express();

// Render przydziela własny port w process.env.PORT
const PORT = process.env.PORT || 3000;

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
 * "0.0.0.0" pozwala przyjmować ruch z zewnątrz (z internetu).
 */
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Foss Spec działa na porcie ${PORT}`
    );
});
