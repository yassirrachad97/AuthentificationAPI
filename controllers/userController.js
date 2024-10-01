const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
const sendEmail = require('../utils/sendEmail'); 


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
        userAgent = req.headers['user-agent'];
        user = new User({
            username,
            email,
            password,
            phoneNumber,
            isVerified: false
        });
        user.device.push({userAgent,
            isVerified: true

        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });

       
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
            user.failedLoginAttempts += 1;
            // Si plus de 5 tentatives échouées, verrouiller le compte
            if (user.failedLoginAttempts >= 5) {
                user.isAccountLocked = true;
                user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes de verrouillage
                await user.save();

                // Envoyer un email à l'utilisateur pour l'informer du verrouillage
                const subject = 'Alerte de sécurité : Tentatives de connexion échouées';
                const text = `Bonjour ${user.username},\n\nNous avons détecté plusieurs tentatives de connexion échouées à votre compte.\nVotre compte a été temporairement verrouillé pour des raisons de sécurité. Vous pouvez réessayer après 30 minutes.\n\nSi ce n'était pas vous, nous vous recommandons de changer votre mot de passe immédiatement.`;
                await sendEmail(user.email, subject, text);

                return res.status(403).json({ message: 'Account locked due to too many failed login attempts. Please check your email.' });
            }
            await user.save();
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        user.failedLoginAttempts = 0;
        user.isAccountLocked = false;
        user.lockUntil = null;

        userAgent = req.headers['user-agent'];
        const currentDevice = {
            userAgent
        };
      
        const existingDevice = user.device.find(
            device => device.userAgent === currentDevice.userAgent
        );

       
     
        // Check if device is new or unverified, then send OTP
        if (!existingDevice) {
            const otp = generateOTP();
            const subject = 'Your OTP Code';
            const text = `Your OTP code is ${otp}. It is valid for 5 minutes.`;
            await sendEmail(user.email, subject, text);

            user.otp = otp;
            user.otpExpires = Date.now() + 5 * 60 * 1000;
            user.device.push({
                userAgent: userAgent,
                isVerified: false,
            });
            await user.save();

            return res.status(200).json({ message: 'OTP sent to your email. Please verify to proceed.' });
        }else if (!existingDevice.isVerified) {
            const otp = generateOTP();
            const subject = 'Your OTP Code';
            const text = `Your OTP code is ${otp}. It is valid for 5 minutes.`;
            await sendEmail(user.email, subject, text);

            user.otp = otp;
            user.otpExpires = Date.now() + 5 * 60 * 1000; 
            await user.save();

            return res.status(200).json({ message: 'OTP sent to your email. Please verify to proceed.' });
        };
        // await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.json({message:'Login successful', token, user: { id: user._id, username: user.username, email: user.email } });
     
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); 
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const deviceIndex = user.device.findIndex(
            (device) => device.userAgent === userAgent
          );
          if (deviceIndex === -1) {
            return res.status(400).json({ message: 'Appareil non trouvé' });
          };
        // Clear the OTP
        user.device[deviceIndex].isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({message:'login succefull', token, user: { id: user._id, username: user.username, email: user.email } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
