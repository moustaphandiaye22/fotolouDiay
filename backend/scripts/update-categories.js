// Script pour mettre à jour les catégories des produits existants
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapping des mots-clés vers les catégories
const categoriesMapping = {
  'Téléphone': ['iPhone', 'Samsung Galaxy', 'smartphone', 'téléphone', 'phone'],
  'Ordinateurs': ['MacBook', 'laptop', 'ordinateur', 'PC'],
  'Chaussure': ['Nike', 'Adidas', 'baskets', 'chaussures', 'soulier'],
  'Voiture': ['BMW', 'Audi', 'Mercedes', 'Toyota', 'voiture', 'auto'],
  'Console': ['PlayStation', 'PS5', 'Xbox', 'Nintendo', 'console'],
  'Bijoux': ['Rolex', 'collier', 'montre', 'bijou', 'or', 'argent'],
  'Électroménager': ['Réfrigérateur', 'frigo', 'Samsung réfrigérateur', 'électroménager'],
  'Montres':['montre','Montres']
};

async function updateProductCategories() {
  try {
    console.log('🔄 Mise à jour des catégories des produits...');
    
    // Récupérer tous les produits
    const produits = await prisma.produit.findMany({
      where: {
        categorie: null // Seulement ceux qui n'ont pas de catégorie
      }
    });

    console.log(`📦 ${produits.length} produits trouvés sans catégorie`);

    let updated = 0;
    
    for (const produit of produits) {
      let categorieAssignee = null;
      
      // Chercher la catégorie appropriée basée sur le titre
      for (const [categorie, motsCles] of Object.entries(categoriesMapping)) {
        for (const motCle of motsCles) {
          if (produit.titre.toLowerCase().includes(motCle.toLowerCase())) {
            categorieAssignee = categorie;
            break;
          }
        }
        if (categorieAssignee) break;
      }
      
      // Si aucune catégorie trouvée, assigner "Autre"
      if (!categorieAssignee) {
        categorieAssignee = 'Autre';
      }
      
      // Mettre à jour le produit
      await prisma.produit.update({
        where: { id: produit.id },
        data: { categorie: categorieAssignee }
      });
      
      console.log(`✅ Produit "${produit.titre}" → Catégorie: ${categorieAssignee}`);
      updated++;
    }
    
    console.log(`🎉 ${updated} produits mis à jour avec succès!`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
updateProductCategories();