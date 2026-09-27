/**
 * FossSpec Forum
 * Copyright (c) 2026 FossSpec
 * Licensed under the MIT License. See the LICENSE file in the project root.
 * SPDX-License-Identifier: MIT
 */
"use strict";
require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Foss Spec Forum działa na porcie ${PORT}`);
    });
});
