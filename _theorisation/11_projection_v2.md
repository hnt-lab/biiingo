# 11 — Projection « la suite » : mode Joueur, pub au lancement, phases (théorisé 2026-06-25)

> Réflexion demandée par l'utilisateur pendant la création de son compte Google Play.
> Intègre ses arbitrages : (1) la plupart des organisateurs n'auront jamais besoin de « pro » ;
> (2) pub acceptable UNIQUEMENT au lancement de l'app, freemium = sans pub ;
> (3) créer la partie « spectateur » avec grille dématérialisée fun (jetons à physique réelle).

## A. LE MODE JOUEUR — la pièce maîtresse (et pourquoi elle change tout)

### Le concept
Le spectateur rejoint la soirée (code ou **QR affiché sur l'écran de salle**) et reçoit **son carton
dématérialisé** (vrai format loto : 3×9, 15 numéros, 5 par ligne, colonnes par dizaines, généré unique).

### Le génie du jeton physique (idée utilisateur — à chérir)
Le joueur pose **lui-même** ses jetons sur les cases, avec une **physique réelle** : le téléphone bouge/
tremble → les jetons glissent, tombent des cases. On garde le rituel ET la fragilité du bingo papier —
c'est drôle, c'est social (« attention à ton carton !! »), c'est LA signature de l'app.
- Techniquement : accéléromètre du téléphone (API DeviceMotion) + moteur physique 2D léger
  (**matter.js — licence MIT ✓** conforme à la règle libre de droit).
- Un « mode sérieux » (marquage au tap, jetons verrouillés) pour ceux qui veulent la tranquillité.

### Ce que ça débloque mécaniquement
- **Vérification instantanée** : l'app CONNAÎT le carton du joueur app → quand il crie « Quine ! », le MC
  vérifie en 1 tap (fini le pointage manuel… pour les joueurs app). Les cartons PAPIER restent 100 %
  compatibles (soirées hybrides) — le pointage manuel actuel reste pour eux.
- **Alerte discrète « tu as une quine 👀 »** côté joueur (le cri reste à lui — on ne vole pas le moment).
- **Habitués enrichis** : stats personnelles, badges, historique de victoires (lien avec le registre).
- **L'AUDIENCE** : chaque soirée = 20-100 téléphones qui ouvrent l'app → c'est ce qui rend viable…

### Fondations déjà en place (rien n'est perdu)
- Comptes/soirées/temps réel : prêts. Le « mode Affichage public par code » (idée 2, design figé) est
  AUSSI la fondation du mode joueur (lecture d'une soirée sans être MC).
- Friction à résoudre : un spectateur ne créera pas de compte pour une soirée → **connexion anonyme
  Firebase** (invisible pour lui) ou lecture publique par code. À trancher en théorisation détaillée.
- ⚠️ Ligne rouge légale inchangée : cartons app GRATUITS, l'app ne touche jamais à l'argent du jeu.
- ⚠️ Coûts : des dizaines d'auditeurs temps réel par soirée → on quittera un jour le palier gratuit
  Firebase. C'est justement le rôle de la monétisation ci-dessous.

## B. MONÉTISATION (arbitrage utilisateur intégré)
- **Gratuit** : tout, avec **une pub au lancement de l'app uniquement** (jamais en jeu, jamais sur
  l'écran de salle). Techniquement : AdSense (web/TWA) + bannière de consentement RGPD (obligatoire).
- **Freemium petit prix** : identique, **sans pub** (+ éventuels bonus cosmétiques joueurs : thèmes de
  jetons/cartons — mignon et inoffensif).
- **Pro organisateur** (plus tard, pour la minorité qui en a besoin — bars/campings/agences) :
  bingo custom (idée 1), marque blanche, multi-écrans.
- **Honnêteté sur la pub** : à petite échelle, ça paie des clopinettes (quelques €/mois). Elle ne devient
  intéressante QUE grâce à l'audience du mode joueur. Donc : joueurs d'abord, pub ensuite. Jamais l'inverse.

## C. LES PHASES PROPOSÉES
- **Phase A — Play Store (EN COURS)** : compte dev ✓ en création · politique de confidentialité (à
  rédiger + héberger) · fiche store anti-« gambling » · test fermé 12 testeurs × 14 jours (les MC).
  → Pendant les 14 jours du test fermé, on a le temps de coder la suite.
- **Phase B — MODE JOUEUR v1** : rejoindre par QR/code, carton généré, jetons physiques (matter.js),
  vérif auto des joueurs app, hybride papier. GROS chantier → théorisation détaillée dédiée avant code
  (comme le CDC initial). C'est la priorité produit n°1.
- **Phase C — Monétisation douce** : pub au lancement (gratuits) + compte sans pub + consentement RGPD.
  Seulement quand l'audience joueurs existe.
- **Phase D — Pro organisateur** : idée 1 (bingo custom) + marque blanche + idée 2 complète (Caster).
- Transverse : DA pailletée avec les MC (toujours en attente), Capacitor si besoin (idée 3).

## D. Questions ouvertes pour la théorisation Phase B (à trancher avec l'utilisateur)
1. Joueur sans compte (anonyme invisible) ou compte léger (pour garder ses stats/badges d'habitué) ? Les deux ?
2. Combien de cartons par joueur (1 ? choix 1-4 comme au vrai loto ?) ?
3. L'alerte « tu as une quine » : discrète pour le joueur seul, ou le MC la voit aussi ?
4. Mode lose côté joueur app : élimination automatique visible (son carton se « brise » ?) — potentiel fun énorme.
5. Les jetons : chaque joueur choisit son style de jeton (skin) ? (futur cosmétique freemium)

*Statut : projection consignée. Prochaine étape concrète = Phase A (dossier store), Phase B à théoriser en détail après GO.*
