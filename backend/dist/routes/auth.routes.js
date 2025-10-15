"use strict";
// Routes d'authentification pour FotoLouJay
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesAuth = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_validator_1 = require("../validators/auth.validator");
exports.routesAuth = (0, express_1.Router)();
/**
 * @route POST /api/auth/inscription
 * @desc Inscription d'un nouvel utilisateur
 * @access Public
 */
exports.routesAuth.post('/inscription', auth_validator_1.validationInscription, auth_controller_1.ControleurAuth.inscrire);
/**
 * @route POST /api/auth/connexion
 * @desc Connexion d'un utilisateur
 * @access Public
 */
exports.routesAuth.post('/connexion', auth_validator_1.validationConnexion, auth_controller_1.ControleurAuth.connecter);
/**
 * @route GET /api/auth/verifier-token
 * @desc Vérification de la validité du token
 * @access Public
 */
exports.routesAuth.get('/verifier-token', auth_controller_1.ControleurAuth.verifierToken);
/**
 * @route POST /api/auth/deconnexion
 * @desc Déconnexion (suppression côté client)
 * @access Private
 */
exports.routesAuth.post('/deconnexion', auth_middleware_1.verifierToken, auth_controller_1.ControleurAuth.deconnecter);
/**
 * @route GET /api/auth/profil
 * @desc Récupération du profil utilisateur connecté
 * @access Private
 */
exports.routesAuth.get('/profil', auth_middleware_1.verifierToken, auth_controller_1.ControleurAuth.obtenirProfil);
/**
 * @route PUT /api/auth/changer-mot-de-passe
 * @desc Changement de mot de passe
 * @access Private
 */
exports.routesAuth.put('/changer-mot-de-passe', auth_middleware_1.verifierToken, auth_validator_1.validationChangementMotDePasse, auth_controller_1.ControleurAuth.changerMotDePasse);
