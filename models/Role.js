// models/Role.js
const mongoose = require('mongoose');

// Définir le schéma de rôle
const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        unique: true,
        trim: true
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission' // Référence au modèle Permission
    }]
}, { timestamps: true });

const Role = mongoose.model('Role', RoleSchema);

module.exports = Role;
