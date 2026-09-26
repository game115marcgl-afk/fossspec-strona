"use strict";
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");

const defaultCategories = [
    { name: "Ogłoszenia", icon: "📢", order: 1, description: "Oficjalne ogłoszenia administracji." },
    { name: "Hardware / Sprzęt", icon: "💻", order: 2, description: "Dyskusje o sprzęcie komputerowym." },
    { name: "Software & FOSS", icon: "🐧", order: 3, description: "Oprogramowanie i wolne oprogramowanie." },
    { name: "Ogólne & Pomoc", icon: "💬", order: 4, description: "Rozmowy ogólne i pomoc techniczna." }
];

function slugify(name) {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

async function seed() {
    if (!process.env.MONGO_URI) throw new Error("Brak MONGO_URI w .env");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 Połączono z bazą.");

    for (const cat of defaultCategories) {
        const slug = slugify(cat.name);
        const exists = await Category.findOne({ slug });
        if (exists) {
            console.log(`⏭  Kategoria "${cat.name}" już istnieje, pomijam.`);
            continue;
        }
        await Category.create({ ...cat, slug });
        console.log(`✅ Dodano kategorię: ${cat.name}`);
    }

    await mongoose.disconnect();
    console.log("Gotowe.");
}

seed().catch((err) => {
    console.error("🔴 Błąd seedowania:", err);
    process.exit(1);
});
