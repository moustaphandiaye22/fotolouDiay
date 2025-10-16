"use strict";
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
exports.ContactController = void 0;
const client_1 = require("@prisma/client");
const contact_enum_1 = require("../enums/contact.enum");
const prisma = new client_1.PrismaClient();
class ContactController {
    // Créer un nouveau message de contact
    static createContactMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nom, email, telephone, sujet, message, produitId, vendeurId, captcha } = req.body;
                // Validation basique
                if (!nom || !email || !sujet || !message) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tous les champs obligatoires doivent être remplis.'
                    });
                    // Validation email
                }
                // Validation email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Format d\'email invalide.'
                    });
                }
                // TODO: Validation CAPTCHA (à implémenter selon le service choisi)
                // Créer le message de contact
                const contactMessage = yield prisma.contactMessage.create({
                    data: {
                        nom,
                        email,
                        telephone,
                        sujet,
                        message,
                        produitId: produitId ? parseInt(produitId) : null,
                        vendeurId: vendeurId ? parseInt(vendeurId) : null,
                        // captcha, // Temporairement désactivé - à implémenter avec un service de captcha approprié
                        statut: contact_enum_1.ContactStatus.EN_ATTENTE
                    },
                    include: {
                        produit: {
                            select: {
                                id: true,
                                titre: true
                            }
                        },
                        vendeur: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true
                            }
                        }
                    }
                });
                res.status(201).json({
                    success: true,
                    message: 'Message envoyé avec succès.',
                    data: contactMessage
                });
            }
            catch (error) {
                console.error('Erreur lors de la création du message de contact:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur.'
                });
            }
        });
    }
    // Récupérer tous les messages de contact (admin/modérateur)
    static getContactMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 20, statut } = req.query;
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const offset = (pageNum - 1) * limitNum;
                const where = {};
                if (statut) {
                    where.statut = statut;
                }
                const [messages, total] = yield Promise.all([
                    prisma.contactMessage.findMany({
                        where,
                        include: {
                            produit: {
                                select: {
                                    id: true,
                                    titre: true
                                }
                            },
                            vendeur: {
                                select: {
                                    id: true,
                                    nom: true,
                                    prenom: true
                                }
                            }
                        },
                        orderBy: {
                            dateCreation: 'desc'
                        },
                        skip: offset,
                        take: limitNum
                    }),
                    prisma.contactMessage.count({ where })
                ]);
                res.json({
                    success: true,
                    data: messages,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        pages: Math.ceil(total / limitNum)
                    }
                });
            }
            catch (error) {
                console.error('Erreur lors de la récupération des messages:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur.'
                });
            }
        });
    }
    // Récupérer les statistiques des contacts
    static getContactStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const stats = yield prisma.contactMessage.groupBy({
                    by: ['statut'],
                    _count: {
                        id: true
                    }
                });
                const total = yield prisma.contactMessage.count();
                const formattedStats = {
                    total,
                    enAttente: ((_a = stats.find(s => s.statut === contact_enum_1.ContactStatus.EN_ATTENTE)) === null || _a === void 0 ? void 0 : _a._count.id) || 0,
                    traites: ((_b = stats.find(s => s.statut === contact_enum_1.ContactStatus.TRAITE)) === null || _b === void 0 ? void 0 : _b._count.id) || 0,
                    ignores: ((_c = stats.find(s => s.statut === contact_enum_1.ContactStatus.IGNORE)) === null || _c === void 0 ? void 0 : _c._count.id) || 0
                };
                res.json({
                    success: true,
                    data: formattedStats
                });
            }
            catch (error) {
                console.error('Erreur lors de la récupération des statistiques:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur.'
                });
            }
        });
    }
    // Marquer un message comme traité
    static markAsProcessed(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const message = yield prisma.contactMessage.update({
                    where: { id: parseInt(id) },
                    data: { statut: contact_enum_1.ContactStatus.TRAITE },
                    include: {
                        produit: {
                            select: {
                                id: true,
                                titre: true
                            }
                        },
                        vendeur: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true
                            }
                        }
                    }
                });
                res.json({
                    success: true,
                    message: 'Message marqué comme traité.',
                    data: message
                });
            }
            catch (error) {
                console.error('Erreur lors de la mise à jour du message:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur.'
                });
            }
        });
    }
    // Marquer un message comme ignoré
    static markAsIgnored(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const message = yield prisma.contactMessage.update({
                    where: { id: parseInt(id) },
                    data: { statut: contact_enum_1.ContactStatus.IGNORE },
                    include: {
                        produit: {
                            select: {
                                id: true,
                                titre: true
                            }
                        },
                        vendeur: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true
                            }
                        }
                    }
                });
                res.json({
                    success: true,
                    message: 'Message marqué comme ignoré.',
                    data: message
                });
            }
            catch (error) {
                console.error('Erreur lors de la mise à jour du message:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur.'
                });
            }
        });
    }
}
exports.ContactController = ContactController;
