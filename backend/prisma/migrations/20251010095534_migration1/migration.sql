-- CreateTable
CREATE TABLE `utilisateurs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `role` ENUM('UTILISATEUR', 'MODERATEUR', 'ADMINISTRATEUR') NOT NULL DEFAULT 'UTILISATEUR',
    `estActif` BOOLEAN NOT NULL DEFAULT true,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,

    UNIQUE INDEX `utilisateurs_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `prix` DOUBLE NOT NULL,
    `estVip` BOOLEAN NOT NULL DEFAULT false,
    `imageUrl` VARCHAR(191) NOT NULL,
    `imagePublicId` VARCHAR(191) NULL,
    `vues` INTEGER NOT NULL DEFAULT 0,
    `statut` ENUM('EN_ATTENTE', 'VALIDE', 'REJETE', 'EXPIRE') NOT NULL DEFAULT 'EN_ATTENTE',
    `localisation` VARCHAR(191) NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,
    `dateExpiration` DATETIME(3) NOT NULL,
    `utilisateurId` INTEGER NOT NULL,

    INDEX `produits_statut_idx`(`statut`),
    INDEX `produits_estVip_idx`(`estVip`),
    INDEX `produits_dateExpiration_idx`(`dateExpiration`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` ENUM('GENERALE', 'PRODUIT_EXPIRE', 'PRODUIT_VALIDE', 'PRODUIT_REJETE', 'RAPPEL') NOT NULL DEFAULT 'GENERALE',
    `estLue` BOOLEAN NOT NULL DEFAULT false,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `utilisateurId` INTEGER NOT NULL,

    INDEX `notifications_utilisateurId_estLue_idx`(`utilisateurId`, `estLue`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vues_produits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dateVue` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `adresseIp` VARCHAR(191) NULL,
    `produitId` INTEGER NOT NULL,
    `utilisateurId` INTEGER NULL,

    UNIQUE INDEX `vues_produits_produitId_utilisateurId_adresseIp_key`(`produitId`, `utilisateurId`, `adresseIp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `produits` ADD CONSTRAINT `produits_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vues_produits` ADD CONSTRAINT `vues_produits_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `produits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vues_produits` ADD CONSTRAINT `vues_produits_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
