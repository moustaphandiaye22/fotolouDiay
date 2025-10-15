// Seeder pour la base de données FotoLouJay
// Génère des utilisateurs et produits de test avec des noms sénégalais

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Noms sénégalais authentiques
const nomsSenegalais = [
  { nom: 'Diop', prenom: 'Amadou' },
  { nom: 'Fall', prenom: 'Fatou' },
  { nom: 'Ndiaye', prenom: 'Moussa' },
  { nom: 'Sow', prenom: 'Aïssatou' },
  { nom: 'Sy', prenom: 'Ousmane' },
  { nom: 'Ba', prenom: 'Mariama' },
  { nom: 'Sarr', prenom: 'Ibrahima' },
  { nom: 'Kane', prenom: 'Khady' },
  { nom: 'Gueye', prenom: 'Mamadou' },
  { nom: 'Diallo', prenom: 'Bineta' },
  { nom: 'Mbaye', prenom: 'Cheikh' },
  { nom: 'Thiam', prenom: 'Awa' },
  { nom: 'Diouf', prenom: 'Babacar' },
  { nom: 'Ndour', prenom: 'Coumba' },
  { nom: 'Seck', prenom: 'Alioune' },
  { nom: 'Faye', prenom: 'Ndèye' },
  { nom: 'Cissé', prenom: 'Modou' },
  { nom: 'Dieng', prenom: 'Rama' },
  { nom: 'Tall', prenom: 'Abdou' },
  { nom: 'Niang', prenom: 'Mame' }
];

// Quartiers de Dakar et autres villes du Sénégal
const localisations = [
  'Dakar Plateau',
  'Médina, Dakar',
  'Grand Yoff',
  'Parcelles Assainies',
  'Guédiawaye',
  'Pikine',
  'Rufisque',
  'Thiès',
  'Saint-Louis',
  'Kaolack',
  'Ziguinchor',
  'Tambacounda',
  'Diourbel',
  'Louga',
  'Fatick',
  'Kolda',
  'Matam',
  'Kaffrine',
  'Kédougou',
  'Sédhiou'
];

// Produits typiques du Sénégal
const produitsTypiques = [
  {
    nom: 'iPhone 15 Pro Max',
    description: 'Téléphone neuf, encore sous garantie. Couleur bleu titane, 256GB.',
    prix: 850000,
    categorie: 'Téléphone'
  },
  {
    nom: 'Samsung Galaxy S24 Ultra',
    description: 'Smartphone Samsung en excellent état, utilisé 3 mois seulement.',
    prix: 750000,
    categorie: 'Téléphone'
  },
  {
    nom: 'MacBook Pro M3',
    description: 'Ordinateur portable Apple, 14 pouces, 16GB RAM, 512GB SSD.',
    prix: 1200000,
    categorie: 'Ordinateurs'
  },
  {
    nom: 'Nike Air Max 270',
    description: 'Baskets Nike neuves, taille 42. Couleur noir et blanc.',
    prix: 85000,
    categorie: 'Chaussures'
  },
  {
    nom: 'Rolex Submariner',
    description: 'Montre de luxe authentique, avec certificat d\'authenticité.',
    prix: 4500000,
    categorie: 'Montres'
  },
  {
    nom: 'Collier en or 18k',
    description: 'Bijou en or véritable, chaîne de 50cm avec pendentif.',
    prix: 150000,
    categorie: 'Bijoux'
  },
  {
    nom: 'Audi A7 2020',
    description: 'Berline allemande, essence, V6 biturbo, 55000km au compteur.',
    prix: 15000000,
    categorie: 'Automobile'
  },
  {
    nom: 'BMW X5 2019',
    description: 'SUV premium, diesel, 7 places, toutes options.',
    prix: 18000000,
    categorie: 'Automobile'
  },
  {
    nom: 'PlayStation 5',
    description: 'Console de jeu Sony PS5, avec 2 manettes et 3 jeux inclus.',
    prix: 450000,
    categorie: 'Électronique'
  },
  {
    nom: 'Réfrigérateur Samsung',
    description: 'Frigo américain 500L, avec distributeur d\'eau et glaçons.',
    prix: 350000,
    categorie: 'Électroménager'
  }
];

