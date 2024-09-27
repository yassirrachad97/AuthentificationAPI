const Joi = require('joi');

const loginValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': `"Email" must be a valid email`,
        'any.required': `"Email" is required`
    }),
    password: Joi.string().min(6).required().messages({
        'string.base': `"Password" should be a type of 'text'`,
        'string.empty': `"Password" cannot be an empty field`,
        'string.min': `"Password" must be at least {#limit} characters long`,
        'any.required': `"Password" is required`
    })
});

module.exports = loginValidation;
