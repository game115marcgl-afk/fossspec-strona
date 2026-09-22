"use strict";
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ensureString } = require("../utils/sanitizeInput");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = asyncHandler(async (req, res, next) => {
    const username = ensureString(req.body.username);
    const email = ensureString(req.body.email)?.toLowerCase();
    const password = ensureString(req.body.password);

    if (!username || !email || !password) {
        return next(new AppError("Wypełnij wszystkie pola!", 400));
    }
    if (username.length < 3 || username.length > 30) {
        return next(new AppError("Nick musi mieć od 3 do 30 znaków.", 400));
    }
    if (!EMAIL_REGEX.test(email)) {
        return next(new AppError("Nieprawidłowy adres e-mail.", 400));
    }
    if (password.length < 8) {
        return next(new AppError("Hasło musi mieć minimum 8 znaków.", 400));
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        return next(new AppError("Użytkownik o takim nicku lub emailu już istnieje!", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const count = await User.countDocuments();
    const role = count === 0 ? "admin" : "user";

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role,
        isVerified: true
    });

    req.session.user = { id: user._id, username: user.username, role: user.role };
    res.json({ success: true, message: "Konto utworzone!", user: req.session.user });
});

const login = asyncHandler(async (req, res, next) => {
    const username = ensureString(req.body.username);
    const password = ensureString(req.body.password);

    if (!username || !password) {
        return next(new AppError("Podaj login i hasło.", 400));
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError("Błędny login lub hasło!", 401));
    }

    req.session.user = { id: user._id, username: user.username, role: user.role };
    res.json({ success: true, message: "Zalogowano!", user: req.session.user });
});

const me = (req, res) => {
    if (req.session?.user) return res.json({ loggedIn: true, user: req.session.user });
    res.json({ loggedIn: false });
};

const logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid");
        res.json({ success: true });
    });
};

module.exports = { register, login, me, logout };
