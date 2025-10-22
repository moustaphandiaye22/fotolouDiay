"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique de l'utilisateur
 *         nom:
 *           type: string
 *           description: Nom de l'utilisateur
 *         prenom:
 *           type: string
 *           description: Prénom de l'utilisateur
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email de l'utilisateur
 *         telephone:
 *           type: string
 *           description: Numéro de téléphone
 *         role:
 *           type: string
 *           enum: [CLIENT, VENDEUR, MODERATEUR, ADMINISTRATEUR]
 *           description: Rôle de l'utilisateur
 *         actif:
 *           type: boolean
 *           description: Statut actif de l'utilisateur
 *         creeLe:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         misAJourLe:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - motDePasse
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email de l'utilisateur
 *         motDePasse:
 *           type: string
 *           format: password
 *           description: Mot de passe de l'utilisateur
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - nom
 *         - prenom
 *         - email
 *         - motDePasse
 *         - telephone
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom de l'utilisateur
 *         prenom:
 *           type: string
 *           description: Prénom de l'utilisateur
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email de l'utilisateur
 *         motDePasse:
 *           type: string
 *           format: password
 *           description: Mot de passe de l'utilisateur
 *         telephone:
 *           type: string
 *           description: Numéro de téléphone
 *         role:
 *           type: string
 *           enum: [CLIENT, VENDEUR]
 *           default: CLIENT
 *           description: Rôle souhaité
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - ancienMotDePasse
 *         - nouveauMotDePasse
 *       properties:
 *         ancienMotDePasse:
 *           type: string
 *           format: password
 *           description: Ancien mot de passe
 *         nouveauMotDePasse:
 *           type: string
 *           format: password
 *           description: Nouveau mot de passe
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Connexion réussie"
 *         data:
 *           type: object
 *           properties:
 *             utilisateur:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *               description: Token JWT d'authentification
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesAuth = void 0;
// Routes d'authentification pour FotoLouJay
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_validator_1 = require("../validators/auth.validator");
exports.routesAuth = (0, express_1.Router)();
/**
 * @swagger
 * /api/auth/inscription:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *       500:
 *         description: Erreur serveur
 */
exports.routesAuth.post('/inscription', auth_validator_1.validationInscription, auth_controller_1.ControleurAuth.inscrire);
/**
 * @swagger
 * /api/auth/connexion:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Email ou mot de passe incorrect
 *       401:
 *         description: Compte désactivé
 *       500:
 *         description: Erreur serveur
 */
exports.routesAuth.post('/connexion', auth_validator_1.validationConnexion, auth_controller_1.ControleurAuth.connecter);
/**
 * @swagger
 * /api/auth/verifier-token:
 *   get:
 *     summary: Vérification de la validité du token
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Token valide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token valide"
 *       401:
 *         description: Token invalide ou expiré
 *       500:
 *         description: Erreur serveur
 */
exports.routesAuth.get('/verifier-token', auth_controller_1.ControleurAuth.verifierToken);
/**
 * @swagger
 * /api/auth/deconnexion:
 *   post:
 *     summary: Déconnexion d'un utilisateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie"
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
exports.routesAuth.post('/deconnexion', auth_middleware_1.verifierToken, auth_controller_1.ControleurAuth.deconnecter);
/**
 * @swagger
 * /api/auth/profil:
 *   get:
 *     summary: Récupération du profil utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
exports.routesAuth.get('/profil', auth_middleware_1.verifierToken, auth_controller_1.ControleurAuth.obtenirProfil);
/**
 * @swagger
 * /api/auth/changer-mot-de-passe:
 *   put:
 *     summary: Changement de mot de passe
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mot de passe changé avec succès"
 *       400:
 *         description: Ancien mot de passe incorrect
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
exports.routesAuth.put('/changer-mot-de-passe', auth_middleware_1.verifierToken, auth_validator_1.validationChangementMotDePasse, auth_controller_1.ControleurAuth.changerMotDePasse);
