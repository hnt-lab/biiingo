# 05 — Architecture technique (PROPOSITIONS ❓ — 2026-06-11)

> Statut : ❓ = proposé, pas encore validé.

## ✅ Vérification Firebase Storage (3 sources concordantes, 2026-06-11)
- **CONFIRMÉ** : depuis le 30 octobre 2024, Cloud Storage for Firebase exige le plan **Blaze** (= carte bancaire enregistrée) même pour le bucket par défaut. Plan gratuit Spark : plus aucun accès Storage (erreurs 402/403).
- Sources : FAQ officielle Firebase (faqs-storage-changes-announced-sept-2024), firebase.google.com/pricing, articles tiers concordants (Medium xeladu, DeepWiki).
- **DÉCISION PROPOSÉE ❓ : PAS de Firebase Storage.** Les photos d'artistes seront **compressées côté client** (canvas : max ~800px, JPEG ~80%) puis stockées **en base64 dans Firestore** (limite 1 Mo/document — un portrait compressé ≈ 100-200 Ko, large marge). Avantage : zéro carte bancaire, plan Spark gratuit suffit.

## Socle (même recette éprouvée que le MJ Toolkit) ❓
- **Hébergement** : GitHub Pages (nouveau dépôt dédié).
- **Firebase** : Auth (email/mot de passe) + **Firestore** (temps réel). Plan Spark (gratuit).
- **Pas de framework** : HTML/CSS/JS pur, **scripts séquentiels** (pas d'ES Modules) — léger pour le PC faible, et recette que je maîtrise sur ce socle.
- **⭐ PAS DE SERVICE WORKER en v1** (différence volontaire avec le MJ Toolkit) :
  - L'app a besoin du réseau de toute façon (Firebase temps réel) → un cache hors-ligne n'apporte rien.
  - Ça supprime TOUT le problème cache/version qui empoisonne le MJ Toolkit (bump sw.js à chaque déploiement, anciens clients coincés). Ici : refresh = dernière version, point.
  - `version.js` conservé uniquement pour afficher le numéro de version.
- **Persistance hors-ligne du téléphone MC** : assurée nativement par Firestore (cache local + renvoi auto à la reconnexion), sans service worker.

## Modèle de données Firestore (vulgarisé) ❓
- **comptes** (users/{uid}) : pseudo du MC.
- **soirées** (soirees/{id}) : LE document vivant que l'écran de salle écoute en temps réel —
  code court, titre, état de l'écran (accueil/tirage/vérification/entracte/fin), n° de manche, objectif courant, **numéros tirés**, bandeau (texte + actif), entracte en cours (artiste), hall of fame de la soirée, MC autorisés, lien vers le préset.
- **présets** (par compte) : titre, programme d'entractes [{nom artiste, photo, message}], écrans accueil/fin (texte, photo, liens, QR), bandeaux types.
- **registre des gagnants** (par compte) : noms + compteur de victoires (autocomplétion + habitués).
- Multi-MC simultané : écritures atomiques (arrayUnion/arrayRemove) → zéro conflit possible.

## Structure des fichiers ❓
```
Projet Bingo/
  index.html          (point d'entrée unique, comme le MJ Toolkit)
  css/main.css
  js/
    version.js        (source unique de version, affichage)
    config.js         (constantes : objectifs, textes)
    firebase.js       (init + helpers Firestore)
    auth.js           (connexion compte)
    core.js           (état partagé de la soirée, sync, routage des modes)
    salle.js          (écran de salle : grille, gros numéro, entracte, hall of fame)
    mc.js             (télécommande : tirage, objectifs, bandeau)
    verification.js   (mode vérification + verdicts)
    editeur.js        (écrans éditables + présets + photos compressées)
    sons.js           (lecture des sons côté écran de salle)
  sounds/             (fichiers REMPLAÇABLES, noms standards :
                       tirage.mp3, valid.mp3, rate.mp3, suspense.mp3,
                       gagne.mp3, fauxbingo.mp3, entracte.mp3)
  img/
  _theorisation/      (ces documents)
  _audit/             (registre d'audit, créé à la phase code)
```

## Responsive / cibles d'affichage ❓
- **Écran de salle** : 16:9 plein écran (projecteur), lisible de loin (gros contrastes).
- **Télécommande** : téléphone portrait (375-430 px), boutons assez gros pour des doigts en pleine pénombre.
- Breakpoints précis à fixer en phase maquette.

## Questions ouvertes pour l'utilisateur ❓
1. **Projet Firebase séparé** du MJ Toolkit (recommandé : données isolées, quotas indépendants — je guiderai la création pas à pas) ou réutiliser l'existant ?
2. **Nom de l'appli / du dépôt GitHub** ? (il en faut un — ex. « Drag'n'Go », « BingoQueen », à lui de voir avec les MC)
3. Validation de l'ensemble de cette architecture.
