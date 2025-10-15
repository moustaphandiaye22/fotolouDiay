import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ControleurNotification {
  static async obtenirNotifications(req: Request, res: Response) {
    try {
      const utilisateurId = (req as any).utilisateur.id;

      const notifications = await prisma.notification.findMany({
        where: {
          utilisateurId
        },
        orderBy: {
          dateCreation: 'desc'
        }
      });

      res.json({
        success: true,
        message: 'Notifications récupérées avec succès',
        data: notifications
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des notifications',
        error: error.message
      });
    }
  }

  static async creerNotification(req: Request, res: Response) {
    try {
      const { utilisateurId, titre, message, type } = req.body;

      if (!utilisateurId || !titre || !message) {
        return res.status(400).json({
          success: false,
          message: 'Utilisateur, titre et message sont requis'
        });
      }

      const notification = await prisma.notification.create({
        data: {
          utilisateurId,
          titre,
          message,
          type: type || 'GENERALE'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Notification créée avec succès',
        data: notification
      });
    } catch (error: any) {
      console.error('Erreur lors de la création de la notification:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la notification',
        error: error.message
      });
    }
  }

  static async marquerCommeLue(req: Request, res: Response) {
    try {
      const notificationId = parseInt(req.params.id);
      const utilisateurId = (req as any).utilisateur.id;

      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          utilisateurId
        }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification non trouvée'
        });
      }

      const notificationMiseAJour = await prisma.notification.update({
        where: { id: notificationId },
        data: { estLue: true }
      });

      res.json({
        success: true,
        message: 'Notification marquée comme lue',
        data: notificationMiseAJour
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la notification',
        error: error.message
      });
    }
  }

  static async supprimerNotification(req: Request, res: Response) {
    try {
      const notificationId = parseInt(req.params.id);
      const utilisateurId = (req as any).utilisateur.id;

      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          utilisateurId
        }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification non trouvée'
        });
      }

      await prisma.notification.delete({
        where: { id: notificationId }
      });

      res.json({
        success: true,
        message: 'Notification supprimée avec succès'
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la notification:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la notification',
        error: error.message
      });
    }
  }

  static async obtenirNombreNonLues(req: Request, res: Response) {
    try {
      const utilisateurId = (req as any).utilisateur.id;

      const count = await prisma.notification.count({
        where: {
          utilisateurId,
          estLue: false
        }
      });

      res.json({
        success: true,
        message: 'Nombre de notifications non lues récupéré',
        data: { count }
      });
    } catch (error: any) {
      console.error('Erreur lors du comptage des notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du comptage des notifications',
        error: error.message
      });
    }
  }
}
