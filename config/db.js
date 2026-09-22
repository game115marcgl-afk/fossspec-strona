"use strict";
const mongoose = require("mongoose");

async function connectDB() {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error("Brak MONGO_URI w zmiennych środowiskowych! Ustaw go w pliku .env.");
    }

    try {
        await mongoose.connect(uri);
        console.log("🟢 Połączono pomyślnie z bazą danych MongoDB Atlas!");
    } catch (err) {
        console.error("🔴 Błąd połączenia z MongoDB:", err.message);
        process.exit(1); // bez bazy serwer i tak nie ma sensu uruchamiać
    }
}

module.exports = connectDB;
