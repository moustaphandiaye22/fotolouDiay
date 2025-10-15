"use strict";
// Contrôleur des paiements pour FotoLouJay
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
exports.ControleurPaiement = void 0;
const express_validator_1 = require("express-validator");
const payment_service_1 = require("../services/payment.service");
const payment_enum_1 = require("../enums/payment.enum");
const message_1 = require("../enums/message");
class ControleurPaiement {
    /**
     * Initier un paiement
     */
    static initierPaiement(req, res) {
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
                const { produitId, montant, prestataire, callbackUrl, metadata } = req.body;
                // Validation des données
                if (!produitId || !montant || !prestataire) {
                    return res.status(400).json({
                        success: false,
                        message: 'Données de paiement incomplètes'
                    });
                }
                // Vérifier que le prestataire est valide
                const prestatairesValides = Object.values(payment_enum_1.PrestatairePaiement);
                if (!prestatairesValides.includes(prestataire)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Prestataire de paiement non supporté'
                    });
                }
                const donneesPaiement = {
                    produitId: parseInt(produitId),
                    utilisateurId,
                    montant: parseFloat(montant),
                    prestataire,
                    callbackUrl,
                    metadata
                };
                const resultat = yield payment_service_1.ServicePaiement.initierPaiement(donneesPaiement);
                const statusCode = resultat.success ? 200 : 400;
                return res.status(statusCode).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurPaiement.initierPaiement:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Confirmer un paiement (webhook/callback)
     */
    static confirmerPaiement(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { reference } = req.params;
                const donneesConfirmation = req.body;
                if (!reference) {
                    return res.status(400).json({
                        success: false,
                        message: 'Référence de paiement manquante'
                    });
                }
                const result = yield payment_service_1.ServicePaiement.confirmerPaiement(reference, donneesConfirmation);
                const statusCode = result.success ? 200 : 400;
                return res.status(statusCode).json(result);
            }
            catch (error) {
                console.error('Erreur dans ControleurPaiement.confirmerPaiement:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Annuler un paiement
     */
    static annulerPaiement(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { reference } = req.params;
                if (!reference) {
                    return res.status(400).json({
                        success: false,
                        message: 'Référence de paiement manquante'
                    });
                }
                const success = yield payment_service_1.ServicePaiement.annulerPaiement(reference);
                if (success) {
                    return res.status(200).json({
                        success: true,
                        message: 'Paiement annulé avec succès'
                    });
                }
                else {
                    return res.status(404).json({
                        success: false,
                        message: 'Paiement non trouvé'
                    });
                }
            }
            catch (error) {
                console.error('Erreur dans ControleurPaiement.annulerPaiement:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Obtenir le statut d'un paiement
     */
    static obtenirStatutPaiement(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { reference } = req.params;
                const utilisateurId = (_a = req.utilisateur) === null || _a === void 0 ? void 0 : _a.id;
                if (!reference) {
                    return res.status(400).json({
                        success: false,
                        message: 'Référence de paiement manquante'
                    });
                }
                const resultat = yield payment_service_1.ServicePaiement.obtenirStatutPaiement(reference);
                const statusCode = resultat.success ? 200 : 404;
                return res.status(statusCode).json(resultat);
            }
            catch (error) {
                console.error('Erreur dans ControleurPaiement.obtenirStatutPaiement:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
}
exports.ControleurPaiement = ControleurPaiement;
