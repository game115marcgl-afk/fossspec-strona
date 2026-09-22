"use strict";
const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
    {
        threadId: { type: mongoose.Schema.Types.ObjectId, ref: "Thread", required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, maxlength: 5000 },
        editedAt: { type: Date }
    },
    { timestamps: true }
);

replySchema.index({ threadId: 1, createdAt: 1 });

module.exports = mongoose.model("Reply", replySchema);
