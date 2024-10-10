const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerificationLink, verifyOTP, resendOTP } = require('../controllers/userController');
const { requestPasswordReset  , resetPassword } = require('../controllers/resitPasswordController');
const validateLogin = require('../middlewares/validateLogin');
const validateUser = require('../middlewares/validateUser');

router.post('/register',validateUser, register);

router.post('/login', validateLogin, login);

router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerificationLink);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);


router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
module.exports = router;
