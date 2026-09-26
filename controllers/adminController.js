"use strict";
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const listUsers = asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
});

// Upewnij się, że to jest obiekt z funkcją!
module.exports = { listUsers };
