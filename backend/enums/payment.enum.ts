// Enums pour le système de paiement FotoLouJay

export enum PrestatairePaiement {
  WAVE = 'WAVE',
  ORANGE_MONEY = 'ORANGE_MONEY',
  PAYTECH = 'PAYTECH',
  CARTE = 'CARTE'
}

export enum StatutPaiement {
  EN_ATTENTE = 'EN_ATTENTE',      // Paiement initié, en attente de confirmation
  CONFIRME = 'CONFIRME',          // Paiement confirmé par le prestataire
  ANNULE = 'ANNULE',              // Paiement annulé par l'utilisateur
  ECHEC = 'ECHEC',                // Échec du paiement
  EXPIRE = 'EXPIRE'               // Paiement expiré
}

export enum TypeTransaction {
  DEBIT = 'DEBIT',                // Débit du compte acheteur
  CREDIT = 'CREDIT',              // Crédit du compte vendeur
  REMBOURSEMENT = 'REMBOURSEMENT' // Remboursement
}

export enum StatutTransaction {
  EN_ATTENTE = 'EN_ATTENTE',      // Transaction en cours
  SUCCES = 'SUCCES',              // Transaction réussie
  ECHEC = 'ECHEC',                // Transaction échouée
  ANNULE = 'ANNULE'               // Transaction annulée
}
