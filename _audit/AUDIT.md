# Registre d'audit — Biiingo

> Source de vérité sur ce qui est RÉELLEMENT vérifié (Règle Zéro : tout statut non audité est provisoire).
> ⚠️ Limitation connue : je ne peux pas exécuter l'app — vérifications par lecture de code (`node --check` = syntaxe seule).
> Les dimensions « Déclenche/Interagit » sont jugées sur la logique du code → le test utilisateur reste indispensable.

## 2026-06-12 — v0.1.0 : build initial complet

### Codé (couverture du cahier des charges 06)
| Élément | État | Notes |
|---|---|---|
| Auth (compte MC, email/mdp) | ✅ codé | messages d'erreur en français sans jargon |
| Accueil : mes soirées, créer (préset), rejoindre par code | ✅ codé | |
| Synchro temps réel téléphone ↔ écran | ✅ codé | onSnapshot sur le doc soirée |
| Écran de salle : 5 états (accueil/tirage/vérif/entracte/fin) | ✅ codé | |
| Grille 1-90 + animations (pop, gros numéro bump) | ✅ codé | CSS only, léger pour PC faible |
| Bandeau manche/objectif + compteur + historique 5 derniers | ✅ codé | |
| Tirage : tap = tiré, tap sur tiré = popup d'annulation | ✅ codé | option 1 validée |
| Objectif libre (quine/double/carton) à tout moment | ✅ codé | |
| Manche suivante = grille vidée + manche+1 (confirmation) | ✅ codé | objectif repart sur Quine |
| Vérification 100% boutons + suspense + verdicts | ✅ codé | sons valid/rate par numéro |
| Hall of fame + champ nom skippable + registre habitués (autocomplétion) | ✅ codé | registre partagé par compte créateur |
| Entractes : programme + entracte libre + reprise | ✅ codé | |
| Bandeau défilant (partie si actif, entracte toujours) | ✅ codé | |
| Écrans éditables (accueil/fin) + liens + QR | ✅ codé | QR généré côté client (lib CDN) |
| Photos compressées base64 (pas de Firebase Storage) | ✅ codé | max 560px, avertissement si lourd |
| Présets (sauver/réutiliser à la création) | ✅ codé | |
| Sons remplaçables + déblocage au clic « Lancer l'affichage » | ✅ codé | fichiers mp3 NON fournis (proposition à venir) |
| Robustesse : refresh, hors-ligne (persistence), multi-MC | ✅ codé | arrayUnion/Remove = zéro conflit |
| Terminer / rouvrir / supprimer la soirée | ✅ codé | suppression réservée au créateur |

### Vérifié
- [x] `node --check` sur tous les fichiers js (syntaxe) — voir session 2026-06-12
- [ ] Test runtime utilisateur (PC + téléphone) — EN ATTENTE (feuille de route de test)

### Reste à faire (bloquant avant test)
- [x] Setup utilisateur : projet Firebase (Auth + Firestore + règles publiées) + config dans js/firebase.js — fait 2026-06-12
- [x] Dépôt GitHub + push + GitHub Pages + domaine autorisé — fait 2026-06-12 → **https://mickaelquintin13-lab.github.io/biiingo/**
- [x] deploy.bat créé (envoi auto)
- [ ] Sons : proposition Pixabay transmise à l'utilisateur (il choisit/télécharge, ou fournit les siens) — fichiers mp3 toujours absents
- [ ] **TEST UTILISATEUR EN COURS** → feuille : _audit/FEUILLE_DE_TEST_v0.1.0.md

