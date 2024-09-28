const request = require('supertest');
const express = require('express');
const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');
const sendEmail = require('../utils/sendEmail'); // Importer sendEmail pour simulation
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock de la fonction sendEmail
jest.mock('../utils/sendEmail');
jest.mock('../models/User');

describe('POST /api/auth/register', () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Réinitialiser les mocks avant chaque test
    });

    it('should successfully register a new user', async () => {
        User.findOne.mockResolvedValue(null); // L'utilisateur n'existe pas
        User.prototype.save = jest.fn().mockResolvedValue({}); // Simule l'enregistrement
        sendEmail.mockResolvedValue({}); // Simule l'envoi d'un e-mail sans erreur

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                phoneNumber: '123456789'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toEqual('User registered successfully, please check your email for the login link'); // Mettez à jour ici
        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(User.prototype.save).toHaveBeenCalled();
        expect(sendEmail).toHaveBeenCalled(); // Vérifiez que sendEmail a été appelé
    });

    it('should return an error if the user already exists', async () => {
        User.findOne.mockResolvedValue({ email: 'test@example.com' }); // Simule un utilisateur existant

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                phoneNumber: '123456789'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('User already exists');
        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(User.prototype.save).not.toHaveBeenCalled();
        expect(sendEmail).not.toHaveBeenCalled(); // Vérifie que sendEmail n'a pas été appelé
    });

    it('should return a 400 error for missing or invalid fields', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: '', // Vide pour provoquer une erreur
                email: 'test@example.com',
                password: '123', // Trop court pour provoquer une erreur
                phoneNumber: '' // Vide pour provoquer une erreur
            });
    
        expect(res.statusCode).toEqual(400);
        // Vérifiez les messages d'erreur reçus
        expect(res.body.errors).toContain('"Username" cannot be an empty field');
        expect(res.body.errors).toContain('"Password" must be at least 6 characters long');
        expect(res.body.errors).toContain('"Phone number" cannot be an empty field');
        expect(sendEmail).not.toHaveBeenCalled(); // Vérifie que sendEmail n'a pas été appelé
    });
    
    it('should return a 500 error if there is a server issue', async () => {
        User.findOne.mockRejectedValue(new Error('Server error')); // Simule une erreur lors de la recherche de l'utilisateur

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',  
                email: 'test@example.com',
                password: 'password123',
                phoneNumber: '123456789'
            });
    
        expect(res.statusCode).toEqual(500);
        expect(res.text).toEqual('Server error');
        expect(sendEmail).not.toHaveBeenCalled(); // Vérifie que sendEmail n'a pas été appelé
    });
});
