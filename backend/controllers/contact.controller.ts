import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ContactStatus } from '../enums/contact.enum';

const prisma = new PrismaClient();

export class ContactController {
  // Créer un nouveau message de contact
  static async createContactMessage(req: Request, res: Response) {
    try {
      const { nom, email, telephone, sujet, message, produitId, vendeurId, captcha } = req.body;

      // Validation basique
      if (!nom || !email || !sujet || !message) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs obligatoires doivent être remplis.'
        });

      // Validation email
      }

      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format d\'email invalide.'
        });
      }

      // TODO: Validation CAPTCHA (à implémenter selon le service choisi)

      // Créer le message de contact
      const contactMessage = await prisma.contactMessage.create({
        data: {
          nom,
          email,
          telephone,
          sujet,
          message,
          produitId: produitId ? parseInt(produitId) : null,
          vendeurId: vendeurId ? parseInt(vendeurId) : null,
          // captcha, // Temporairement désactivé - à implémenter avec un service de captcha approprié
          statut: ContactStatus.EN_ATTENTE
        },
        include: {
          produit: {
            select: {
              id: true,
              titre: true
            }
          },
          vendeur: {
            select: {
              id: true,
              nom: true,
              prenom: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Message envoyé avec succès.',
        data: contactMessage
      });

    } catch (error) {
      console.error('Erreur lors de la création du message de contact:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.'
      });
    }
  }

  // Récupérer tous les messages de contact (admin/modérateur)
  static async getContactMessages(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, statut } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const where: any = {};
      if (statut) {
        where.statut = statut as ContactStatus;
      }

      const [messages, total] = await Promise.all([
        prisma.contactMessage.findMany({
          where,
          include: {
            produit: {
              select: {
                id: true,
                titre: true
              }
            },
            vendeur: {
              select: {
                id: true,
                nom: true,
                prenom: true
              }
            }
          },
          orderBy: {
            dateCreation: 'desc'
          },
          skip: offset,
          take: limitNum
        }),
        prisma.contactMessage.count({ where })
      ]);

      res.json({
        success: true,
        data: messages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.'
      });
    }
  }

  // Récupérer les statistiques des contacts
  static async getContactStats(req: Request, res: Response) {
    try {
      const stats = await prisma.contactMessage.groupBy({
        by: ['statut'],
        _count: {
          id: true
        }
      });

      const total = await prisma.contactMessage.count();

      const formattedStats = {
        total,
        enAttente: stats.find(s => s.statut === ContactStatus.EN_ATTENTE)?._count.id || 0,
        traites: stats.find(s => s.statut === ContactStatus.TRAITE)?._count.id || 0,
        ignores: stats.find(s => s.statut === ContactStatus.IGNORE)?._count.id || 0
      };

      res.json({
        success: true,
        data: formattedStats
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.'
      });
    }
  }

  // Marquer un message comme traité
  static async markAsProcessed(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const message = await prisma.contactMessage.update({
        where: { id: parseInt(id) },
        data: { statut: ContactStatus.TRAITE },
        include: {
          produit: {
            select: {
              id: true,
              titre: true
            }
          },
          vendeur: {
            select: {
              id: true,
              nom: true,
              prenom: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Message marqué comme traité.',
        data: message
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.'
      });
    }
  }

  // Marquer un message comme ignoré
  static async markAsIgnored(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const message = await prisma.contactMessage.update({
        where: { id: parseInt(id) },
        data: { statut: ContactStatus.IGNORE },
        include: {
          produit: {
            select: {
              id: true,
              titre: true
            }
          },
          vendeur: {
            select: {
              id: true,
              nom: true,
              prenom: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Message marqué comme ignoré.',
        data: message
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.'
      });
    }
  }
}