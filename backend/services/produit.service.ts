// Service des produits pour FotoLouJay

import { RepositoryProduit, DonneesProduit, MiseAJourProduit, FiltresProduits } from '../repositories/produit.repository';
import { StatutProduit, MESSAGES_ERREUR, MESSAGES_SUCCES } from '../enums/message';
import { Produit } from '@prisma/client';

export interface ReponseProduit {
  success: boolean;
  message: string;
  data?: any;
}

export class ServiceProduit {
  /**
   * Créer un nouveau produit
   */
  static async creer(donnees: DonneesProduit): Promise<ReponseProduit> {
    try {
      const produit = await RepositoryProduit.creer(donnees);

      return {
        success: true,
        message: MESSAGES_SUCCES.PRODUIT_CREE,
        data: { produit }
      };
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Obtenir un produit par ID avec gestion des vues
   */
  static async obtenirParId(
    id: number, 
    utilisateurId?: number, 
    adresseIp?: string
  ): Promise<ReponseProduit> {
    try {
      const produit = await RepositoryProduit.trouverParId(id);

      if (!produit) {
        return {
          success: false,
          message: MESSAGES_ERREUR.PRODUIT_NON_TROUVE
        };
      }

      // Incrémenter les vues si le produit est validé
      if (produit.statut === StatutProduit.VALIDE) {
        await RepositoryProduit.incrementerVues(id, utilisateurId, adresseIp);
      }

      return {
        success: true,
        message: 'Produit récupéré avec succès',
        data: { produit }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Obtenir tous les produits avec filtres
   */
  static async obtenirTous(filtres: FiltresProduits = {}): Promise<ReponseProduit> {
    try {
      const resultat = await RepositoryProduit.trouverTous(filtres);

      return {
        success: true,
        message: 'Produits récupérés avec succès',
        data: resultat
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Rechercher des produits avec filtres avancés
   */
  static async rechercherProduits(filtres: FiltresProduits = {}): Promise<ReponseProduit> {
    try {
      const filtresRecherche = {
        ...filtres,
        statut: StatutProduit.VALIDE
      };

      const resultat = await RepositoryProduit.trouverTous(filtresRecherche);

      return {
        success: true,
        message: 'Recherche effectuée avec succès',
        data: resultat
      };
    } catch (error) {
      console.error('Erreur lors de la recherche des produits:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Obtenir les produits publics (validés seulement)
   */
  static async obtenirProduitsPublics(filtres: Omit<FiltresProduits, 'statut'> = {}): Promise<ReponseProduit> {
    try {
      const filtresPublics = {
        ...filtres,
        statut: StatutProduit.VALIDE
      };

      return await this.obtenirTous(filtresPublics);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits publics:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Obtenir les produits VIP
   */
  static async obtenirProduitsVip(filtres: Omit<FiltresProduits, 'estVip'> = {}): Promise<ReponseProduit> {
    try {
      const filtresVip = {
        ...filtres,
        estVip: true,
        statut: StatutProduit.VALIDE
      };

      return await this.obtenirTous(filtresVip);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits VIP:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Mettre à jour un produit
   */
  static async mettreAJour(
    id: number, 
    donnees: MiseAJourProduit, 
    utilisateurId: number, 
    roleUtilisateur: string
  ): Promise<ReponseProduit> {
    try {
      // Vérifier l'existence du produit
      const produitExistant = await RepositoryProduit.trouverParId(id);

      if (!produitExistant) {
        return {
          success: false,
          message: MESSAGES_ERREUR.PRODUIT_NON_TROUVE
        };
      }

      // Vérifier les permissions
      const estProprietaire = produitExistant.utilisateurId === utilisateurId;
      const estModerateurOuAdmin = ['MODERATEUR', 'ADMINISTRATEUR'].includes(roleUtilisateur);

      if (!estProprietaire && !estModerateurOuAdmin) {
        return {
          success: false,
          message: MESSAGES_ERREUR.PRODUIT_NON_AUTORISE
        };
      }

      // Si l'utilisateur modifie son propre produit, remettre en attente de validation
      if (estProprietaire && !estModerateurOuAdmin) {
        donnees = { ...donnees };
        // Étendre la date d'expiration de 7 jours
        const nouvelleExpiration = new Date();
        nouvelleExpiration.setDate(nouvelleExpiration.getDate() + 7);
      }

      const produitMisAJour = await RepositoryProduit.mettreAJour(id, donnees);

      return {
        success: true,
        message: MESSAGES_SUCCES.PRODUIT_MODIFIE,
        data: { produit: produitMisAJour }
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Supprimer un produit
   */
  static async supprimer(
    id: number, 
    utilisateurId: number, 
    roleUtilisateur: string
  ): Promise<ReponseProduit> {
    try {
      // Vérifier l'existence du produit
      const produit = await RepositoryProduit.trouverParId(id);

      if (!produit) {
        return {
          success: false,
          message: MESSAGES_ERREUR.PRODUIT_NON_TROUVE
        };
      }

      // Vérifier les permissions
      const estProprietaire = produit.utilisateurId === utilisateurId;
      const estModerateurOuAdmin = ['MODERATEUR', 'ADMINISTRATEUR'].includes(roleUtilisateur);

      if (!estProprietaire && !estModerateurOuAdmin) {
        return {
          success: false,
          message: MESSAGES_ERREUR.PRODUIT_NON_AUTORISE
        };
      }

      await RepositoryProduit.supprimer(id);

      return {
        success: true,
        message: MESSAGES_SUCCES.PRODUIT_SUPPRIME
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Valider un produit (modérateur/admin)
   */
  static async valider(id: number): Promise<ReponseProduit> {
    try {
      const produit = await RepositoryProduit.changerStatut(id, StatutProduit.VALIDE);

      if (!produit) {
        return {
          success: false,
          message: MESSAGES_ERREUR.PRODUIT_NON_TROUVE
        };
      }

      return {
        success: true,
        message: MESSAGES_SUCCES.PRODUIT_VALIDE,
        data: { produit }
      };
    } catch (error) {
      console.error('Erreur lors de la validation du produit:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Rejeter un produit (modérateur/admin)
   */
  static async rejeter(id: number): Promise<ReponseProduit> {
    try {
      const produit = await RepositoryProduit.changerStatut(id, StatutProduit.REJETE);

      if (!produit) {
        return {
          success: false,
          message: MESSAGES_ERREUR.PRODUIT_NON_TROUVE
        };
      }

      return {
        success: true,
        message: MESSAGES_SUCCES.PRODUIT_REJETE,
        data: { produit }
      };
    } catch (error) {
      console.error('Erreur lors du rejet du produit:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Obtenir les statistiques des produits
   */
  static async obtenirStatistiques(utilisateurId?: number): Promise<ReponseProduit> {
    try {
      const statistiques = await RepositoryProduit.obtenirStatistiques(utilisateurId);

      return {
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: { statistiques }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Processus de nettoyage automatique des produits expirés
   */
  static async nettoyerProduitsExpires(): Promise<void> {
    try {
      const produitsExpires = await RepositoryProduit.trouverExpires();
      
      if (produitsExpires.length > 0) {
        const ids = produitsExpires.map(p => p.id);
        await RepositoryProduit.marquerCommeExpires(ids);
        
        console.log(`${produitsExpires.length} produits marqués comme expirés`);
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des produits expirés:', error);
    }
  }

  /**
   * Obtenir les produits qui vont expirer pour les notifications
   */
  static async obtenirProduitsQuiVontExpirer(joursAvant: number = 1): Promise<Produit[]> {
    try {
      return await RepositoryProduit.trouverQuiVontExpirer(joursAvant);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits qui vont expirer:', error);
      return [];
    }
  }
}