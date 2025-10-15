// Middleware d'authentification pour FotoLouJay

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RoleUtilisateur, MESSAGES_ERREUR } from '../enums/message';

const prisma = new PrismaClient();

// Interface pour le token JWT décodé
interface TokenPayload {
  utilisateurId: number;
  email: string;
  role: RoleUtilisateur;
  iat: number;
  exp: number;
}

// Extension de l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      utilisateur?: {
        id: number;
        email: string;
        nom: string;
        prenom?: string | null;
        telephone?: string | null;
        role: RoleUtilisateur;
      };
    }
  }
}

/**
 * Middleware de vérification du token JWT
 */
export const verifierToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupération du token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header or invalid format:', authHeader);
      return res.status(401).json({
        success: false,
        message: MESSAGES_ERREUR.TOKEN_INVALIDE
      });
    }

    const token = authHeader.substring(7); // Supprimer "Bearer "
    console.log('Token received:', token.substring(0, 20) + '...');

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Configuration error'
      });
    }

    // Vérification et décodage du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // Vérification de l'existence de l'utilisateur
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { 
        id: decoded.utilisateurId,
        estActif: true
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        role: true,
        estActif: true
      }
    });

    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        message: MESSAGES_ERREUR.UTILISATEUR_NON_TROUVE
      });
    }

    // Ajout des informations utilisateur à la requête
    req.utilisateur = {
      id: utilisateur.id,
      email: utilisateur.email,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      telephone: utilisateur.telephone,
      role: utilisateur.role as RoleUtilisateur
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: MESSAGES_ERREUR.TOKEN_EXPIRE
      });
    }

    return res.status(401).json({
      success: false,
      message: MESSAGES_ERREUR.TOKEN_INVALIDE
    });
  }
};

/**
 * Middleware de vérification des rôles
 */
export const verifierRole = (...rolesAutorises: RoleUtilisateur[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.utilisateur) {
      return res.status(401).json({
        success: false,
        message: MESSAGES_ERREUR.TOKEN_INVALIDE
      });
    }

    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return res.status(403).json({
        success: false,
        message: MESSAGES_ERREUR.ACCES_REFUSE
      });
    }

    next();
  };
};

/**
 * Middleware optionnel d'authentification (pour les routes publiques avec fonctionnalités supplémentaires pour les utilisateurs connectés)
 */
export const authentificationOptionnelle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Pas de token, mais on continue
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { 
        id: decoded.utilisateurId,
        estActif: true
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        telephone: true,
        role: true
      }
    });

    if (utilisateur) {
      req.utilisateur = {
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        telephone: utilisateur.telephone,
        role: utilisateur.role as RoleUtilisateur
      };
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur connecté
    next();
  }
};

/**
 * Middleware de vérification de propriété d'un produit
 */
export const verifierProprieteProduit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const produitId = parseInt(req.params.id);
    const utilisateurId = req.utilisateur?.id;

    if (!utilisateurId) {
      return res.status(401).json({
        success: false,
        message: MESSAGES_ERREUR.TOKEN_INVALIDE
      });
    }

    // Les modérateurs et administrateurs peuvent modifier tous les produits
    if (req.utilisateur?.role === RoleUtilisateur.MODERATEUR || 
        req.utilisateur?.role === RoleUtilisateur.ADMINISTRATEUR) {
      return next();
    }

    // Vérification de la propriété pour les utilisateurs normaux
    const produit = await prisma.produit.findUnique({
      where: { id: produitId },
      select: { utilisateurId: true }
    });

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: MESSAGES_ERREUR.PRODUIT_NON_TROUVE
      });
    }

    if (produit.utilisateurId !== utilisateurId) {
      return res.status(403).json({
        success: false,
        message: MESSAGES_ERREUR.PRODUIT_NON_AUTORISE
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: MESSAGES_ERREUR.ERREUR_SERVEUR
    });
  }
};