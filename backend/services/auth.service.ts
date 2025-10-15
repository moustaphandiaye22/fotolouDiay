// Service d'authentification pour FotoLouJay

import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RoleUtilisateur, MESSAGES_ERREUR, MESSAGES_SUCCES } from '../enums/message';

const prisma = new PrismaClient();

// Interfaces pour les données d'authentification
export interface DonneesInscription {
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  motDePasse: string;
}

export interface DonneesConnexion {
  email: string;
  motDePasse: string;
}

export interface ReponseAuth {
  success: boolean;
  message: string;
  data?: {
    utilisateur: {
      id: number;
      nom: string;
      prenom?: string;
      email: string;
      role: RoleUtilisateur;
    };
    token: string;
  };
}

export class ServiceAuth {
  /**
   * Inscription d'un nouvel utilisateur
   */
  static async inscrire(donnees: DonneesInscription): Promise<ReponseAuth> {
    try {
      // Vérification si l'email existe déjà
      const utilisateurExistant = await prisma.utilisateur.findUnique({
        where: { email: donnees.email }
      });

      if (utilisateurExistant) {
        return {
          success: false,
          message: MESSAGES_ERREUR.EMAIL_DEJA_UTILISE
        };
      }

      // Hachage du mot de passe
      const motDePasseHache = await bcrypt.hash(donnees.motDePasse, 12);

      // Création de l'utilisateur
      const nouvelUtilisateur = await prisma.utilisateur.create({
        data: {
          nom: donnees.nom,
          prenom: donnees.prenom,
          email: donnees.email,
          telephone: donnees.telephone,
          motDePasse: motDePasseHache,
          role: RoleUtilisateur.UTILISATEUR
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true
        }
      });

      // Génération du token JWT
      const token = this.genererToken(nouvelUtilisateur.id, nouvelUtilisateur.email, nouvelUtilisateur.role as RoleUtilisateur);

      return {
        success: true,
        message: MESSAGES_SUCCES.UTILISATEUR_CREE,
        data: {
          utilisateur: {
            id: nouvelUtilisateur.id,
            nom: nouvelUtilisateur.nom,
            prenom: nouvelUtilisateur.prenom || undefined,
            email: nouvelUtilisateur.email,
            role: nouvelUtilisateur.role as RoleUtilisateur
          },
          token
        }
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  static async connecter(donnees: DonneesConnexion): Promise<ReponseAuth> {
    try {
      // Recherche de l'utilisateur par email
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { 
          email: donnees.email,
          estActif: true
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          motDePasse: true,
          role: true
        }
      });

      if (!utilisateur) {
        return {
          success: false,
          message: MESSAGES_ERREUR.IDENTIFIANTS_INVALIDES
        };
      }

      // Vérification du mot de passe
      const motDePasseValide = await bcrypt.compare(donnees.motDePasse, utilisateur.motDePasse);

      if (!motDePasseValide) {
        return {
          success: false,
          message: MESSAGES_ERREUR.IDENTIFIANTS_INVALIDES
        };
      }

      // Génération du token JWT
      const token = this.genererToken(utilisateur.id, utilisateur.email, utilisateur.role as RoleUtilisateur);

      return {
        success: true,
        message: MESSAGES_SUCCES.UTILISATEUR_CONNECTE,
        data: {
          utilisateur: {
            id: utilisateur.id,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom || undefined,
            email: utilisateur.email,
            role: utilisateur.role as RoleUtilisateur
          },
          token
        }
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Génération d'un token JWT
   */
  private static genererToken(utilisateurId: number, email: string, role: RoleUtilisateur): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET n\'est pas défini dans les variables d\'environnement');
    }
    
    const options: SignOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    } as SignOptions;
    
    return jwt.sign(
      {
        utilisateurId,
        email,
        role
      },
      jwtSecret,
      options
    );
  }

  /**
   * Vérification d'un token JWT
   */
  static async verifierToken(token: string): Promise<{
    valide: boolean;
    utilisateur?: {
      id: number;
      email: string;
      role: RoleUtilisateur;
    };
  }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { 
          id: decoded.utilisateurId,
          estActif: true
        },
        select: {
          id: true,
          email: true,
          role: true
        }
      });

      if (!utilisateur) {
        return { valide: false };
      }

      return {
        valide: true,
        utilisateur: {
          id: utilisateur.id,
          email: utilisateur.email,
          role: utilisateur.role as RoleUtilisateur
        }
      };
    } catch (error) {
      return { valide: false };
    }
  }

  /**
   * Changement de mot de passe
   */
  static async changerMotDePasse(
    utilisateurId: number,
    ancienMotDePasse: string,
    nouveauMotDePasse: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id: utilisateurId },
        select: { motDePasse: true }
      });

      if (!utilisateur) {
        return {
          success: false,
          message: MESSAGES_ERREUR.UTILISATEUR_NON_TROUVE
        };
      }

      // Vérification de l'ancien mot de passe
      const ancienMotDePasseValide = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasse);

      if (!ancienMotDePasseValide) {
        return {
          success: false,
          message: MESSAGES_ERREUR.IDENTIFIANTS_INVALIDES
        };
      }

      // Hachage du nouveau mot de passe
      const nouveauMotDePasseHache = await bcrypt.hash(nouveauMotDePasse, 12);

      // Mise à jour du mot de passe
      await prisma.utilisateur.update({
        where: { id: utilisateurId },
        data: { motDePasse: nouveauMotDePasseHache }
      });

      return {
        success: true,
        message: 'Mot de passe modifié avec succès'
      };
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }
}