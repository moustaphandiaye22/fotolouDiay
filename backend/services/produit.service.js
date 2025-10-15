"use strict";
// Service des produits pour FotoLouJay
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
exports.ServiceProduit = void 0;
const produit_repository_1 = require("../repositories/produit.repository");
const message_1 = require("../enums/message");
class ServiceProduit {
    /**
     * Créer un nouveau produit
     */
    static creer(donnees) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const produit = yield produit_repository_1.RepositoryProduit.creer(donnees);
                return {
                    success: true,
                    message: message_1.MESSAGES_SUCCES.PRODUIT_CREE,
                    data: { produit }
                };
            }
            catch (error) {
                console.error('Erreur lors de la création du produit:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Obtenir un produit par ID avec gestion des vues
     */
    static obtenirParId(id, utilisateurId, adresseIp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const produit = yield produit_repository_1.RepositoryProduit.trouverParId(id);
                if (!produit) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.PRODUIT_NON_TROUVE
                    };
                }
                // Incrémenter les vues si le produit est validé
                if (produit.statut === message_1.StatutProduit.VALIDE) {
                    yield produit_repository_1.RepositoryProduit.incrementerVues(id, utilisateurId, adresseIp);
                }
                return {
                    success: true,
                    message: 'Produit récupéré avec succès',
                    data: { produit }
                };
            }
            catch (error) {
                console.error('Erreur lors de la récupération du produit:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Obtenir tous les produits avec filtres
     */
    static obtenirTous() {
        return __awaiter(this, arguments, void 0, function* (filtres = {}) {
            try {
                const resultat = yield produit_repository_1.RepositoryProduit.trouverTous(filtres);
                return {
                    success: true,
                    message: 'Produits récupérés avec succès',
                    data: resultat
                };
            }
            catch (error) {
                console.error('Erreur lors de la récupération des produits:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Obtenir les produits publics (validés seulement)
     */
    static obtenirProduitsPublics() {
        return __awaiter(this, arguments, void 0, function* (filtres = {}) {
            try {
                const filtresPublics = Object.assign(Object.assign({}, filtres), { statut: message_1.StatutProduit.VALIDE });
                return yield this.obtenirTous(filtresPublics);
            }
            catch (error) {
                console.error('Erreur lors de la récupération des produits publics:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Obtenir les produits VIP
     */
    static obtenirProduitsVip() {
        return __awaiter(this, arguments, void 0, function* (filtres = {}) {
            try {
                const filtresVip = Object.assign(Object.assign({}, filtres), { estVip: true, statut: message_1.StatutProduit.VALIDE });
                return yield this.obtenirTous(filtresVip);
            }
            catch (error) {
                console.error('Erreur lors de la récupération des produits VIP:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Mettre à jour un produit
     */
    static mettreAJour(id, donnees, utilisateurId, roleUtilisateur) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Vérifier l'existence du produit
                const produitExistant = yield produit_repository_1.RepositoryProduit.trouverParId(id);
                if (!produitExistant) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.PRODUIT_NON_TROUVE
                    };
                }
                // Vérifier les permissions
                const estProprietaire = produitExistant.utilisateurId === utilisateurId;
                const estModerateurOuAdmin = ['MODERATEUR', 'ADMINISTRATEUR'].includes(roleUtilisateur);
                if (!estProprietaire && !estModerateurOuAdmin) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.PRODUIT_NON_AUTORISE
                    };
                }
                // Si l'utilisateur modifie son propre produit, remettre en attente de validation
                if (estProprietaire && !estModerateurOuAdmin) {
                    donnees = Object.assign({}, donnees);
                    // Étendre la date d'expiration de 7 jours
                    const nouvelleExpiration = new Date();
                    nouvelleExpiration.setDate(nouvelleExpiration.getDate() + 7);
                }
                const produitMisAJour = yield produit_repository_1.RepositoryProduit.mettreAJour(id, donnees);
                return {
                    success: true,
                    message: message_1.MESSAGES_SUCCES.PRODUIT_MODIFIE,
                    data: { produit: produitMisAJour }
                };
            }
            catch (error) {
                console.error('Erreur lors de la mise à jour du produit:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Supprimer un produit
     */
    static supprimer(id, utilisateurId, roleUtilisateur) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Vérifier l'existence du produit
                const produit = yield produit_repository_1.RepositoryProduit.trouverParId(id);
                if (!produit) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.PRODUIT_NON_TROUVE
                    };
                }
                // Vérifier les permissions
                const estProprietaire = produit.utilisateurId === utilisateurId;
                const estModerateurOuAdmin = ['MODERATEUR', 'ADMINISTRATEUR'].includes(roleUtilisateur);
                if (!estProprietaire && !estModerateurOuAdmin) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.PRODUIT_NON_AUTORISE
                    };
                }
                yield produit_repository_1.RepositoryProduit.supprimer(id);
                return {
                    success: true,
                    message: message_1.MESSAGES_SUCCES.PRODUIT_SUPPRIME
                };
            }
            catch (error) {
                console.error('Erreur lors de la suppression du produit:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Valider un produit (modérateur/admin)
     */
    static valider(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const produit = yield produit_repository_1.RepositoryProduit.changerStatut(id, message_1.StatutProduit.VALIDE);
                if (!produit) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.PRODUIT_NON_TROUVE
                    };
                }
                return {
                    success: true,
                    message: message_1.MESSAGES_SUCCES.PRODUIT_VALIDE,
                    data: { produit }
                };
            }
            catch (error) {
                console.error('Erreur lors de la validation du produit:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Rejeter un produit (modérateur/admin)
     */
    static rejeter(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const produit = yield produit_repository_1.RepositoryProduit.changerStatut(id, message_1.StatutProduit.REJETE);
                if (!produit) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.PRODUIT_NON_TROUVE
                    };
                }
                return {
                    success: true,
                    message: message_1.MESSAGES_SUCCES.PRODUIT_REJETE,
                    data: { produit }
                };
            }
            catch (error) {
                console.error('Erreur lors du rejet du produit:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Obtenir les statistiques des produits
     */
    static obtenirStatistiques(utilisateurId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const statistiques = yield produit_repository_1.RepositoryProduit.obtenirStatistiques(utilisateurId);
                return {
                    success: true,
                    message: 'Statistiques récupérées avec succès',
                    data: { statistiques }
                };
            }
            catch (error) {
                console.error('Erreur lors de la récupération des statistiques:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Processus de nettoyage automatique des produits expirés
     */
    static nettoyerProduitsExpires() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const produitsExpires = yield produit_repository_1.RepositoryProduit.trouverExpires();
                if (produitsExpires.length > 0) {
                    const ids = produitsExpires.map(p => p.id);
                    yield produit_repository_1.RepositoryProduit.marquerCommeExpires(ids);
                    console.log(`${produitsExpires.length} produits marqués comme expirés`);
                }
            }
            catch (error) {
                console.error('Erreur lors du nettoyage des produits expirés:', error);
            }
        });
    }
    /**
     * Obtenir les produits qui vont expirer pour les notifications
     */
    static obtenirProduitsQuiVontExpirer() {
        return __awaiter(this, arguments, void 0, function* (joursAvant = 1) {
            try {
                return yield produit_repository_1.RepositoryProduit.trouverQuiVontExpirer(joursAvant);
            }
            catch (error) {
                console.error('Erreur lors de la récupération des produits qui vont expirer:', error);
                return [];
            }
        });
    }
}
exports.ServiceProduit = ServiceProduit;
