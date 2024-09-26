// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    if (!to) {
        throw new Error('No recipients defined');
    }

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.MAIL_FROM, // Adresse de l'expéditeur
        to,
        subject,
        text,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
