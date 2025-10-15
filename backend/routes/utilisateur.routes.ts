// Routes des utilisateurs pour FotoLouJay

import { Router } from 'express';
import { verifierToken, verifierRole } from '../middlewares/auth.middleware';
import { RoleUtilisateur } from '../enums/message';

export const routesUtilisateur = Router();

/**
 * @route GET /api/utilisateurs
 * @desc Récupérer tous les utilisateurs
 * @access Private (Admin)
 */
routesUtilisateur.get(
  '/',
  verifierToken,
  verifierRole(RoleUtilisateur.ADMINISTRATEUR),
  (req, res) => {
    res.json({ message: 'Liste des utilisateurs - À implémenter' });
  }
);

/**
 * @route GET /api/utilisateurs/:id
 * @desc Récupérer un utilisateur par ID
 * @access Private (Admin ou Propriétaire)
 */
routesUtilisateur.get('/:id', verifierToken, (req, res) => {
  res.json({ message: 'Détails utilisateur - À implémenter' });
});

/**
 * @route PUT /api/utilisateurs/:id
 * @desc Mettre à jour un utilisateur
 * @access Private (Propriétaire)
 */
routesUtilisateur.put('/:id', verifierToken, (req, res) => {
  res.json({ message: 'Mise à jour utilisateur - À implémenter' });
});

/**
 * @route DELETE /api/utilisateurs/:id
 * @desc Supprimer un utilisateur
 * @access Private (Admin)
 */
routesUtilisateur.delete(
  '/:id',
  verifierToken,
  verifierRole(RoleUtilisateur.ADMINISTRATEUR),
  (req, res) => {
    res.json({ message: 'Suppression utilisateur - À implémenter' });
  }
);