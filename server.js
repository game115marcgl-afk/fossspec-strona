const path = require("path");
const express = require("express");
const app = express();

// Kluczowa linijka - wskazuje folder public jako źródło plików statycznych (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Middleware do parsowania JSON (jeśli jeszcze nie masz)
app.use(express.json());
