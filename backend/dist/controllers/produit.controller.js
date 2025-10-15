"use strict";
// Contrôleur des produits pour FotoLouJay
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
exports.ControleurProduit = void 0;
const express_validator_1 = require("express-validator");
const produit_service_1 = require("../services/produit.service");
const message_1 = require("../enums/message");
class ControleurProduit {
    /**
     * Créer un nouveau produit
     */
    static creer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
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
                // Vérification de la présence d'une image (file upload ou photo capturée)
                const filesObj = req.files;
                const photoFile = ((_b = filesObj === null || filesObj === void 0 ? void 0 : filesObj.photo) === null || _b === void 0 ? void 0 : _b[0]) || ((_c = filesObj === null || filesObj === void 0 ? void 0 : filesObj.photosSupplementaires) === null || _c === void 0 ? void 0 : _c[0]);
                if (!req.file && !req.body.imageUrl && !photoFile) {
                    return res.status(400).json({
                        success: false,
                        message: message_1.MESSAGES_ERREUR.IMAGE_REQUISE
                    });
                }
                // Support des deux formats : ancien (titre) et nouveau (nom)
                const { titre, nom, description, prix, localisation, estVip, sourceType, securityLevel } = req.body;
                const imageUrl = (photoFile === null || photoFile === void 0 ? void 0 : photoFile.path) || ((_d = req.file) === null || _d === void 0 ? void 0 : _d.path) || req.body.imageUrl || '';
                const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:${process.env.PORT || 2025}/${imageUrl}`;
                const donneesProduit = {
                    titre: titre || nom,
                    description,
                    prix: parseFloat(prix),
                    imageUrl: fullImageUrl,
                    imagePublicId: req.body.imagePublicId,
                    localisation,
                    estVip: estVip === 'true' || estVip === true,
                    utilisateurId,
                    sourceType: sourceType || 'camera_capture_only',
                    securityLevel: securityLevel || 'authenticated_photos'
                };
                const resultat = yield produit_service_1.ServiceProduit.creer(donneesProduit);
                const statusCode = resultat.success ? 201 : 400;
                return res.status(statusCode).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurProduit.creer:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Obtenir tous les produits (avec filtres)
     */
    static obtenirTous(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { statut, estVip, utilisateurId, recherche, categorie, page = '1', limite = '20' } = req.query;
                const filtres = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (statut && { statut: statut })), (estVip !== undefined && { estVip: estVip === 'true' })), (utilisateurId && { utilisateurId: parseInt(utilisateurId) })), (recherche && { recherche: recherche })), (categorie && { categorie: categorie })), { page: parseInt(page), limite: parseInt(limite) });
                const resultat = yield produit_service_1.ServiceProduit.obtenirTous(filtres);
                return res.status(200).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurProduit.obtenirTous:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Rechercher des produits avec filtres avancés
     */
    static rechercherProduits(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { recherche, categorie, localisation, prixMin, prixMax, estVip, page = '1', limite = '20' } = req.query;
                const filtres = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (recherche && { recherche: recherche })), (categorie && { categorie: categorie })), (localisation && { localisation: localisation })), (prixMin && { prixMin: parseFloat(prixMin) })), (prixMax && { prixMax: parseFloat(prixMax) })), (estVip !== undefined && { estVip: estVip === 'true' })), { page: parseInt(page), limite: parseInt(limite) });
                const resultat = yield produit_service_1.ServiceProduit.rechercherProduits(filtres);
                return res.status(200).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurProduit.rechercherProduits:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Obtenir les produits publics (pour les utilisateurs non connectés)
     */
    static obtenirProduitsPublics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { estVip, recherche, categorie, page = '1', limite = '20' } = req.query;
                const filtres = Object.assign(Object.assign(Object.assign(Object.assign({}, (estVip !== undefined && { estVip: estVip === 'true' })), (recherche && { recherche: recherche })), (categorie && { categorie: categorie })), { page: parseInt(page), limite: parseInt(limite) });
                const resultat = yield produit_service_1.ServiceProduit.obtenirProduitsPublics(filtres);
                return res.status(200).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurProduit.obtenirProduitsPublics:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Obtenir les produits VIP
     */
    static obtenirProduitsVip(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { recherche, categorie, page = '1', limite = '20' } = req.query;
                const filtres = Object.assign(Object.assign(Object.assign({}, (recherche && { recherche: recherche })), (categorie && { categorie: categorie })), { page: parseInt(page), limite: parseInt(limite) });
                const resultat = yield produit_service_1.ServiceProduit.obtenirProduitsVip(filtres);
                return res.status(200).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurProduit.obtenirProduitsVip:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Obtenir un produit par ID
     */
    static obtenirParId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = parseInt(req.params.id);
                const utilisateurId = (_a = req.utilisateur) === null || _a === void 0 ? void 0 : _a.id;
                const adresseIp = req.ip;
                const resultat = yield produit_service_1.ServiceProduit.obtenirParId(id, utilisateurId, adresseIp);
                const statusCode = resultat.success ? 200 : 404;
                return res.status(statusCode).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurProduit.obtenirParId:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Mettre à jour un produit
     */
    static mettreAJour(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
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
                const id = parseInt(req.params.id);
                const utilisateurId = (_a = req.utilisateur) === null || _a === void 0 ? void 0 : _a.id;
                const roleUtilisateur = (_b = req.utilisateur) === null || _b === void 0 ? void 0 : _b.role;
                if (!utilisateurId || !roleUtilisateur) {
                    return res.status(401).json({
                        success: false,
                        message: message_1.MESSAGES_ERREUR.TOKEN_INVALIDE
                    });
                }
                const { titre, description, prix, localisation, estVip, imageUrl, imagePublicId } = req.body;
                const donneesMiseAJour = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (titre && { titre })), (description && { description })), (prix && { prix: parseFloat(prix) })), (localisation !== undefined && { localisation })), (estVip !== undefined && { estVip: estVip === 'true' || estVip === true })), (imageUrl && { imageUrl })), (imagePublicId && { imagePublicId }));
                const resultat = yield produit_service_1.ServiceProduit.mettreAJour(id, donneesMiseAJour, utilisateurId, roleUtilisateur);
                const statusCode = resultat.success ? 200 : (resultat.message === message_1.MESSAGES_ERREUR.PRODUIT_NON_TROUVE ? 404 : 403);
                return res.status(statusCode).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurProduit.mettreAJour:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Supprimer un produit
     */
    static supprimer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const id = parseInt(req.params.id);
                const utilisateurId = (_a = req.utilisateur) === null || _a === void 0 ? void 0 : _a.id;
                const roleUtilisateur = (_b = req.utilisateur) === null || _b === void 0 ? void 0 : _b.role;
                if (!utilisateurId || !roleUtilisateur) {
                    return res.status(401).json({
                        success: false,
                        message: message_1.MESSAGES_ERREUR.TOKEN_INVALIDE
                    });
                }
                const resultat = yield produit_service_1.ServiceProduit.supprimer(id, utilisateurId, roleUtilisateur);
                const statusCode = resultat.success ? 200 : (resultat.message === message_1.MESSAGES_ERREUR.PRODUIT_NON_TROUVE ? 404 : 403);
                return res.status(statusCode).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurProduit.supprimer:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Valider un produit (modérateur/admin)
     */
    static valider(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const resultat = yield produit_service_1.ServiceProduit.valider(id);
                const statusCode = resultat.success ? 200 : 404;
                return res.status(statusCode).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurProduit.valider:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Rejeter un produit (modérateur/admin)
     */
    static rejeter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const resultat = yield produit_service_1.ServiceProduit.rejeter(id);
                const statusCode = resultat.success ? 200 : 404;
                return res.status(statusCode).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurProduit.rejeter:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Obtenir les produits de l'utilisateur connecté
     */
    static obtenirMesProduits(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const utilisateurId = (_a = req.utilisateur) === null || _a === void 0 ? void 0 : _a.id;
                if (!utilisateurId) {
                    return res.status(401).json({
                        success: false,
                        message: message_1.MESSAGES_ERREUR.TOKEN_INVALIDE
                    });
                }
                const { statut, page = '1', limite = '20' } = req.query;
                const filtres = Object.assign(Object.assign({ utilisateurId }, (statut && { statut: statut })), { page: parseInt(page), limite: parseInt(limite) });
                const resultat = yield produit_service_1.ServiceProduit.obtenirTous(filtres);
                return res.status(200).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurProduit.obtenirMesProduits:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Obtenir les statistiques des produits
     */
    static obtenirStatistiques(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const utilisateurId = (_a = req.utilisateur) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.utilisateur) === null || _b === void 0 ? void 0 : _b.role;
                // Seuls les modérateurs/admins peuvent voir toutes les statistiques
                const idUtilisateur = (role === message_1.RoleUtilisateur.MODERATEUR || role === message_1.RoleUtilisateur.ADMINISTRATEUR)
                    ? undefined
                    : utilisateurId;
                const resultat = yield produit_service_1.ServiceProduit.obtenirStatistiques(idUtilisateur);
                return res.status(200).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurProduit.obtenirStatistiques:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
}
exports.ControleurProduit = ControleurProduit;
