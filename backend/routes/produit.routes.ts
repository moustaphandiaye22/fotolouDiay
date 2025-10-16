// Routes des produits pour FotoLouJay

import { Router } from 'express';
import multer from 'multer';
import { ControleurProduit } from '../controllers/produit.controller';
import { 
  verifierToken, 
  verifierRole, 
  authentificationOptionnelle,
  verifierProprieteProduit 
} from '../middlewares/auth.middleware';
import { 
  validerSecuritePhotos, 
  loggerSecurite 
} from '../middlewares/security.middleware';
import { RoleUtilisateur } from '../enums/message';
import { 
  validationProduit, 
  validationMiseAJourProduit 
} from '../validators/auth.validator';

export const routesProduit = Router();

// Configuration de multer pour les photos capturées UNIQUEMENT
const stockage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/produits/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `produit-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({
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
routesProduit.get('/recherche', authentificationOptionnelle, ControleurProduit.rechercherProduits);

/**
 * @route GET /api/produits/publics
 * @desc Récupérer tous les produits publics (validés)
 * @access Public
 */
routesProduit.get('/publics', authentificationOptionnelle, ControleurProduit.obtenirProduitsPublics);

/**
 * @route GET /api/produits/vip
 * @desc Récupérer les produits VIP
 * @access Public
 */
routesProduit.get('/vip', authentificationOptionnelle, ControleurProduit.obtenirProduitsVip);

/**
 * @route GET /api/produits/statistiques
 * @desc Récupérer les statistiques des produits (vendeurs voient leurs propres statistiques)
 * @access Private (Tous les utilisateurs connectés)
 */
routesProduit.get('/statistiques', verifierToken, ControleurProduit.obtenirStatistiques);

/**
 * @route GET /api/produits/mes-produits
 * @desc Récupérer les produits de l'utilisateur connecté (vendeurs peuvent voir leurs produits)
 * @access Private (Tous les utilisateurs connectés)
 */
routesProduit.get('/mes-produits', verifierToken, ControleurProduit.obtenirMesProduits);

/**
 * @route POST /api/produits
 * @desc Créer un nouveau produit avec photos capturées uniquement - SÉCURISÉ
 * @access Private
 */
routesProduit.post(
  '/',
  verifierToken,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'photosSupplementaires', maxCount: 7 }
  ]),
  validationProduit,
  ControleurProduit.creer
);

/**
 * @route GET /api/produits
 * @desc Récupérer tous les produits (avec filtres) - Pour modérateurs/admins
 * @access Private (Modérateur/Admin)
 */
routesProduit.get(
  '/',
  verifierToken,
  verifierRole(RoleUtilisateur.MODERATEUR, RoleUtilisateur.ADMINISTRATEUR),
  ControleurProduit.obtenirTous
);

/**
 * @route GET /api/produits/:id
 * @desc Récupérer un produit par ID
 * @access Public avec authentification optionnelle
 */
routesProduit.get('/:id', authentificationOptionnelle, ControleurProduit.obtenirParId);

/**
 * @route PUT /api/produits/:id
 * @desc Mettre à jour un produit
 * @access Private (Propriétaire ou Modérateur/Admin)
 */
routesProduit.put(
  '/:id',
  verifierToken,
  upload.single('image'),
  validationMiseAJourProduit,
  ControleurProduit.mettreAJour
);

/**
 * @route DELETE /api/produits/:id
 * @desc Supprimer un produit
 * @access Private (Propriétaire ou Modérateur/Admin)
 */
routesProduit.delete('/:id', verifierToken, ControleurProduit.supprimer);

/**
 * @route PUT /api/produits/:id/valider
 * @desc Valider un produit
 * @access Private (Modérateur/Admin)
 */
routesProduit.put(
  '/:id/valider',
  verifierToken,
  verifierRole(RoleUtilisateur.MODERATEUR, RoleUtilisateur.ADMINISTRATEUR),
  ControleurProduit.valider
);

/**
 * @route PUT /api/produits/:id/rejeter
 * @desc Rejeter un produit
 * @access Private (Modérateur/Admin)
 */
routesProduit.put(
  '/:id/rejeter',
  verifierToken,
  verifierRole(RoleUtilisateur.MODERATEUR, RoleUtilisateur.ADMINISTRATEUR),
  ControleurProduit.rejeter
);