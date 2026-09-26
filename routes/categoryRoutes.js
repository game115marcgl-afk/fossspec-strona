"use strict";
const router = require("express").Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { getCategories, createCategory } = require("../controllers/categoryController");

router.get("/", getCategories); // publiczne - lista kategorii do wyboru w formularzu
router.post("/", requireAuth, requireAdmin, createCategory); // tylko admin tworzy nowe kategorie

module.exports = router;
