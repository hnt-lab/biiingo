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

## 2026-06-12 — v0.5.1 : plein écran récupérable
- Bug signalé : après Échap (sortie du plein écran), aucun moyen d'y revenir (le bouton rose ne réapparaissait pas — il est lié au déblocage du son, qui ne se refait pas).
- Fix : **bouton ⛶ dédié au survol** (à côté du ✕, opacité faible → visible au hover) qui bascule le plein écran à tout moment. Le bouton rose ne gère plus que le cas « son pas encore débloqué » (après F5).

## 2026-06-12 — v0.6.0 : sons de début/fin de soirée + musique d'attente
- **`debut.mp3`** : joué à la transition accueil → tirage (manche 1, grille neuve). Fichier déjà déposé par l'utilisateur.
- **`fin.mp3`** : joué au passage à l'écran de fin.
- **`attente.mp3`** : musique d'ambiance **en boucle** tant que l'écran d'accueil est affiché (stoppée en quittant l'accueil ; démarre aussi après le déblocage du son post-F5). Boucles factorisées (SOUND_LOOPS).
- Les 3 ajoutés à la liste des sons remplaçables in-app + LISEZMOI.md refait (13 emplacements).
- ⏳ L'utilisateur cherche les fichiers attente/fin.

## 2026-06-12 — v0.7.0 : animations de verdict personnalisables (théorisé doc 07, validé)
- **Moteur js/anims.js** : 3 couches (fond / vedette / particules), CSS transform/opacity uniquement, ≤30 particules, nettoyage auto.
- **6 styles** : GAGNÉ = Pluie de gloire / Feu d'artifice / Cabaret (projecteurs + bulles) · FAUX = Douche froide / Tampon (secousse) / Pschitt. + mode 🎲 Surprise (aléatoire, résolu une fois par verdict).
- **PNG persos** (transparence conservée — compression PNG dédiée, jamais JPEG) : max 3 particules (320px) + 1 vedette (512px) par verdict, refus si > ~300 Ko après réduction. Sans PNG : emojis (✨💖💋 / 💔🥀). Sauvé dans soirée + présets.
- **Éditeur** : 2 blocs 🎉/💋 dans Édition (choix de style + gestion des images, vignettes à damier pour voir l'alpha).
- **Robustesse** : l'écran de vérif ne se reconstruit que si la vérif change (l'animation n'est plus coupée par un snapshot anodin) ; rejouée après F5 ; stoppée en quittant l'état.
- **Garde-fou son** (incident utilisateur du jour) : un son bloqué faute de clic → le bouton devient rouge « 🔇 Cliquez ici pour activer le son ! » (Sons.onBlocked).
- `node --check` : à vérifier ci-dessous.

## 2026-06-12 — v0.8.0 : lot de retours n°2 (5 points)
| Retour | Traitement |
|---|---|
| 5 derniers numéros dans la colonne de droite | Réintégré (`.histo`, sous le dernier numéro en grand) |
| Couper le son / régler le volume | Onglet ⚙️ Soirée → bloc « 🔊 Son de la salle » : bouton mute + slider volume → `son:{mute,volume}` dans la soirée, appliqué par l'écran de salle (Sons.enabled + Sons.setVolume) |
| Nom du joueur saisi AVANT la vérif | Champ nom (+ autocomplétion habitués) sur l'écran d'intro de vérif ; GAGNÉ valide direct avec ce nom (plus de modal après) ; nom affiché pendant le pointage |
| Photos accueil/entracte plus grandes | salle-photo 32→46vh, grande 42→58vh, largeurs élargies |
| **Partie de la lose** (battle royale) | Objectif `lose` (💀). Thème danger rouge sur l'écran (grille, dernier numéro), label « Numéro fatal », couperet plein écran « N — ÉLIMINÉ·E ! » à chaque tirage, son `elimination` optionnel (fallback tirage). N'auto-avance pas d'objectif. GAGNÉ = enregistre le·a survivant·e. |
- DA lose : choix assumé — comme l'app ne connaît pas les cartons joueurs, la dramatisation porte sur le NUMÉRO fatal (couperet), pas sur un compteur de survivants. À faire évoluer si cartons virtuels un jour.
- `node --check` : 12/12 OK.

## 2026-06-12 — v0.9.0 : lot retours n°3 (réorg + ajustements)
| Retour | Traitement |
|---|---|
| Désactiver un son individuellement | Bouton 🔊/🔇 par son dans Édition → `son.off[]` (liste), respecté par Sons.setDisabled ; barré + grisé dans la liste ; sauvé dans les présets (sonOff) |
| DA mort subite : garder fond+grille, changer couleur dernier numéro | Thème rouge sur fond/grille/cases RETIRÉ ; couperet plein écran RETIRÉ ; seul le « Numéro fatal » (grand numéro) passe au rouge + label adapté + accent manche |
| Image d'accueil 75/80 % | `.salle-accueil .salle-photo` 74vh/82vw, titre/sous-titre réduits |
| Image de fond pour l'écran de fin | `ecrans.fin.fond` éditable (voile sombre), comme le fond d'entracte |
| Réorg Édition par étapes chronologiques | Accueil → Pendant la partie (déco+bandeau fusionnés) → Vérification (anims gagné+faux fusionnés) → Entracte (programme+fond fusionnés) → Fin (écran+fond fusionnés) → Sons (avant-dernier) → Présets (dernier) |
| Réorg Soirée | « Écran de salle » en 1er, panneau mis en avant + gros boutons nav ; puis Son ; Code de la soirée en version compacte plus bas |
- `node --check` : 13/13 OK. Aucune référence orpheline (grep).

## 2026-06-12 — v0.9.1 : corrections du lot n°3 (3 malentendus)
- **Mort subite DA — sens corrigé** : j'avais inversé. L'utilisateur AIMAIT les cases rouges + animation `cellElim` (v0.8.0) ; je les avais retirées en v0.9.0. → RESTAURÉES (cases sorties rouges + couperet), sur fond + grille habituels. Le numéro fatal reste rouge.
- **Image d'accueil trop petite** : cause = photo compressée à 560px (max-* ne fait que rétrécir, pas agrandir → affichée à sa taille native). Fix : accueil compressé en HD (FOND_MAX_DIM 1280) + max-height 78vh/86vw. ⚠️ les photos d'accueil déjà uploadées (560px) doivent être re-uploadées.
- **Pas de vérification en mode lose** : la mort subite n'a pas de carton → onglet Vérif remplacé par « 🏆 Déclarer le·a survivant·e » (nom + bouton, déclenche l'animation GAGNÉ + Hall of Fame). verifLoseWin().
- `node --check` : 13/13 OK.

