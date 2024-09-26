const Joi = require('joi');

const userValidation = Joi.object({
    username: Joi.string().min(3).required().messages({
        'string.base': `"Username" should be a type of 'text'`,
        'string.empty': `"Username" cannot be an empty field`,
        'string.min': `"Username" should have a minimum length of {#limit}`,
        'any.required': `"Username" is required`
    }),
    email: Joi.string().email().required().messages({
        'string.email': `"Email" must be a valid email`,
        'any.required': `"Email" is required`
    }),
    password: Joi.string().min(6).required().messages({
        'string.base': `"Password" should be a type of 'text'`,
        'string.empty': `"Password" cannot be an empty field`,
        'string.min': `"Password" must be at least {#limit} characters long`,
        'any.required': `"Password" is required`
    }),
    phoneNumber: Joi.string().required().messages({
        'string.empty': `"Phone number" cannot be an empty field`,
        'any.required': `"Phone number" is required`
    })
});

module.exports = userValidation;
