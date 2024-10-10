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
     
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

      
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email first.' });
        }
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' }); 


        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

        const subject = 'Réinitialisation de mot de passe';
        const text = `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`;

        await sendEmail(user.email, subject, text);

        res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};




exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

   
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

