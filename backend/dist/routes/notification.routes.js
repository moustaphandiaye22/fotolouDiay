"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique de la notification
 *         titre:
 *           type: string
 *           description: Titre de la notification
 *         message:
 *           type: string
 *           description: Contenu de la notification
 *         type:
 *           type: string
 *           enum: [INFO, SUCCESS, WARNING, ERROR]
 *           description: Type de notification
 *         lue:
 *           type: boolean
 *           description: Statut de lecture
 *         utilisateurId:
 *           type: integer
 *           description: ID de l'utilisateur destinataire
 *         creeLe:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         misAJourLe:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesNotification = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const message_1 = require("../enums/message");
const notification_controller_1 = require("../controllers/notification.controller");
exports.routesNotification = (0, express_1.Router)();
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Récupérer les notifications de l'utilisateur connecté
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
exports.routesNotification.get('/', auth_middleware_1.verifierToken, notification_controller_1.ControleurNotification.obtenirNotifications);
/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Créer une nouvelle notification (Modérateur/Admin uniquement)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - message
 *               - utilisateurId
 *             properties:
 *               titre:
 *                 type: string
 *                 description: Titre de la notification
 *               message:
 *                 type: string
 *                 description: Contenu de la notification
 *               type:
 *                 type: string
 *                 enum: [INFO, SUCCESS, WARNING, ERROR]
 *                 default: INFO
 *                 description: Type de notification
 *               utilisateurId:
 *                 type: integer
 *                 description: ID de l'utilisateur destinataire
 *     responses:
 *       201:
 *         description: Notification créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
exports.routesNotification.post('/', auth_middleware_1.verifierToken, (0, auth_middleware_1.verifierRole)(message_1.RoleUtilisateur.MODERATEUR, message_1.RoleUtilisateur.ADMINISTRATEUR), notification_controller_1.ControleurNotification.creerNotification);
/**
 * @swagger
 * /api/notifications/non-lus/count:
 *   get:
 *     summary: Obtenir le nombre de notifications non lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de notifications non lues récupéré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       description: Nombre de notifications non lues
 *                       example: 5
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
exports.routesNotification.get('/non-lus/count', auth_middleware_1.verifierToken, notification_controller_1.ControleurNotification.obtenirNombreNonLues);
/**
 * @swagger
 * /api/notifications/{id}/lire:
 *   put:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification marquée comme lue"
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Notification non trouvée
 *       500:
 *         description: Erreur serveur
 */
exports.routesNotification.put('/:id/lire', auth_middleware_1.verifierToken, notification_controller_1.ControleurNotification.marquerCommeLue);
/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Supprimer une notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification supprimée"
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Notification non trouvée
 *       500:
 *         description: Erreur serveur
 */
exports.routesNotification.delete('/:id', auth_middleware_1.verifierToken, notification_controller_1.ControleurNotification.supprimerNotification);
