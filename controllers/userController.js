const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            username,
            email,
            password,
            phoneNumber
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Générer un JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Envoyer un email avec le lien de connexion
        const transporter = nodemailer.createTransport({
            host: 'your-smtp-host', // Remplacez par votre hôte SMTP
            port: 587, // Port SMTP
            auth: {
                user: process.env.MAIL_USER, // Votre email
                pass: process.env.MAIL_PASS, // Votre mot de passe
            },
        });

        const mailOptions = {
            from: process.env.MAIL_FROM, // L'adresse d'envoi
            to: email, // L'adresse de destination
            subject: 'Confirmation d\'inscription',
            text: `Merci pour votre inscription ! Vous pouvez vous connecter en cliquant sur le lien suivant : http://localhost:3000/api/auth/login?token=${token}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'User registered successfully, please check your email for the login link' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
