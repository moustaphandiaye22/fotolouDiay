# TODO - Ajout de la documentation Swagger

## Étape 1: Installation des dépendances
- [ ] Installer swagger-jsdoc et swagger-ui-express
- [ ] Ajouter les types TypeScript si nécessaire

## Étape 2: Configuration Swagger dans app.ts
- [ ] Importer swagger-jsdoc et swagger-ui-express
- [ ] Créer la configuration Swagger avec les métadonnées de l'API
- [ ] Ajouter la route /api-docs pour l'interface Swagger UI

## Étape 3: Mise à jour des routes avec annotations Swagger
- [ ] auth.routes.ts - Convertir les commentaires JSDoc en annotations Swagger
- [ ] produit.routes.ts - Convertir les commentaires JSDoc en annotations Swagger
- [ ] utilisateur.routes.ts - Convertir les commentaires JSDoc en annotations Swagger
- [ ] payment.routes.ts - Convertir les commentaires JSDoc en annotations Swagger
- [ ] contact.routes.ts - Convertir les commentaires JSDoc en annotations Swagger
- [ ] notification.routes.ts - Convertir les commentaires JSDoc en annotations Swagger

## Étape 4: Test et vérification
- [ ] Démarrer le serveur et vérifier l'accès à /api-docs
- [ ] Tester quelques endpoints via Swagger UI
- [ ] Vérifier que tous les endpoints sont documentés correctement
