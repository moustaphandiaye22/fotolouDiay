"use strict";
// Routes des notifications pour FotoLouJay
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesNotification = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const message_1 = require("../enums/message");
exports.routesNotification = (0, express_1.Router)();
/**
 * @route GET /api/notifications
 * @desc Récupérer les notifications de l'utilisateur connecté
 * @access Private
 */
exports.routesNotification.get('/', auth_middleware_1.verifierToken, (req, res) => {
    res.json({ message: 'Notifications utilisateur - À implémenter' });
});
/**
 * @route POST /api/notifications
 * @desc Créer une nouvelle notification
 * @access Private (Admin/Modérateur)
 */
exports.routesNotification.post('/', auth_middleware_1.verifierToken, (0, auth_middleware_1.verifierRole)(message_1.RoleUtilisateur.MODERATEUR, message_1.RoleUtilisateur.ADMINISTRATEUR), (req, res) => {
    res.json({ message: 'Création notification - À implémenter' });
});
/**
 * @route PUT /api/notifications/:id/lire
 * @desc Marquer une notification comme lue
 * @access Private
 */
exports.routesNotification.put('/:id/lire', auth_middleware_1.verifierToken, (req, res) => {
    res.json({ message: 'Marquer notification lue - À implémenter' });
});
/**
 * @route DELETE /api/notifications/:id
 * @desc Supprimer une notification
 * @access Private
 */
exports.routesNotification.delete('/:id', auth_middleware_1.verifierToken, (req, res) => {
    res.json({ message: 'Suppression notification - À implémenter' });
});
