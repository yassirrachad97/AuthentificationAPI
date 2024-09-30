const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
const sendEmail = require('../utils/sendEmail');


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); 
};


exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        // Trouver l'utilisateur par e-mail
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Vérifier si l'utilisateur est vérifié
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email first.' });
        }
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' }); 


        const resetLink = `http://${process.env.APP_HOST}/api/auth/reset-password/${resetToken}`;
        const subject = 'Réinitialisation de mot de passe';
        const text = `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`;

        await sendEmail(user.email, subject, text);

        res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.verifyResetTokenAndGenerateOTP = async (req, res) => {
    const { token } = req.params;

    try {
       
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

       
        const otp = generateOTP();

 
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; 
        await user.save();

  
        const subject = 'Votre code OTP pour la réinitialisation du mot de passe';
        const text = `Votre code OTP est ${otp}. Il est valide pendant 5 minutes.`;

        await sendEmail(user.email, subject, text);

        res.status(200).json({ message: 'OTP sent to your email. Please verify OTP to reset password.' });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


exports.resetPasswordWithOTP = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
    
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

      
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

   
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};