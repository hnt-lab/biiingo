# Guide d'installation Biiingo — pas à pas

> À faire UNE SEULE FOIS. Chaque étape dit exactement où cliquer. Durée totale : ~20 minutes.

## Étape 1 — Créer le projet Firebase (la « base de données »)

1. Va sur **https://console.firebase.google.com** et connecte-toi avec ton compte Google.
2. Clique sur **« Créer un projet »** (ou « Ajouter un projet »).
3. Nom du projet : **biiingo** → Continuer.
4. Google Analytics : **désactive** l'interrupteur (on n'en a pas besoin) → Créer le projet → Continuer.

## Étape 2 — Activer les comptes (connexion des MC)

1. Dans le menu de gauche : **Création (Build) → Authentication**.
2. Clique **« Commencer »**.
3. Dans l'onglet « Sign-in method », clique sur **« Adresse e-mail/Mot de passe »**.
4. Active **le premier interrupteur** (Adresse e-mail/Mot de passe) — laisse le second (lien e-mail) désactivé → **Enregistrer**.

## Étape 3 — Activer la base de données temps réel

1. Menu de gauche : **Création (Build) → Firestore Database**.
2. Clique **« Créer une base de données »**.
3. Emplacement : choisis **europe-west1 (Belgique)** ou **europe-west9 (Paris)** → Suivant.
4. Mode : choisis **« Démarrer en mode production »** → Créer.
5. Une fois créée, va dans l'onglet **« Règles » (Rules)** en haut.
6. **Efface tout** le texte affiché et **colle à la place** le contenu du fichier `_setup/firestore.rules` de ce projet → **Publier**.

## Étape 4 — Récupérer la configuration pour l'app

1. Clique sur la **roue dentée ⚙️ en haut à gauche** (à côté de « Vue d'ensemble du projet ») → **Paramètres du projet**.
2. Descends jusqu'à « Vos applications » et clique sur l'icône **`</>`** (application Web).
3. Surnom de l'app : **Biiingo** → ne coche PAS « Firebase Hosting » → **Enregistrer l'application**.
4. Une zone de code s'affiche avec `const firebaseConfig = { ... }`.
   **Copie tout ce qui est entre les accolades { }** (les lignes apiKey, authDomain, projectId…)
   et **envoie-le à Claude** : il l'installera au bon endroit (`js/firebase.js`).

## Étape 5 — Créer le dépôt GitHub (l'hébergement du site)

1. Va sur **https://github.com** et connecte-toi.
2. En haut à droite : **+ → New repository**.
3. Nom : **biiingo** · coche **Public** · ne coche RIEN d'autre → **Create repository**.
4. **Préviens Claude** : il enverra le code dans ce dépôt avec git (tu n'as rien d'autre à faire).

## Étape 6 — Activer GitHub Pages (mettre le site en ligne)

*(après que Claude a envoyé le code)*
1. Dans le dépôt GitHub : onglet **Settings → Pages** (menu de gauche).
2. « Source » : **Deploy from a branch** · Branche : **main** · dossier : **/ (root)** → **Save**.
3. Après 1-2 minutes, l'adresse du site apparaît en haut : `https://TONPSEUDO.github.io/biiingo/`.
   C'est l'adresse à ouvrir sur le PC de la salle ET sur les téléphones.

## Étape 7 — Autoriser le site dans Firebase (sécurité)

1. Retour sur la console Firebase : **Authentication → Settings → Domaines autorisés**.
2. Clique **« Ajouter un domaine »** et ajoute : `TONPSEUDO.github.io` → Ajouter.
