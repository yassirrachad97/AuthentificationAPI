const mongoose = require('mongoose');

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
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role' // Référence au modèle Role
    }],
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission' // Référence au modèle Permission
    }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;
