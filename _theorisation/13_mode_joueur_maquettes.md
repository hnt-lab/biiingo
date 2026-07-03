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

*Statut : maquettes en attente de validation → puis GO code (un bloc) + feuille de test.*
