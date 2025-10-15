"use strict";
// Service de paiement pour FotoLouJay
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
exports.ServicePaiement = void 0;
const app_1 = require("../app");
const message_1 = require("../enums/message");
class ServicePaiement {
    /**
     * Initier un paiement
     */
    static initierPaiement(donnees) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Vérifier que le produit existe et est valide
                const produit = yield app_1.prisma.produit.findUnique({
                    where: { id: donnees.produitId }
                });
                if (!produit) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.PRODUIT_NON_TROUVE
                    };
                }
                if (produit.statut !== 'VALIDE') {
                    return {
                        success: false,
                        message: 'Le produit n\'est pas disponible pour l\'achat'
                    };
                }
                // Vérifier que l'utilisateur n'est pas le propriétaire du produit
                if (produit.utilisateurId === donnees.utilisateurId) {
                    return {
                        success: false,
                        message: 'Vous ne pouvez pas acheter votre propre produit'
                    };
                }
                // Générer une référence unique
                const reference = this.genererReferencePaiement();
                // Calculer la date d'expiration (30 minutes)
                const dateExpiration = new Date();
                dateExpiration.setMinutes(dateExpiration.getMinutes() + 30);
                // Créer le paiement en base avec statut EN_ATTENTE
                const paiement = yield app_1.prisma.paiement.create({
                    data: {
                        reference,
                        montant: donnees.montant,
                        prestataire: donnees.prestataire,
                        utilisateurId: donnees.utilisateurId,
                        produitId: donnees.produitId,
                        statut: 'EN_ATTENTE',
                        dateExpiration,
                        metadata: donnees.metadata || {}
                    }
                });
                // Traiter le paiement selon le prestataire
                const resultatTraitement = yield this.traiterPaiement(paiement, donnees);
                if (!resultatTraitement.success) {
                    // Annuler le paiement si le traitement échoue
                    yield app_1.prisma.paiement.update({
                        where: { id: paiement.id },
                        data: { statut: 'ECHEC' }
                    });
                    return {
                        success: false,
                        message: resultatTraitement.message
                    };
                }
                // Mettre à jour le paiement avec les informations de traitement (reste EN_ATTENTE)
                yield app_1.prisma.paiement.update({
                    where: { id: paiement.id },
                    data: {
                        metadata: Object.assign(Object.assign({}, paiement.metadata), { redirectUrl: resultatTraitement.redirectUrl, paymentReference: resultatTraitement.paymentReference })
                    }
                });
                return {
                    success: true,
                    message: message_1.MESSAGES_SUCCES.PAIEMENT_INITIE,
                    data: {
                        paiementId: paiement.id,
                        reference: paiement.reference,
                        redirectUrl: resultatTraitement.redirectUrl,
                        paymentReference: resultatTraitement.paymentReference
                    }
                };
            }
            catch (error) {
                console.error('Erreur dans ServicePaiement.initierPaiement:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Traiter le paiement selon le prestataire
     */
    static traiterPaiement(paiement, donnees) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                switch (paiement.prestataire) {
                    case 'WAVE':
                        return yield this.traiterPaiementWave(paiement, donnees);
                    case 'ORANGE_MONEY':
                        return yield this.traiterPaiementOrangeMoney(paiement, donnees);
                    case 'PAYTECH':
                        return yield this.traiterPaiementPayTech(paiement, donnees);
                    case 'CARTE':
                        return yield this.traiterPaiementCarte(paiement, donnees);
                    default:
                        return {
                            success: false,
                            message: 'Prestataire de paiement non supporté'
                        };
                }
            }
            catch (error) {
                console.error('Erreur dans traiterPaiement:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Traiter paiement Wave (simulé)
     */
    static traiterPaiementWave(paiement, donnees) {
        return __awaiter(this, void 0, void 0, function* () {
            // Simulation d'un appel à l'API Wave
            const paymentReference = `WAVE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Simuler une URL de redirection Wave
            const redirectUrl = `https://wave.ci/pay?ref=${paymentReference}&amount=${paiement.montant}`;
            return {
                success: true,
                message: 'Paiement Wave initié',
                redirectUrl,
                paymentReference
            };
        });
    }
    /**
     * Traiter paiement Orange Money (simulé)
     */
    static traiterPaiementOrangeMoney(paiement, donnees) {
        return __awaiter(this, void 0, void 0, function* () {
            // Simulation d'un appel à l'API Orange Money
            const paymentReference = `OM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Simuler une URL de redirection Orange Money
            const redirectUrl = `https://orange-money.ci/pay?ref=${paymentReference}&amount=${paiement.montant}`;
            return {
                success: true,
                message: 'Paiement Orange Money initié',
                redirectUrl,
                paymentReference
            };
        });
    }
    /**
     * Traiter paiement PayTech (simulé)
     */
    static traiterPaiementPayTech(paiement, donnees) {
        return __awaiter(this, void 0, void 0, function* () {
            // Simulation d'un appel à l'API PayTech
            const paymentReference = `PT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Simuler une URL de redirection PayTech
            const redirectUrl = `https://paytech.sn/pay?ref=${paymentReference}&amount=${paiement.montant}`;
            return {
                success: true,
                message: 'Paiement PayTech initié',
                redirectUrl,
                paymentReference
            };
        });
    }
    /**
     * Traiter paiement par carte (simulé)
     */
    static traiterPaiementCarte(paiement, donnees) {
        return __awaiter(this, void 0, void 0, function* () {
            // Simulation d'un appel à une API de paiement par carte
            const paymentReference = `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Simuler une URL de redirection pour le paiement par carte
            const redirectUrl = `https://payment-gateway.com/pay?ref=${paymentReference}&amount=${paiement.montant}`;
            return {
                success: true,
                message: 'Paiement par carte initié',
                redirectUrl,
                paymentReference
            };
        });
    }
    /**
     * Confirmer un paiement
     */
    static confirmerPaiement(reference, donneesConfirmation) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paiement = yield app_1.prisma.paiement.findUnique({
                    where: { reference },
                    include: { utilisateur: true, produit: true }
                });
                if (!paiement) {
                    return { success: false, message: 'Paiement non trouvé' };
                }
                if (paiement.statut === 'CONFIRME') {
                    return { success: true, message: 'Paiement déjà confirmé' };
                }
                if (paiement.statut !== 'EN_ATTENTE') {
                    return { success: false, message: 'Paiement ne peut pas être confirmé' };
                }
                // Mettre à jour le statut du paiement
                yield app_1.prisma.paiement.update({
                    where: { id: paiement.id },
                    data: { statut: 'CONFIRME' }
                });
                // Créer une transaction de débit
                yield app_1.prisma.transaction.create({
                    data: {
                        paiementId: paiement.id,
                        type: 'DEBIT',
                        montant: paiement.montant,
                        statut: 'SUCCES',
                        referenceExterne: donneesConfirmation === null || donneesConfirmation === void 0 ? void 0 : donneesConfirmation.referenceExterne,
                        details: donneesConfirmation
                    }
                });
                // Créer une transaction de crédit pour le vendeur (simulé)
                yield app_1.prisma.transaction.create({
                    data: {
                        paiementId: paiement.id,
                        type: 'CREDIT',
                        montant: paiement.montant * 0.95, // 5% de commission
                        statut: 'SUCCES',
                        details: { commission: paiement.montant * 0.05 }
                    }
                });
                // TODO: Envoyer des notifications aux utilisateurs
                // TODO: Mettre à jour le statut du produit si nécessaire
                return { success: true, message: 'Paiement confirmé avec succès' };
            }
            catch (error) {
                console.error('Erreur dans confirmerPaiement:', error);
                return { success: false, message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR };
            }
        });
    }
    /**
     * Annuler un paiement
     */
    static annulerPaiement(reference) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paiement = yield app_1.prisma.paiement.findUnique({
                    where: { reference }
                });
                if (!paiement) {
                    return false;
                }
                if (paiement.statut !== 'EN_ATTENTE') {
                    return false;
                }
                // Mettre à jour le statut du paiement
                yield app_1.prisma.paiement.update({
                    where: { id: paiement.id },
                    data: { statut: 'ANNULE' }
                });
                // Créer une transaction d'annulation
                yield app_1.prisma.transaction.create({
                    data: {
                        paiementId: paiement.id,
                        type: 'REMBOURSEMENT',
                        montant: paiement.montant,
                        statut: 'SUCCES',
                        details: { reason: 'Annulation par l\'utilisateur' }
                    }
                });
                return true;
            }
            catch (error) {
                console.error('Erreur dans annulerPaiement:', error);
                return false;
            }
        });
    }
    /**
     * Obtenir le statut d'un paiement
     */
    static obtenirStatutPaiement(reference) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paiement = yield app_1.prisma.paiement.findUnique({
                    where: { reference },
                    include: {
                        utilisateur: { select: { id: true, nom: true, prenom: true } },
                        produit: { select: { id: true, titre: true, prix: true } },
                        transactions: true
                    }
                });
                if (!paiement) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.PAIEMENT_NON_TROUVE
                    };
                }
                return {
                    success: true,
                    message: 'Statut du paiement récupéré',
                    data: {
                        reference: paiement.reference,
                        statut: paiement.statut,
                        montant: paiement.montant,
                        prestataire: paiement.prestataire,
                        dateCreation: paiement.dateCreation,
                        dateExpiration: paiement.dateExpiration,
                        utilisateur: paiement.utilisateur,
                        produit: paiement.produit,
                        transactions: paiement.transactions
                    }
                };
            }
            catch (error) {
                console.error('Erreur dans obtenirStatutPaiement:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Générer une référence de paiement unique
     */
    static genererReferencePaiement() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `PAY-${timestamp}-${random}`.toUpperCase();
    }
}
exports.ServicePaiement = ServicePaiement;
