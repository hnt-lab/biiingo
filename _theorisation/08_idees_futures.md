# 08 — Idées futures (backlog, non priorisé) — 2026-06-25

> Pistes d'évolution notées au fil de l'eau. Pas encore théorisées ni validées pour développement.

## 1. Bingo entièrement personnalisable (générateur de bingo custom)
Permettre aux utilisateurs de **créer leur propre bingo sur mesure**, au-delà du loto français 90 numéros :
- **Nombre de cases libre** (pas forcément 90) — ex. grille 25, 50, 100…
- **Contenu des cases entièrement personnalisable** : au lieu de numéros, mettre des mots, des images, des thèmes (ex. bingo de soirée, bingo de répliques, bingo d'événements…).
- **Objectifs éditables** eux aussi : définir ses propres conditions de victoire (au lieu de quine/double/carton imposés) — ex. une forme précise, X cases, une diagonale, un motif custom…

**Implications à théoriser (le jour venu) :**
- L'affichage de salle doit s'adapter à une grille de taille/forme variable (actuellement figé en 9×10 pour 1-90).
- La vérification (plafond, pointage) doit suivre les objectifs custom.
- Stockage : un « modèle de bingo » réutilisable (probablement dans les présets / un nouveau type d'objet).
- Gros chantier UX + technique — bien cadrer avant.

## 2. Configuration technique « un seul appareil » (stream / miroir d'écran)
Aujourd'hui : 2 appareils (PC salle + téléphone MC). Proposer une config alternative pour ceux qui n'ont **qu'un seul ordi OU qu'un seul mobile**, en diffusant l'écran vers le rétroprojecteur / la télé :
- **Cast / stream d'écran** (Chromecast, miroir d'écran Windows/Android, câble HDMI…) depuis l'appareil unique vers le grand écran.
- Nécessiterait sans doute un **mode « tout-en-un »** : la même fenêtre montre la télécommande ET ce qui est projeté (ou une bascule rapide), puisqu'il n'y a qu'un appareil.
- À étudier : comment éviter que les contrôles MC (boutons, modales) ne s'affichent sur le grand écran si on mire l'écran complet → peut-être un affichage « salle » dans un onglet/fenêtre séparé que l'on caste, pendant qu'on garde la télécommande sur l'appareil.

**Implications à théoriser :**
- Détecter / proposer le mode selon le matériel.
- Séparer proprement « ce qui se caste » (vue salle) de « ce qu'on touche » (télécommande) sur un seul appareil.
- Tester la faisabilité du cast d'un onglet seul vs écran complet selon les plateformes.

---

# THÉORISATION APPROFONDIE (2026-06-25) — aucune ligne de code, réflexion seulement

## Idée 1 — Bingo personnalisable : approche par PALIERS (du plus simple au plus ambitieux)

L'app est aujourd'hui câblée sur le loto français : `NB_NUMEROS = 90`, grille fixe 9×10, objectifs figés (quine/double/carton/lose), vérification = nombre de cases (5/10/15). Tout personnaliser d'un coup = gros risque. Découpage proposé :

### Palier A — Nombre de numéros configurable (petit effort)
- Un réglage « format » à la création : 90 (FR), 75 (US), ou nombre libre.
- Surtout une généralisation de `NB_NUMEROS` + adaptation de la grille de salle (colonnes auto).
- Garde des numéros (pas de contenu custom). Faible risque, vrai gain (couvre le bingo US 75).

### Palier B — Contenu des cases personnalisable (effort moyen-élevé)
- Cases = mots / images / thèmes au lieu de numéros.
- **Vrai point dur : le tirage.** Aujourd'hui le MC tape un numéro sur une grille 1-90. Avec du contenu libre, il faut soit (a) une grille télécommande qui affiche tout le contenu (cases cliquables), soit (b) un tirage aléatoire par l'app qui révèle l'item. À trancher.
- Éditeur de contenu (liste d'items + upload d'images → repose sur le système `medias` déjà en place).
- L'écran de salle doit afficher du texte/des images dans les cases, pas que des chiffres.

### Palier C — Objectifs / motifs éditables (effort élevé)
- Définir ses conditions de victoire : ligne, colonne, diagonale, carton, **ou motif dessiné** (cocher des cases sur une mini-grille = le motif gagnant).
- Impacte la **vérification** : le plafond et le pointage doivent suivre le motif. Or l'app ne connaît pas les cartons joueurs (jugement MC) → il faut repenser ce que « vérifier » veut dire pour un motif libre.
- Probablement : un « modèle de bingo » réutilisable (nouveau type d'objet, ou extension des présets) contenant format + contenu + objectifs.

### Questions ouvertes idée 1
- Quel palier vise-t-on en premier ? (A seul est déjà très utile et peu risqué.)
- Tirage du contenu custom : grille cliquable (MC choisit) OU tirage aléatoire app ?
- La « partie de la lose » s'applique-t-elle aux bingos custom ? (a priori oui, générique.)
- Garde-t-on TOUJOURS le jugement MC pour la vérif, ou un jour des cartons joueurs dans l'app ?

## Idée 2 — Configuration « un seul appareil » (diffusion vers grand écran)

Objectif : se passer du duo PC+téléphone quand on n'a qu'UN appareil. Le nœud = **séparer ce qui est projeté (vue salle) de ce qu'on touche (télécommande)**.

### Cas faisable AUJOURD'HUI sans nouveau code (juste de l'usage)
- **PC portable + 2ᵉ écran/projecteur en HDMI (mode “étendre l'affichage”)** : ouvrir 2 onglets de Biiingo — un en mode 🖥 Affichage (glissé sur le projecteur), un en mode 📱 télécommande (sur l'écran du PC). Marche déjà tel quel.
- **PC + Chromecast** : « caster un onglet » (l'onglet Affichage) vers la TV, garder l'onglet télécommande sur le PC. Marche déjà.

### Ce qu'un futur dev pourrait AJOUTER pour rendre ça fluide
- Un bouton **« Ouvrir l'écran de salle dans une autre fenêtre »** (popout) depuis la télécommande → un clic, la fenêtre Affichage s'ouvre, prête à être glissée sur le projecteur / castée. Évite de retaper le code de soirée.
- Détection « un seul écran » → proposer ce mode automatiquement.

### Le cas DIFFICILE : un seul téléphone qui caste sur une TV
- Le **miroir d'écran d'un téléphone diffuse TOUT** (y compris tes boutons MC) → on verrait les contrôles sur la TV. Le cast « d'un onglet seul » est peu/pas supporté sur mobile.
- Pistes (à valider techniquement) : un **« mode présentation »** qui n'affiche que le tableau, contrôlé par des **gestes/zones invisibles** ou une **petite barre escamotable** ; ou accepter que la TV montre le tableau plein écran et piloter « à l'aveugle ». Aucune solution propre évidente → à creuser, faisabilité incertaine.

### Questions ouvertes idée 2
- Cible prioritaire : PC unique (faisable, fluidifiable) ou téléphone unique (dur) ?
- Le bouton « popout fenêtre salle » suffirait-il pour 90 % des cas ?
- Teste-t-on d'abord ce qui marche déjà (2 onglets / cast d'onglet) avant de coder quoi que ce soit ?

---

# IDÉE 2 — THÉORISATION APPROFONDIE (2026-06-25, focus demandé par l'utilisateur)

## Le vrai problème reformulé
Il faut séparer **2 surfaces** : la **surface d'affichage** (le tableau, vu par la salle) et la **surface de contrôle** (les boutons, touchés par le MC). Avec 2 appareils c'est naturel. Avec 1 seul, il faut « envoyer » l'affichage ailleurs tout en gardant le contrôle en main.

## ⭐ DÉCOUVERTE CLÉ : l'authentification casse le cast
- L'app synchronise déjà tout via Firestore. Donc **n'importe quelle 2ᵉ fenêtre/écran qui ouvre la soirée en mode Affichage est déjà synchro** — pas de nouvelle plomberie à inventer. ✅
- MAIS : aujourd'hui le mode Affichage **exige d'être connecté** (compte MC) et de choisir la soirée.
  - **Même appareil, 2ᵉ écran HDMI (bureau étendu)** : c'est le MÊME navigateur → la connexion est partagée → **une fenêtre “popout” marche directement**. ✅
  - **Chromecast / cast d'appareil** : le Chromecast charge l'URL **comme un appareil neuf, sans connexion** → il ne peut PAS s'authentifier comme le MC → **écran de connexion au lieu du tableau.** ❌
- **Conséquence majeure** : pour caster proprement (Chromecast, ou partager un lien d'affichage), il faut un **mode “Affichage public” en lecture seule** : voir une soirée **sans compte**, juste via son **code/lien**. Ça implique aussi d'ajuster les règles Firestore (aujourd'hui lecture = connexion requise).

## Mécanismes web disponibles (pour mémoire technique)
- **Multi-fenêtre** (`window.open`) : ouvrir l'Affichage dans une fenêtre séparée → la glisser sur le 2ᵉ écran. Simple, même session (auth OK).
- **Window Management API** (`getScreenDetails`) : détecter les écrans + placer la fenêtre en plein écran sur le projecteur automatiquement (Chrome desktop, permission). Confort en plus.
- **Presentation API** (`PresentationRequest`) : la “vraie” voie web pour envoyer une URL sur un écran de cast (Chrome desktop + Android). MAIS bute sur le problème d'auth ci-dessus → nécessite le mode public.
- **Miroir d'écran OS** (téléphone) : diffuse TOUT, non sélectif → montre les contrôles. Pas de solution propre.

## Approche par phases proposée (idée 2)
- **Phase 2.1 — Bouton “Ouvrir l'écran de salle dans une autre fenêtre” (popout).** Cible : **PC unique + 2ᵉ écran/projecteur HDMI**. Effort faible. Réutilise synchro + auth existantes. Couvre déjà beaucoup de cas. Lien profond `?soiree=ID&mode=salle` pour auto-ouvrir.
- **Phase 2.2 — “Mode Affichage public” (lecture seule, sans compte, via code/lien).** Débloque : **Chromecast, cast d'onglet propre, et un lien d'affichage partageable** (ex. une tablette dédiée à l'entrée). Effort moyen + **modif des règles Firestore** (lecture publique d'une soirée par code). Enjeu sécurité : n'importe qui avec le lien voit le tableau (pas grave — c'est fait pour être public à l'écran).
- **Phase 2.3 — “Mode présentation” pour téléphone unique castant en miroir.** Tableau plein écran + contrôles escamotables/gestes. Faisabilité **incertaine**, à prototyper en dernier.

## Questions ouvertes à trancher (idée 2)
1. **Quel matériel** ont réellement les MC quand ils veulent le mode 1 appareil : PC portable ? tablette ? téléphone ? (détermine la phase prioritaire)
2. Un **lien/QR d'affichage public en lecture seule** est-il OK (n'importe qui avec le lien voit le tableau) ? → débloque le cast proprement.
3. On valide l'ordre **2.1 → 2.2 → 2.3** ? (le popout PC d'abord, le cast public ensuite, le téléphone-miroir en dernier si faisable)
4. Avant tout code : veux-tu d'abord **tester en vrai** le « 2 onglets sur écran étendu » et le « cast d'onglet » pour voir si ça suffit déjà à 90 % ?

---

# IDÉE 2 — RÉORIENTATION (2026-06-25) : « souvent les gens n'ont qu'un MOBILE »

Info utilisateur déterminante → la cible n°1 = **un seul téléphone**. Ça re-priorise tout.

## Le « téléphone seul » se scinde en 2 selon COMMENT le tél rejoint le grand écran
1. **Téléphone + écran “intelligent” (Chromecast / Smart TV / TV avec navigateur / projecteur connecté)**
   → **CAS PROPRE ET RÉALISTE.** On NE mirroir PAS le téléphone. À la place, le **grand écran charge lui-même le lien d'affichage public** (via son navigateur, ou un Chromecast qui ouvre l'URL). Le téléphone reste **100 % télécommande**. Display et contrôle sont sur 2 surfaces différentes → exactement ce qu'on veut.
   → Nécessite : **Mode Affichage public** (lecture seule, sans compte, via **code court** ou **lien/QR**). C'est tout.
2. **Téléphone + câble HDMI (adaptateur) = miroir d'écran**
   → **CAS DUR.** Le miroir diffuse TOUT l'écran du téléphone, contrôles compris. Impossible de séparer display et contrôle sur la même dalle physique.
   → Compromis seul possible : **« mode présentation »** = tableau plein écran avec **contrôles ultra-discrets/escamotables** (le public voit surtout le tableau ; quand le MC touche, un mini-panneau apparaît brièvement). Jamais parfait. À prototyper en dernier, faisabilité limitée.

## ⭐ Conséquence : LE MODE AFFICHAGE PUBLIC devient la PRIORITÉ N°1
C'est la clé qui débloque le téléphone seul (cas 1, le plus courant aujourd'hui avec les Smart TV / Chromecast) ET, en bonus, le PC, le cast d'onglet, et une tablette d'accueil. Donc on inverse l'ordre :

