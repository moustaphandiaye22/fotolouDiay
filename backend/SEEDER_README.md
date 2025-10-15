# 🌱 Seeder FotoLouJay

Ce fichier contient le seeder pour la base de données de l'application mobile FotoLouJay.

## 📋 Ce que fait le seeder

Le seeder crée automatiquement :

### 👤 **Utilisateur Administrateur Spécial**
- **Email**: `khoussn@gmail.com`
- **Mot de passe**: `marakhib`
- **Rôle**: Administrateur
- **Nom**: Khouss Ngom

### 👥 **15 Utilisateurs Sénégalais**
- Noms authentiques sénégalais (Diop, Fall, Ndiaye, Sow, etc.)
- **Mot de passe commun**: `password123`
- **Emails**: Format `[prenom].[nom]@fotoljay.sn`
- **Téléphones**: Numéros sénégalais réalistes (+221)
- **Rôles**: 2 modérateurs + 13 utilisateurs standard

### 🛍️ **25 Produits Variés**
- iPhones, Samsung, MacBook, Nike, Rolex, voitures, etc.
- Prix réalistes en FCFA
- Localisations sénégalaises (Dakar, Thiès, Saint-Louis, etc.)
- Images aléatoires générées
- 30% de produits VIP
- 75% de produits validés

### 🔔 **Notifications**
- Notifications de validation de produits
- Rappels d'expiration
- Messages personnalisés

## 🚀 Comment utiliser le seeder

### 1. Installation des dépendances
```bash
cd backend
npm install
```

### 2. Configuration de la base de données
Assurez-vous que votre fichier `.env` contient :
```env
DATABASE_URL="mysql://username:password@localhost:3306/fotoloujay"
```

### 3. Exécution du seeder

#### Option 1 : Seeder simple
```bash
npm run seed
```

#### Option 2 : Reset complet + seeder
```bash
npm run prisma:reset
```

#### Option 3 : Commande Prisma directe
```bash
npx prisma db seed
```

### 4. Vérification
Après exécution, vous verrez un résumé :
```
🎉 Seeding terminé avec succès !
📊 Statistiques:
   👥 Utilisateurs: 16
   🛍️  Produits: 25
   🔔 Notifications: 15

🔐 Compte administrateur:
   📧 Email: khoussn@gmail.com
   🔑 Mot de passe: marakhib
```

## 📱 Connexion aux comptes

### Compte Administrateur
- **Email**: `khoussn@gmail.com`
- **Mot de passe**: `marakhib`

### Comptes Utilisateurs
- **Mot de passe universel**: `password123`
- **Exemples d'emails**:
  - `amadou.diop@fotoljay.sn`
  - `fatou.fall@fotoljay.sn`
  - `moussa.ndiaye@fotoljay.sn`
  - `aissatou.sow@fotoljay.sn`

## 🗃️ Structure des données créées

### Utilisateurs (16 total)
- 1 Administrateur (Khouss)
- 2 Modérateurs
- 13 Utilisateurs standard

### Produits (25 total)
- **Catégories**: Téléphones, Ordinateurs, Chaussures, Montres, Bijoux, Automobiles, Électronique, Électroménager
- **Prix**: Entre 85,000 FCFA et 18,000,000 FCFA
- **Statuts**: 75% validés, 25% en attente/rejetés
- **VIP**: 30% des produits sont VIP

### Notifications
- Notifications de validation
- Rappels d'expiration
- Messages système

## 🛠️ Personnalisation

Pour modifier les données du seeder, éditez le fichier `prisma/seed.ts` :

- **Noms sénégalais**: Array `nomsSenegalais`
- **Localisations**: Array `localisations`
- **Produits**: Array `produitsTypiques`
- **Nombre d'utilisateurs**: Variable dans la boucle `for`

## ⚠️ Important

- Le seeder **supprime toutes les données existantes** avant de créer les nouvelles
- Utilisez uniquement en développement
- Pour la production, créez un seeder séparé avec des données minimales

## 🔧 Dépannage

### Erreur de connexion à la base
- Vérifiez votre `DATABASE_URL` dans `.env`
- Assurez-vous que MySQL/MariaDB est démarré
- Vérifiez les permissions de la base de données

### Erreur de compilation TypeScript
```bash
npm run prisma:generate
```

### Reset complet en cas de problème
```bash
npx prisma migrate reset --force
npm run seed
```

## 📈 Développement

Le seeder est écrit en TypeScript avec :
- **Prisma Client** pour les opérations de base de données
- **bcryptjs** pour le hachage des mots de passe
- **Données réalistes** adaptées au contexte sénégalais
- **Fonctions utilitaires** pour générer des données aléatoires

---

*Développé pour FotoLouJay - Application mobile de vente en ligne* 🇸🇳