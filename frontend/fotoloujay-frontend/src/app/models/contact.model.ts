export interface ContactMessage {
  id?: number;
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
  produitId?: number;
  vendeurId?: number;
  captcha?: string;
  dateCreation?: Date;
  statut: ContactStatus;
}

export enum ContactStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  TRAITE = 'TRAITE',
  IGNORE = 'IGNORE'
}

export interface ContactStats {
  total: number;
  enAttente: number;
  traites: number;
  ignores: number;
}