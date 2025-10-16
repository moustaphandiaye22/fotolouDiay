# TODO - Implémentation de la liste des vendeurs pour admin/modérateur

## Backend
- [ ] Modifier la méthode `obtenirTous` dans `utilisateur.controller.ts` pour permettre l'accès aux modérateurs
- [ ] Implémenter la route GET /utilisateurs dans `utilisateur.routes.ts`

## Frontend
- [ ] Ajouter méthode `getUsers()` dans `auth.service.ts`
- [ ] Ajouter logique de chargement des utilisateurs dans `dashboard.ts`
- [ ] Ajouter onglet "Utilisateurs" dans `dashboard.html`
- [ ] Ajouter tableau pour afficher la liste des utilisateurs

## Tests
- [ ] Tester l'accès pour les modérateurs
- [ ] Tester l'accès pour les administrateurs
- [ ] Vérifier l'affichage correct de la liste
