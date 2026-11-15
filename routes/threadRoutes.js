"use strict";
const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const {
    getThreads,
    getThreadById,
    createThread,
    createReply,
    deleteThread
} = require("../controllers/threadController");

// DODANO requireAuth do routingu GET, aby chronić dostęp przed gośćmi
router.get("/", requireAuth, getThreads);
router.get("/:id", requireAuth, getThreadById);
router.post("/", requireAuth, createThread);
router.post("/:id/replies", requireAuth, createReply);
router.delete("/:id", requireAuth, deleteThread);

module.exports = router;
