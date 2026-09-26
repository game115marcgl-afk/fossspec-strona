"use strict";
const express = require("express");
const router = express.Router();
// Importujesz middleware, który sprawdza czy ktoś jest zalogowany i czy jest adminem
const { requireAuth, requireAdmin } = require("../middleware/auth"); 
const { listUsers } = require("../controllers/adminController");

// TYLKO admin może wykonać te operacje
router.use(requireAuth, requireAdmin); 

router.get("/users", listUsers);

module.exports = router;
