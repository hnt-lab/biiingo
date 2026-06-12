# 03 — Écrans & contrôles (2026-06-11 — VALIDÉ avec précisions)

> Statut : ✅ = validé par l'utilisateur · ❓ = proposé, pas encore validé.

## ✅ VALIDATIONS (3ᵉ vague, 2026-06-11)
- **Vue « Tirage » : VALIDÉE** telle que proposée (grille par dizaines, bandeau d'état, barre d'actions).
- **Vérification : tout en BOUTONS, jamais de clavier/saisie texte.** (Malentendu levé : « taper » voulait dire « appuyer sur le bouton du numéro ».) L'écran de vérification affiche les numéros en **boutons triés par dizaine** ; le MC **appuie** sur les numéros du carton du joueur : bouton tiré → vert + son de validation ; bouton NON tiré → rouge + son raté (le faux bingo se révèle en direct). Les 90 numéros sont affichés (tirés mis en évidence), tous appuyables.
- **Sons : sortent du PC écran de salle** (branché au jack de la sono). Téléphones muets. ✅
- **Annulation : Option 1** — tap sur un numéro déjà coché → mini-popup « Annuler le 42 ? ». ✅
- **« Manche suivante » = vider la grille** (une seule et même action : nouvelle manche, grille vierge, compteur de manche +1). Le bouton « Vider la grille » séparé disparaît. ✅
- **Modes sur un même compte : « mode Affichage » et « mode MC »** — le PC se connecte au compte du MC et choisit « Affichage (écran de salle) », le téléphone choisit « MC ». **Un compte connecté sur plusieurs appareils simultanément = aucun problème technique** (Firebase Auth le permet nativement, le MJ Toolkit fonctionne déjà comme ça). Le code court reste utile pour qu'un AUTRE MC (autre compte) rejoigne la soirée. ✅
- Sons : l'utilisateur attend ma **proposition de recherche** de sons libres de droits ambiance cabaret ; il tranchera.

## La télécommande MC (téléphone) ❓

### Vue principale « Tirage »
- **Grille compacte 1-90** (rangées par dizaines : 1-10, 11-20, …) — un tap = numéro tiré → synchro instantanée sur l'écran de salle.
- Numéros déjà tirés : visuellement marqués (remplis/colorés).
- **Bandeau d'état en haut** : Manche X · Objectif en cours · compteur de numéros tirés (ex. « 23/90 »).
- **Barre d'actions** :
  - 🎯 **Objectif** : Quine / Double quine / Carton plein (le MC choisit librement, changement à tout moment).
  - 🔍 **Vérification** (passe en mode vérification).
  - 🎭 **Entracte** (bascule l'écran de salle en mode spectacle).
  - 🧹 **Vider la grille** (avec confirmation — action lourde).
  - ➡️ **Manche suivante** (incrémente le compteur de manche ; vide la grille ? à clarifier).

### Annulation ❓ (options)
- **Option 1** : tap sur un numéro déjà coché → mini-popup « Annuler le 42 ? » (évite le doigt qui glisse).
- **Option 2** : bouton « ↩ Annuler le dernier » + appui long sur un numéro pour annuler un numéro précis.

### Mode « Vérification » (principe validé, détails ❓)
- Affiche les **numéros tirés triés par dizaine**.
- Le MC **tape les numéros du carton du joueur** → chaque appui = **bruit de validation** (joué par l'écran de salle).
- **Toggle « Suspense »** : si activé, l'écran de salle passe en mode suspense (roulement feutré, lumière tamisée visuelle) pendant la vérification.
- Verdict : bouton **« GAGNÉ ✨ »** → animation glamour sur l'écran de salle · bouton **« Faux bingo 💋 »** → animation humoristique.
- Si le MC tape un numéro NON tiré → signal immédiat (rouge + son « raté ») : verdict évident.

## L'écran de salle (PC + projecteur) — états
1. **Accueil** : visuel d'attente (titre de la soirée).
2. **Tirage** : grille 1-90 + bandeau manche/objectif + dernier numéro en énorme (pulse/paillettes).
3. **Vérification** : mode suspense optionnel, puis animation GAGNÉ / FAUX BINGO.
4. **Entracte** : plein écran spectacle (nom de l'artiste).
5. **Fin** : remerciements.
- L'écran de salle est **passif** : il ne fait qu'afficher ce que les téléphones pilotent (PC faible → page légère).
- **Sons joués par l'écran de salle** (PC branché au jack de la sono) ❓ à confirmer.

## Comptes & présets ❓
- **Compte MC** (Firebase Auth, comme MJ Toolkit) : email/mot de passe.
- **Soirée** : créée par un MC → **code court** (ex. 4 lettres) → écran de salle + autres MC rejoignent avec le code.
- **Préset de soirée** (réutilisable d'une fois sur l'autre) : titre de la soirée, structure des manches habituelle, noms des artistes/numéros d'entracte, (plus tard : sons custom, visuels).
- L'écran de salle rejoint en « mode affichage » (pas besoin de compte sur le PC ? juste le code ?) ❓

## Direction sons 🔊 (ambiance cabaret glamour — recherche à faire)
- Numéro tiré : son discret et classe (clic feutré, note de harpe ?) — à doser, ×90 tirages.
- Vérification (suspense) : roulement feutré, nappe de tension type Drag Race élimination.
- Validation par numéro : « ding » doux/glamour.
- GAGNÉ : envolée glamour (harpe + applaudissements cabaret, shimmer).
- Faux bingo : humour chic (« ba-dum-tss » burlesque, ou soupir de diva).
- Entracte : jingle d'intro spectacle.
- ⚠️ Si introuvable en libre de droits → l'utilisateur fournira les sons. Prévoir des **fichiers remplaçables** (architecture : un dossier sounds/ avec noms standards).
