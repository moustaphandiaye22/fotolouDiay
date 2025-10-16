"use strict";
// Routes des produits pour FotoLouJay
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesProduit = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const produit_controller_1 = require("../controllers/produit.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const message_1 = require("../enums/message");
const auth_validator_1 = require("../validators/auth.validator");
exports.routesProduit = (0, express_1.Router)();
// Configuration de multer pour les photos capturées UNIQUEMENT
const stockage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/produits/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, `produit-${uniqueSuffix}.${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage: stockage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
        files: 8 // Max 8 fichiers (1 principale + 7 supplémentaires)
    },
    fileFilter: (req, file, cb) => {
        // Types autorisés pour photos capturées uniquement
        const typesAutorises = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!typesAutorises.includes(file.mimetype)) {
            return cb(new Error('Format non autorisé. Utilisez uniquement l\'appareil photo (JPEG/PNG).'));
        }
        console.log('🔒 Upload sécurisé accepté:', {
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            sourceType: req.body.sourceType
        });
        cb(null, true);
    }
});
/**
 * @route GET /api/produits/recherche
 * @desc Rechercher des produits avec filtres
 * @access Public
 */
exports.routesProduit.get('/recherche', auth_middleware_1.authentificationOptionnelle, produit_controller_1.ControleurProduit.rechercherProduits);
/**
 * @route GET /api/produits/publics
 * @desc Récupérer tous les produits publics (validés)
 * @access Public
 */
exports.routesProduit.get('/publics', auth_middleware_1.authentificationOptionnelle, produit_controller_1.ControleurProduit.obtenirProduitsPublics);
/**
 * @route GET /api/produits/vip
 * @desc Récupérer les produits VIP
 * @access Public
 */
exports.routesProduit.get('/vip', auth_middleware_1.authentificationOptionnelle, produit_controller_1.ControleurProduit.obtenirProduitsVip);
/**
 * @route GET /api/produits/statistiques
 * @desc Récupérer les statistiques des produits (vendeurs voient leurs propres statistiques)
 * @access Private (Tous les utilisateurs connectés)
 */
exports.routesProduit.get('/statistiques', auth_middleware_1.verifierToken, produit_controller_1.ControleurProduit.obtenirStatistiques);
/**
 * @route GET /api/produits/mes-produits
 * @desc Récupérer les produits de l'utilisateur connecté (vendeurs peuvent voir leurs produits)
 * @access Private (Tous les utilisateurs connectés)
 */
exports.routesProduit.get('/mes-produits', auth_middleware_1.verifierToken, produit_controller_1.ControleurProduit.obtenirMesProduits);
/**
 * @route POST /api/produits
 * @desc Créer un nouveau produit avec photos capturées uniquement - SÉCURISÉ
 * @access Private
 */
exports.routesProduit.post('/', auth_middleware_1.verifierToken, upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'photosSupplementaires', maxCount: 7 }
]), auth_validator_1.validationProduit, produit_controller_1.ControleurProduit.creer);
/**
 * @route GET /api/produits
 * @desc Récupérer tous les produits (avec filtres) - Pour modérateurs/admins
 * @access Private (Modérateur/Admin)
 */
exports.routesProduit.get('/', auth_middleware_1.verifierToken, (0, auth_middleware_1.verifierRole)(message_1.RoleUtilisateur.MODERATEUR, message_1.RoleUtilisateur.ADMINISTRATEUR), produit_controller_1.ControleurProduit.obtenirTous);
/**
 * @route GET /api/produits/:id
 * @desc Récupérer un produit par ID
 * @access Public avec authentification optionnelle
 */
exports.routesProduit.get('/:id', auth_middleware_1.authentificationOptionnelle, produit_controller_1.ControleurProduit.obtenirParId);
/**
 * @route PUT /api/produits/:id
 * @desc Mettre à jour un produit
 * @access Private (Propriétaire ou Modérateur/Admin)
 */
exports.routesProduit.put('/:id', auth_middleware_1.verifierToken, upload.single('image'), auth_validator_1.validationMiseAJourProduit, produit_controller_1.ControleurProduit.mettreAJour);
/**
 * @route DELETE /api/produits/:id
 * @desc Supprimer un produit
 * @access Private (Propriétaire ou Modérateur/Admin)
 */
exports.routesProduit.delete('/:id', auth_middleware_1.verifierToken, produit_controller_1.ControleurProduit.supprimer);
/**
 * @route PUT /api/produits/:id/valider
 * @desc Valider un produit
 * @access Private (Modérateur/Admin)
 */
exports.routesProduit.put('/:id/valider', auth_middleware_1.verifierToken, (0, auth_middleware_1.verifierRole)(message_1.RoleUtilisateur.MODERATEUR, message_1.RoleUtilisateur.ADMINISTRATEUR), produit_controller_1.ControleurProduit.valider);
/**
 * @route PUT /api/produits/:id/rejeter
 * @desc Rejeter un produit
 * @access Private (Modérateur/Admin)
 */
exports.routesProduit.put('/:id/rejeter', auth_middleware_1.verifierToken, (0, auth_middleware_1.verifierRole)(message_1.RoleUtilisateur.MODERATEUR, message_1.RoleUtilisateur.ADMINISTRATEUR), produit_controller_1.ControleurProduit.rejeter);
