# 04 — Comptes, soirées, présets & robustesse (2026-06-11 — VALIDÉ + ajouts)

> Statut : ✅ = validé par l'utilisateur · ❓ = proposé, pas encore validé.

## ✅ VALIDATIONS (4ᵉ vague, 2026-06-11)
- **Cycle de vie de soirée + robustesse live : VALIDÉS** (survit au refresh, reconnexion auto, page légère).
- **Entracte** : écran avec **message animé + nom et photo de l'artiste**. (L'utilisateur dit « un écran que je ferais moi » → à terme il veut pouvoir composer le contenu — cf. écrans éditables.)
- **Écran de fin** : remerciements + **HALL OF FAME** (les gagnant·e·s de la soirée) + **liens réseaux sociaux + QR code**.
- **Pas de chrono d'entracte** (spectacles à durée variable).
- **Bandeau de messages** : le MC peut afficher un message libre à l'écran de salle. ✅
- **⭐ ÉCRANS ÉDITABLES PAR LES MC** (« ce serait top ») : les écrans d'accueil / entracte / fin doivent être personnalisables (textes, photos, liens, QR) — pas codés en dur.

## ✅ VALIDATIONS (5ᵉ vague, 2026-06-11) — fonctionnel BOUCLÉ
- **Hall of fame** : nom/prénom du gagnant + ce qu'il a remporté (quine / double quine / carton). **Champ gagnant = juste le nom** (pas de champ lot).
- **⭐ Registre des habitués** : garder les noms des gagnants **en mémoire d'une soirée à l'autre** (par compte MC) → autocomplétion du nom à la saisie + « faire plaisir aux habitués » (reconnaître les récurrents, ex. compteur de victoires).
- **Bandeau défilant** (style bandeau d'infos/news, en bas de l'écran) : pendant la partie **si le MC l'active** ; pendant l'entracte **défile en continu**. Texte éditable par le MC (= « bandeau d'annonce » inclus dans les écrans éditables).
- **Écrans éditables : OUI** — accueil, entracte (un par artiste), fin — texte + photo + liens/QR + bandeau d'annonce.
- Limitations techniques signalées : acceptées (vérif stockage photos à l'étape architecture).

## Conséquences fonctionnelles des ajouts (à théoriser/valider) ❓
- **Hall of fame** ⇒ il faut **capturer les gagnants** : au moment du verdict « GAGNÉ ✨ », petit champ optionnel « Prénom du gagnant·e » (+ lot ?) — skippable pour ne pas casser le rythme du show. Liste affichée à l'écran de fin (et consultable par le MC).
- **Photos d'artistes** ⇒ stockage d'images à trancher à l'étape architecture. ⚠️ LIMITATION À VÉRIFIER : Firebase Storage n'est peut-être plus gratuit pour les nouveaux projets (changement 2024) — alternatives : images compressées en base64 dans Firestore (limite 1 Mo/document) ou URL externes. À vérifier 3 sources avant de promettre.
- **QR code** ⇒ généré dans l'app depuis une URL fournie par le MC (lib JS légère côté client, pas de service externe).
- **Bandeau message** ⇒ où s'affiche-t-il ? (pendant le tirage ? l'entracte ? les deux ?) ❓

## Cycle de vie d'une soirée ❓
1. **Connexion** (compte MC) → écran d'accueil de l'app.
2. **Choix du mode** : 🖥 Affichage (écran de salle) ou 📱 MC (télécommande).
3. **Créer une soirée** (depuis un préset ou de zéro) → l'app génère le **code court**.
4. Les autres appareils **rejoignent** : même compte → liste de ses soirées ; autre compte → code court.
5. La soirée vit (manches, entractes, vérifications).
6. **Clôturer la soirée** → écran de fin (remerciements) → la soirée passe en « terminée ».

## Préset de soirée ❓ (contenu)
- Titre de la soirée (affiché à l'accueil et en fin).
- **Programme d'entractes** : liste ordonnée des numéros de spectacle (nom de l'artiste / titre du numéro). Au moment de lancer l'entracte, le MC choisit dans la liste OU saisit librement.
- Structure habituelle des manches (optionnel, indicatif — les MC restent libres en live).
- (Plus tard : sons custom, visuels, couleurs.)

## Robustesse en live (CRITIQUE — c'est un outil de scène) ❓
- **Tout survit au refresh** : F5 sur le PC en pleine soirée → la grille revient telle quelle (état dans Firestore, pas seulement en mémoire locale).
- **Coupure réseau** : Firebase se reconnecte tout seul ; à la reconnexion, l'écran se resynchronise. Les taps faits hors-ligne sur le téléphone partent à la reconnexion (offline persistence Firestore).
- **Double tap simultané de deux MC sur le même numéro** : sans effet négatif (le numéro est tiré, point).
- **Le PC faible** : page d'affichage légère — animations CSS simples, pas de framework lourd.

## Idées notées pour PLUS TARD (pas v1)
- Faire venir les **joueurs** dans l'app (cartons virtuels) — la base comptes/soirées le permettra.
- Statistiques de soirée (numéros sortis, durée des manches).
- Sons et visuels personnalisés par compte.
