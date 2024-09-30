const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerificationLink, verifyOTP } = require('../controllers/userController');
const { requestPasswordReset , verifyResetTokenAndGenerateOTP , resetPasswordWithOTP } = require('../controllers/resitPasswordController');
const validateLogin = require('../middlewares/validateLogin');
const validateUser = require('../middlewares/validateUser');

router.post('/register',validateUser, register);

router.post('/login', validateLogin, login);

router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerificationLink);
router.post('/verify-otp', verifyOTP);


router.post('/request-password-reset', requestPasswordReset);
router.get('/reset-password/:token', verifyResetTokenAndGenerateOTP);
router.post('/reset-password/otp', resetPasswordWithOTP);
module.exports = router;
