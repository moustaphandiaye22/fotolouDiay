# 🛍️ FotoLouJay - Plateforme de Vente en Ligne

[![Angular](https://img.shields.io/badge/Angular-20.3.0-red.svg)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.19.1-2D3748.svg)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1.svg)](https://www.mysql.com/)

Une plateforme moderne de vente en ligne développée au Sénégal pour FotoLouJay, permettant aux utilisateurs de vendre et acheter des produits avec un système de modération avancé et des paiements sécurisés.

## 📋 Table des matières

- [🏗️ Architecture](#-architecture)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🚀 Installation et Configuration](#-installation-et-configuration)
- [📱 Utilisation](#-utilisation)
- [🔐 Authentification](#-authentification)
- [👥 Rôles Utilisateurs](#-rôles-utilisateurs)
- [🛍️ Gestion des Produits](#️-gestion-des-produits)
- [💳 Système de Paiement](#-système-de-paiement)
- [🛡️ Modération](#️-modération)
- [📊 API Documentation](#-api-documentation)
- [🧪 Tests](#-tests)
- [🚀 Déploiement](#-déploiement)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## 🏗️ Architecture

### Backend
- **Framework**: Node.js + Express.js
- **Langage**: TypeScript
- **Base de données**: MySQL avec Prisma ORM
- **Authentification**: JWT (JSON Web Tokens)
- **Upload de fichiers**: Multer avec stockage local
- **Logging**: Winston
- **Validation**: Express-validator + Zod

### Frontend
- **Framework**: Angular 20 (Standalone Components)
- **UI Library**: Angular Material
- **Styling**: SCSS avec thème personnalisé
- **State Management**: Services Angular + RxJS
- **Routing**: Angular Router avec lazy loading

### Base de données
- **SGBD**: MySQL 8.0+
- **ORM**: Prisma
- **Migration**: Prisma Migrate
- **Seeding**: Données de test automatiques

## ✨ Fonctionnalités

### 🔐 Authentification & Autorisation
- Inscription et connexion utilisateur
- Gestion des rôles (Utilisateur, Vendeur, Modérateur, Administrateur)
- JWT pour l'authentification stateless
- Guards Angular pour la protection des routes

### 🛍️ Marketplace
- Catalogue de produits avec recherche et filtres
- Pagination côté serveur
- Produits VIP et standards
- Géolocalisation des produits
- Système de notation et commentaires

### 📸 Gestion des Images
- Upload sécurisé de photos (appareil photo uniquement)
- Validation stricte des métadonnées
- Stockage optimisé avec compression
- Support multi-formats (JPEG, PNG)

### 💰 Paiements Intégrés
- Intégration Wave Money
- Intégration Orange Money
- Intégration PayTech
- Suivi des transactions
- Remboursements automatiques

### 🛡️ Modération
- Validation manuelle des produits
- Système de signalement
- Gestion des utilisateurs problématiques
- Logs d'audit complets

### 📢 Notifications
- Notifications en temps réel
- Alertes de modération
- Rappels d'expiration
- Notifications push (futur)

## 🚀 Installation et Configuration

### Prérequis
- **Node.js** 18+ et npm
- **MySQL** 8.0+ ou MariaDB
- **Angular CLI** 20+ (pour le développement frontend)
- **Git**

### 1. Clonage du projet
```bash
git clone https://github.com/khoussngom/fotoloujay.git
cd fotoloujay
```

### 2. Configuration du Backend
```bash
cd backend

# Installation des dépendances
npm install

# Configuration de la base de données
cp .env.example .env
# Éditer .env avec vos paramètres MySQL

# Migration de la base de données
npx prisma generate
npx prisma db push

# Création des données de test
npm run seed
```

### 3. Configuration du Frontend
```bash
cd ../frontend/fotoloujay-frontend

# Installation des dépendances
npm install

# Configuration de l'API (si nécessaire)
# Éditer src/environments/environment.ts
```

### 4. Démarrage des services
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend/fotoloujay-frontend
npm start
```

### Variables d'environnement (.env)
```env
# Base de données
DATABASE_URL="mysql://username:password@localhost:3306/fotoloujay"

# JWT
JWT_SECRET="votre_secret_jwt_tres_securise"
JWT_EXPIRES_IN="24h"

# Serveur
PORT=3001
NODE_ENV=development

# Upload
MAX_FILE_SIZE=2097152
ALLOWED_FILE_TYPES="image/jpeg,image/png"

# API Frontend
API_BASE_URL="http://localhost:3001/api"
```

## 📱 Utilisation

### Comptes de test
Après exécution de `npm run seed`, les comptes suivants sont disponibles :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@fotoljay.sn` | `admin2024` | ADMINISTRATEUR |
| `khoussn@gmail.com` | `marakhib` | ADMINISTRATEUR |
| `amadou.diop@fotoljay.sn` | `password123` | MODERATEUR |
| `fatou.fall@fotoljay.sn` | `password123` | MODERATEUR |
| `moussa.ndiaye@fotoljay.sn` | `password123` | UTILISATEUR |

### Workflow utilisateur

1. **Inscription/Connexion**
   - Créer un compte ou se connecter
   - Vérification email (futur)

2. **Navigation**
   - Parcourir les produits publics
   - Utiliser les filtres (prix, catégorie, localisation)
   - Consulter les détails des produits

3. **Vente de produits**
   - Créer un compte vendeur
   - Ajouter des produits avec photos
   - Attendre la validation modérateur
   - Gérer ses annonces

4. **Achat**
   - Sélectionner un produit
   - Procéder au paiement
   - Confirmation et livraison

## 🔐 Authentification

### Inscription
```json
POST /api/auth/inscription
{
  "nom": "Diop",
  "prenom": "Amadou",
  "email": "amadou.diop@fotoljay.sn",
  "telephone": "+221 77 123 45 67",
  "motDePasse": "motDePasseSecurise123"
}
```

### Connexion
```json
POST /api/auth/connexion
{
  "email": "amadou.diop@fotoljay.sn",
  "motDePasse": "motDePasseSecurise123"
}
```

## 👥 Rôles Utilisateurs

### 👤 Utilisateur (USER)
- Parcourir les produits
- Acheter des produits
- Créer un compte vendeur
- Contacter les vendeurs

### 🛒 Vendeur (VENDOR)
- Toutes les permissions Utilisateur
- Créer et gérer ses produits
- Voir ses statistiques de vente
- Répondre aux messages clients

### 👮 Modérateur (MODERATOR)
- Toutes les permissions Vendeur
- Valider/Rejeter les produits
- Gérer les signalements
- Voir les statistiques globales

### 👑 Administrateur (ADMIN)
- Toutes les permissions Modérateur
- Gérer les utilisateurs
- Modifier les rôles
- Accès aux logs système

## 🛍️ Gestion des Produits

### Création de produit
```typescript
// Service Angular
const formData = new FormData();
formData.append('nom', 'iPhone 15 Pro Max');
formData.append('description', 'Téléphone neuf sous garantie');
formData.append('prix', '850000');
formData.append('localisation', 'Dakar Plateau');
formData.append('sourceType', 'camera_capture_only');
formData.append('securityLevel', 'authenticated_photos');
formData.append('photo', capturedImageFile);

this.produitService.createProduit(formData).subscribe(response => {
  console.log('Produit créé:', response);
});
```

### Recherche et filtres
```typescript
// Recherche avec filtres
this.produitService.getProduitsPublics({
  recherche: 'iPhone',
  categorie: 'Téléphone',
  prixMin: 100000,
  prixMax: 1000000,
  estVip: true,
  page: 1,
  limite: 20
}).subscribe(response => {
  this.produits = response.data.produits;
  this.pagination = response.data.pagination;
});
```

## 💳 Système de Paiement

### Prestataires supportés
- **Wave Money** - Paiement mobile populaire au Sénégal
- **Orange Money** - Solution Orange
- **PayTech** - Passerelle de paiement
- **Carte bancaire** - VISA/Mastercard

### Workflow de paiement
1. Sélection du produit
2. Choix du prestataire
3. Génération de référence de paiement
4. Redirection vers l'interface de paiement
5. Confirmation et validation
6. Mise à jour du statut

## 🛡️ Modération

### Processus de validation
1. **Soumission** - Vendeur crée un produit
2. **En attente** - Produit en file d'attente
3. **Validation** - Modérateur approuve/rejette
4. **Publication** - Produit visible publiquement

### Règles de modération
- **Photos authentiques** uniquement (appareil photo)
- **Descriptions complètes** et précises
- **Prix réalistes** selon le marché
- **Informations de contact** valides

## 📊 API Documentation

### Endpoints principaux

#### Authentification
- `POST /api/auth/inscription` - Créer un compte
- `POST /api/auth/connexion` - Se connecter
- `GET /api/auth/verifier-token` - Vérifier le token
- `GET /api/auth/profil` - Profil utilisateur

#### Produits
- `GET /api/produits/publics` - Produits publics
- `GET /api/produits/vip` - Produits VIP
- `GET /api/produits/mes-produits` - Mes produits
- `POST /api/produits` - Créer un produit
- `PUT /api/produits/:id` - Modifier un produit
- `DELETE /api/produits/:id` - Supprimer un produit

#### Modération
- `GET /api/produits` - Tous les produits (modération)
- `PUT /api/produits/:id/valider` - Valider un produit
- `PUT /api/produits/:id/rejeter` - Rejeter un produit

#### Paiements
- `POST /api/paiements/initier` - Initier un paiement
- `GET /api/paiements/:id` - Détails du paiement
- `POST /api/paiements/confirmer` - Confirmer un paiement

## 🧪 Tests

### Tests Backend
```bash
cd backend
npm test
```

### Tests Frontend
```bash
cd frontend/fotoloujay-frontend
npm test
```

### Tests E2E
```bash
cd frontend/fotoloujay-frontend
npm run e2e
```

### Tests manuels avec cURL
```bash
# Test de l'API
curl -X GET "http://localhost:3001/api/health"

# Test des produits publics
curl -X GET "http://localhost:3001/api/produits/publics?limite=5"

# Test de connexion
curl -X POST "http://localhost:3001/api/auth/connexion" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fotoljay.sn","password":"admin2024"}'
```

## 🚀 Déploiement

### Backend (Railway, Render, Heroku)
```bash
# Build de production
npm run build

# Démarrage en production
npm start
```

### Frontend (Vercel, Netlify)
```bash
# Build de production
npm run build

# Les fichiers sont dans dist/fotoloujay-frontend/
```

### Configuration production
```env
NODE_ENV=production
DATABASE_URL="mysql://prod_user:prod_pass@prod_host:3306/fotoloujay_prod"
JWT_SECRET="production_jwt_secret_very_secure"
```

## 📁 Structure du projet

```
fotoloujay/
├── backend/                          # API Backend
│   ├── controllers/                  # Contrôleurs
│   ├── routes/                       # Routes API
│   ├── services/                     # Services métier
│   ├── middlewares/                  # Middlewares
│   ├── validators/                   # Validation des données
│   ├── prisma/                       # Base de données
│   │   ├── schema.prisma            # Schéma Prisma
│   │   └── seed.ts                  # Données de test
│   ├── uploads/                     # Images uploadées
│   └── logs/                        # Logs application
├── frontend/fotoloujay-frontend/     # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/                # Authentification
│   │   │   ├── produits/            # Gestion produits
│   │   │   ├── dashboard/           # Tableaux de bord
│   │   │   ├── services/            # Services Angular
│   │   │   ├── guards/              # Guards de route
│   │   │   └── models/              # Modèles TypeScript
│   │   ├── assets/                  # Assets statiques
│   │   └── environments/            # Configuration
│   └── dist/                        # Build de production
├── README.md                         # Documentation
└── TODO.md                          # Tâches en cours
```

## 🔧 Scripts utiles

### Backend
```bash
# Développement
npm run dev              # Démarrage avec nodemon
npm run build           # Compilation TypeScript
npm start               # Démarrage production

# Base de données
npm run prisma:generate # Générer client Prisma
npm run prisma:migrate  # Migrer la base
npm run prisma:seed     # Créer données de test
npm run prisma:reset    # Reset complet DB

# Maintenance
npm run prisma:studio   # Interface graphique Prisma
```

### Frontend
```bash
# Développement
npm start               # Serveur dev (port 4200)
npm run build          # Build production
npm run watch          # Build avec watch

# Tests
npm test               # Tests unitaires
npm run e2e           # Tests end-to-end
```

## 🤝 Contribution

1. **Fork** le projet
2. Créer une **branche feature** (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une **Pull Request**

### Standards de code
- **TypeScript** strict pour le backend
- **ESLint** et **Prettier** configurés
- **Tests unitaires** requis
- **Documentation** des APIs
- **Commits** conventionnels

## 📄 Licence

Ce projet est sous licence **ISC**.

---

## 🇸🇳 À propos

**FotoLouJay** est une plateforme de e-commerce développée au Sénégal pour faciliter la vente et l'achat de produits entre particuliers et professionnels. Notre mission est de créer un marketplace sécurisé, moderne et accessible à tous les Sénégalais.

### Équipe
- **Développement Backend**: moustapha ndiaye
- **Développement Frontend**: moustapha ndiaye
- **Design UI/UX**: moustapha ndiaye
- **Product Management**:moustapha ndiaye


---

*Développé par moustapha ndiaye FotoLouJay* 🇸🇳
