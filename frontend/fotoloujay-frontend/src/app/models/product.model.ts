export enum StatutProduit {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE',
  EXPIRE = 'EXPIRE'
}

export interface Product {
  id: number;
  titre: string;
  description: string;
  prix: number;
  estVip: boolean;
  imageUrl: string;
  imagePublicId?: string;
  vues: number;
  statut: StatutProduit;
  localisation?: string;
  categorie?: string;
  dateCreation: Date;
  dateModification: Date;
  dateExpiration: Date;
  utilisateurId: number;
  utilisateur?: {
    id: number;
    nom: string;
    prenom?: string;
  };
}

export interface CreateProductData {
  titre: string;
  description: string;
  prix: number;
  estVip?: boolean;
  localisation?: string;
  categorie?: string;
  photo?: File;
  photosSupplementaires?: File[];
}

export interface UpdateProductData {
  titre?: string;
  description?: string;
  prix?: number;
  estVip?: boolean;
  localisation?: string;
  categorie?: string;
  image?: File;
}

export interface ProductStats {
  totalProduits: number;
  produitsEnAttente: number;
  produitsValides: number;
  produitsVips: number;
  vuesTotales: number;
}