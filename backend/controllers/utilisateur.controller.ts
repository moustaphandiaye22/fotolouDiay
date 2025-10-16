// Contrôleur des utilisateurs pour FotoLouJay

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RoleUtilisateur, MESSAGES_ERREUR } from '../enums/message';

const prisma = new PrismaClient();

export class ControleurUtilisateur {
  /**
   * Obtenir tous les utilisateurs (Admin et Modérateur)
   */
  static async obtenirTous(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limite = '20',
        role,
        estActif
      } = req.query;

      const filtres: any = {};

      if (role) {
        filtres.role = role as RoleUtilisateur;
      }

      if (estActif !== undefined) {
        filtres.estActif = estActif === 'true';
      }

      const pageNum = parseInt(page as string);
      const limiteNum = parseInt(limite as string);
      const skip = (pageNum - 1) * limiteNum;

      const [utilisateurs, total] = await Promise.all([
        prisma.utilisateur.findMany({
          where: filtres,
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            role: true,
            estActif: true,
            dateCreation: true,
            dateModification: true,
            _count: {
              select: {
                produits: true
              }
            }
          },
          orderBy: {
            dateCreation: 'desc'
          },
          skip,
          take: limiteNum
        }),
        prisma.utilisateur.count({ where: filtres })
      ]);

      const totalPages = Math.ceil(total / limiteNum);

      return res.status(200).json({
        success: true,
        data: {
          utilisateurs,
          pagination: {
            page: pageNum,
            limite: limiteNum,
            total,
            totalPages
          }
        }
      });
    } catch (error) {
      console.error('Erreur dans ControleurUtilisateur.obtenirTous:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Obtenir un utilisateur par ID
   */
  static async obtenirParId(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const utilisateurId = req.utilisateur?.id;
      const role = req.utilisateur?.role;

      // Vérifier les permissions
      if (role !== RoleUtilisateur.ADMINISTRATEUR && role !== RoleUtilisateur.MODERATEUR && utilisateurId !== id) {
        return res.status(403).json({
          success: false,
          message: MESSAGES_ERREUR.ACCES_REFUSE
        });
      }

      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          role: true,
          estActif: true,
          dateCreation: true,
          dateModification: true,
          _count: {
            select: {
              produits: true
            }
          }
        }
      });

      if (!utilisateur) {
        return res.status(404).json({
          success: false,
          message: MESSAGES_ERREUR.UTILISATEUR_NON_TROUVE
        });
      }

      return res.status(200).json({
        success: true,
        data: utilisateur
      });
    } catch (error) {
      console.error('Erreur dans ControleurUtilisateur.obtenirParId:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async mettreAJour(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const utilisateurId = req.utilisateur?.id;
      const role = req.utilisateur?.role;

      // Vérifier les permissions
      if (role !== RoleUtilisateur.ADMINISTRATEUR && utilisateurId !== id) {
        return res.status(403).json({
          success: false,
          message: MESSAGES_ERREUR.ACCES_REFUSE
        });
      }

      const { nom, prenom, telephone, role: nouveauRole } = req.body;

      const donneesMiseAJour: any = {
        nom,
        prenom,
        telephone,
        dateModification: new Date()
      };

      // Seuls les admins peuvent changer les rôles
      if (role === RoleUtilisateur.ADMINISTRATEUR && nouveauRole) {
        donneesMiseAJour.role = nouveauRole;
      }

      const utilisateur = await prisma.utilisateur.update({
        where: { id },
        data: donneesMiseAJour,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          role: true,
          estActif: true,
          dateCreation: true,
          dateModification: true
        }
      });

      return res.status(200).json({
        success: true,
        data: utilisateur,
        message: 'Utilisateur mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur dans ControleurUtilisateur.mettreAJour:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Activer/Désactiver un utilisateur (Admin seulement)
   */
  static async changerStatut(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { estActif } = req.body;

      const utilisateur = await prisma.utilisateur.update({
        where: { id },
        data: {
          estActif,
          dateModification: new Date()
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
          estActif: true,
          dateModification: true
        }
      });

      return res.status(200).json({
        success: true,
        data: utilisateur,
        message: `Utilisateur ${estActif ? 'activé' : 'désactivé'} avec succès`
      });
    } catch (error) {
      console.error('Erreur dans ControleurUtilisateur.changerStatut:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }

  /**
   * Supprimer un utilisateur (Admin seulement)
   */
  static async supprimer(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      // Vérifier si l'utilisateur a des produits
      const produitsCount = await prisma.produit.count({
        where: { utilisateurId: id }
      });

      if (produitsCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer un utilisateur qui a des produits'
        });
      }

      await prisma.utilisateur.delete({
        where: { id }
      });

      return res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur dans ControleurUtilisateur.supprimer:', error);
      return res.status(500).json({
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      });
    }
  }
}
