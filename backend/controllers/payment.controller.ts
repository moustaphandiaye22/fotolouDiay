// Contrôleur des paiements pour FotoLouJay

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ServicePaiement } from '../services/payment.service';
import { PrestatairePaiement } from '../enums/payment.enum';
import { MESSAGES_ERREUR } from '../enums/message';

export class ControleurPaiement {
  /**
   * Initier un paiement
   */
  static async initierPaiement(req: Request, res: Response) {
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

      const { produitId, montant, prestataire, callbackUrl, metadata } = req.body;

      // Validation des données
      if (!produitId || !montant || !prestataire) {
        return res.status(400).json({
          success: false,
          message: 'Données de paiement incomplètes'
        });
      }

      // Vérifier que le prestataire est valide
      const prestatairesValides = Object.values(PrestatairePaiement);
      if (!prestatairesValides.includes(prestataire)) {
        return res.status(400).json({
          success: false,
          message: 'Prestataire de paiement non supporté'
        });
      }

      const donneesPaiement = {
        produitId: parseInt(produitId),
        utilisateurId,
        montant: parseFloat(montant),
        prestataire,
        callbackUrl,
        metadata
      };

      const resultat = await ServicePaiement.initierPaiement(donneesPaiement);

      const statusCode = resultat.success ? 200 : 400;
      return res.status(statusCode).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurPaiement.initierPaiement:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Confirmer un paiement (webhook/callback)
   */
  static async confirmerPaiement(req: Request, res: Response) {
    try {
      const { reference } = req.params;
      const donneesConfirmation = req.body;

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Référence de paiement manquante'
        });
      }

      const result = await ServicePaiement.confirmerPaiement(reference, donneesConfirmation);

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error) {
      console.error('Erreur dans ControleurPaiement.confirmerPaiement:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Annuler un paiement
   */
  static async annulerPaiement(req: Request, res: Response) {
    try {
      const { reference } = req.params;

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Référence de paiement manquante'
        });
      }

      const success = await ServicePaiement.annulerPaiement(reference);

      if (success) {
        return res.status(200).json({
          success: true,
          message: 'Paiement annulé avec succès'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Paiement non trouvé'
        });
      }
    } catch (error) {
      console.error('Erreur dans ControleurPaiement.annulerPaiement:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Obtenir le statut d'un paiement
   */
  static async obtenirStatutPaiement(req: Request, res: Response) {
    try {
      const { reference } = req.params;
      const utilisateurId = req.utilisateur?.id;

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Référence de paiement manquante'
        });
      }

      const resultat = await ServicePaiement.obtenirStatutPaiement(reference);

      const statusCode = resultat.success ? 200 : 404;
      return res.status(statusCode).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurPaiement.obtenirStatutPaiement:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }
}
