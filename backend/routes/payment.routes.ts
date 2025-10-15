// Routes des paiements pour FotoLouJay

import { Router } from 'express';
import { ControleurPaiement } from '../controllers/payment.controller';
import { verifierToken } from '../middlewares/auth.middleware';
import { body } from 'express-validator';

export const routesPaiement = Router();

/**
 * @route POST /api/paiements/initier
 * @desc Initier un paiement pour un produit
 * @access Private
 */
routesPaiement.post(
  '/initier',
  verifierToken,
  [
    body('produitId').isInt({ min: 1 }).withMessage('ID du produit invalide'),
    body('montant').isFloat({ min: 0.01 }).withMessage('Montant invalide'),
    body('prestataire').isIn(['WAVE', 'ORANGE_MONEY', 'PAYTECH', 'CARTE']).withMessage('Prestataire non supporté'),
    body('callbackUrl').optional().isURL().withMessage('URL de callback invalide')
  ],
  ControleurPaiement.initierPaiement
);

/**
 * @route POST /api/paiements/:reference/confirmer
 * @desc Confirmer un paiement (webhook/callback)
 * @access Public (avec vérification de sécurité)
 */
routesPaiement.post(
  '/:reference/confirmer',
  ControleurPaiement.confirmerPaiement
);

/**
 * @route POST /api/paiements/:reference/annuler
 * @desc Annuler un paiement
 * @access Private
 */
routesPaiement.post(
  '/:reference/annuler',
  verifierToken,
  ControleurPaiement.annulerPaiement
);

/**
 * @route GET /api/paiements/:reference/statut
 * @desc Obtenir le statut d'un paiement
 * @access Private
 */
routesPaiement.get(
  '/:reference/statut',
  verifierToken,
  ControleurPaiement.obtenirStatutPaiement
);