- **Phase 1 (ex-2.2) — Mode Affichage public (lecture seule, sans compte, via code/lien).**
  - Le grand écran (TV/navigateur/Chromecast) ouvre `…/biiingo/?display=CODE` → affiche le tableau en direct, sans login.
  - Le téléphone du MC = télécommande normale.
  - Techniquement : une vue Affichage qui s'abonne à la soirée en lecture seule via le **code** (pas l'UID), + **règles Firestore** permettant la lecture d'une soirée par code sans authentification (à border : lecture seule, pas d'écriture, et seulement les champs d'affichage).
  - Enjeu sécurité : quiconque a le lien voit le tableau → **acceptable** (c'est projeté en public de toute façon). À NE pas exposer : données de compte, autres soirées.
- **Phase 2 (ex-2.1) — Bouton “popout fenêtre” pour le PC + 2ᵉ écran HDMI.** Confort pour ceux qui ont un PC. Faible effort.
- **Phase 3 (ex-2.3) — “Mode présentation” pour téléphone + HDMI miroir.** Compromis imparfait, en dernier.

## Points encore à trancher (idée 2, version mobile-first)
1. Quand un MC n'a qu'un téléphone, il rejoint le grand écran **comment** le plus souvent : **Chromecast/Smart TV** (→ cas propre) ou **câble HDMI** (→ cas dur) ? (à demander aux MC)
2. Le **Mode Affichage public** via code/lien : principe validé ? (lecture seule, public)
3. Détail du code public : on réutilise le **code soirée à 4 lettres** existant, ou un lien/QR dédié « affichage » ?
4. Faut-il que l'écran public gère le **son** ? (oui — c'est lui le grand écran branché à la sono ; donc le mode public doit aussi jouer les sons → ça marche sans login, juste un clic pour débloquer le son.)

