"use strict";
const Category = require("../models/Category");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ensureString } = require("../utils/sanitizeInput");

function slugify(name) {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // usuwa polskie znaki diakrytyczne (ą, ę, ś...)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json(categories);
});

const createCategory = asyncHandler(async (req, res, next) => {
    const name = ensureString(req.body.name);
    const description = ensureString(req.body.description) || "";
    const icon = ensureString(req.body.icon) || "";

    if (!name) return next(new AppError("Podaj nazwę kategorii.", 400));

    const slug = slugify(name);
    const existing = await Category.findOne({ slug });
    if (existing) return next(new AppError("Kategoria o takiej nazwie już istnieje.", 400));

    const category = await Category.create({ name, slug, description, icon });
    res.json({ success: true, category });
});

module.exports = { getCategories, createCategory };
