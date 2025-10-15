// Routes d'authentification pour FotoLouJay

import { Router } from 'express';
import { ControleurAuth } from '../controllers/auth.controller';
import { verifierToken } from '../middlewares/auth.middleware';
import { 
  validationInscription, 
  validationConnexion, 
  validationChangementMotDePasse 
} from '../validators/auth.validator';

export const routesAuth = Router();

/**
 * @route POST /api/auth/inscription
 * @desc Inscription d'un nouvel utilisateur
 * @access Public
 */
routesAuth.post('/inscription', validationInscription, ControleurAuth.inscrire);

/**
 * @route POST /api/auth/connexion
 * @desc Connexion d'un utilisateur
 * @access Public
 */
routesAuth.post('/connexion', validationConnexion, ControleurAuth.connecter);

/**
 * @route GET /api/auth/verifier-token
 * @desc Vérification de la validité du token
 * @access Public
 */
routesAuth.get('/verifier-token', ControleurAuth.verifierToken);

/**
 * @route POST /api/auth/deconnexion
 * @desc Déconnexion (suppression côté client)
 * @access Private
 */
routesAuth.post('/deconnexion', verifierToken, ControleurAuth.deconnecter);

/**
 * @route GET /api/auth/profil
 * @desc Récupération du profil utilisateur connecté
 * @access Private
 */
routesAuth.get('/profil', verifierToken, ControleurAuth.obtenirProfil);

/**
 * @route PUT /api/auth/changer-mot-de-passe
 * @desc Changement de mot de passe
 * @access Private
 */
routesAuth.put('/changer-mot-de-passe', verifierToken, validationChangementMotDePasse, ControleurAuth.changerMotDePasse);