async function main() {
  console.log('🌱 Début du seeding de la base de données FotoLouJay...');

  try {
    // Nettoyer la base de données
    console.log('🧹 Nettoyage de la base de données...');
    await prisma.vueProduit.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.produit.deleteMany();
    await prisma.utilisateur.deleteMany();

    // Créer l'utilisateur spécial
    console.log('👤 Création de l\'utilisateur spécial...');
    const motDePasseHash = await bcrypt.hash('marakhib', 12);

    const utilisateurSpecial = await prisma.utilisateur.create({
      data: {
        nom: 'Ngom',
        prenom: 'Khouss',
        email: 'khoussn@gmail.com',
        telephone: '+221 77 123 45 67',
        motDePasse: motDePasseHash,
        role: 'ADMINISTRATEUR',
        estActif: true,
        dateCreation: new Date(),
        dateModification: new Date()
      }
    });

    console.log('✅ Utilisateur spécial créé:', utilisateurSpecial.email);

    // Créer des utilisateurs sénégalais
    console.log('👥 Création des utilisateurs sénégalais...');
    const utilisateursCreés = [];

    for (let i = 0; i < 15; i++) {
      const nom = nomsSenegalais[i];
      const motDePasseUser = await bcrypt.hash('password123', 12);

      // Générer un email basé sur le nom
      const email = `${nom.prenom.toLowerCase()}.${nom.nom.toLowerCase()}@fotoljay.sn`;

      // Générer un numéro de téléphone sénégalais
      const telephone = `+221 ${77 + Math.floor(Math.random() * 7)} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`;

      const utilisateur = await prisma.utilisateur.create({
        data: {
          nom: nom.nom,
          prenom: nom.prenom,
          email: email,
          telephone: telephone,
          motDePasse: motDePasseUser,
          role: i < 2 ? 'MODERATEUR' : 'UTILISATEUR', // 2 modérateurs
          estActif: true,
          dateCreation: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Dates aléatoires sur 30 jours
          dateModification: new Date()
        }
      });

      utilisateursCreés.push(utilisateur);
    }

    console.log(`✅ ${utilisateursCreés.length} utilisateurs sénégalais créés`);

    // Créer des produits
    console.log('🛍️ Création des produits...');
    const toutsLesUtilisateurs = [utilisateurSpecial, ...utilisateursCreés];

    for (let i = 0; i < 25; i++) {
      const produitTemplate = produitsTypiques[i % produitsTypiques.length];
      const utilisateurAleatoire = toutsLesUtilisateurs[Math.floor(Math.random() * toutsLesUtilisateurs.length)];
      const localisationAleatoire = localisations[Math.floor(Math.random() * localisations.length)];

      // Varier les prix
      const variationPrix = 0.8 + Math.random() * 0.4; // Entre 80% et 120% du prix de base
      const prixFinal = Math.floor(produitTemplate.prix * variationPrix);

      // Date de création aléatoire (derniers 15 jours)
      const dateCreation = new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000);

      // Date d'expiration (7 jours après création)
      const dateExpiration = new Date(dateCreation.getTime() + 7 * 24 * 60 * 60 * 1000);

      const statutsDisponibles = ['VALIDE', 'EN_ATTENTE', 'VALIDE', 'VALIDE'] as const;
      const statutChoisi = statutsDisponibles[Math.floor(Math.random() * statutsDisponibles.length)];

      const produit = await prisma.produit.create({
        data: {
          titre: produitTemplate.nom + (i > 9 ? ` (${i + 1})` : ''),
          description: produitTemplate.description,
          prix: prixFinal,
          localisation: localisationAleatoire,
          imageUrl: `https://picsum.photos/400/300?random=${i + 1}`, // Images aléatoires
          estVip: Math.random() < 0.3, // 30% de chance d'être VIP
          statut: statutChoisi, // 75% validés
          vues: Math.floor(Math.random() * 100),
          utilisateurId: utilisateurAleatoire.id,
          dateCreation: dateCreation,
          dateExpiration: dateExpiration,
          dateModification: new Date()
        }
      });

      // Créer quelques notifications pour les utilisateurs
      if (Math.random() < 0.4) { // 40% de chance
        await prisma.notification.create({
          data: {
            titre: 'Produit validé !',
            message: `Votre produit "${produit.titre}" a été approuvé et est maintenant visible.`,
            type: 'PRODUIT_VALIDE',
            utilisateurId: utilisateurAleatoire.id,
            estLue: Math.random() < 0.6, // 60% lues
            dateCreation: new Date(produit.dateCreation.getTime() + 60 * 60 * 1000) // 1h après création produit
          }
        });
      }
    }

    console.log('✅ 25 produits créés avec succès');

    // Créer des notifications générales
    console.log('🔔 Création des notifications...');

    for (const utilisateur of toutsLesUtilisateurs.slice(0, 10)) {
      // Notification d'expiration
      await prisma.notification.create({
        data: {
          titre: 'Produit bientôt expiré',
          message: 'Un de vos produits expire dans 2 jours. Pensez à le republier !',
          type: 'PRODUIT_EXPIRE',
          utilisateurId: utilisateur.id,
          estLue: false,
          dateCreation: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000)
        }
      });
    }

    // Statistiques finales
    const statsUtilisateurs = await prisma.utilisateur.count();
    const statsProduits = await prisma.produit.count();
    const statsNotifications = await prisma.notification.count();

    console.log('\n🎉 Seeding terminé avec succès !');
    console.log('📊 Statistiques:');
    console.log(`   👥 Utilisateurs: ${statsUtilisateurs}`);
    console.log(`   🛍️  Produits: ${statsProduits}`);
    console.log(`   🔔 Notifications: ${statsNotifications}`);

    console.log('\n🔐 Compte administrateur:');
    console.log(`   📧 Email: khoussn@gmail.com`);
    console.log(`   🔑 Mot de passe: marakhib`);

    console.log('\n👤 Comptes utilisateurs:');
    console.log(`   🔑 Mot de passe pour tous: password123`);
    console.log(`   📧 Emails: [prenom].[nom]@fotoljay.sn`);
    console.log(`   📱 Téléphones: Numéros sénégalais (+221)`);

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction utilitaire pour générer des données aléatoires
function genererTelephoneSenegalais(): string {
  const operateurs = ['77', '78', '70', '76', '75']; // Principaux opérateurs sénégalais
  const operateur = operateurs[Math.floor(Math.random() * operateurs.length)];
  const numero = Math.floor(Math.random() * 9000000) + 1000000; // 7 chiffres
  return `+221 ${operateur} ${numero.toString().substring(0, 3)} ${numero.toString().substring(3, 5)} ${numero.toString().substring(5, 7)}`;
}

// Exécuter le seeder
main()
  .catch((e) => {
    console.error('💥 Erreur fatale:', e);
    process.exit(1);
  });

export default main;