const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) =>{
const {username, email, password, phoneNumber} = req.body;

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

    res.status(201).json({ message: 'User registered successfully' });

} catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
}
};