
# AuthentificationAPI

## Description

Ce projet est une API d'authentification sécurisée avec gestion des utilisateurs, gestion des appareils (device tracking), OTP (One-Time Password) pour la validation des connexions depuis de nouveaux appareils, et verrouillage de compte après plusieurs tentatives de connexion échouées.

L'API comprend les fonctionnalités suivantes :
- Inscription d'utilisateurs avec vérification par email.
- Connexion avec prise en charge des tentatives échouées et verrouillage du compte.
- Envoi d'un OTP lors de la connexion à partir d'un nouvel appareil.
- Envoi d'alertes de sécurité en cas de tentatives échouées multiples.
- Système de JWT (JSON Web Tokens) pour la gestion des sessions.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre machine :
- Node.js (v14 ou supérieur)
- MongoDB (en local ou via un service comme MongoDB Atlas)

## Installation

1. Clonez le dépôt :

    ```bash
    git clone https://github.com/votre-utilisateur/AuthentificationAPI.git
    cd AuthentificationAPI
    ```

2. Installez les dépendances :

    ```bash
    npm install
    ```

3. Créez un fichier `.env` à la racine du projet avec le contenu suivant :

    ```
    MONGO_URI=mongodb://localhost:27017/authAPI
    JWT_SECRET=your_jwt_secret_key
    JWT_EXPIRES_IN=1h
    APP_HOST=localhost:3000
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_email_password
    ```

4. Lancez le serveur :

    ```bash
    npm start
    ```

L'API devrait maintenant être disponible à l'adresse http://localhost:3000.

## Routes de l'API

### Authentification

#### 1. Inscription
- **Endpoint** : `/api/auth/register`
- **Méthode** : POST
- **Description** : Crée un nouveau compte utilisateur.
- **Body (JSON)** :
    ```json
    {
      "username": "testuser",
      "email": "testuser@example.com",
      "password": "password123",
      "phoneNumber": "123456789"
    }
    ```
- **Réponse** :
    - `201 Created` : Utilisateur créé avec succès, lien de vérification envoyé.
    - `400 Bad Request` : L'utilisateur existe déjà ou les informations sont incorrectes.

#### 2. Vérification d'email
- **Endpoint** : `/api/auth/verify/:token`
- **Méthode** : GET
- **Description** : Vérifie l'email de l'utilisateur avec un jeton JWT envoyé par email.
- **Réponse** :
    - `200 OK` : Email vérifié avec succès.
    - `400 Bad Request` : Jeton invalide ou expiré.

#### 3. Connexion
- **Endpoint** : `/api/auth/login`
- **Méthode** : POST
- **Description** : Authentifie l'utilisateur. Si un nouvel appareil est détecté, envoie un OTP pour validation.
- **Body (JSON)** :
    ```json
    {
      "email": "testuser@example.com",
      "password": "password123"
    }
    ```
- **Réponse** :
    - `200 OK` : Connexion réussie, renvoie un token JWT.
    - `200 OK` : OTP envoyé si l'appareil n'est pas vérifié.
    - `400 Bad Request` : Identifiants incorrects.
    - `403 Forbidden` : Compte verrouillé après plusieurs tentatives échouées.

#### 4. Vérification OTP
- **Endpoint** : `/api/auth/verify-otp`
- **Méthode** : POST
- **Description** : Vérifie l'OTP envoyé à l'utilisateur pour confirmer l'appareil.
- **Body (JSON)** :
    ```json
    {
      "email": "testuser@example.com",
      "otp": "123456"
    }
    ```
- **Réponse** :
    - `200 OK` : Appareil vérifié, connexion réussie.
    - `400 Bad Request` : OTP incorrect ou expiré.

### Gestion des échecs de connexion

L'API verrouille automatiquement un compte utilisateur après 5 tentatives échouées et envoie un email pour en avertir l'utilisateur. Le verrouillage dure 30 minutes.

- **Réponse de verrouillage** :
    ```json
    {
      "message": "Account locked due to too many failed login attempts. Please check your email."
    }
    ```

## Tests avec Postman

### Inscription
1. Utilisez la route `/api/auth/register` pour créer un nouvel utilisateur.
2. Vérifiez l'email reçu pour confirmer l'inscription.

### Connexion avec OTP
1. Utilisez la route `/api/auth/login` pour vous connecter.
2. Si c'est un nouvel appareil, un OTP sera envoyé à votre email.
3. Vérifiez l'OTP avec la route `/api/auth/verify-otp`.

### Tentatives échouées
1. Faites plusieurs connexions avec des mauvais mots de passe à la route `/api/auth/login`.
2. Après 5 tentatives échouées, le compte sera verrouillé et un email de sécurité sera envoyé.

## Technologies utilisées

- **Node.js** et **Express.js** pour la gestion des routes et de la logique serveur.
- **MongoDB** avec **Mongoose** pour la base de données.
- **JWT** (JSON Web Token) pour la gestion des sessions utilisateurs.
- **Bcrypt.js** pour le hachage des mots de passe.
- **Nodemailer** pour l'envoi d'emails de vérification et d'OTP.
