# Architecture technique

## Vue d'ensemble

Biiingo est une application Web statique servie par GitHub Pages. Le navigateur charge les fichiers HTML, CSS et JavaScript, puis utilise Firebase Authentication et Cloud Firestore pour l'identité, la persistance et la synchronisation temps réel.

## Interfaces

- **MC** : crée, rejoint, configure et pilote une soirée.
- **Salle** : affiche le tableau, les animations et les médias projetés.
- **Joueur** : rejoint par code ou QR, reçoit ses cartons et manipule ses jetons.
- **Affichage public** : ouvre la vue salle en lecture seule après authentification anonyme invisible.

Toutes les interfaces utilisent aujourd'hui la même page et un état global partagé. Les scripts sont chargés séquentiellement depuis `index.html` et exposent leurs fonctions dans le contexte global du navigateur.

## Répartition actuelle

- `js/core.js` : état global, navigation, soirées et accès communs à Firestore.
- `js/auth.js`, `js/profil.js` : authentification et compte.
- `js/mc.js`, `js/editeur.js`, `js/verification.js` : télécommande et configuration.
- `js/salle.js`, `js/anims.js`, `js/sons.js` : rendu public et ambiance.
- `js/joueur.js`, `js/cartons.js`, `js/jetons.js` : expérience joueur.
- `_setup/firestore.rules` : autorisations de la base de données.

## Contraintes de refactoring

1. Aucun changement fonctionnel implicite.
2. Chaque extraction conserve les fonctions globales utilisées par le HTML tant que les gestionnaires `onclick` en dépendent.
3. Les règles métier sont couvertes avant déplacement.
4. Les changements Firestore sont testés séparément et ne sont pas publiés automatiquement.
5. `main` reste déployable à chaque fusion.

## Validation

- `npm run check` : syntaxe des scripts.
- `npm test` : tests métier et cohérence du paquet publié.
- GitHub Actions exécute ces deux commandes sur les branches de refactoring et les demandes de fusion vers `main`.
- Les scénarios nécessitant Firebase, plusieurs appareils, le mouvement ou une TV restent dans la feuille de test manuel.
