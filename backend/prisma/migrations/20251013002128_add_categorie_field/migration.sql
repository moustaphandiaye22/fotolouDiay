-- AlterTable
ALTER TABLE `produits` ADD COLUMN `categorie` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `produits_categorie_idx` ON `produits`(`categorie`);
