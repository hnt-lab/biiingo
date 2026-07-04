# Feuille de test consolidée — Biiingo v0.1.0 (2026-06-12)

> Matériel : le PC (idéalement celui de la salle) + un téléphone. Adresse (historique — depuis : hnt-lab.github.io/biiingo)
> Noter chaque problème avec : l'écran, l'action faite, ce qui était attendu, ce qui s'est passé.
> ⚠️ Les sons sont silencieux tant que les fichiers mp3 ne sont pas déposés dans sounds/ — c'est normal.

## 0. Préparation
- [ ] PC : ouvrir l'adresse → « Créer mon compte » (nom de scène + email + mot de passe)
- [ ] Téléphone : ouvrir la même adresse → se connecter au même compte

## A. Créer et afficher
- [ ] Téléphone : « ➕ Nouvelle soirée » (titre libre) → la télécommande s'ouvre, code 4 lettres visible en haut à droite
- [ ] PC : la soirée apparaît dans « Mes soirées » → « 🖥 Afficher » → « ▶ Lancer l'affichage » → plein écran + écran d'accueil

## B. Tirage (le cœur)
- [ ] Taper un numéro sur le téléphone → il s'illumine sur le PC en ~1 seconde, avec animation + gros numéro qui pulse
- [ ] Taper 5-6 numéros → historique des précédents + compteur X/90 OK sur le PC
- [ ] Re-taper un numéro coché → popup « Annuler le N ? » → confirmer → il s'éteint sur le PC
- [ ] 🎯 Objectif → choisir « Double quine » → le bandeau du PC se met à jour
- [ ] 📢 Bandeau → taper un texte → « Afficher » → il défile en bas du PC ; le re-masquer

## C. Vérification
- [ ] Onglet 🔍 → laisser « suspense » coché → « Lancer la vérification » → le PC passe en mode suspense
- [ ] Appuyer sur 4 numéros SORTIS → verts sur téléphone ET PC
- [ ] Appuyer sur 1 numéro NON sorti → rouge + secousse sur le PC
- [ ] « 💋 Faux bingo » → animation sur le PC → « Reprendre la partie »
- [ ] Refaire une vérification → « ✨ GAGNÉ » → taper un prénom → Valider → animation Bravo sur le PC
- [ ] Onglet ⚙️ : le gagnant est dans le Hall of Fame
- [ ] Refaire un GAGNÉ → taper les 1res lettres du même prénom → il est proposé automatiquement (habitués)

## D. Entracte
- [ ] Onglet ✏️ Édition → « Ajouter un artiste » (nom + message + photo depuis le téléphone) → il apparaît
- [ ] Onglet 🎭 → « ▶ » sur l'artiste → le PC affiche l'entracte (photo + nom) + le bandeau défile en continu
- [ ] « ▶ Reprendre la partie » → la grille revient telle quelle

## E. Manche suivante
- [ ] « ➡️ Manche suiv. » → confirmation → grille vidée, « Manche 2 », objectif revenu sur Quine (PC + téléphone)

## F. Écrans personnalisés & fin
- [ ] ✏️ Édition : message d'accueil + photo → Enregistrer → ⚙️ → « 🏠 Accueil » → vérifier sur le PC → revenir sur « 🎲 Partie »
- [ ] ✏️ Édition : message de fin + un lien + lien du QR code → Enregistrer
- [ ] ⚙️ → « 🏁 Terminer la soirée » → PC : remerciements + Hall of Fame + lien + QR code (scanner le QR avec un téléphone !)
- [ ] « 🔓 Rouvrir la soirée » → ça repart

## G. Robustesse (important — outil de scène)
- [ ] PC : F5 en pleine manche → re-clic « Lancer l'affichage » → TOUT revient (grille, manche, objectif)
- [ ] Téléphone : couper le wifi/4G → taper 2 numéros (rien ne se passe sur PC) → réactiver → ils apparaissent tout seuls
- [ ] Fermer l'app du téléphone, la rouvrir → revenir dans la soirée → tout est là

## H. Multi-MC (si un 2ᵉ appareil/compte est dispo)
- [ ] 2ᵉ compte : « 🔑 Rejoindre avec un code » → taper le code → accès à la même soirée
- [ ] Les deux téléphones tapent des numéros en même temps → tout arrive sur le PC sans conflit

## I. Présets
- [ ] ✏️ Édition → « 💾 Sauver comme préset » → puis « ➕ Nouvelle soirée » en choisissant le préset → artistes + écrans + bandeau récupérés
