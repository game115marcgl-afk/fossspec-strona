"use strict";
const router = require("express").Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { listUsers } = require("../controllers/adminController");

router.get("/users", requireAuth, requireAdmin, listUsers);

module.exports = router;
