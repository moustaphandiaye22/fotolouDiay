"use strict";
// Repository des produits pour FotoLouJay - Pattern Repository
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
exports.RepositoryProduit = void 0;
const client_1 = require("@prisma/client");
const message_1 = require("../enums/message");
const prisma = new client_1.PrismaClient();
class RepositoryProduit {
    /**
     * Créer un nouveau produit
     */
    static creer(donnees) {
        return __awaiter(this, void 0, void 0, function* () {
            const dateExpiration = new Date();
            dateExpiration.setDate(dateExpiration.getDate() + 7); // Expire dans 7 jours
            return yield prisma.produit.create({
                data: Object.assign(Object.assign({}, donnees), { dateExpiration, statut: message_1.StatutProduit.EN_ATTENTE }),
                include: {
                    utilisateur: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            email: true,
                            telephone: true
                        }
                    }
                }
            });
        });
    }
    /**
     * Trouver un produit par ID
     */
    static trouverParId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.produit.findUnique({
                where: { id },
                include: {
                    utilisateur: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            email: true,
                            telephone: true
                        }
                    },
                    vuesProduites: {
                        select: {
                            id: true,
                            dateVue: true
                        }
                    }
                }
            });
        });
    }
    /**
     * Trouver tous les produits avec filtres
     */
    static trouverTous() {
        return __awaiter(this, arguments, void 0, function* (filtres = {}) {
            const { titre, prixMin, prixMax, localisation, categorie, statut, estVip, utilisateurId, recherche, page = 1, limite = 20 } = filtres;
            const skip = (page - 1) * limite;
            // Construction des conditions WHERE
            const where = {};
            if (titre) {
                where.titre = { contains: titre, mode: 'insensitive' };
            }
            if (prixMin !== undefined) {
                where.prix = Object.assign(Object.assign({}, where.prix), { gte: prixMin });
            }
            if (prixMax !== undefined) {
                where.prix = Object.assign(Object.assign({}, where.prix), { lte: prixMax });
            }
            if (localisation) {
                where.localisation = { contains: localisation, mode: 'insensitive' };
            }
            if (categorie) {
                where.categorie = { equals: categorie };
            }
            if (statut) {
                where.statut = statut;
            }
            if (estVip !== undefined) {
                where.estVip = estVip;
            }
            if (utilisateurId) {
                where.utilisateurId = utilisateurId;
            }
            if (recherche) {
                where.OR = [
                    { titre: { contains: recherche } },
                    { description: { contains: recherche } },
                    { localisation: { contains: recherche } },
                    { categorie: { contains: recherche } }
                ];
            }
            // Requête avec pagination
            const [produits, total] = yield Promise.all([
                prisma.produit.findMany({
                    where,
                    include: {
                        utilisateur: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true,
                                email: true,
                                telephone: true
                            }
                        }
                    },
                    orderBy: [
                        { estVip: 'desc' }, // VIP d'abord
                        { dateCreation: 'desc' } // Plus récents ensuite
                    ],
                    skip,
                    take: limite
                }),
                prisma.produit.count({ where })
            ]);
            return {
                produits,
                pagination: {
                    page,
                    limite,
                    total,
                    totalPages: Math.ceil(total / limite)
                }
            };
        });
    }
    /**
     * Mettre à jour un produit
     */
    static mettreAJour(id, donnees) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.produit.update({
                where: { id },
                data: donnees,
                include: {
                    utilisateur: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            email: true,
                            telephone: true
                        }
                    }
                }
            });
        });
    }
    /**
     * Supprimer un produit
     */
    static supprimer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.produit.delete({
                where: { id }
            });
        });
    }
    /**
     * Changer le statut d'un produit
     */
    static changerStatut(id, statut) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.produit.update({
                where: { id },
                data: { statut },
                include: {
                    utilisateur: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            email: true,
                            telephone: true
                        }
                    }
                }
            });
        });
    }
    /**
     * Incrémenter le nombre de vues
     */
    static incrementerVues(id, utilisateurId, adresseIp) {
        return __awaiter(this, void 0, void 0, function* () {
            // Vérifier si cette vue existe déjà pour éviter les doublons
            const vueExistante = yield prisma.vueProduit.findFirst({
                where: Object.assign(Object.assign({ produitId: id }, (utilisateurId && { utilisateurId })), (adresseIp && { adresseIp }))
            });
            if (!vueExistante) {
                // Ajouter la vue
                yield prisma.vueProduit.create({
                    data: {
                        produitId: id,
                        utilisateurId,
                        adresseIp
                    }
                });
                // Incrémenter le compteur de vues
                yield prisma.produit.update({
                    where: { id },
                    data: {
                        vues: {
                            increment: 1
                        }
                    }
                });
            }
        });
    }
    /**
     * Trouver les produits expirés
     */
    static trouverExpires() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.produit.findMany({
                where: {
                    dateExpiration: {
                        lte: new Date()
                    },
                    statut: {
                        not: message_1.StatutProduit.EXPIRE
                    }
                },
                include: {
                    utilisateur: {
                        select: {
                            id: true,
                            nom: true,
                            email: true
                        }
                    }
                }
            });
        });
    }
    /**
     * Trouver les produits qui vont expirer dans X jours
     */
    static trouverQuiVontExpirer() {
        return __awaiter(this, arguments, void 0, function* (joursAvant = 1) {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() + joursAvant);
            return yield prisma.produit.findMany({
                where: {
                    dateExpiration: {
                        lte: dateLimit,
                        gte: new Date()
                    },
                    statut: message_1.StatutProduit.VALIDE
                },
                include: {
                    utilisateur: {
                        select: {
                            id: true,
                            nom: true,
                            email: true
                        }
                    }
                }
            });
        });
    }
    /**
     * Marquer les produits comme expirés
     */
    static marquerCommeExpires(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.produit.updateMany({
                where: {
                    id: {
                        in: ids
                    }
                },
                data: {
                    statut: message_1.StatutProduit.EXPIRE
                }
            });
        });
    }
    /**
     * Obtenir les statistiques des produits
     */
    static obtenirStatistiques(utilisateurId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = utilisateurId ? { utilisateurId } : {};
            const [total, enAttente, valides, rejetes, expires, vip] = yield Promise.all([
                prisma.produit.count({ where }),
                prisma.produit.count({ where: Object.assign(Object.assign({}, where), { statut: message_1.StatutProduit.EN_ATTENTE }) }),
                prisma.produit.count({ where: Object.assign(Object.assign({}, where), { statut: message_1.StatutProduit.VALIDE }) }),
                prisma.produit.count({ where: Object.assign(Object.assign({}, where), { statut: message_1.StatutProduit.REJETE }) }),
                prisma.produit.count({ where: Object.assign(Object.assign({}, where), { statut: message_1.StatutProduit.EXPIRE }) }),
                prisma.produit.count({ where: Object.assign(Object.assign({}, where), { estVip: true }) })
            ]);
            return {
                total,
                enAttente,
                valides,
                rejetes,
                expires,
                vip
            };
        });
    }
}
exports.RepositoryProduit = RepositoryProduit;
