"use strict";
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        username: { type: String, required: true, index: true },
        action: {
            type: String,
            required: true,
            enum: [
                "login_success",
                "login_failed",
                "logout",
                "post_created",
                "post_edited",
                "post_deleted",
                "reply_created",
                "profile_updated",
                "password_changed",
                "suspicious_activity"
            ],
            index: true
        },
        description: { type: String, default: "" },
        metadata: {
            ipAddress: String,
            userAgent: String,
            postId: mongoose.Schema.Types.ObjectId,
            threadId: mongoose.Schema.Types.ObjectId,
            content: String, // do detekcji spamu
            riskScore: { type: Number, default: 0 } // 0-100, im wyższy tym bardziej podejrzane
        },
        location: {
            country: String,
            city: String,
            coordinates: [Number] // [longitude, latitude]
        }
    },
    { timestamps: true }
);

// Indeks dla szybkiego wyszukiwania po czasie
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
