# 02 — Déroulé d'une soirée (2026-06-11, mis à jour après retours)

> Statut : ✅ = validé par l'utilisateur · ❓ = proposé, pas encore validé.

## ✅ DÉCISIONS VALIDÉES (retours utilisateur 2026-06-11, 2ᵉ vague)
- **Ambiance sonore/visuelle : cabaret glamour (Lido / Drag Race), PAS fanfare de kermesse.** Si je ne trouve pas de sons adaptés, l'utilisateur s'occupera des sons lui-même.
- **Vérification** : afficher les numéros tirés **triés par dizaine** ; le MC **appuie sur les numéros du carton du joueur** → **bruits de validation** à chaque appui. **Option « suspense »** pour jouer avec les émotions des joueurs.
- **Manche** = quine → double quine → carton plein **sur la MÊME grille**. MAIS contrôle **totalement libre pour les MC** : ce sont eux qui lancent l'objectif, changent d'objectif, vident la grille ou passent à la manche suivante, à tout moment. Pas de déroulé imposé par l'app.
- **Sono** : la salle a une sono **avec entrée jack** (→ brancher le PC écran de salle dessus ; à confirmer).
- **Comptes : OUI, rien n'est jetable.** Les MC gardent leur compte et leurs **présets**. Le modèle « soirée + code court » est validé. Utile à l'avenir si on fait venir les joueurs dans l'app.
- **Annulation d'un numéro : OUI**, les MC peuvent annuler.
- **DA : on reste FONCTIONNEL pour le moment.** L'utilisateur consultera les MC pour la DA. (Pas d'ancre DA verrouillée encore — base propre et sobre, paillettes plus tard.)

## Phases d'une soirée (machine à états de l'écran de salle)
1. **Préparation (avant le public)** : l'organisateur configure la soirée — nombre de manches, objectif de chaque manche (quine / double quine / carton plein), noms des artistes pour les entractes.
2. **Écran d'accueil** ❓ : avant le début, le projecteur affiche un visuel d'attente (logo de la soirée, « Ça commence bientôt ! », paillettes).
3. **Manche en cours** : grille 1-90 + bandeau objectif + dernier numéro en gros.
4. **Vérification** ❓ : quelqu'un crie « Quine ! » → le MC déclenche le mode vérification → écran de salle en mode suspense (roulement de tambour 🥁), le MC vérifie sur son téléphone → résultat :
   - **GAGNÉ** → grosse animation de célébration + son fanfare.
   - **FAUX BINGO** ❓ → animation humoristique « Faux espoir ! » + son sad-trombone (moment drag par excellence).
5. **Entracte** : visuel spectacle plein écran (nom de l'artiste).
6. **Manche suivante** : la grille repart à zéro (ou continue — selon objectif : au sein d'une même grille, quine puis double quine puis carton plein peuvent s'enchaîner SANS vider la grille — à clarifier avec eux : 3 manches = 3 grilles vierges ? ou 1 grille qui monte en objectif ?) ❓
7. **Fin de soirée** ❓ : écran de remerciement.

## Vérification — options proposées ❓
- **Option A (visuel trié)** : le téléphone du MC affiche les numéros sortis triés par dizaines ; il lit le carton du joueur et vérifie à l'œil. Simple, zéro saisie.
- **Option B (saisie de la ligne)** : le MC tape les 5 numéros de la ligne annoncée (ou 15 pour carton plein) → chaque numéro s'allume vert (sorti) ou rouge (PAS sorti) → verdict instantané et fiable.
- **Option C (hybride)** : B pour quine/double quine (rapide, 5-10 numéros), A pour carton plein.
- Dans tous les cas : bouton « C'est gagné ! » / « Faux bingo ! » → déclenche l'animation sur l'écran de salle.

## Connexion des appareils ❓
- Modèle « soirée » : l'organisateur crée une soirée → obtient un **code court** (ex. 4 lettres) → l'écran de salle ET les téléphones MC rejoignent avec ce code. (Même esprit que les campagnes du MJ Toolkit.)
- Question ouverte : compte organisateur (login) ou tout anonyme ?

## Multi-MC simultané (validé) — implications
- La grille = un ensemble partagé de numéros tirés (Firebase temps réel). Deux MC qui tapent en même temps : aucun conflit possible (un numéro est soit sorti soit pas).
- **Annulation** : tout MC peut dé-cocher un numéro saisi par erreur ❓ (ou seulement celui qui l'a saisi ?).

## Sons 🔊 (demande validée — détails à théoriser)
- Question clé : **la sono de la salle est branchée sur quel appareil ?** Le PC du projecteur ? → les sons sortiraient de l'écran de salle, pas des téléphones.
- Pistes : petit son « pop/ding » au numéro tiré ❓ (attention à la répétition ×90), roulement de tambour pendant la vérification, fanfare victoire, sad-trombone faux bingo, jingle d'entracte.
