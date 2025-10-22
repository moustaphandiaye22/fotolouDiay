"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     Produit:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique du produit
 *         titre:
 *           type: string
 *           description: Titre du produit
 *         description:
 *           type: string
 *           description: Description détaillée du produit
 *         prix:
 *           type: number
 *           format: float
 *           description: Prix du produit
 *         categorie:
 *           type: string
 *           description: Catégorie du produit
 *         statut:
 *           type: string
 *           enum: [EN_ATTENTE, VALIDE, REJETE, VENDU]
 *           description: Statut du produit
 *         vip:
 *           type: boolean
 *           description: Indique si le produit est VIP
 *         photo:
 *           type: string
 *           description: URL de la photo principale
 *         photosSupplementaires:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs des photos supplémentaires
 *         utilisateurId:
 *           type: integer
 *           description: ID du vendeur
 *         creeLe:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         misAJourLe:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour
 *     ProduitCreateRequest:
 *       type: object
 *       required:
 *         - titre
 *         - description
 *         - prix
 *         - categorie
 *       properties:
 *         titre:
 *           type: string
 *           description: Titre du produit
 *         description:
 *           type: string
 *           description: Description du produit
 *         prix:
 *           type: number
 *           format: float
 *           description: Prix du produit
 *         categorie:
 *           type: string
 *           description: Catégorie du produit
 *         vip:
 *           type: boolean
 *           default: false
 *           description: Produit VIP
 *         photo:
 *           type: string
 *           format: binary
 *           description: Photo principale (fichier)
 *         photosSupplementaires:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           description: Photos supplémentaires (fichiers)
 *     ProduitUpdateRequest:
 *       type: object
 *       properties:
 *         titre:
 *           type: string
 *           description: Titre du produit
 *         description:
 *           type: string
 *           description: Description du produit
 *         prix:
 *           type: number
 *           format: float
 *           description: Prix du produit
 *         categorie:
 *           type: string
 *           description: Catégorie du produit
 *         vip:
 *           type: boolean
 *           description: Produit VIP
 *         image:
 *           type: string
 *           format: binary
 *           description: Nouvelle image (fichier)
 *     ProduitSearchRequest:
 *       type: object
 *       properties:
 *         q:
 *           type: string
 *           description: Terme de recherche
 *         categorie:
 *           type: string
 *           description: Filtre par catégorie
 *         prixMin:
 *           type: number
 *           format: float
 *           description: Prix minimum
 *         prixMax:
 *           type: number
 *           format: float
 *           description: Prix maximum
 *         statut:
 *           type: string
 *           enum: [EN_ATTENTE, VALIDE, REJETE, VENDU]
 *           description: Filtre par statut
 *         page:
 *           type: integer
 *           default: 1
 *           description: Numéro de page
 *         limit:
 *           type: integer
 *           default: 10
 *           description: Nombre d'éléments par page
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesProduit = void 0;
// Routes des produits pour FotoLouJay
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
 * @swagger
 * /api/produits/recherche:
 *   get:
 *     summary: Rechercher des produits avec filtres avancés
 *     tags: [Produits]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: categorie
 *         schema:
 *           type: string
 *         description: Filtre par catégorie
 *       - in: query
 *         name: prixMin
 *         schema:
 *           type: number
 *           format: float
 *         description: Prix minimum
 *       - in: query
 *         name: prixMax
 *         schema:
 *           type: number
 *           format: float
 *         description: Prix maximum
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Produits trouvés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Produit'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Erreur serveur
 */
exports.routesProduit.get('/recherche', auth_middleware_1.authentificationOptionnelle, produit_controller_1.ControleurProduit.rechercherProduits);
/**
 * @swagger
 * /api/produits/publics:
 *   get:
 *     summary: Récupérer tous les produits publics validés
 *     tags: [Produits]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Produits publics récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Produit'
 *       500:
 *         description: Erreur serveur
 */
exports.routesProduit.get('/publics', auth_middleware_1.authentificationOptionnelle, produit_controller_1.ControleurProduit.obtenirProduitsPublics);
/**
 * @swagger
 * /api/produits/vip:
 *   get:
 *     summary: Récupérer les produits VIP
 *     tags: [Produits]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Produits VIP récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Produit'
 *       500:
 *         description: Erreur serveur
 */
