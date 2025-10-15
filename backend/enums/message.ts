// Énumérations et messages pour l'application FotoLouJay

export enum RoleUtilisateur {
  UTILISATEUR = 'UTILISATEUR',
  MODERATEUR = 'MODERATEUR',
  ADMINISTRATEUR = 'ADMINISTRATEUR'
}

export enum StatutProduit {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE',
  EXPIRE = 'EXPIRE'
}

export enum TypeNotification {
  GENERALE = 'GENERALE',
  PRODUIT_EXPIRE = 'PRODUIT_EXPIRE',
  PRODUIT_VALIDE = 'PRODUIT_VALIDE',
  PRODUIT_REJETE = 'PRODUIT_REJETE',
  RAPPEL = 'RAPPEL'
}

// Messages de succès
export const MESSAGES_SUCCES = {
  UTILISATEUR_CREE: 'Utilisateur créé avec succès',
  UTILISATEUR_CONNECTE: 'Connexion réussie',
  PRODUIT_CREE: 'Produit ajouté avec succès',
  PRODUIT_MODIFIE: 'Produit modifié avec succès',
  PRODUIT_SUPPRIME: 'Produit supprimé avec succès',
  PRODUIT_VALIDE: 'Produit validé avec succès',
  PRODUIT_REJETE: 'Produit rejeté',
  NOTIFICATION_ENVOYEE: 'Notification envoyée',
  VUE_ENREGISTREE: 'Vue enregistrée'
} as const;

// Messages d'erreur
export const MESSAGES_ERREUR = {
  // Erreurs d'authentification
  EMAIL_DEJA_UTILISE: 'Cette adresse email est déjà utilisée',
  IDENTIFIANTS_INVALIDES: 'Email ou mot de passe incorrect',
  TOKEN_INVALIDE: 'Token d\'authentification invalide',
  TOKEN_EXPIRE: 'Token d\'authentification expiré',
  ACCES_REFUSE: 'Accès refusé',
  UTILISATEUR_NON_TROUVE: 'Utilisateur non trouvé',
  
  // Erreurs de produits
  PRODUIT_NON_TROUVE: 'Produit non trouvé',
  PRODUIT_NON_AUTORISE: 'Vous n\'êtes pas autorisé à modifier ce produit',
  IMAGE_REQUISE: 'Une image est requise',
  FORMAT_IMAGE_INVALIDE: 'Format d\'image non supporté',
  TAILLE_IMAGE_TROP_GRANDE: 'La taille de l\'image est trop grande',
  
  // Erreurs de validation
  CHAMPS_REQUIS: 'Tous les champs requis doivent être remplis',
  EMAIL_INVALIDE: 'Format d\'email invalide',
  MOT_DE_PASSE_TROP_COURT: 'Le mot de passe doit contenir au moins 6 caractères',
  PRIX_INVALIDE: 'Le prix doit être un nombre positif',
  
  // Erreurs générales
  ERREUR_SERVEUR: 'Erreur interne du serveur',
  ERREUR_BASE_DONNEES: 'Erreur de base de données',
  ERREUR_UPLOAD: 'Erreur lors du téléchargement de l\'image'
} as const;

// Messages de validation
export const MESSAGES_VALIDATION = {
  EMAIL_REQUIS: 'L\'email est requis',
  MOT_DE_PASSE_REQUIS: 'Le mot de passe est requis',
  NOM_REQUIS: 'Le nom est requis',
  TITRE_REQUIS: 'Le titre du produit est requis',
  DESCRIPTION_REQUISE: 'La description est requise',
  PRIX_REQUIS: 'Le prix est requis'
} as const;

// Configuration des rôles et permissions
export const PERMISSIONS = {
  [RoleUtilisateur.UTILISATEUR]: [
    'lire_produits',
    'creer_produit',
    'modifier_ses_produits',
    'supprimer_ses_produits'
  ],
  [RoleUtilisateur.MODERATEUR]: [
    'lire_produits',
    'creer_produit',
    'modifier_ses_produits',
    'supprimer_ses_produits',
    'valider_produits',
    'rejeter_produits',
    'voir_tous_produits'
  ],
  [RoleUtilisateur.ADMINISTRATEUR]: [
    'lire_produits',
    'creer_produit',
    'modifier_ses_produits',
    'supprimer_ses_produits',
    'valider_produits',
    'rejeter_produits',
    'voir_tous_produits',
    'gerer_utilisateurs',
    'voir_statistiques'
  ]
} as const;
