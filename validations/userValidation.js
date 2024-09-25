const Joi = require('joi');

const userValidation = Joi.object({
    name: Joi.string().min(3).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name should have at least 3 characters',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please include a valid email',
        'string.empty': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password is required',
    }),
    phoneNumber: Joi.string().required().messages({
        'string.empty': 'Phone number is required',
    })
});

module.exports = userValidation;
