"use strict";
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const listUsers = asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
});

module.exports = { listUsers };