---

# IDÉE 2 — POINT TECHNIQUE CRUCIAL (2026-06-25) : « caster » ≠ « caster »

Info utilisateur : la méthode courante = Chromecast / Smart TV **via la fonction “caster” (WiFi/Bluetooth)**. Il faut distinguer DEUX choses que les gens appellent toutes les deux « caster » :

### 1. « Caster mon écran » = MIROIR D'ÉCRAN (Miracast / Smart View / AirPlay / Google Cast “écran”)
- Diffuse **tout l'écran du téléphone**. Donc si le tél montre la grille de boutons (le contrôle), la TV montre… la grille de boutons.
- **Conflit fondamental** : au bingo, le MC tape des numéros en permanence → la « surface de contrôle » EST le pavé de numéros. En miroir, ce pavé serait **toujours** sur la TV. ⇒ **impossible d'avoir un beau tableau propre sur la TV ET le contrôle sur le tél en même temps.** Le miroir ne peut pas séparer les deux surfaces. ❌

### 2. « Caster une appli / un lien » = ENVOI INDÉPENDANT (Chromecast charge une URL tout seul)
- Le Chromecast charge **lui-même** la page d'affichage public ; le téléphone garde le contrôle. Les 2 surfaces sont séparées. ✅
- C'est LA solution propre pour téléphone seul. Déclenchée par un **bouton “Caster” intégré à l'app** (technique web = Cast SDK / Presentation API) qui envoie l'URL d'affichage public au Chromecast.

