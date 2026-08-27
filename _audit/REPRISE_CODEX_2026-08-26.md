# Reprise technique Codex — 2026-08-26

## Point de départ

- Branche stable : `main`.
- Commit de référence : `d724f52908b1eed5cc3021a19d36462372f3f4cd`.
- Version applicative et publique : `1.5.1`.
- Branche de travail : `refactor/technical-foundation`.
- Dépôt local propre avant intervention et aligné sur `origin/main`.
- Site GitHub Pages comparé au dossier local : contenu identique, hors fins de ligne CSS.

## Sauvegarde

Archive complète créée avant modification :

`C:\Users\mika_\Desktop\Projet Bingo - sauvegarde COMPLETE avant refactor 2026-08-26.zip`

SHA-256 : `73362BD57F88720AD635B02F37DC12ECD543F75DFED5ED6CF98432693C8B17E6`

Vérification : 691 entrées, avec `.git/HEAD`, `index.html` et `_audit/AUDIT.md`.

Une première archive plus petite existe également mais n'inclut pas `.git` ; elle ne constitue pas la sauvegarde de référence.

## Constats de reprise

- Syntaxe valide sur les 16 scripts applicatifs.
- Historique et documentation très complets.
- Version riche mais validation terrain encore incomplète.
- Aucun test automatisé ni validation continue au point de départ.
- Règles Firestore trop permissives pour une ouverture publique avec comptes anonymes.
- Architecture globale fonctionnelle mais devenue coûteuse à faire évoluer sans garde-fous.

## Fondation ajoutée

- Commandes `npm run check` et `npm test` sans dépendance externe.
- Tests des cartons, conditions de victoire, sérialisation, échappement HTML, identifiants, codes de soirée et versions.
- Validation GitHub Actions sur `main`, les branches `refactor/**` et les demandes de fusion.
- Documentation d'architecture et règles de refactoring.

## Lot de fondation validé

- 17 scripts applicatifs valides syntaxiquement.
- 12 tests unitaires verts.
- 11 scénarios d'autorisations Firestore verts dans l'émulateur officiel.
- Test de chargement vert dans le Chrome installé, bibliothèques distantes comprises.
- Test séparé du `main` réellement publié vert : chargement GitHub Pages, authentification anonyme
  Firebase, requête d'affichage sur un code inexistant, puis suppression du compte anonyme de test.
- Zéro vulnérabilité npm dans les dépendances livrées au navigateur.
- Les cinq alertes npm modérées restantes appartiennent exclusivement à la CLI Firebase de développement.
- Empreintes SRI ajoutées aux cinq bibliothèques chargées depuis un CDN.
- Suppressions Firestore centralisées et exécutées par lots de 400 documents.
- Suppression d'une soirée ou d'un compte étendue aux sous-documents joueurs auparavant orphelins.
- Suppression d'un compte étendue aux retours associés.
- Registres, sons, médias, joueurs et feedbacks protégés par rôle dans les nouvelles règles.
- Migration prévue pour les anciens registres dépourvus de liste de membres.
- `deploy.bat` sécurisé : aucune création automatique de commit, publication uniquement depuis un `main` propre et testé.

## Important avant publication

Ce lot n'est ni fusionné, ni poussé, ni déployé. Les règles Firestore du fichier `_setup/firestore.rules`
ne doivent être publiées qu'avec le code correspondant, après la campagne manuelle de validation.

## Lot de découpage structurel — en cours

- État partagé extrait dans `js/state.js` et rendu explicitement accessible via `window.S`.
- Défaut corrigé : le mode joueur testait `window.S`, auparavant absent malgré l'intention du code.
- Outils d'interface extraits de `core.js` vers `js/ui.js`.
- Traitements PNG, JPEG et jeton rond extraits de l'éditeur vers `js/image-utils.js`.
- Calculs de redimensionnement et de recadrage isolés et testés.
- Affichage public et normalisation des codes extraits vers `js/public-display.js`.
- Feedback extrait vers `js/feedback.js`.
- TV, QR et Cast extraits de `mc.js` vers `js/mc-display.js`.
- Test Chrome enrichi : état partagé, vraie compression PNG/JPEG et génération d'un jeton rond.
- Test de production rendu portable entre Windows, macOS et Linux, sans dépendre de la version locale en préparation.
- Workflow GitHub Actions corrigé : installation reproductible des dépendances avec `npm ci` et cache npm.
- Feedback relié sans réinjecter son origine dans un attribut JavaScript HTML.
- État joueur extrait dans `js/joueur-state.js` et exposé via `window.J` : le retour Android peut désormais
  détecter une partie joueur active comme le prévoyait déjà `core.js`.
- Liens et QR codes de la salle extraits dans `js/salle-qr.js` avec test de l'URL joueur encodée.
- Taille après extraction : `core.js` 356 lignes, `mc.js` 324 lignes, `editeur.js` 514 lignes.
- Validation automatisée du lot : 25 scripts valides, 20 tests unitaires, 11 scénarios Firestore,
  Chrome local et site GitHub Pages public tous verts.

## Ordre de travail retenu

1. Figer les comportements métier testables.
2. Centraliser la gestion de version.
3. Durcir les règles Firestore et supprimer les écritures transversales dangereuses.
4. Extraire progressivement les responsabilités techniques.
5. Exécuter les contrôles automatiques après chaque lot.
6. Terminer par une campagne manuelle consolidée avant fusion vers `main`.