exports.routesProduit.get('/vip', auth_middleware_1.authentificationOptionnelle, produit_controller_1.ControleurProduit.obtenirProduitsVip);
/**
 * @swagger
 * /api/produits/statistiques:
 *   get:
 *     summary: Récupérer les statistiques des produits
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalProduits:
 *                       type: integer
 *                       description: Nombre total de produits
 *                     produitsValides:
 *                       type: integer
 *                       description: Nombre de produits validés
 *                     produitsEnAttente:
 *                       type: integer
 *                       description: Nombre de produits en attente
 *                     produitsVendus:
 *                       type: integer
 *                       description: Nombre de produits vendus
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
exports.routesProduit.get('/statistiques', auth_middleware_1.verifierToken, produit_controller_1.ControleurProduit.obtenirStatistiques);
/**
 * @swagger
 * /api/produits/mes-produits:
 *   get:
 *     summary: Récupérer les produits de l'utilisateur connecté
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Produits de l'utilisateur récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Produit'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
exports.routesProduit.get('/mes-produits', auth_middleware_1.verifierToken, produit_controller_1.ControleurProduit.obtenirMesProduits);
/**
 * @swagger
 * /api/produits:
 *   post:
 *     summary: Créer un nouveau produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProduitCreateRequest'
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Produit'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 *   get:
 *     summary: Récupérer tous les produits (Modérateur/Admin uniquement)
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [EN_ATTENTE, VALIDE, REJETE, VENDU]
 *         description: Filtre par statut
 *     responses:
 *       200:
 *         description: Produits récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Produit'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
exports.routesProduit.post('/', auth_middleware_1.verifierToken, upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'photosSupplementaires', maxCount: 7 }
]), auth_validator_1.validationProduit, produit_controller_1.ControleurProduit.creer);
exports.routesProduit.get('/', auth_middleware_1.verifierToken, (0, auth_middleware_1.verifierRole)(message_1.RoleUtilisateur.MODERATEUR, message_1.RoleUtilisateur.ADMINISTRATEUR), produit_controller_1.ControleurProduit.obtenirTous);
/**
 * @swagger
 * /api/produits/{id}:
 *   get:
 *     summary: Récupérer un produit par ID
 *     tags: [Produits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Produit'
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur serveur
 */
exports.routesProduit.get('/:id', auth_middleware_1.authentificationOptionnelle, produit_controller_1.ControleurProduit.obtenirParId);
/**
 * @swagger
 * /api/produits/{id}:
 *   put:
 *     summary: Mettre à jour un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProduitUpdateRequest'
 *     responses:
 *       200:
 *         description: Produit mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Produit'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur serveur
 */
exports.routesProduit.put('/:id', auth_middleware_1.verifierToken, upload.single('image'), auth_validator_1.validationMiseAJourProduit, produit_controller_1.ControleurProduit.mettreAJour);
/**
 * @swagger
 * /api/produits/{id}:
 *   delete:
 *     summary: Supprimer un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
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
 *                   example: "Produit supprimé avec succès"
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur serveur
 */
exports.routesProduit.delete('/:id', auth_middleware_1.verifierToken, produit_controller_1.ControleurProduit.supprimer);
/**
 * @swagger
 * /api/produits/{id}/valider:
 *   put:
 *     summary: Valider un produit (Modérateur/Admin uniquement)
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit validé avec succès
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
 *                   example: "Produit validé avec succès"
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur serveur
 */
exports.routesProduit.put('/:id/valider', auth_middleware_1.verifierToken, (0, auth_middleware_1.verifierRole)(message_1.RoleUtilisateur.MODERATEUR, message_1.RoleUtilisateur.ADMINISTRATEUR), produit_controller_1.ControleurProduit.valider);
/**
 * @swagger
 * /api/produits/{id}/rejeter:
 *   put:
 *     summary: Rejeter un produit (Modérateur/Admin uniquement)
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit rejeté avec succès
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
 *                   example: "Produit rejeté avec succès"
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur serveur
 */
exports.routesProduit.put('/:id/rejeter', auth_middleware_1.verifierToken, (0, auth_middleware_1.verifierRole)(message_1.RoleUtilisateur.MODERATEUR, message_1.RoleUtilisateur.ADMINISTRATEUR), produit_controller_1.ControleurProduit.rejeter);
