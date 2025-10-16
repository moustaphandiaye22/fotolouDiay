-- CreateTable
CREATE TABLE `contact_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NULL,
    `sujet` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `produitId` INTEGER NULL,
    `vendeurId` INTEGER NULL,
    `captcha` VARCHAR(191) NULL,
    `statut` ENUM('EN_ATTENTE', 'TRAITE', 'IGNORE') NOT NULL DEFAULT 'EN_ATTENTE',
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,

    INDEX `contact_messages_statut_idx`(`statut`),
    INDEX `contact_messages_dateCreation_idx`(`dateCreation`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contact_messages` ADD CONSTRAINT `contact_messages_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `produits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_messages` ADD CONSTRAINT `contact_messages_vendeurId_fkey` FOREIGN KEY (`vendeurId`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
