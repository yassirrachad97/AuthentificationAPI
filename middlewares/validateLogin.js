// middlewares/validateLogin.js
const loginValidation = require('../validations/loginValidation');

const validateLogin = (req, res, next) => {
    const { error } = loginValidation.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            errors: error.details.map(err => err.message), 
        });
    }

    next();
};

module.exports = validateLogin;
