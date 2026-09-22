"use strict";
const Thread = require("../models/Thread");
const Reply = require("../models/Reply");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ensureString } = require("../utils/sanitizeInput");

const getThreads = asyncHandler(async (req, res) => {
    const threads = await Thread.find()
        .populate("author", "username avatarUrl")
        .populate("category", "name slug")
        .sort({ isPinned: -1, lastReplyAt: -1 })
        .limit(100);

    res.json(threads);
});

const getThreadById = asyncHandler(async (req, res, next) => {
    const thread = await Thread.findByIdAndUpdate(
        req.params.id,
        { $inc: { viewCount: 1 } },
        { new: true }
    )
        .populate("author", "username avatarUrl")
        .populate("category", "name slug");

    if (!thread) return next(new AppError("Nie znaleziono wątku", 404));

    const replies = await Reply.find({ threadId: thread._id })
        .populate("author", "username avatarUrl")
        .sort({ createdAt: 1 });

    res.json({ thread, replies });
});

const createThread = asyncHandler(async (req, res, next) => {
    const title = ensureString(req.body.title);
    const category = ensureString(req.body.category);
    const content = ensureString(req.body.content);

    if (!title || !category || !content) {
        return next(new AppError("Wypełnij wszystkie pola wątku.", 400));
    }

    const thread = await Thread.create({
        title,
        category,
        content,
        author: req.session.user.id
    });

    await User.findByIdAndUpdate(req.session.user.id, { $inc: { "stats.threadCount": 1 } });

    res.json({ success: true, thread });
});

const createReply = asyncHandler(async (req, res, next) => {
    const content = ensureString(req.body.content);
    if (!content) return next(new AppError("Treść odpowiedzi nie może być pusta.", 400));

    const thread = await Thread.findById(req.params.id);
    if (!thread) return next(new AppError("Nie znaleziono wątku", 404));
    if (thread.isLocked) return next(new AppError("Wątek jest zablokowany.", 403));

    const reply = await Reply.create({
        threadId: req.params.id,
        author: req.session.user.id,
        content
    });

    thread.replyCount += 1;
    thread.lastReplyAt = new Date();
    await thread.save();

    await User.findByIdAndUpdate(req.session.user.id, { $inc: { "stats.replyCount": 1 } });

    res.json({ success: true, reply });
});

const deleteThread = asyncHandler(async (req, res, next) => {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return next(new AppError("Nie znaleziono wątku", 404));

    const isOwner = String(thread.author) === String(req.session.user.id);
    const isAdmin = req.session.user.role === "admin";

    if (!isOwner && !isAdmin) {
        return next(new AppError("Brak uprawnień!", 403));
    }

    await Thread.findByIdAndDelete(req.params.id);
    await Reply.deleteMany({ threadId: req.params.id });
    res.json({ success: true });
});

module.exports = { getThreads, getThreadById, createThread, createReply, deleteThread };
