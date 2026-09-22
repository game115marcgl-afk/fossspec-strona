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

router.get("/", getThreads);
router.get("/:id", getThreadById);
router.post("/", requireAuth, createThread);
router.post("/:id/replies", requireAuth, createReply);
router.delete("/:id", requireAuth, deleteThread);

module.exports = router;
