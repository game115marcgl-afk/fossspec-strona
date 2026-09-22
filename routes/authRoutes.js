"use strict";
const router = require("express").Router();
const { register, login, me, logout } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.get("/logout", logout);

module.exports = router;
