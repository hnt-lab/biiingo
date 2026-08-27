# Biiingo

Biiingo est un outil d'animation de soirées bingo. Une télécommande MC pilote en temps réel un écran de salle et, si le mode est activé, les cartons dématérialisés des joueurs.

## Prérequis

- Node.js 20 ou supérieur pour les contrôles locaux.
- Un projet Firebase configuré pour faire fonctionner l'application.
- Un serveur HTTP local ou GitHub Pages pour utiliser l'application dans un navigateur.

## Contrôles locaux

```powershell
npm.cmd run check
npm.cmd test
```

`npm run check` valide la syntaxe de tous les scripts applicatifs. `npm test` contrôle les règles métier, les autorisations Firestore avec l'émulateur et le chargement de la page dans un vrai navigateur Chromium.

`npm run test:production` contrôle séparément la version actuellement publiée sur GitHub Pages, sans écrire de donnée métier.

Pour changer la version sans désynchroniser le cache navigateur :

```powershell
npm.cmd run version:set -- 1.6.0
```

`package.json` est la source de référence ; la commande met également à jour `js/version.js` et le cache-buster de `index.html`.

## Déploiement

La branche `main` correspond à la version publiable. Les travaux passent par une branche dédiée et ne sont fusionnés qu'après validation des contrôles automatiques et de la feuille de test manuel.

La publication actuelle repose sur GitHub Pages. Firebase Authentication et Firestore restent des services externes à configurer séparément ; voir `_setup/GUIDE_INSTALLATION.md`.

`deploy.bat` ne crée plus de commit automatique. Il refuse toute branche autre que `main`, vérifie que le dépôt est propre, exécute tous les contrôles puis pousse explicitement `main` vers GitHub.

## Documentation

- Architecture technique : `docs/ARCHITECTURE.md`
- Registre d'audit : `_audit/AUDIT.md`
- Feuilles de test : `_audit/FEUILLE_DE_TEST_*.md`
- Guides d'installation et de distribution : `_setup/`
- Décisions produit historiques : `_theorisation/`
