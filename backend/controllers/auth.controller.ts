// Contrôleur d'authentification pour FotoLouJay

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ServiceAuth } from '../services/auth.service';
import { MESSAGES_ERREUR } from '../enums/message';

export class ControleurAuth {
  /**
   * Inscription d'un nouvel utilisateur
   */
  static async inscrire(req: Request, res: Response) {
    try {
      // Vérification des erreurs de validation
      const erreurs = validationResult(req);
      if (!erreurs.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Erreurs de validation',
          erreurs: erreurs.array()
        });
      }

      const { nom, prenom, email, telephone, motDePasse, role } = req.body;

      const resultat = await ServiceAuth.inscrire({
        nom,
        prenom,
        email,
        telephone,
        motDePasse,
        role
      });

      const statusCode = resultat.success ? 201 : 400;
      return res.status(statusCode).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurAuth.inscrire:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  static async connecter(req: Request, res: Response) {
    try {
      // Vérification des erreurs de validation
      const erreurs = validationResult(req);
      if (!erreurs.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Erreurs de validation',
          erreurs: erreurs.array()
        });
      }

      const { email, motDePasse } = req.body;

      const resultat = await ServiceAuth.connecter({
        email,
        motDePasse
      });

      const statusCode = resultat.success ? 200 : 401;
      return res.status(statusCode).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurAuth.connecter:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Vérification du token (pour valider une session)
   */
  static async verifierToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: MESSAGES_ERREUR.TOKEN_INVALIDE
        });
      }

      const token = authHeader.substring(7);
      const resultat = await ServiceAuth.verifierToken(token);

      if (!resultat.valide) {
        return res.status(401).json({
          success: false,
          message: MESSAGES_ERREUR.TOKEN_INVALIDE
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Token valide',
        data: {
          utilisateur: resultat.utilisateur
        }
      });
    } catch (error) {
      console.error('Erreur dans ControleurAuth.verifierToken:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Changement de mot de passe
   */
  static async changerMotDePasse(req: Request, res: Response) {
    try {
      // Vérification des erreurs de validation
      const erreurs = validationResult(req);
      if (!erreurs.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Erreurs de validation',
          erreurs: erreurs.array()
        });
      }

      const utilisateurId = req.utilisateur?.id;
      if (!utilisateurId) {
        return res.status(401).json({
          success: false,
          message: MESSAGES_ERREUR.TOKEN_INVALIDE
        });
      }

      const { ancienMotDePasse, nouveauMotDePasse } = req.body;

      const resultat = await ServiceAuth.changerMotDePasse(
        utilisateurId,
        ancienMotDePasse,
        nouveauMotDePasse
      );

      const statusCode = resultat.success ? 200 : 400;
      return res.status(statusCode).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurAuth.changerMotDePasse:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Déconnexion (côté client, pas besoin de logique serveur pour JWT)
   */
  static async deconnecter(req: Request, res: Response) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Déconnexion réussie. Veuillez supprimer le token côté client.'
      });
    } catch (error) {
      console.error('Erreur dans ControleurAuth.deconnecter:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Récupération du profil utilisateur connecté
   */
  static async obtenirProfil(req: Request, res: Response) {
    try {
      const utilisateur = req.utilisateur;
      
      if (!utilisateur) {
        return res.status(401).json({
          success: false,
          message: MESSAGES_ERREUR.TOKEN_INVALIDE
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profil récupéré avec succès',
        data: {
          utilisateur
        }
      });
    } catch (error) {
      console.error('Erreur dans ControleurAuth.obtenirProfil:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }
}