export enum TypeNotification {
  GENERALE = 'GENERALE',
  PRODUIT_EXPIRE = 'PRODUIT_EXPIRE',
  PRODUIT_VALIDE = 'PRODUIT_VALIDE',
  PRODUIT_REJETE = 'PRODUIT_REJETE',
  RAPPEL = 'RAPPEL'
}

export interface Notification {
  id: number;
  titre: string;
  message: string;
  type: TypeNotification;
  estLue: boolean;
  dateCreation: Date;
  utilisateurId: number;
  utilisateur?: {
    id: number;
    nom: string;
    prenom?: string;
  };
}

export interface CreateNotificationData {
  titre: string;
  message: string;
  type: TypeNotification;
  utilisateurId: number;
}

export interface MarkNotificationReadData {
  estLue: boolean;
}