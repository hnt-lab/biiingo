# Feuille de validation du refactor — 2026-08-26

## Validé automatiquement

- [x] Syntaxe et version cohérentes sur les 27 scripts applicatifs.
- [x] 28 tests unitaires : cartons, victoire, données, état, sécurité HTML, images, jetons et modules extraits.
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

- [ ] Téléphone joueur : secousse réelle et seuil de déclenchement sur une version HTTPS.
- [x] Téléphone joueur : chute à la rotation, réservoir protégé, recalibrage et réaccrochage des jetons.
- [x] Téléphone joueur : changement d'application, reprise et chute des jetons au retour.
- [x] Téléphone joueur : bouton retour Android, reprise de session et persistance des jetons après actualisation.
- [x] Téléphone joueur : fluidité, quatre mini-cartons lisibles et marques indépendantes par carton.
- [x] PC/projecteur : plein écran, sortie audio réelle et reprise après actualisation.
- [x] Bureau : contrôle visuel des deux colonnes et redimensionnement grand/petit.
- [x] Réseau réel : coupure du téléphone, tirage hors ligne puis resynchronisation automatique sans actualisation.
- [ ] Réseau réel : répéter la coupure sur les interfaces MC, salle et éditeur.

## Fonctionnalités différées — hors périmètre du socle stable

- [ ] Smart TV : navigation au clavier/télécommande, QR et fluidité du tableau.
- [ ] Chromecast compatible : lancement, annulation et message de diagnostic.

## Publication

- [x] Fusionner la branche validée vers `main`.
- [x] Publier simultanément le code et `_setup/firestore.rules`.
- [x] Relancer `npm run test:production` après la mise en ligne.
