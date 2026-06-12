# 01 — Contexte et vision (2026-06-11)

## Le client / l'usage
- Une connaissance de l'utilisateur organise des **bingo-drags** : soirées bingo en ~3 manches, avec un **spectacle drag entre chaque manche**.
- L'app doit les aider à **animer leur soirée** : c'est un outil de scène, pas un simple utilitaire.

## Installation actuelle (le problème)
- Un **PC portable peu puissant** branché à un **rétroprojecteur**.
- Le PC est si faible qu'il **ne peut pas dupliquer l'affichage** : seul l'écran du projecteur fonctionne.
- Aujourd'hui ils **remplissent des cases à la main** dans une grille pour afficher les numéros sortis — laborieux.

## Ce que l'app doit faire (vision validée par l'utilisateur)
1. **Saisie en un clic** : un tap sur un numéro → la grille de salle se remplit, **avec animations**.
2. **Grille de salle belle et joyeuse** : DA drag — paillettes, festif, théâtral.
3. **Objectifs par manche** : en général 1 ligne (quine) → 2 lignes (double quine) → carton plein.
4. **Télécommande téléphone** : les maîtres/maîtresses de cérémonie remplissent la grille **à distance depuis leur téléphone** en se déplaçant dans la salle.
5. Interface PC (affichage projecteur) + interface mobile (saisie).

## Socle technique pressenti (même recette que le MJ Toolkit)
- **GitHub Pages** (hébergement gratuit, simple URL à ouvrir).
- **Firebase/Firestore** (synchro temps réel téléphone ↔ écran de salle).
- Insight clé : le PC faible n'a **qu'à afficher une page web** — toute la saisie se fait ailleurs. Ça contourne exactement leur problème de duplication d'écran.

## Règles du jeu vérifiées (loto/bingo français à 90 numéros — 3+ sources concordantes)
- 90 numéros. Cartons de **3 lignes × 9 colonnes**, **15 numéros** par carton (5 par ligne).
- Gains successifs : **Quine** (1 ligne) → **Double quine** (2 lignes) → **Carton plein**.
- L'animateur tire les numéros un à un et les annonce ; le gagnant crie « Quine ! » etc., l'animateur **vérifie le carton** avant de valider.
- ⚠️ À confirmer avec l'utilisateur : format français 90 numéros (probable) vs bingo américain 75 numéros (grille B-I-N-G-O 5×5).

## Méthode (rappel)
- On théorise TOUT → validation → code d'un bloc (cf. CLAUDE.md).
- Chaque étape de théorisation est écrite dans `_theorisation/` au fur et à mesure.

## ✅ Décisions validées (réponses utilisateur 2026-06-11)
1. **Format : loto français 90 numéros.**
2. **Boulier physique** — l'app ne tire PAS les numéros, elle affiche ce que le MC saisit.
3. **Cartons papier physiques** pour les joueurs — la v1 ne gère pas les joueurs.
4. **Tous les MC saisissent en même temps** (multi-téléphones simultanés).
5. **Écran entracte personnalisable : OUI** (nom de l'artiste, visuel spectacle).
6. **Aide à la vérification : OUI**, gérée par le MC, avec une **animation de validation**.

## Écran de salle — détails validés
- Grille 1-90, chaque numéro tiré **s'illumine avec animation** (paillettes, étincelles). ✅
- Dernier numéro **en énorme + mise en forme distincte** (pulse, paillettes). ✅
- Bandeau **manche en cours + objectif** (« Manche 2 — Double quine ! »). ✅
- **Mode entracte** plein écran entre les manches. ✅
- **Des SONS** viendront renforcer le tout (demande utilisateur). 🔊
