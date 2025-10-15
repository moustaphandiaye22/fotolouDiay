// Repository des produits pour FotoLouJay - Pattern Repository

import { PrismaClient, Produit } from '@prisma/client';
import { StatutProduit } from '../enums/message';

const prisma = new PrismaClient();

// Interfaces pour les requêtes
export interface FiltresProduits {
  titre?: string;
  prixMin?: number;
  prixMax?: number;
  localisation?: string;
  categorie?: string;
  statut?: string;
  estVip?: boolean;
  utilisateurId?: number;
  recherche?: string;
  page?: number;
  limite?: number;
}

export interface DonneesProduit {
  titre: string;
  description: string;
  prix: number;
  imageUrl: string;
  imagePublicId?: string;
  estVip?: boolean;
  localisation?: string;
  categorie?: string;
  utilisateurId: number;
  sourceType?: string;
  securityLevel?: string;
}

export interface MiseAJourProduit {
  titre?: string;
  description?: string;
  prix?: number;
  imageUrl?: string;
  imagePublicId?: string;
  estVip?: boolean;
  localisation?: string;
}

export class RepositoryProduit {
  /**
   * Créer un nouveau produit
   */
  static async creer(donnees: DonneesProduit): Promise<Produit> {
    const dateExpiration = new Date();
    dateExpiration.setDate(dateExpiration.getDate() + 7); // Expire dans 7 jours

    return await prisma.produit.create({
      data: {
        ...donnees,
        dateExpiration,
        statut: StatutProduit.EN_ATTENTE
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true
          }
        }
      }
    });
  }

  /**
   * Trouver un produit par ID
   */
  static async trouverParId(id: number): Promise<Produit | null> {
    return await prisma.produit.findUnique({
      where: { id },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true
          }
        },
        vuesProduites: {
          select: {
            id: true,
            dateVue: true
          }
        }
      }
    });
  }

  /**
   * Trouver tous les produits avec filtres
   */
  static async trouverTous(filtres: FiltresProduits = {}) {
    const {
      titre,
      prixMin,
      prixMax,
      localisation,
      categorie,
      statut,
      estVip,
      utilisateurId,
      recherche,
      page = 1,
      limite = 20
    } = filtres;

    const skip = (page - 1) * limite;

    // Construction des conditions WHERE
    const where: any = {};

    if (titre) {
      where.titre = { contains: titre, mode: 'insensitive' };
    }

    if (prixMin !== undefined) {
      where.prix = { ...where.prix, gte: prixMin };
    }

    if (prixMax !== undefined) {
      where.prix = { ...where.prix, lte: prixMax };
    }

    if (localisation) {
      where.localisation = { contains: localisation, mode: 'insensitive' };
    }

    if (categorie) {
      where.categorie = { equals: categorie };
    }

    if (statut) {
      where.statut = statut;
    }

    if (estVip !== undefined) {
      where.estVip = estVip;
    }

    if (utilisateurId) {
      where.utilisateurId = utilisateurId;
    }

    if (recherche) {
      where.OR = [
        { titre: { contains: recherche } },
        { description: { contains: recherche } },
        { localisation: { contains: recherche } },
        { categorie: { contains: recherche } }
      ];
    }

    // Requête avec pagination
    const [produits, total] = await Promise.all([
      prisma.produit.findMany({
        where,
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              telephone: true
            }
          }
        },
        orderBy: [
          { estVip: 'desc' }, // VIP d'abord
          { dateCreation: 'desc' } // Plus récents ensuite
        ],
        skip,
        take: limite
      }),
      prisma.produit.count({ where })
    ]);

    return {
      produits,
      pagination: {
        page,
        limite,
        total,
        totalPages: Math.ceil(total / limite)
      }
    };
  }

  /**
   * Mettre à jour un produit
   */
  static async mettreAJour(id: number, donnees: MiseAJourProduit): Promise<Produit | null> {
    return await prisma.produit.update({
      where: { id },
      data: donnees,
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true
          }
        }
      }
    });
  }

  /**
   * Supprimer un produit
   */
  static async supprimer(id: number): Promise<void> {
    await prisma.produit.delete({
      where: { id }
    });
  }

  /**
   * Changer le statut d'un produit
   */
  static async changerStatut(id: number, statut: StatutProduit): Promise<Produit | null> {
    return await prisma.produit.update({
      where: { id },
      data: { statut },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true
          }
        }
      }
    });
  }

  /**
   * Incrémenter le nombre de vues
   */
  static async incrementerVues(id: number, utilisateurId?: number, adresseIp?: string): Promise<void> {
    // Vérifier si cette vue existe déjà pour éviter les doublons
    const vueExistante = await prisma.vueProduit.findFirst({
      where: {
        produitId: id,
        ...(utilisateurId && { utilisateurId }),
        ...(adresseIp && { adresseIp })
      }
    });

    if (!vueExistante) {
      // Ajouter la vue
      await prisma.vueProduit.create({
        data: {
          produitId: id,
          utilisateurId,
          adresseIp
        }
      });

      // Incrémenter le compteur de vues
      await prisma.produit.update({
        where: { id },
        data: {
          vues: {
            increment: 1
          }
        }
      });
    }
  }

  /**
   * Trouver les produits expirés
   */
  static async trouverExpires(): Promise<Produit[]> {
    return await prisma.produit.findMany({
      where: {
        dateExpiration: {
          lte: new Date()
        },
        statut: {
          not: StatutProduit.EXPIRE
        }
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Trouver les produits qui vont expirer dans X jours
   */
  static async trouverQuiVontExpirer(joursAvant: number = 1): Promise<Produit[]> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + joursAvant);

    return await prisma.produit.findMany({
      where: {
        dateExpiration: {
          lte: dateLimit,
          gte: new Date()
        },
        statut: StatutProduit.VALIDE
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Marquer les produits comme expirés
   */
  static async marquerCommeExpires(ids: number[]): Promise<void> {
    await prisma.produit.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        statut: StatutProduit.EXPIRE
      }
    });
  }

  /**
   * Obtenir les statistiques des produits
   */
  static async obtenirStatistiques(utilisateurId?: number) {
    const where = utilisateurId ? { utilisateurId } : {};

    const [
      total,
      enAttente,
      valides,
      rejetes,
      expires,
      vip
    ] = await Promise.all([
      prisma.produit.count({ where }),
      prisma.produit.count({ where: { ...where, statut: StatutProduit.EN_ATTENTE } }),
      prisma.produit.count({ where: { ...where, statut: StatutProduit.VALIDE } }),
      prisma.produit.count({ where: { ...where, statut: StatutProduit.REJETE } }),
      prisma.produit.count({ where: { ...where, statut: StatutProduit.EXPIRE } }),
      prisma.produit.count({ where: { ...where, estVip: true } })
    ]);

    return {
      total,
      enAttente,
      valides,
      rejetes,
      expires,
      vip
    };
  }
}