// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, htmlContent) => {
    if (!to) {
        throw new Error('No recipients defined');
    }

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false, 
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.MAIL_FROM,
        to,
        subject,
        html: htmlContent, 
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
