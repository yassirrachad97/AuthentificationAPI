const mongoose = require('mongoose');
const validator = require('validator');

// Définir le schéma utilisateur
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6 
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
    },
    isVerified: {
        type: Boolean,
        default: false 
    },
    verificationDate: {
        type: Date,
        default: null
    },    
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role' // Référence au modèle Role
    }],
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission' // Référence au modèle Permission
    }],
    otp: {
        type: String, // Stocke le code OTP
    },
    otpExpires: {
        type: Date, // Stocke la date d'expiration de l'OTP
    }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;
