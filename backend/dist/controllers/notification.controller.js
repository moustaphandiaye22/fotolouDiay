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
exports.ControleurNotification = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ControleurNotification {
    static obtenirNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const utilisateurId = req.utilisateur.id;
                const notifications = yield prisma.notification.findMany({
                    where: {
                        utilisateurId
                    },
                    orderBy: {
                        dateCreation: 'desc'
                    }
                });
                res.json({
                    success: true,
                    message: 'Notifications récupérées avec succès',
                    data: notifications
                });
            }
            catch (error) {
                console.error('Erreur lors de la récupération des notifications:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération des notifications',
                    error: error.message
                });
            }
        });
    }
    static creerNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { utilisateurId, titre, message, type } = req.body;
                if (!utilisateurId || !titre || !message) {
                    return res.status(400).json({
                        success: false,
                        message: 'Utilisateur, titre et message sont requis'
                    });
                }
                const notification = yield prisma.notification.create({
                    data: {
                        utilisateurId,
                        titre,
                        message,
                        type: type || 'GENERALE'
                    }
                });
                res.status(201).json({
                    success: true,
                    message: 'Notification créée avec succès',
                    data: notification
                });
            }
            catch (error) {
                console.error('Erreur lors de la création de la notification:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la création de la notification',
                    error: error.message
                });
            }
        });
    }
    static marquerCommeLue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notificationId = parseInt(req.params.id);
                const utilisateurId = req.utilisateur.id;
                const notification = yield prisma.notification.findFirst({
                    where: {
                        id: notificationId,
                        utilisateurId
                    }
                });
                if (!notification) {
                    return res.status(404).json({
                        success: false,
                        message: 'Notification non trouvée'
                    });
                }
                const notificationMiseAJour = yield prisma.notification.update({
                    where: { id: notificationId },
                    data: { estLue: true }
                });
                res.json({
                    success: true,
                    message: 'Notification marquée comme lue',
                    data: notificationMiseAJour
                });
            }
            catch (error) {
                console.error('Erreur lors de la mise à jour de la notification:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la mise à jour de la notification',
                    error: error.message
                });
            }
        });
    }
    static supprimerNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notificationId = parseInt(req.params.id);
                const utilisateurId = req.utilisateur.id;
                const notification = yield prisma.notification.findFirst({
                    where: {
                        id: notificationId,
                        utilisateurId
                    }
                });
                if (!notification) {
                    return res.status(404).json({
                        success: false,
                        message: 'Notification non trouvée'
                    });
                }
                yield prisma.notification.delete({
                    where: { id: notificationId }
                });
                res.json({
                    success: true,
                    message: 'Notification supprimée avec succès'
                });
            }
            catch (error) {
                console.error('Erreur lors de la suppression de la notification:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la suppression de la notification',
                    error: error.message
                });
            }
        });
    }
    static obtenirNombreNonLues(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const utilisateurId = req.utilisateur.id;
                const count = yield prisma.notification.count({
                    where: {
                        utilisateurId,
                        estLue: false
                    }
                });
                res.json({
                    success: true,
                    message: 'Nombre de notifications non lues récupéré',
                    data: { count }
                });
            }
            catch (error) {
                console.error('Erreur lors du comptage des notifications:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors du comptage des notifications',
                    error: error.message
                });
            }
        });
    }
}
exports.ControleurNotification = ControleurNotification;