### ⚠️ LIMITE DE PLATEFORME à dire clairement
- **Android + Chrome + Chromecast** : le bouton « Caster » intégré (Presentation API) peut envoyer l'URL → **propre, faisable.** ✅
- **iPhone (Safari/AirPlay)** : pas d'API web pour envoyer une URL indépendante ; AirPlay ne fait que **mirrorer** → **bloqué dans le cas miroir.** ❌ (sauf si la TV a un navigateur et qu'on ouvre le lien public dessus à la main).
- Smart TV (Samsung/LG) **avec navigateur intégré** : ouvrir le lien public à la main dans le navigateur de la TV → propre, sans Chromecast.

## Synthèse de faisabilité (téléphone seul → grand écran)
| Matériel | Méthode propre possible ? |
|---|---|
| Android + Chromecast | ✅ Bouton « Caster » in-app (Presentation API) → tableau public sur TV, tél = télécommande |
| N'importe quel tél + Smart TV avec navigateur | ✅ Ouvrir le **lien/QR d'affichage public** dans le navigateur de la TV |
| iPhone + Chromecast/AirPlay (miroir seul) | ❌ Miroir → contrôles visibles. Pas de séparation propre |
| Tél + HDMI / miroir WiFi pur | ❌ Idem miroir |

## Ce que ça impose comme plan (mobile-first, honnête)
- **Brique 1 — Mode Affichage public** (lecture seule via code/lien/QR) = **indispensable et premier**. Sans ça, rien d'autre n'est possible. Couvre déjà : Smart TV à navigateur, et sert de cible au bouton Caster.
- **Brique 2 — Bouton “Caster” intégré** (Cast/Presentation API) = l'expérience fluide pour **Android + Chromecast**. Effort moyen, dépendant des navigateurs.
- **Le miroir pur (iPhone/AirPlay, Miracast) restera un angle mort** : techniquement on ne peut pas séparer. À assumer/communiquer.

