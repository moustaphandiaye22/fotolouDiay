#!/bin/bash

# Script d'exécution du seeder FotoLouJay
# Usage: ./run-seeder.sh

echo "🌱 FotoLouJay - Lancement du seeder"
echo "=================================="

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Vous devez être dans le répertoire backend"
    echo "   Commande: cd backend && ./run-seeder.sh"
    exit 1
fi

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Erreur: Node.js n'est pas installé"
    exit 1
fi

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier la présence du fichier .env
if [ ! -f ".env" ]; then
    echo "⚠️  Attention: Fichier .env manquant"
    echo "   Créez un fichier .env avec DATABASE_URL"
    echo "   Exemple: DATABASE_URL=\"mysql://user:password@localhost:3306/fotoloujay\""
    read -p "   Continuer quand même ? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🧹 Nettoyage et recréation de la base de données..."
echo "⚠️  Attention: Toutes les données existantes seront supprimées !"
read -p "Continuer ? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔄 Génération du client Prisma..."
    npm run prisma:generate
    
    echo ""
    echo "🗄️  Application des migrations..."
    npm run prisma:migrate
    
    echo ""
    echo "🌱 Exécution du seeder..."
    npm run seed
    
    echo ""
    echo "✅ Seeder terminé avec succès !"
    echo ""
    echo "🔐 Compte administrateur créé:"
    echo "   📧 Email: khoussn@gmail.com"
    echo "   🔑 Mot de passe: marakhib"
    echo ""
    echo "👥 Comptes utilisateurs:"
    echo "   🔑 Mot de passe: password123"
    echo "   📧 Format: [prenom].[nom]@fotoljay.sn"
    echo ""
    echo "🚀 Vous pouvez maintenant démarrer l'application !"
    
else
    echo "🚫 Opération annulée"
    exit 0
fi