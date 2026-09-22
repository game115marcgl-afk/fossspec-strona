"use strict";
const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 150 },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        content: { type: String, required: true, maxlength: 10000 },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        viewCount: { type: Number, default: 0 },
        replyCount: { type: Number, default: 0 },
        lastReplyAt: { type: Date, default: Date.now },

        isPinned: { type: Boolean, default: false },
        isLocked: { type: Boolean, default: false }
    },
    { timestamps: true }
);

threadSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("Thread", threadSchema);