## 2026-06-12 — v0.9.2 : icône déconnexion + bouton recharger
- Icône déconnexion ⏻ (mal rendue sur Android) → 🚪.
- **Bouton 🔄 Recharger / mettre à jour** : en-tête accueil + onglet ⚙️ Soirée (avec n° de version affiché). Indispensable en mode app installée (standalone) où il n'y a pas de barre d'adresse pour faire F5. `appReload()` = location.reload().
- `node --check` : OK.

## 2026-06-12 — v0.9.3 : image d'accueil (vrai fix)
- v0.9.1 insuffisant : `max-height` ne fait que limiter, jamais agrandir → l'image restait à sa taille native.
- Fix : `.salle-accueil .salle-photo { height: 74vh; width: auto; max-width: 90vw; flex-shrink: 0; object-fit: contain; }` → la hauteur d'affichage est FORCÉE (≈ 75 % de l'écran) quelle que soit la résolution source. Compression accueil montée à 1600px pour rester net sur projecteur.

## 2026-06-12 — v0.10.0 : images hors fiche soirée (fix limite 1 Mo) + accueil HD + bandeau
- **Cause de l'erreur « réseau » à l'upload = limite 1 Mo/document Firestore** (confirmée avec l'utilisateur). Toutes les images étaient empilées dans la fiche soirée.
- **Refonte stockage** : nouvelle collection `medias` (1 doc par image, clé `{soireeId}__{key}`). Les 3 grandes images plein écran (accueil, entracteFond, finFond) y sont déplacées → la fiche soirée redevient légère + chaque image a son propre budget. `mediaGet/mediaSet/mediaDel` (core.js), abonnement temps réel `S.medias`, repli sur l'ancien champ inline (compat soirées existantes ; re-sauver vide l'inline). Nettoyage des médias à la suppression de soirée. Règle Firestore `medias` ajoutée (À REPUBLIER).
- **Accueil HD** : compression 1920px q0.78 (son propre doc → peut être lourd), affichage `height: 82vh` (≈ image dominante).
- Compression : baisse auto de qualité si une image dépasse ~950 Ko (tient dans son doc).
- **Bandeau** : fond = dégradé or→rose (couleur des cases) + texte blanc ombré ; séparateur ✦ entre deux passages du message.
- (Restent inline, plus petits : photos d'artistes, déco, PNG d'animation — à migrer aussi si la fiche regrossit.)
- `node --check` : 13/13 OK.

## 2026-06-12 — v0.10.1 : couleur du bandeau corrigée
- Malentendu : « même couleur que les cases » = cases NON sorties (violet/prune par défaut), pas le doré. Bandeau → fond `var(--bg2)` + bord `var(--bord)` (identique aux cases vides), texte clair, séparateur ✦ rose.

