"use strict";
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: { type: String, trim: true, default: "" },
        icon: { type: String, default: "" },
        order: { type: Number, default: 0 },
        threadCount: { type: Number, default: 0 }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
