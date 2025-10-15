"use strict";
// Contrôleur d'authentification pour FotoLouJay
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControleurAuth = void 0;
const express_validator_1 = require("express-validator");
const auth_service_1 = require("../services/auth.service");
const message_1 = require("../enums/message");
class ControleurAuth {
    /**
     * Inscription d'un nouvel utilisateur
     */
    static inscrire(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Vérification des erreurs de validation
                const erreurs = (0, express_validator_1.validationResult)(req);
                if (!erreurs.isEmpty()) {
                    return res.status(400).json({
                        success: false,
                        message: 'Erreurs de validation',
                        erreurs: erreurs.array()
                    });
                }
                const { nom, prenom, email, telephone, motDePasse } = req.body;
                const resultat = yield auth_service_1.ServiceAuth.inscrire({
                    nom,
                    prenom,
                    email,
                    telephone,
                    motDePasse
                });
                const statusCode = resultat.success ? 201 : 400;
                return res.status(statusCode).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurAuth.inscrire:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Connexion d'un utilisateur
     */
    static connecter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Vérification des erreurs de validation
                const erreurs = (0, express_validator_1.validationResult)(req);
                if (!erreurs.isEmpty()) {
                    return res.status(400).json({
                        success: false,
                        message: 'Erreurs de validation',
                        erreurs: erreurs.array()
                    });
                }
                const { email, motDePasse } = req.body;
                const resultat = yield auth_service_1.ServiceAuth.connecter({
                    email,
                    motDePasse
                });
                const statusCode = resultat.success ? 200 : 401;
                return res.status(statusCode).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurAuth.connecter:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Vérification du token (pour valider une session)
     */
    static verifierToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return res.status(401).json({
                        success: false,
                        message: message_1.MESSAGES_ERREUR.TOKEN_INVALIDE
                    });
                }
                const token = authHeader.substring(7);
                const resultat = yield auth_service_1.ServiceAuth.verifierToken(token);
                if (!resultat.valide) {
                    return res.status(401).json({
                        success: false,
                        message: message_1.MESSAGES_ERREUR.TOKEN_INVALIDE
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: 'Token valide',
                    data: {
                        utilisateur: resultat.utilisateur
                    }
                });
            }
            catch (error) {
                console.error('Erreur dans ControleurAuth.verifierToken:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Changement de mot de passe
     */
    static changerMotDePasse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Vérification des erreurs de validation
                const erreurs = (0, express_validator_1.validationResult)(req);
                if (!erreurs.isEmpty()) {
                    return res.status(400).json({
                        success: false,
                        message: 'Erreurs de validation',
                        erreurs: erreurs.array()
                    });
                }
                const utilisateurId = (_a = req.utilisateur) === null || _a === void 0 ? void 0 : _a.id;
                if (!utilisateurId) {
                    return res.status(401).json({
                        success: false,
                        message: message_1.MESSAGES_ERREUR.TOKEN_INVALIDE
                    });
                }
                const { ancienMotDePasse, nouveauMotDePasse } = req.body;
                const resultat = yield auth_service_1.ServiceAuth.changerMotDePasse(utilisateurId, ancienMotDePasse, nouveauMotDePasse);
                const statusCode = resultat.success ? 200 : 400;
                return res.status(statusCode).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurAuth.changerMotDePasse:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Déconnexion (côté client, pas besoin de logique serveur pour JWT)
     */
    static deconnecter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return res.status(200).json({
                    success: true,
                    message: 'Déconnexion réussie. Veuillez supprimer le token côté client.'
                });
            }
            catch (error) {
                console.error('Erreur dans ControleurAuth.deconnecter:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Récupération du profil utilisateur connecté
     */
    static obtenirProfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const utilisateur = req.utilisateur;
                if (!utilisateur) {
                    return res.status(401).json({
                        success: false,
                        message: message_1.MESSAGES_ERREUR.TOKEN_INVALIDE
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: 'Profil récupéré avec succès',
                    data: {
                        utilisateur
                    }
                });
            }
            catch (error) {
                console.error('Erreur dans ControleurAuth.obtenirProfil:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
}
exports.ControleurAuth = ControleurAuth;
