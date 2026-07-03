# 12 — CAHIER DES CHARGES : MODE JOUEUR (Phase B) — théorisé 2026-06-25

> Décisions utilisateur intégrées (Q&A du 2026-06-25). Statut : EN THÉORISATION — pas de code avant GO.

## A. PARCOURS JOUEUR

### Rejoindre (zéro friction)
1. L'écran de salle affiche un **QR code de la soirée** (+ le code 4 lettres) — pendant l'accueil et
   accessible pendant la partie (coin discret ? à trancher).
2. Le spectateur scanne → arrive sur la vue joueur → choix : **« Jouer en invité »** (saisit juste
   son prénom/pseudo) ou **« Créer mon compte / me connecter »**.
3. ✅ DÉCISION : compte léger optionnel. Invité = immédiat. Compte = stats personnelles portables.

### Les stats même pour les invités (décision utilisateur)
- **Invité** : ses stats sont rattachées AU COMPTE DE L'ORGANISATEUR — extension naturelle du
  **registre des habitués** existant (registres/{ownerUid}) : victoires, participations, par prénom.
  (Même mécanique que le hall of fame actuel : l'organisateur « possède » la mémoire de SES soirées.)
- **Compte joueur** : stats personnelles portables de soirée en soirée (participations, victoires,
  badges) + personnalisation (voir E).

## B. LE(S) CARTON(S)

- Génération au vrai format loto FR : 3×9, 15 numéros, 5/ligne, colonnes par dizaines, unique par joueur.
- ✅ DÉCISION : **le NOMBRE de cartons par joueur est un réGLAGE DE L'ANIMATEUR** (ex. 1 à 4) —
  dans les réglages de la soirée (⚙️ ou Édition).
- Multi-cartons : navigation par balayage (ou vue réduite 2×2 ?) — à maquetter.
- Le carton survit au refresh (stocké côté soirée, re-associé au joueur).

## C. LES JETONS À PHYSIQUE (la signature)

- Le joueur POSE ses jetons lui-même (drag & drop) sur les cases qu'il pense sorties.
- **Physique réelle** : moteur 2D (matter.js — MIT ✓) + accéléromètre : le téléphone bouge trop →
  les jetons glissent/tombent. Fun, social, fidèle au bingo papier.
- **Mode sérieux** (toggle joueur) : jetons verrouillés après pose (tap pour retirer).
- Les positions de jetons restent LOCALES (pas de synchro — la physique est personnelle, ça ne
  concerne pas les autres). Seul le carton (numéros) est stocké côté serveur.

## D. ALERTE & VÉRIFICATION (décisions clés)

- ✅ **Alerte « tu as une quine 👀 » UNIQUEMENT côté joueur**, et SEULEMENT si :
  (1) il a **posé un jeton sur chaque case de la ligne** concernée ET
  (2) ces cases correspondent **vraiment** aux numéros tirés.
  → L'alerte récompense le marquage actif : pas de jetons posés = pas d'alerte (comme au vrai
  bingo, on peut rater sa quine !). Le CRI reste au joueur.
- ✅ **La vérification reste MANUELLE par l'animateur, un numéro à la fois, même pour un carton
  démat** (rituel + contrôle + suspense conservés). Le joueur peut montrer son téléphone, l'animateur
  pointe comme aujourd'hui. AUCUN changement du flux de vérif actuel.

## E. PERSONNALISATION (décisions)
- ✅ **L'animateur personnalise le JETON PAR DÉFAUT** de la soirée (style/couleur/emoji — dans Édition).
- ✅ **Seuls les joueurs AVEC COMPTE peuvent personnaliser leur carton/jeton** (skins) —
  c'est aussi le futur crochet freemium cosmétique (théorisation 10/11).

## F. CE QUE LE JOUEUR VOIT (écran)
- Son/ses carton(s) + réserve de jetons en bas.
- Le **dernier numéro tiré** (bandeau haut, discret — l'écran de salle reste la star).
- ✅ **Le bandeau défilant de l'animateur** (s'il est affiché) en bas de son écran.
- **Mort subite** : détection AUTO (un numéro tiré est sur son carton) → **animation carton qui se
  brise/brûle + écran grisé + gros popup « ÉLIMINÉ·E 💀 »** (décision). Il reste ensuite en spectateur.
- États de la soirée suivis : entracte (visuel calme), fin (remerciements + hall of fame).

## G. TECHNIQUE (esquisse)
- **Invités = connexion anonyme Firebase** (invisible, zéro friction) → élégant : les règles Firestore
  actuelles (auth != null) continuent de protéger, PAS besoin d'ouvrir la lecture publique.
- Données : `soirees/{id}/joueurs/{uid}` : { nom, invite: bool, cartons: [[15 nums]], elimine: bool }.
  Règles : le joueur écrit SON doc ; les MC lisent tout ; nb cartons contrôlé par réglage soirée.
- Le joueur écoute la soirée (tirés/état/bandeau) en temps réel — comme l'écran de salle.
- Physique : matter.js (MIT), chargé UNIQUEMENT côté vue joueur (pas d'alourdissement salle/MC).
- Coûts : n joueurs = n auditeurs temps réel → surveiller le palier gratuit Firebase (lié théorisation 10).
- QR : généré avec la lib qrcodejs déjà intégrée (MIT ✓).

## H. QUESTIONS TRANCHÉES ✅ (réponses utilisateur 2026-06-25)
1. **Vibration uniquement** côté joueur (numéro tiré + alerte quine). Aucun son.
2. **Balayage** entre cartons + **miniatures des autres cartons en picture-in-picture**.
3. QR : **écran d'accueil uniquement** en automatique + **bouton animateur** qui affiche le QR
   **en popup sur n'importe quel écran de salle** à la demande (retardataires).
4. **Oui** : compteur de joueurs connectés visible par l'animateur.
5. **Oui** : un invité doit pouvoir récupérer ses stats en créant un compte — et **l'app doit
   POUSSER à la création de compte** (nudges aux bons moments : après une victoire, en fin de
   soirée — jamais bloquant).

*Prochaine étape : maquettes d'écrans (doc 13) → validation utilisateur → GO → code d'un bloc.*
