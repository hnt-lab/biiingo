# Feuille de test consolidée — v1.1.0 MODE JOUEUR (Phase B) — 2026-06-25

> Matériel idéal : PC (salle) + ton téléphone (MC) + 1-2 téléphones « joueurs » (Android de préférence).
> Noter chaque souci : écran + action + attendu + obtenu.

## ⚠️ PRÉ-REQUIS (2 actions Firebase — sinon les joueurs ne peuvent pas entrer)
- [ ] Firebase → Authentication → Sign-in method → **activer « Anonyme »** (pour les invités)
- [ ] Firebase → Firestore → Règles : recoller `_setup/firestore.rules` (bloc joueurs ajouté) → **Publier**

## A. Rejoindre
- [ ] Écran de salle en Accueil → le **QR « Scanne pour jouer »** s'affiche en bas à droite
- [ ] Téléphone joueur : scanner le QR → écran « Tu rejoins la soirée XXXX » → prénom → **🎟 Jouer en invité**
- [ ] Passage en **paysage** (plein écran) ; en portrait → écran « 🔄 Tourne ton téléphone »
- [ ] Le carton s'affiche (3 lignes × 9 colonnes, 15 numéros) avec la réserve de jetons à droite
- [ ] Sur la télécommande MC : le compteur **👥** monte à 1
- [ ] ⚙️ Soirée → « 📱 Afficher le QR en salle » → popup QR par-dessus la partie ; re-tap → disparaît
- [ ] Rejoindre avec « 👤 Mon compte » (2ᵉ appareil ou après déconnexion) → entre avec le pseudo du compte

## B. Les jetons (le cœur fun)
- [ ] Glisser un jeton de la réserve sur une case → il se **colle** au centre de la case
- [ ] Le re-glisser hors de la case → il retombe et roule (physique)
- [ ] **Secouer le téléphone** → TOUS les jetons posés tombent 😈
- [ ] Après la chute : les cases dont le numéro était VRAIMENT tiré ont un **halo doré** (aide à la re-pose)
- [ ] **Changer d'appli puis revenir** → les jetons sont tombés aussi
- [ ] Vibration légère à chaque numéro tiré par le MC

## C. Alerte & victoire
- [ ] MC : tirer les numéros d'une ligne du carton du joueur ; joueur : poser ses jetons dessus
      → bannière « 👀 Psst… ta ligne X est complète. À toi de crier ! » + vibration (UNE seule fois)
- [ ] Poser un jeton sur un numéro NON tiré → PAS d'alerte même si la ligne est couverte
- [ ] MC : vérification classique → GAGNÉ avec le **prénom exact du joueur** → le joueur reçoit
      « 🎉 Bravo …, victoire validée ! » (+ invitation compte si invité)
- [ ] Multi-cartons : ✏️ Édition → 2 cartons/joueur → NOUVEAU joueur → 2 cartons, miniatures C1/C2 à gauche, bascule OK

## D. Mort subite côté joueur 💀
- [ ] Objectif → Partie de la lose ; MC tire un numéro présent sur le carton du joueur
      → **carton qui se fissure OU brûle** + popup « ÉLIMINÉ·E ! Le N t'a été fatal… »
- [ ] « 👀 Rester regarder » → il voit la suite en spectateur
- [ ] ➡️ Manche suivante → le joueur reçoit de **nouveaux cartons** et revient en jeu

## E. Suivre la soirée
- [ ] Entracte lancé par le MC → écran 🎭 avec le nom de l'artiste côté joueur
- [ ] Bandeau défilant activé → visible en bas de l'écran du joueur
- [ ] Fin de soirée → remerciements + hall of fame + **bouton « Créer mon compte »** (invités)
- [ ] F5 / fermeture-réouverture du téléphone joueur → revient dans la partie avec SON carton (jetons tombés, normal)

## F. Réglages & personnalisation
- [ ] ✏️ Édition → bloc 👥 : désactiver le mode joueur → un nouveau scan dit « mode joueur désactivé »
- [ ] Jeton par défaut : choisir 💋 → les jetons des NOUVEAUX arrivants sont des 💋
- [ ] Jeton depuis une **image** (📷) → jeton rond bordé d'or avec l'image dedans
- [ ] Compte joueur : 👤 Profil → choisir SON jeton (emoji ou image) → il est utilisé en jeu
- [ ] Profil : les stats (soirées jouées / victoires) s'affichent

## G. Régression rapide (rien de cassé côté MC/salle)
- [ ] Tirage, vérif, entracte, sons, présets → comme avant
- [ ] Une soirée SANS joueurs fonctionne exactement comme avant

→ Tout vert = v1.1.0 confirmée, le mode joueur part en soirée réelle ! 🎉
