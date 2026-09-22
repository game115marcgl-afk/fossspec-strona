"use strict";
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        role: {
            type: String,
            enum: ["user", "moderator", "admin"],
            default: "user"
        },
        isVerified: { type: Boolean, default: false },
        verifyCode: { type: String, select: false },

        avatarUrl: { type: String, default: "" },
        bio: { type: String, maxlength: 300, default: "" },
        signature: { type: String, maxlength: 200, default: "" },

        stats: {
            threadCount: { type: Number, default: 0 },
            replyCount: { type: Number, default: 0 },
            lastSeenAt: { type: Date, default: Date.now }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
