# 13 — MAQUETTES : MODE JOUEUR (Phase B) — proposées 2026-06-25 ❓

> Maquettes texte à valider AVANT tout code. ❓ = en attente de validation.

## 1. Écran « Rejoindre » (après scan du QR ou saisie du code)
```
┌─────────────────────────────┐
│         Biiingo ✨           │
│   🎉 Soirée du 20 juin      │
│   animée par Diamond Dust    │
│                             │
│  Ton prénom / surnom :       │
│  ┌─────────────────────┐    │
│  │ Jacqueline          │    │
│  └─────────────────────┘    │
│  [ 🎟 Jouer en invité ]      │   ← gros bouton principal
│                             │
│  ─────────  ou  ──────────  │
│  [ 👤 Mon compte Biiingo ]   │   ← connexion / création
│  Avec un compte : tes stats  │
│  te suivent à chaque soirée  │
└─────────────────────────────┘
```

## 2. Vue joueur principale (le carton)
```
┌─────────────────────────────┐
│ Manche 2 · Double quine  47 │  ← bandeau haut : objectif + DERNIER NUMÉRO (pulse)
│ ┌───┐                        │
│ │c2 │  ← miniatures PiP des  │
│ │c3 │    autres cartons      │
│ └───┘   (tap = y aller)      │
│ ┌─────────────────────────┐ │
│ │  4 │12 │  │45 │  │68│83│ │ │
│ │  7 │  │31│  │52 │  │87│ │ │  ← LE CARTON (3×9)
│ │  │18│36│  │59 │74│  │90│ │ │    jetons posés dessus 🔴
│ └─────────────────────────┘ │
│    ● ● ○ ○  (position 2/4)   │  ← balayage entre cartons
│                             │
│   🔴 🔴 🔴 🔴 🔴 🔴          │  ← réserve de jetons (drag vers le carton)
│ [🔒 Mode sérieux]  [❓]      │
│▓▓ Pensez au bar 🍹 ▓▓▓▓▓▓▓▓│  ← bandeau défilant de l'animateur (si actif)
└─────────────────────────────┘
```
- **Physique** : jetons soumis à l'accéléromètre — téléphone secoué = jetons qui glissent/tombent
  du carton (retour dans la réserve). Mode sérieux = jetons verrouillés (tap pour retirer).
- **Vibration légère** à chaque numéro tiré + à l'alerte quine.

## 3. Alerte quine (discrète, pour le joueur seul)
```
╭─────────────────────────────╮
│ 👀 Psst… ta ligne 2 est      │   ← bannière glissante en haut, halo doré,
│ complète. À toi de jouer !   │     vibration. Ne dit pas QUOI crier —
╰─────────────────────────────╯     le joueur garde son moment.
```
Condition stricte : jetons posés sur TOUTES les cases de la ligne ET numéros réellement tirés.

## 4. Élimination (mort subite)
- Le numéro fatal est sur son carton → **animation carton qui se fissure puis brûle/s'effrite**
  (morceaux qui tombent avec la physique 💅), écran grisé, popup :
```
┌─────────────────────────────┐
│          💀                  │
│      ÉLIMINÉ·E !             │
│   Le 47 t'a été fatal…       │
│ [ 👀 Rester regarder ]       │
└─────────────────────────────┘
```
- Ensuite : vue spectateur (dernier numéro + bandeau, carton grisé cassé en fond).

## 5. Fin de soirée côté joueur + nudge compte
```
┌─────────────────────────────┐
│   Merci d'avoir joué ! ❤️    │
│   🏆 Hall of Fame            │
│   (les gagnants du soir)     │
│                             │
│ 🎉 Jacqueline, tu as gagné   │
│ 1 fois ce soir !             │
│ [ 👤 Créer mon compte pour   │   ← LE nudge (aussi après une victoire
│   garder mes stats ]         │     validée). Jamais bloquant.
└─────────────────────────────┘
```

## 6. Côté ANIMATEUR (ajouts à l'existant)
- **En-tête télécommande** : `👥 42` (compteur de joueurs connectés, live).
- **⚙️ Soirée** : bouton **« 📱 Afficher le QR en salle »** → popup QR par-dessus N'IMPORTE QUEL
  écran de salle (tirage/entracte…), re-tap pour fermer. QR automatique sur l'écran d'accueil.
- **✏️ Édition** : nouveau bloc « 👥 Joueurs » : nombre de cartons par joueur (1-4),
  jeton par défaut de la soirée (choix emoji/couleur), activer/désactiver le mode joueur.
- **Vérification** : INCHANGÉE (pointage manuel, décision utilisateur).

## 7. Personnalisation joueur AVEC COMPTE (léger pour v1)
- Choix du style de SES jetons (ex. 6 styles : 🔴 classique, 💖, ⭐, 💋, 🍀, 💀) + couleur du carton.
- (Plus tard : skins premium = crochet freemium, théorisation 10/11.)

## ✅ VALIDATION UTILISATEUR (2026-06-25) — maquettes approuvées AVEC amendements

1. **Vue joueur en PAYSAGE** (téléphone horizontal) : le carton 3×9 s'y étale naturellement.
   - En app installée/TWA : verrouillage paysage (screen.orientation.lock).
   - En navigateur simple : écran « 🔄 Tourne ton téléphone » tant qu'on est en portrait.
   - Layout paysage : carton au centre, réserve de jetons à droite (pouce), miniatures PiP à gauche,
     bandeau animateur en bas, dernier numéro en haut.
2. **PAS de mode sérieux — hardcore assumé** :
   - Le téléphone bouge → les jetons glissent/tombent.
   - **Changer d'appli / verrouiller l'écran → TOUS les jetons tombent** (visibilitychange).
   - **Aide à la re-pose** : les cases où un jeton était posé À RAISON (numéro réellement tiré)
     restent **légèrement mises en avant** (halo doux) pour remettre facilement. Les cases marquées
     à tort ne sont PAS aidées (bien fait pour toi 💅).
3. Texte alerte : « 👀 Psst… ta ligne 2 est complète. **À toi de crier !** »
4. Élimination : le carton **se fissure OU brûle** (choisi aléatoirement — variété).
5. Côté animateur : OK tel quel. Nudge compte : OK tel quel.
6. **NOUVEAU — jeton personnalisé À PARTIR D'UNE IMAGE** : cercle avec bordure et l'image insérée
   dedans (recadrage circulaire automatique via canvas, compressé petit ~128px).
   - Joueur avec compte : son jeton-image perso.
   - Animateur : peut aussi créer le jeton PAR DÉFAUT de la soirée à partir d'une image (logo de la
     troupe, tête de la drag du soir 💖).

*Statut : MAQUETTES VALIDÉES. EN ATTENTE DU GO EXPLICITE pour coder la Phase B d'un bloc.*
