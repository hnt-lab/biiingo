# Feuille de validation du refactor — 2026-08-26

## Validé automatiquement

- [x] Syntaxe et version cohérentes sur les 27 scripts applicatifs.
- [x] 23 tests unitaires : cartons, victoire, données, état, sécurité HTML, images et modules extraits.
- [x] 11 scénarios de règles Firestore dans l'émulateur officiel.
- [x] Création d'un compte MC et d'une soirée depuis l'interface.
- [x] Ouverture d'un écran public anonyme par code.
- [x] Connexion d'un joueur invité avec génération de carton.
- [x] Connexion d'un joueur avec compte et conservation du pseudo choisi.
- [x] Compteur MC synchronisé avec les deux joueurs.
- [x] Passage accueil → tirage et numéro reçu par la salle et les joueurs.
- [x] Ajout d'un artiste dans l'éditeur et persistance du programme.
- [x] Désactivation d'un son et persistance du réglage.
- [x] Bandeau reçu en direct sur l'écran de salle.
- [x] Vérification ciblée : carton concerné identifié et jetons des autres joueurs gelés.
- [x] Entracte reçu par la salle et les joueurs, puis reprise du tirage.
- [x] Écran de fin reçu par la salle et les joueurs.
- [x] Suppression de la soirée, de ses joueurs et des comptes de test dans les émulateurs.
- [x] Chargement Chrome local avec Firebase et traitements d'images réels.
- [x] Chargement du `main` public sur GitHub Pages, authentification anonyme et nettoyage du compte de test.

## À valider sur appareils physiques avant fusion

- [ ] Téléphone joueur : secousse, seuil de déclenchement et réservoir de jetons.
- [ ] Téléphone joueur : rotation portrait/paysage, changement d'application et retour Android.
- [ ] Téléphone joueur : fluidité des jetons et lisibilité des mini-cartons.
- [ ] PC/projecteur : plein écran, sortie audio réelle et reprise après actualisation.
- [ ] Smart TV : navigation au clavier/télécommande, QR et fluidité du tableau.
- [ ] Chromecast compatible : lancement, annulation et message de diagnostic.
- [ ] Bureau : contrôle visuel des deux colonnes et redimensionnement grand/petit.
- [ ] Réseau réel : coupure courte puis resynchronisation des quatre interfaces.

## Publication

- [ ] Fusionner la branche validée vers `main`.
- [ ] Publier simultanément le code et `_setup/firestore.rules`.
- [ ] Relancer `npm run test:production` après la mise en ligne.