## 2026-06-12 — v0.11.0 : anti-cache (les MAJ ne s'appliquaient pas !) + plafond de vérification
- **CAUSE des « pas de changement »** : cache HTTP du navigateur/GitHub Pages (~10 min) sur css/js. Le reload normal ne re-téléchargeait pas → l'utilisateur voyait l'ancienne version (image accueil, bandeau inchangés).
- **Fix anti-cache** : CSS + tous les JS chargés avec `?v=__B` (document.write dans index.html). `window.__B` à bumper À CHAQUE DÉPLOIEMENT (en même temps que APP_VERSION). Bouton 🔄 → `location.replace(base + '?u=' + Date.now())` force un index.html frais → re-télécharge les assets versionnés.
  - ⚠️ RÈGLE DEPLOIEMENT : bumper `version.js` APP_VERSION **ET** `index.html` window.__B ensemble.
- **Vérification plafonnée** : on ne peut pointer que le nombre requis (quine 5 / double 10 / carton 15) — au-delà, tap bloqué + toast, cases non pointées grisées. Quand le compte est atteint : **bannière qui surgit** — verte « 🏆 Valider la victoire » si tout est sorti, rouge « Faux bingo » sinon. (VERIF_BESOIN)
- `node --check` : 13/13 OK.

## 2026-06-13 — v0.12.0 : lot post-test réel (4 correctifs)
- **Emojis cassés dans les titres en dégradé** : `background-clip:text` transformait les emojis en silhouette. Helper `gradTxt()` (core.js) qui isole les emojis dans `<span class="emo">` (-webkit-text-fill-color:initial). Appliqué à : titre accueil, nom entracte, message de fin, verdicts (✨/💋).
- **Vérification spéciale « partie de la lose »** : remplace la déclaration directe. Logique INVERSÉE — on vérifie que le carton du survivant n'a AUCUN numéro sorti (sorti = rouge = éliminé, pas sorti = vert = sauvé). besoin lose = 15. CTA : « 💀 Éliminé » si un numéro sorti, « 🏆 Survivant·e confirmé·e » si carton complet sans aucun sorti. verifLoseWin supprimée.
- **Hall of Fame** : ~5 visibles (max-height 42vh) + défilement vertical aller-retour auto (`salleHofScroll` mesure le débordement → anim `hofScroll` alternate, durée selon le nombre).
- **Message du bas page de fin** : bandeau défilant désormais affiché aussi sur l'écran de fin (avant : entracte + partie seulement). *(Interprétation de « message du bas pas codé » — à confirmer.)*
- `node --check` : 13/13 OK. __B + APP_VERSION bumpés (0.12.0).

## 2026-06-25 — v0.13.0 : bouton validation flottant + tuto refait
- **Vérif — barre d'action flottante (hybride)** : le CTA de validation/faux n'est plus en haut (scroll requis sur mobile) mais une **barre fixée en bas** (au-dessus des onglets, zone du pouce), avec halo pulsé (vert si victoire, rouge sinon). La grille reste visible au-dessus (correction sans rien fermer). Spacer ajouté pour le scroll. `.verif-cta.float`.
- **Tuto refait en visite guidée complète (10 étapes)** : principe, lancer+code, tirage, objectifs **+ mort subite**, vérification (plafond/correction/bouton flottant + lose inversée), entracte, hall of fame & fin, édition par étapes + présets, son (mute/volume/couper un son/clic activer), installer + 🔄. Nouveaux mockups (`.tg-cell.lose`, `.tg-flow`). Clé localStorage versionnée `biiingo_tuto_vu_v2` → se réaffiche une fois à tout le monde.
- `node --check` : 13/13 OK. __B + APP_VERSION = 0.13.0.

## 2026-06-25 — Idées futures notées
- Voir `_theorisation/08_idees_futures.md` : (1) bingo entièrement personnalisable (nombre de cases + contenu + objectifs éditables), (2) config technique « un seul appareil » via stream/miroir d'écran vers rétroprojecteur/télé. Non priorisé, à théoriser plus tard.

