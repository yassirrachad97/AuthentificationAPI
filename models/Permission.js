// models/Permission.js
const mongoose = require('mongoose');

// Définir le schéma de permission
const PermissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Permission name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: false
    }
}, { timestamps: true });

const Permission = mongoose.model('Permission', PermissionSchema);

module.exports = Permission;

