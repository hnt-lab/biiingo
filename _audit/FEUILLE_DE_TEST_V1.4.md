# Feuille de test consolidée — v1.2 → v1.4 (2026-07-04)

> Regroupe : correctifs du mode joueur (v1.2), télécommande bureau + feedback (v1.3.x), idée 2 (v1.4).
> ⚠️ Pré-requis : règles Firestore republiées (bloc `feedback`) — sinon l'envoi d'avis échoue.

## A. Correctifs mode joueur (v1.2)
- [ ] Secousse : sensiblement moins nerveuse qu'avant (marcher avec le tel ne fait plus tout tomber)
- [ ] Tenter de tourner le téléphone en portrait → tout tombe 💅
- [ ] Changer d'appli et revenir → les jetons NE tombent PLUS
- [ ] Halo doré : poser un jeton sur une case TIRÉE → secouer → la case garde un halo d'aide
- [ ] Réservoir 🛟 : les jetons au repos à droite ne bougent pas pendant une secousse
- [ ] Miniatures = vrais mini-cartons (cases marquées en rose), bascule au tap
- [ ] Manche suivante → les joueurs GARDENT leurs cartons (marquages remis à zéro)
- [ ] Bouton 🎴 → confirmation → nouveaux cartons
- [ ] L'animateur change l'objectif → il change EN DIRECT sur les téléphones joueurs
- [ ] Passer l'objectif en 💀 → confirmation → le tableau se VIDE partout
- [ ] Bandeau joueur : absent pendant le tirage, présent à l'entracte
- [ ] Élimination → bouton « ↩ Revenir à mon carton »

## B. La nouvelle vérification (v1.2)
- [ ] Écran de lancement : chips 📱 des joueurs connectés + autocomplétion des noms
- [ ] Tap sur un chip → vérif lancée → **le carton du joueur s'affiche** (vert/rouge) + verdict suggéré
- [ ] Pendant la vérif : les jetons de TOUS les joueurs sont GELÉS + voile « 🥁 Vérification en cours »
- [ ] Le joueur vérifié voit « C'est TON carton qu'on vérifie 🤞 »
- [ ] Mort subite : vérif d'un survivant → carton vert si aucun numéro sorti → « Survivant·e confirmé·e »
- [ ] Joueur papier (sans chip) : pointage classique inchangé
- [ ] Tap sur 👥 → liste des joueurs (nom, invité/compte, 💀, victoires)

## C. Bureau & feedback (v1.3.x)
- [ ] PC : onglets EN HAUT, Édition/Soirée en 2 colonnes SANS scroll horizontal
- [ ] La barre de défilement est au bord DROIT de la fenêtre
- [ ] Redimensionner la fenêtre grand↔petit → la mise en page bascule proprement
- [ ] 💬 « Donner mon avis » (⚙️ Soirée, 👤 Profil, fin joueur) → envoi → visible dans
      console Firebase → Firestore → collection `feedback`
- [ ] Profil : stats détaillées (quines/doubles/cartons/morts subites)

## D. Idée 2 — écran sans PC (v1.4)
- [ ] ⚙️ Soirée → « 🔗 Lien pour un écran » → QR + lien copiable
- [ ] Ouvrir le lien sur un AUTRE appareil (PC, tablette, TV) → tableau affiché SANS connexion
- [ ] La TV suit les tirages en direct ; F5 sur la TV → revient direct au tableau
- [ ] Smart TV : fluidité acceptable dans le navigateur de la TV ?
- [ ] Chromecast (si dispo) : « 📺 Caster sur la TV » depuis Chrome Android
- [ ] Son sur l'écran public : bouton rose 🔊 cliquable (télécommande TV) → sons OK
- [ ] ✕ sur l'écran public → confirmation → écran remis à zéro

## E. Reste du 1er passage
- [ ] Rejoindre en tant que joueur avec « 👤 Mon compte » (jamais testé)