## 2026-06-12 — v0.2.0 : lot de corrections n°1 (10 retours utilisateur, tous traités)
| Retour | Traitement |
|---|---|
| Suggestions noms de scène | Placeholders « Diamond Dust » (compte, entracte libre) et « Aude Dubain » (artiste) |
| Bandeau éditable dans Édition | Bloc 📢 ajouté dans l'onglet Édition (texte + afficher/masquer) |
| Bandeau recouvrait la grille | Espace réservé (`#salleScreen.bandeau-on`) : la grille se rétrécit |
| Boutons numéros plus gros sur téléphone | ≤520 px : grille en 5 colonnes (1 dizaine = 2 lignes), tous les boutons agrandis |
| Responsive | mc-content centré max 560px, tabs/boutons agrandis sur mobile |
| Gagnant validé → retour onglet Tirage | `S.mcTab='tirage'` après verdict (gagné ET faux bingo) |
| Objectif suivant automatique après un gagné | quine→double→carton + toast ; carton = message « manche suiv. quand vous voulez » |
| Colonne de droite épurée + emplacements déco | Historique supprimé, compteur déplacé en haut, dernier numéro centré, photos déco haut/bas éditables (soirée + préset) |
| Tuto au démarrage + accessible | js/tuto.js : auto à la 1re visite (localStorage) + bouton ❓ à l'accueil |
| F5 écran de salle → retour direct au tableau | Session mémorisée (localStorage) → réouverture auto ; bouton flottant « 🔊 Plein écran & son » (clic exigé par le navigateur après un F5) |
- Verdict : l'écran de salle revient seul à la grille après ~7 s (timer côté MC + garde-fou : taper un numéro ramène toujours au tirage).
- `node --check` : 11/11 OK. Version 0.2.0.

## 2026-06-12 — v0.3.0 : fond d'entracte + sons changeables depuis l'app
- **Fond d'écran d'entracte** : photo personnalisable (✏️ Édition), compressée à 1280px, voile sombre pour la lisibilité, sauvée dans les présets.
- **Sons changeables DANS l'app** : bloc 🔊 dans Édition — chaque son : ▶ écouter / 📁 remplacer (mp3 ≤ 700 Ko) / 🗑 retour au son de base. Stockés par compte créateur (collection `sons`), chargés par l'écran de salle à l'ouverture. ⚠️ NÉCESSITE la mise à jour des règles Firestore (bloc `sons` ajouté à _setup/firestore.rules) — utilisateur informé.
- **Alternance aléatoire** des variantes tirage/tirage1 et valid/valid1 (fichiers déposés par l'utilisateur).
- Sons de base complets déposés par l'utilisateur (tirage, valid, rate, suspense + gagne/fauxbingo/entracte à confirmer).
- `node --check` : 11/11 OK.

## 2026-06-12 — v0.4.0 : icône & installation app + son de reprise
- **Installable comme une app** : manifest.json (standalone, fr, thème prune) + icônes générées par `_tools/make_icons.js` (grille 3×3, diagonale gagnante or→rose — img/icon-512/192 + apple-touch-icon 180). Liens + metas iOS dans index.html. Pas de service worker (choix assumé) — l'installation Chrome/Android fonctionne sans, iOS passe par « Sur l'écran d'accueil ».
- **Son de reprise de partie** (demande utilisateur) : transition entracte → tirage joue `reprise.mp3` s'il existe (fichier ou perso), sinon le son d'entracte. Ajouté à la liste des sons remplaçables in-app.
- `node --check` : OK. Icône vérifiée visuellement (rendu conforme).

## 2026-06-12 — v0.5.0 : visite guidée + contour du bandeau
- **Tutoriel transformé en visite guidée** (demande : « tuto plus guidé pour les moins studieux ») : 9 étapes, un concept par écran, visuels mockups (boutons, code, mini-grille, vérif), points de progression cliquables, Précédent/Suivant/Passer. Auto à la 1re visite + ❓ accueil + **⚙️ Soirée → « 📖 Revoir le tutoriel »** (le « settings » demandé).
- **Bandeau** : contour doré (liserés haut/bas 3px + halo léger).
- `node --check` : OK.

### Points connus / dette assumée
- Règles Firestore v1 permissives entre comptes connectés (outil privé de troupe) — à durcir si ouverture aux joueurs.
- Préset avec BEAUCOUP de photos d'artistes : risque de dépasser la limite d'1 Mo par document → message d'erreur prévu, à surveiller.
- L'écran de salle suppose un navigateur récent (Chrome/Edge) sur le PC.
