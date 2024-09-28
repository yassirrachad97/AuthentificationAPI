const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerificationLink, verifyOTP } = require('../controllers/userController');
const validateLogin = require('../middlewares/validateLogin');
const validateUser = require('../middlewares/validateUser');

router.post('/register',validateUser, register);

router.post('/login', validateLogin, login);

router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerificationLink);
router.post('/verify-otp', verifyOTP);
module.exports = router;