## 2026-06-25 — v0.14.0 : SPRINT v1 — Lot 1 (comptes + sécurité + migration hnt-lab)
- **Migration** : remote git → hnt-lab/biiingo ✅. Théorisations 08/09 poussées. ⏳ Domaine Firebase (utilisateur).
- **Mot de passe oublié** : lien sur l'écran de connexion → sendPasswordResetEmail (message neutre anti-énumération).
- **Écran Profil (👤 accueil)** : pseudo modifiable, email affiché, changer mot de passe (reauth), revoir tuto, déconnexion (déplacée ici), **suppression de compte** (reauth + purge complète : soirées possédées + leurs médias, sons, registre, présets, profil, puis compte).
- **Règles Firestore resserrées** : create = owner ; update = mcUids seulement, SAUF « rejoindre » (seule modif permise : s'ajouter soi-même à mcUids — diff/hasAll/size+1) ; delete = owner. ⚠️ À REPUBLIER par l'utilisateur.
- **Règle permanente enregistrée (mémoire)** : bibliothèques libres de droit uniquement. Licences vérifiées : Firebase (Apache 2.0), qrcodejs (MIT), Bubblewrap (Apache 2.0).
- `node --check` : 14/14 OK. Version + __B = 0.14.0.

## 2026-06-25 — v0.14.1 : SPRINT v1 — Lot 2 (préparation APK)
- **Méthode APK choisie : PWABuilder** (open source MIT — respecte la règle libre de droit) → TWA signée sans toolchain local. Justification : pas de téléchargement SDK/JDK fragile sur la machine, génère APK + clé + assetlinks en un clic. Bubblewrap gardé en plan B.
- **Site rendu « packageable »** : manifest.json complété (`id`) ; **sw.js minimal SANS AUCUN CACHE** (installabilité sans réintroduire l'enfer de cache du MJ Toolkit — aucun respondWith) + enregistrement dans index.html.
- **_setup/GUIDE_APK.md** : pas à pas PWABuilder (Package ID io.github.hntlab.biiingo, sauvegarde OBLIGATOIRE de la clé ×2, dépôt `hnt-lab.github.io` pour assetlinks — je pousserai le fichier quand l'utilisateur me donne son contenu, installation sideload).
- `node --check` OK. Version + __B = 0.14.1.

### ⏳ EN ATTENTE UTILISATEUR (bloquants pour finir le sprint)
1. Firebase : ajouter `hnt-lab.github.io` aux domaines autorisés (Auth → Settings) — sinon LOGIN CASSÉ sur le nouveau domaine.
2. Firebase : republier les règles (_setup/firestore.rules — resserrées v0.14.0).
3. PWABuilder : générer le zip APK (guide) + sauvegarder la clé + m'envoyer assetlinks.json.
4. GitHub : créer le dépôt public `hnt-lab.github.io`.

## 2026-06-25 — INCIDENT SÉCURITÉ (résolu) : clé de signature poussée sur le dépôt public
- **Cause** : l'utilisateur avait déposé le zip PWABuilder (keystore + mots de passe) dans `_setup/` ; mon `git add -A` l'a embarqué sans vérification. **Leçon : toujours relire le `git status` avant un add -A quand des fichiers tiers peuvent traîner.**
- **Résolution** : (1) paquet déplacé hors dépôt → `Bureau\Biiingo-CLES-APK-NE-PAS-SUPPRIMER\` ; (2) .gitignore blindé (*.keystore, *.apk, *.aab, signing-key-info.txt) ; (3) historique réécrit + push forcé (autorisé par l'utilisateur) ; (4) **clé considérée compromise → RÉGÉNÉRÉE** via PWABuilder (rien n'était distribué → coût nul) ; (5) assetlinks.json mis à jour avec la nouvelle empreinte (EF:D3:E4:…) et poussé sur hnt-lab.github.io.
- L'ancien APK (1re clé) est à jeter ; seule la nouvelle génération fait foi.

## 2026-06-25 — 🏆 v1.0.0 — FEUILLE DE TEST V1 : TOUT VERT
- L'utilisateur a validé l'intégralité de FEUILLE_DE_TEST_V1.md : comptes (reset mdp, profil, changement mdp, suppression avec compte de test), sécurité, régression, **APK installé sans barre d'adresse**, MAJ auto via deploy.bat confirmée sur téléphone, clé sauvegardée en double.
- Sprint « v1 diffusable + APK » BOUCLÉ dans les délais (objectif : une semaine — fait en 1 jour de sessions).
- Biiingo v1.0.0 = officiellement diffusable (APK hors store + site + PWA).
- ⚠️ Seule vérification restante demandée à l'utilisateur : confirmer que les règles Firestore resserrées ont bien été REPUBLIÉES (les cases pré-requis étaient décochées ; le domaine est prouvé fait par la connexion, les règles ne sont pas prouvables par les tests passés).

### Points connus / dette assumée
- Règles Firestore v1 permissives entre comptes connectés (outil privé de troupe) — à durcir si ouverture aux joueurs.
- Préset avec BEAUCOUP de photos d'artistes : risque de dépasser la limite d'1 Mo par document → message d'erreur prévu, à surveiller.
- L'écran de salle suppose un navigateur récent (Chrome/Edge) sur le PC.
