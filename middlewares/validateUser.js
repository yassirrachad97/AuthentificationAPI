
const userValidation = require('../validations/userValidation');

const validateUser = (req, res, next) => {
       const { error } = userValidation.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            errors: error.details.map(err => err.message), 
        });
    }

    next();
};

module.exports = validateUser;
