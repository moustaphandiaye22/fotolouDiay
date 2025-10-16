"use strict";
// Routes des utilisateurs pour FotoLouJay
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesUtilisateur = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const message_1 = require("../enums/message");
const utilisateur_controller_1 = require("../controllers/utilisateur.controller");
exports.routesUtilisateur = (0, express_1.Router)();
/**
 * @route GET /api/utilisateurs
 * @desc Récupérer tous les utilisateurs
 * @access Private (Admin et Modérateur)
 */
exports.routesUtilisateur.get('/', auth_middleware_1.verifierToken, (0, auth_middleware_1.verifierRole)(message_1.RoleUtilisateur.ADMINISTRATEUR, message_1.RoleUtilisateur.MODERATEUR), utilisateur_controller_1.ControleurUtilisateur.obtenirTous);
/**
 * @route GET /api/utilisateurs/:id
 * @desc Récupérer un utilisateur par ID
 * @access Private (Admin ou Propriétaire)
 */
exports.routesUtilisateur.get('/:id', auth_middleware_1.verifierToken, (req, res) => {
    res.json({ message: 'Détails utilisateur - À implémenter' });
});
/**
 * @route PUT /api/utilisateurs/:id
 * @desc Mettre à jour un utilisateur
 * @access Private (Propriétaire)
 */
exports.routesUtilisateur.put('/:id', auth_middleware_1.verifierToken, (req, res) => {
    res.json({ message: 'Mise à jour utilisateur - À implémenter' });
});
/**
 * @route PUT /api/utilisateurs/:id/statut
 * @desc Changer le statut d'un utilisateur (activer/désactiver)
 * @access Private (Admin)
 */
exports.routesUtilisateur.put('/:id/statut', auth_middleware_1.verifierToken, (0, auth_middleware_1.verifierRole)(message_1.RoleUtilisateur.ADMINISTRATEUR), utilisateur_controller_1.ControleurUtilisateur.changerStatut);
/**
 * @route DELETE /api/utilisateurs/:id
 * @desc Supprimer un utilisateur
 * @access Private (Admin)
 */
exports.routesUtilisateur.delete('/:id', auth_middleware_1.verifierToken, (0, auth_middleware_1.verifierRole)(message_1.RoleUtilisateur.ADMINISTRATEUR), (req, res) => {
    res.json({ message: 'Suppression utilisateur - À implémenter' });
});
