export enum RoleUtilisateur {
  UTILISATEUR = 'UTILISATEUR',
  VENDEUR = 'VENDEUR',
  MODERATEUR = 'MODERATEUR',
  ADMINISTRATEUR = 'ADMINISTRATEUR'
}

export interface User {
  id: number;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  motDePasse: string;
  role: RoleUtilisateur;
  estActif: boolean;
  dateCreation: Date;
  dateModification: Date;
}

export interface LoginCredentials {
  email: string;
  motDePasse: string;
}

export interface RegisterData {
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  motDePasse: string;
}

export interface ChangePasswordData {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}