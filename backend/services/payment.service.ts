// Service de paiement pour FotoLouJay

import { prisma } from '../app';
import { PrestatairePaiement, StatutPaiement, TypeTransaction, StatutTransaction } from '../enums/payment.enum';
import { MESSAGES_ERREUR, MESSAGES_SUCCES } from '../enums/message';

export interface DonneesInitiationPaiement {
  produitId: number;
  utilisateurId: number;
  montant: number;
  prestataire: PrestatairePaiement;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface ReponseInitiationPaiement {
  success: boolean;
  message: string;
  data?: {
    paiementId: number;
    reference: string;
    redirectUrl?: string;
    paymentReference?: string;
  };
}

export class ServicePaiement {
  /**
   * Initier un paiement
   */
  static async initierPaiement(donnees: DonneesInitiationPaiement): Promise<ReponseInitiationPaiement> {
    try {
      // Vérifier que le produit existe et est valide
      const produit = await prisma.produit.findUnique({
        where: { id: donnees.produitId }
      });

      if (!produit) {
        return {
          success: false,
          message: MESSAGES_ERREUR.PRODUIT_NON_TROUVE
        };
      }

      if (produit.statut !== 'VALIDE') {
        return {
          success: false,
          message: 'Le produit n\'est pas disponible pour l\'achat'
        };
      }

      // Vérifier que l'utilisateur n'est pas le propriétaire du produit
      if (produit.utilisateurId === donnees.utilisateurId) {
        return {
          success: false,
          message: 'Vous ne pouvez pas acheter votre propre produit'
        };
      }

      // Générer une référence unique
      const reference = this.genererReferencePaiement();

      // Calculer la date d'expiration (30 minutes)
      const dateExpiration = new Date();
      dateExpiration.setMinutes(dateExpiration.getMinutes() + 30);

      // Créer le paiement en base avec statut EN_ATTENTE
      const paiement = await prisma.paiement.create({
        data: {
          reference,
          montant: donnees.montant,
          prestataire: donnees.prestataire,
          utilisateurId: donnees.utilisateurId,
          produitId: donnees.produitId,
          statut: 'EN_ATTENTE',
          dateExpiration,
          metadata: donnees.metadata || {}
        }
      });

      // Traiter le paiement selon le prestataire
      const resultatTraitement = await this.traiterPaiement(paiement, donnees);

      if (!resultatTraitement.success) {
        // Annuler le paiement si le traitement échoue
        await prisma.paiement.update({
          where: { id: paiement.id },
          data: { statut: 'ECHEC' }
        });

        return {
          success: false,
          message: resultatTraitement.message
        };
      }

      // Mettre à jour le paiement avec les informations de traitement (reste EN_ATTENTE)
      await prisma.paiement.update({
        where: { id: paiement.id },
        data: {
          metadata: {
            ...(paiement.metadata as object),
            redirectUrl: resultatTraitement.redirectUrl,
            paymentReference: resultatTraitement.paymentReference
          }
        }
      });

      return {
        success: true,
        message: MESSAGES_SUCCES.PAIEMENT_INITIE,
        data: {
          paiementId: paiement.id,
          reference: paiement.reference,
          redirectUrl: resultatTraitement.redirectUrl,
          paymentReference: resultatTraitement.paymentReference
        }
      };
    } catch (error) {
      console.error('Erreur dans ServicePaiement.initierPaiement:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Traiter le paiement selon le prestataire
   */
  private static async traiterPaiement(paiement: any, donnees: DonneesInitiationPaiement): Promise<{ success: boolean; message: string; redirectUrl?: string; paymentReference?: string }> {
    try {
      switch (paiement.prestataire) {
        case 'WAVE':
          return await this.traiterPaiementWave(paiement, donnees);
        case 'ORANGE_MONEY':
          return await this.traiterPaiementOrangeMoney(paiement, donnees);
        case 'PAYTECH':
          return await this.traiterPaiementPayTech(paiement, donnees);
        case 'CARTE':
          return await this.traiterPaiementCarte(paiement, donnees);
        default:
          return {
            success: false,
            message: 'Prestataire de paiement non supporté'
          };
      }
    } catch (error) {
      console.error('Erreur dans traiterPaiement:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Traiter paiement Wave (simulé)
   */
  private static async traiterPaiementWave(paiement: any, donnees: DonneesInitiationPaiement): Promise<{ success: boolean; message: string; redirectUrl?: string; paymentReference?: string }> {
    // Simulation d'un appel à l'API Wave
    const paymentReference = `WAVE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Simuler une URL de redirection Wave
    const redirectUrl = `https://wave.ci/pay?ref=${paymentReference}&amount=${paiement.montant}`;

    return {
      success: true,
      message: 'Paiement Wave initié',
      redirectUrl,
      paymentReference
    };
  }

  /**
   * Traiter paiement Orange Money (simulé)
   */
  private static async traiterPaiementOrangeMoney(paiement: any, donnees: DonneesInitiationPaiement): Promise<{ success: boolean; message: string; redirectUrl?: string; paymentReference?: string }> {
    // Simulation d'un appel à l'API Orange Money
    const paymentReference = `OM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Simuler une URL de redirection Orange Money
    const redirectUrl = `https://orange-money.ci/pay?ref=${paymentReference}&amount=${paiement.montant}`;

    return {
      success: true,
      message: 'Paiement Orange Money initié',
      redirectUrl,
      paymentReference
    };
  }

  /**
   * Traiter paiement PayTech (simulé)
   */
  private static async traiterPaiementPayTech(paiement: any, donnees: DonneesInitiationPaiement): Promise<{ success: boolean; message: string; redirectUrl?: string; paymentReference?: string }> {
    // Simulation d'un appel à l'API PayTech
    const paymentReference = `PT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Simuler une URL de redirection PayTech
    const redirectUrl = `https://paytech.sn/pay?ref=${paymentReference}&amount=${paiement.montant}`;

    return {
      success: true,
      message: 'Paiement PayTech initié',
      redirectUrl,
      paymentReference
    };
  }

  /**
   * Traiter paiement par carte (simulé)
   */
  private static async traiterPaiementCarte(paiement: any, donnees: DonneesInitiationPaiement): Promise<{ success: boolean; message: string; redirectUrl?: string; paymentReference?: string }> {
    // Simulation d'un appel à une API de paiement par carte
    const paymentReference = `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Simuler une URL de redirection pour le paiement par carte
    const redirectUrl = `https://payment-gateway.com/pay?ref=${paymentReference}&amount=${paiement.montant}`;

    return {
      success: true,
      message: 'Paiement par carte initié',
      redirectUrl,
      paymentReference
    };
  }

  /**
   * Confirmer un paiement
   */
  static async confirmerPaiement(reference: string, donneesConfirmation: any): Promise<{ success: boolean; message: string }> {
    try {
      const paiement = await prisma.paiement.findUnique({
        where: { reference },
        include: { utilisateur: true, produit: true }
      });

      if (!paiement) {
        return { success: false, message: 'Paiement non trouvé' };
      }

      if (paiement.statut === 'CONFIRME') {
        return { success: true, message: 'Paiement déjà confirmé' };
      }

      if (paiement.statut !== 'EN_ATTENTE') {
        return { success: false, message: 'Paiement ne peut pas être confirmé' };
      }

      // Mettre à jour le statut du paiement
      await prisma.paiement.update({
        where: { id: paiement.id },
        data: { statut: 'CONFIRME' }
      });

      // Créer une transaction de débit
      await prisma.transaction.create({
        data: {
          paiementId: paiement.id,
          type: 'DEBIT',
          montant: paiement.montant,
          statut: 'SUCCES',
          referenceExterne: donneesConfirmation?.referenceExterne,
          details: donneesConfirmation
        }
      });

      // Créer une transaction de crédit pour le vendeur (simulé)
      await prisma.transaction.create({
        data: {
          paiementId: paiement.id,
          type: 'CREDIT',
          montant: paiement.montant * 0.95, // 5% de commission
          statut: 'SUCCES',
          details: { commission: paiement.montant * 0.05 }
        }
      });

      // TODO: Envoyer des notifications aux utilisateurs
      // TODO: Mettre à jour le statut du produit si nécessaire

      return { success: true, message: 'Paiement confirmé avec succès' };
    } catch (error) {
      console.error('Erreur dans confirmerPaiement:', error);
      return { success: false, message: MESSAGES_ERREUR.ERREUR_SERVEUR };
    }
  }

  /**
   * Annuler un paiement
   */
  static async annulerPaiement(reference: string): Promise<boolean> {
    try {
      const paiement = await prisma.paiement.findUnique({
        where: { reference }
      });

      if (!paiement) {
        return false;
      }

      if (paiement.statut !== 'EN_ATTENTE') {
        return false;
      }

      // Mettre à jour le statut du paiement
      await prisma.paiement.update({
        where: { id: paiement.id },
        data: { statut: 'ANNULE' }
      });

      // Créer une transaction d'annulation
      await prisma.transaction.create({
        data: {
          paiementId: paiement.id,
          type: 'REMBOURSEMENT',
          montant: paiement.montant,
          statut: 'SUCCES',
          details: { reason: 'Annulation par l\'utilisateur' }
        }
      });

      return true;
    } catch (error) {
      console.error('Erreur dans annulerPaiement:', error);
      return false;
    }
  }

  /**
   * Obtenir le statut d'un paiement
   */
  static async obtenirStatutPaiement(reference: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const paiement = await prisma.paiement.findUnique({
        where: { reference },
        include: {
          utilisateur: { select: { id: true, nom: true, prenom: true } },
          produit: { select: { id: true, titre: true, prix: true } },
          transactions: true
        }
      });

      if (!paiement) {
        return {
          success: false,
          message: MESSAGES_ERREUR.PAIEMENT_NON_TROUVE
        };
      }

      return {
        success: true,
        message: 'Statut du paiement récupéré',
        data: {
          reference: paiement.reference,
          statut: paiement.statut,
          montant: paiement.montant,
          prestataire: paiement.prestataire,
          dateCreation: paiement.dateCreation,
          dateExpiration: paiement.dateExpiration,
          utilisateur: paiement.utilisateur,
          produit: paiement.produit,
          transactions: paiement.transactions
        }
      };
    } catch (error) {
      console.error('Erreur dans obtenirStatutPaiement:', error);
      return {
        success: false,
        message: MESSAGES_ERREUR.ERREUR_SERVEUR
      };
    }
  }

  /**
   * Générer une référence de paiement unique
   */
  private static genererReferencePaiement(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `PAY-${timestamp}-${random}`.toUpperCase();
  }
}
