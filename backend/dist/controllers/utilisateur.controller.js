"use strict";
// Contrôleur des utilisateurs pour FotoLouJay
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
exports.ControleurUtilisateur = void 0;
const client_1 = require("@prisma/client");
const message_1 = require("../enums/message");
const prisma = new client_1.PrismaClient();
class ControleurUtilisateur {
    /**
     * Obtenir tous les utilisateurs (Admin et Modérateur)
     */
    static obtenirTous(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = '1', limite = '20', role, estActif } = req.query;
                const filtres = {};
                if (role) {
                    filtres.role = role;
                }
                if (estActif !== undefined) {
                    filtres.estActif = estActif === 'true';
                }
                const pageNum = parseInt(page);
                const limiteNum = parseInt(limite);
                const skip = (pageNum - 1) * limiteNum;
                const [utilisateurs, total] = yield Promise.all([
                    prisma.utilisateur.findMany({
                        where: filtres,
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            email: true,
                            telephone: true,
                            role: true,
                            estActif: true,
                            dateCreation: true,
                            dateModification: true,
                            _count: {
                                select: {
                                    produits: true
                                }
                            }
                        },
                        orderBy: {
                            dateCreation: 'desc'
                        },
                        skip,
                        take: limiteNum
                    }),
                    prisma.utilisateur.count({ where: filtres })
                ]);
                const totalPages = Math.ceil(total / limiteNum);
                return res.status(200).json({
                    success: true,
                    data: {
                        utilisateurs,
                        pagination: {
                            page: pageNum,
                            limite: limiteNum,
                            total,
                            totalPages
                        }
                    }
                });
            }
            catch (error) {
                console.error('Erreur dans ControleurUtilisateur.obtenirTous:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Obtenir un utilisateur par ID
     */
    static obtenirParId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const id = parseInt(req.params.id);
                const utilisateurId = (_a = req.utilisateur) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.utilisateur) === null || _b === void 0 ? void 0 : _b.role;
                // Vérifier les permissions
                if (role !== message_1.RoleUtilisateur.ADMINISTRATEUR && role !== message_1.RoleUtilisateur.MODERATEUR && utilisateurId !== id) {
                    return res.status(403).json({
                        success: false,
                        message: message_1.MESSAGES_ERREUR.ACCES_REFUSE
                    });
                }
                const utilisateur = yield prisma.utilisateur.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        telephone: true,
                        role: true,
                        estActif: true,
                        dateCreation: true,
                        dateModification: true,
                        _count: {
                            select: {
                                produits: true
                            }
                        }
                    }
                });
                if (!utilisateur) {
                    return res.status(404).json({
                        success: false,
                        message: message_1.MESSAGES_ERREUR.UTILISATEUR_NON_TROUVE
                    });
                }
                return res.status(200).json({
                    success: true,
                    data: utilisateur
                });
            }
            catch (error) {
                console.error('Erreur dans ControleurUtilisateur.obtenirParId:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Mettre à jour un utilisateur
     */
    static mettreAJour(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const id = parseInt(req.params.id);
                const utilisateurId = (_a = req.utilisateur) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.utilisateur) === null || _b === void 0 ? void 0 : _b.role;
                // Vérifier les permissions
                if (role !== message_1.RoleUtilisateur.ADMINISTRATEUR && utilisateurId !== id) {
                    return res.status(403).json({
                        success: false,
                        message: message_1.MESSAGES_ERREUR.ACCES_REFUSE
                    });
                }
                const { nom, prenom, telephone, role: nouveauRole } = req.body;
                const donneesMiseAJour = {
                    nom,
                    prenom,
                    telephone,
                    dateModification: new Date()
                };
                // Seuls les admins peuvent changer les rôles
                if (role === message_1.RoleUtilisateur.ADMINISTRATEUR && nouveauRole) {
                    donneesMiseAJour.role = nouveauRole;
                }
                const utilisateur = yield prisma.utilisateur.update({
                    where: { id },
                    data: donneesMiseAJour,
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        telephone: true,
                        role: true,
                        estActif: true,
                        dateCreation: true,
                        dateModification: true
                    }
                });
                return res.status(200).json({
                    success: true,
                    data: utilisateur,
                    message: 'Utilisateur mis à jour avec succès'
                });
            }
            catch (error) {
                console.error('Erreur dans ControleurUtilisateur.mettreAJour:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Activer/Désactiver un utilisateur (Admin seulement)
     */
    static changerStatut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const { estActif } = req.body;
                const utilisateur = yield prisma.utilisateur.update({
                    where: { id },
                    data: {
                        estActif,
                        dateModification: new Date()
                    },
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        role: true,
                        estActif: true,
                        dateModification: true
                    }
                });
                return res.status(200).json({
                    success: true,
                    data: utilisateur,
                    message: `Utilisateur ${estActif ? 'activé' : 'désactivé'} avec succès`
                });
            }
            catch (error) {
                console.error('Erreur dans ControleurUtilisateur.changerStatut:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
    /**
     * Supprimer un utilisateur (Admin seulement)
     */
    static supprimer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                // Vérifier si l'utilisateur a des produits
                const produitsCount = yield prisma.produit.count({
                    where: { utilisateurId: id }
                });
                if (produitsCount > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Impossible de supprimer un utilisateur qui a des produits'
                    });
                }
                yield prisma.utilisateur.delete({
                    where: { id }
                });
                return res.status(200).json({
                    success: true,
                    message: 'Utilisateur supprimé avec succès'
                });
            }
            catch (error) {
                console.error('Erreur dans ControleurUtilisateur.supprimer:', error);
                return res.status(500).json({
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                });
            }
        });
    }
}
exports.ControleurUtilisateur = ControleurUtilisateur;
