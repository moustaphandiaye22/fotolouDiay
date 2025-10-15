"use strict";
// Routes des paiements pour FotoLouJay
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesPaiement = void 0;
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_validator_1 = require("express-validator");
exports.routesPaiement = (0, express_1.Router)();
/**
 * @route POST /api/paiements/initier
 * @desc Initier un paiement pour un produit
 * @access Private
 */
exports.routesPaiement.post('/initier', auth_middleware_1.verifierToken, [
    (0, express_validator_1.body)('produitId').isInt({ min: 1 }).withMessage('ID du produit invalide'),
    (0, express_validator_1.body)('montant').isFloat({ min: 0.01 }).withMessage('Montant invalide'),
    (0, express_validator_1.body)('prestataire').isIn(['WAVE', 'ORANGE_MONEY', 'PAYTECH', 'CARTE']).withMessage('Prestataire non supporté'),
    (0, express_validator_1.body)('callbackUrl').optional().isURL().withMessage('URL de callback invalide')
], payment_controller_1.ControleurPaiement.initierPaiement);
/**
 * @route POST /api/paiements/:reference/confirmer
 * @desc Confirmer un paiement (webhook/callback)
 * @access Public (avec vérification de sécurité)
 */
exports.routesPaiement.post('/:reference/confirmer', payment_controller_1.ControleurPaiement.confirmerPaiement);
/**
 * @route POST /api/paiements/:reference/annuler
 * @desc Annuler un paiement
 * @access Private
 */
exports.routesPaiement.post('/:reference/annuler', auth_middleware_1.verifierToken, payment_controller_1.ControleurPaiement.annulerPaiement);
/**
 * @route GET /api/paiements/:reference/statut
 * @desc Obtenir le statut d'un paiement
 * @access Private
 */
exports.routesPaiement.get('/:reference/statut', auth_middleware_1.verifierToken, payment_controller_1.ControleurPaiement.obtenirStatutPaiement);
