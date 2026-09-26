"use strict";
const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category" // Zakładam, że masz model kategorii na podstawie Twojego kodu JS
    }
}, { timestamps: true });

const Thread = mongoose.model("Thread", threadSchema);
module.exports = Thread;

