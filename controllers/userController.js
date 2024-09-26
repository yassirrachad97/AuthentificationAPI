const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendEmail = require('../utils/sendEmail'); // Ajustez le chemin selon votre structure de projet




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

        // Generate a JWT for confirmation
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the email
        const subject = 'Confirmation d\'inscription';
        const text = `Merci pour votre inscription ! Vous pouvez vous connecter en cliquant sur le lien suivant : http://${process.env.APP_HOST}/api/auth/login?token=${token}`;

        await sendEmail(user.email, subject, text);

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