## Questions à trancher
1. Les MC sont plutôt **Android ou iPhone** ? (décisif : Android = bouton Caster propre possible ; iPhone = surtout dépendant d'une Smart TV à navigateur)
2. Leurs grands écrans ont-ils un **Chromecast** intégré, ou ce sont des **Smart TV avec navigateur**, ou juste un **écran muet** (HDMI/miroir) ?
3. Valide-t-on : **Brique 1 (affichage public) d'abord**, puis **Brique 2 (bouton Caster)** ?

---

# IDÉE 3 — APK « instance à part » via Capacitor (noté 2026-06-25)
Question utilisateur : l'APK TWA « se lance via Chrome » — pourra-t-il un jour être une instance autonome ?
- **Oui : Capacitor** (open source MIT) = moteur d'affichage embarqué, indépendant de Chrome, session/stockage propres.
- Compromis : toolchain Android locale (~1 Go) à installer, re-build de l'APK à chaque changement de coquille (icône/nom), reconnexion des MC (session séparée de Chrome). En config « URL distante », les MAJ du site restent instantanées.
- **Décision : TWA conservée pour la v1** (légère, auto-MAJ, déjà livrée). Capacitor = évolution possible, surtout si visée Play Store « native ». Non priorisé.

# IDÉE 2 — DESIGN FIGÉ, PRÊT À CODER AU GO (2026-06-25)
Décision utilisateur : **Android prioritaire, mais on couvre les deux plateformes.** La brique 1 étant universelle, l'iPhone est couvert via le navigateur de la Smart TV.

## BRIQUE 1 — Mode Affichage public (universel, fondation, à coder en 1er)
**But** : un grand écran (Smart TV, Chromecast, navigateur) affiche une soirée **en lecture seule, sans compte**, via un **lien + QR + code**.
- **Lien profond** : `https://hnt-lab.github.io/biiingo/?display=CODE` → au chargement, si `?display=` présent → on saute l'écran de connexion et on ouvre directement la **vue salle en lecture seule** de la soirée portant ce code.
- **Résolution** : `soirees where code == CODE` (lecture sans auth).
- **Règles Firestore à adapter** : autoriser la **lecture publique** de `soirees`, `medias` et `sons` (écriture toujours réservée aux comptes). Acceptable : tout ce contenu est destiné à être projeté ; aucune donnée privée n'y est (profils/présets sont dans `users/*`, non exposés). Risque d'énumération par code 4 lettres = négligeable pour cet usage.
- **Réutilise** : tout le rendu `salle.js` existant (grille, animations, entracte, fin, sons, bandeau). Le clic « activer le son » reste nécessaire (déblocage navigateur). Les sons perso se chargent via `soiree.ownerUid` (donc `sons` en lecture publique).
- **Où on génère le lien/QR** : dans la télécommande (onglet ⚙️ Soirée) → un panneau « 📺 Afficher sur un écran » avec le **QR + le lien court + le code**. Le MC ouvre ça sur la TV.
- **Couvre directement** : Smart TV avec navigateur (Android ET iPhone), PC, tablette d'accueil.

## BRIQUE 2 — Bouton « Caster » intégré (confort Android + Chromecast)
- Dans la télécommande, bouton **« 📺 Caster sur la TV »** → utilise la **Presentation API** : `new PresentationRequest(['…?display=CODE']).start()` → l'utilisateur choisit son Chromecast → la TV charge la vue d'affichage public, le téléphone reste télécommande.
- **Dépend de la brique 1** (c'est l'URL publique qui est envoyée).
- **Plateformes** : Chrome Android + Chromecast = ✅. Si l'API n'est pas dispo (iPhone, navigateur non compatible) → **le bouton se transforme en « Afficher sur un écran »** (QR + lien de la brique 1). Donc dégradation propre, les deux plateformes ont une voie.

## Récap de couverture (objectif « les deux »)
- **Android + Chromecast** → bouton Caster (brique 2). ✅ fluide
- **Android/iPhone + Smart TV à navigateur** → QR/lien public (brique 1). ✅
- **iPhone + AirPlay miroir seul / écran muet HDMI** → angle mort assumé (le miroir ne sépare pas). ⚠️

## Ordre de dev (au GO)
1. Brique 1 (affichage public + lien/QR + règles Firestore) — la fondation.
2. Brique 2 (bouton Caster Presentation API + repli QR).
3. (Plus tard / optionnel) « mode présentation » pour le miroir pur — imparfait.

## Limitations à redire à l'utilisateur le moment venu
- Lecture publique des soirées (par code) = assumée (contenu projeté).
- Presentation API = surtout Chrome/Android ; iPhone restera sur la voie « navigateur de la TV ».
- Le miroir d'écran pur ne sera jamais « propre » (limite physique, pas un bug).

---
*Statut : idée 2 — DESIGN COMPLET ET FIGÉ, prêt à coder. Android prio + couverture des deux via la brique 1 universelle. AUCUN dev tant que l'utilisateur n'a pas dit « déploie ». Au GO : commencer par la Brique 1.*
