// Contrôleur des produits pour FotoLouJay

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ServiceProduit } from '../services/produit.service';
import { RoleUtilisateur, StatutProduit, MESSAGES_ERREUR } from '../enums/message';

export class ControleurProduit {
  /**
   * Créer un nouveau produit
   */
  static async creer(req: Request, res: Response) {
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

      // Vérification de la présence d'une image (file upload ou photo capturée)
      const filesObj = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const photoFile = filesObj?.photo?.[0] || filesObj?.photosSupplementaires?.[0];

      if (!req.file && !req.body.imageUrl && !photoFile) {
        return res.status(400).json({
          success: false,
          message: MESSAGES_ERREUR.IMAGE_REQUISE
        });
      }

      // Support des deux formats : ancien (titre) et nouveau (nom)
      const { titre, nom, description, prix, localisation, estVip, sourceType, securityLevel } = req.body;

      const imageUrl = photoFile?.path || req.file?.path || req.body.imageUrl || '';
      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:${process.env.PORT || 2025}/${imageUrl}`;

      const donneesProduit = {
        titre: titre || nom,
        description,
        prix: parseFloat(prix),
        imageUrl: fullImageUrl,
        imagePublicId: req.body.imagePublicId,
        localisation,
        estVip: estVip === 'true' || estVip === true,
        utilisateurId,
        sourceType: sourceType || 'camera_capture_only',
        securityLevel: securityLevel || 'authenticated_photos'
      };

      const resultat = await ServiceProduit.creer(donneesProduit);

      const statusCode = resultat.success ? 201 : 400;
      return res.status(statusCode).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurProduit.creer:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Obtenir tous les produits (avec filtres)
   */
  static async obtenirTous(req: Request, res: Response) {
    try {
      const {
        statut,
        estVip,
        utilisateurId,
        recherche,
        categorie,
        page = '1',
        limite = '20'
      } = req.query;

      const filtres = {
        ...(statut && { statut: statut as StatutProduit }),
        ...(estVip !== undefined && { estVip: estVip === 'true' }),
        ...(utilisateurId && { utilisateurId: parseInt(utilisateurId as string) }),
        ...(recherche && { recherche: recherche as string }),
        ...(categorie && { categorie: categorie as string }),
        page: parseInt(page as string),
        limite: parseInt(limite as string)
      };

      const resultat = await ServiceProduit.obtenirTous(filtres);

      return res.status(200).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurProduit.obtenirTous:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Rechercher des produits avec filtres avancés
   */
  static async rechercherProduits(req: Request, res: Response) {
    try {
      const {
        recherche,
        categorie,
        localisation,
        prixMin,
        prixMax,
        estVip,
        page = '1',
        limite = '20'
      } = req.query;

      const filtres = {
        ...(recherche && { recherche: recherche as string }),
        ...(categorie && { categorie: categorie as string }),
        ...(localisation && { localisation: localisation as string }),
        ...(prixMin && { prixMin: parseFloat(prixMin as string) }),
        ...(prixMax && { prixMax: parseFloat(prixMax as string) }),
        ...(estVip !== undefined && { estVip: estVip === 'true' }),
        page: parseInt(page as string),
        limite: parseInt(limite as string)
      };

      const resultat = await ServiceProduit.rechercherProduits(filtres);

      return res.status(200).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurProduit.rechercherProduits:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Obtenir les produits publics (pour les utilisateurs non connectés)
   */
  static async obtenirProduitsPublics(req: Request, res: Response) {
    try {
      const {
        estVip,
        recherche,
        categorie,
        page = '1',
        limite = '20'
      } = req.query;

      const filtres = {
        ...(estVip !== undefined && { estVip: estVip === 'true' }),
        ...(recherche && { recherche: recherche as string }),
        ...(categorie && { categorie: categorie as string }),
        page: parseInt(page as string),
        limite: parseInt(limite as string)
      };

      const resultat = await ServiceProduit.obtenirProduitsPublics(filtres);

      return res.status(200).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurProduit.obtenirProduitsPublics:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Obtenir les produits VIP
   */
  static async obtenirProduitsVip(req: Request, res: Response) {
    try {
      const {
        recherche,
        categorie,
        page = '1',
        limite = '20'
      } = req.query;

      const filtres = {
        ...(recherche && { recherche: recherche as string }),
        ...(categorie && { categorie: categorie as string }),
        page: parseInt(page as string),
        limite: parseInt(limite as string)
      };

      const resultat = await ServiceProduit.obtenirProduitsVip(filtres);

      return res.status(200).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurProduit.obtenirProduitsVip:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Obtenir un produit par ID
   */
  static async obtenirParId(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const utilisateurId = req.utilisateur?.id;
      const adresseIp = req.ip;

      const resultat = await ServiceProduit.obtenirParId(id, utilisateurId, adresseIp);

      const statusCode = resultat.success ? 200 : 404;
      return res.status(statusCode).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurProduit.obtenirParId:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Mettre à jour un produit
   */
  static async mettreAJour(req: Request, res: Response) {
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

      const id = parseInt(req.params.id);
      const utilisateurId = req.utilisateur?.id;
      const roleUtilisateur = req.utilisateur?.role;

      if (!utilisateurId || !roleUtilisateur) {
        return res.status(401).json({
          success: false,
          message: MESSAGES_ERREUR.TOKEN_INVALIDE
        });
      }

      const { titre, description, prix, localisation, estVip, imageUrl, imagePublicId } = req.body;

      const donneesMiseAJour = {
        ...(titre && { titre }),
        ...(description && { description }),
        ...(prix && { prix: parseFloat(prix) }),
        ...(localisation !== undefined && { localisation }),
        ...(estVip !== undefined && { estVip: estVip === 'true' || estVip === true }),
        ...(imageUrl && { imageUrl }),
        ...(imagePublicId && { imagePublicId })
      };

      const resultat = await ServiceProduit.mettreAJour(
        id,
        donneesMiseAJour,
        utilisateurId,
        roleUtilisateur
      );

      const statusCode = resultat.success ? 200 : (resultat.message === MESSAGES_ERREUR.PRODUIT_NON_TROUVE ? 404 : 403);
      return res.status(statusCode).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurProduit.mettreAJour:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Supprimer un produit
   */
  static async supprimer(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const utilisateurId = req.utilisateur?.id;
      const roleUtilisateur = req.utilisateur?.role;

      if (!utilisateurId || !roleUtilisateur) {
        return res.status(401).json({
          success: false,
          message: MESSAGES_ERREUR.TOKEN_INVALIDE
        });
      }

      const resultat = await ServiceProduit.supprimer(id, utilisateurId, roleUtilisateur);

      const statusCode = resultat.success ? 200 : (resultat.message === MESSAGES_ERREUR.PRODUIT_NON_TROUVE ? 404 : 403);
      return res.status(statusCode).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurProduit.supprimer:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Valider un produit (modérateur/admin)
   */
  static async valider(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      const resultat = await ServiceProduit.valider(id);

      const statusCode = resultat.success ? 200 : 404;
      return res.status(statusCode).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurProduit.valider:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Rejeter un produit (modérateur/admin)
   */
  static async rejeter(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      const resultat = await ServiceProduit.rejeter(id);

      const statusCode = resultat.success ? 200 : 404;
      return res.status(statusCode).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurProduit.rejeter:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Obtenir les produits de l'utilisateur connecté
   */
  static async obtenirMesProduits(req: Request, res: Response) {
    try {
      const utilisateurId = req.utilisateur?.id;

      if (!utilisateurId) {
        return res.status(401).json({
          success: false,
          message: MESSAGES_ERREUR.TOKEN_INVALIDE
        });
      }

      const {
        statut,
        page = '1',
        limite = '20'
      } = req.query;

      const filtres = {
        utilisateurId,
        ...(statut && { statut: statut as StatutProduit }),
        page: parseInt(page as string),
        limite: parseInt(limite as string)
      };

      const resultat = await ServiceProduit.obtenirTous(filtres);

      return res.status(200).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurProduit.obtenirMesProduits:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Obtenir les statistiques des produits
   */
  static async obtenirStatistiques(req: Request, res: Response) {
    try {
      const utilisateurId = req.utilisateur?.id;
      const role = req.utilisateur?.role;

      // Les modérateurs/admins peuvent voir toutes les statistiques, les vendeurs voient les leurs
      const idUtilisateur = (role === RoleUtilisateur.MODERATEUR || role === RoleUtilisateur.ADMINISTRATEUR)
        ? undefined
        : utilisateurId;

      const resultat = await ServiceProduit.obtenirStatistiques(idUtilisateur);

      return res.status(200).json(resultat);
    } catch (error) {
      console.error('Erreur dans ControleurProduit.obtenirStatistiques:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }
}