"use strict";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendVerificationEmail(to, username, code) {
    return transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: "FossSpec - Kod weryfikacyjny",
        text: `Czesc ${username}! Twoj kod weryfikacyjny to: ${code}. Kod wygasa za 60 minut.`,
        html: `<p>Czesc <strong>${username}</strong>!</p>
               <p>Twoj kod weryfikacyjny to:</p>
               <h2 style="letter-spacing:6px">${code}</h2>
               <p>Kod wygasa za 60 minut. Jesli to nie Ty zakladales konto, zignoruj te wiadomosc.</p>`
    });
}

module.exports = { sendVerificationEmail };
