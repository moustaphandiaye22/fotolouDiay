-- CreateTable
CREATE TABLE `paiements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference` VARCHAR(191) NOT NULL,
    `montant` DOUBLE NOT NULL,
    `prestataire` ENUM('WAVE', 'ORANGE_MONEY', 'PAYTECH', 'CARTE') NOT NULL,
    `statut` ENUM('EN_ATTENTE', 'CONFIRME', 'ANNULE', 'ECHEC', 'EXPIRE') NOT NULL DEFAULT 'EN_ATTENTE',
    `dateExpiration` DATETIME(3) NOT NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,
    `metadata` JSON NULL,
    `utilisateurId` INTEGER NOT NULL,
    `produitId` INTEGER NOT NULL,

    UNIQUE INDEX `paiements_reference_key`(`reference`),
    INDEX `paiements_reference_idx`(`reference`),
    INDEX `paiements_statut_idx`(`statut`),
    INDEX `paiements_dateExpiration_idx`(`dateExpiration`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('DEBIT', 'CREDIT', 'REMBOURSEMENT') NOT NULL,
    `montant` DOUBLE NOT NULL,
    `statut` ENUM('EN_ATTENTE', 'SUCCES', 'ECHEC', 'ANNULE') NOT NULL DEFAULT 'EN_ATTENTE',
    `referenceExterne` VARCHAR(191) NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,
    `details` JSON NULL,
    `paiementId` INTEGER NOT NULL,

    INDEX `transactions_paiementId_idx`(`paiementId`),
    INDEX `transactions_statut_idx`(`statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `paiements` ADD CONSTRAINT `paiements_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paiements` ADD CONSTRAINT `paiements_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `produits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_paiementId_fkey` FOREIGN KEY (`paiementId`) REFERENCES `paiements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
