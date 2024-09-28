const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendEmail = require('../utils/sendEmail'); // Ajustez le chemin selon votre structure de projet


exports.verifyEmail = async (req, res) => {
    const token = req.params.token;

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Find the user by ID
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'Invalid verification link or user does not exist' });
        }

        // Check if the user is already verified
        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        // Set the user as verified
        user.isVerified = true;
        user.verificationDate = new Date(); 
        await user.save();

        res.status(200).json({ message: 'Email verified successfully!' });
    } catch (err) {

        if (err.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Verification session has expired. Please request a new verification email.' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.resendVerificationLink = async (req, res) => {
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });

        const subject = 'Nouveau lien de vérification';
        const text = `Voici votre nouveau lien de vérification : http://${process.env.APP_HOST}/api/auth/verify/${token}`;

        await sendEmail(user.email, subject, text);

        res.status(200).json({ message: 'Verification link sent. Please check your email.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


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
            phoneNumber,
            isVerified: false 
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Generate a JWT for confirmation
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });

        // Send the email
        const subject = 'Confirmation d\'inscription';
        const text = `Merci pour votre inscription ! Vous pouvez vous connecter en cliquant sur le lien suivant : http://${process.env.APP_HOST}/api/auth/verify/${token}`;

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
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email before logging in' });
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
