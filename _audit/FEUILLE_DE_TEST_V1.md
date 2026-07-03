# Feuille de test consolidée — Sprint v1 (v0.14.1 → v1.0.0) — 2026-06-25

> Nouvelle adresse : https://hnt-lab.github.io/biiingo/ · Noter chaque souci : écran + action + attendu + obtenu.

## ⚠️ PRÉ-REQUIS (sinon rien ne marche sur le nouveau domaine)
- [ ] Firebase → Authentication → Settings → Domaines autorisés : `hnt-lab.github.io` ajouté
- [ ] Firebase → Firestore → Règles : contenu de `_setup/firestore.rules` collé + **Publier**

## A. Comptes (les nouveautés du Lot 1)
- [ ] Connexion normale sur https://hnt-lab.github.io/biiingo/ (vérifie v0.14.1 en bas)
- [ ] « Mot de passe oublié ? » avec ton email → email reçu → nouveau mot de passe → reconnexion OK
- [ ] 👤 Profil : changer le pseudo → visible en haut de l'accueil après fermeture
- [ ] 👤 Profil : changer le mot de passe (avec l'actuel) → déconnexion → reconnexion avec le nouveau
- [ ] Mauvais mot de passe actuel → message d'erreur clair (pas de plantage)
- [ ] **Suppression de compte — avec un COMPTE DE TEST créé pour l'occasion** (pas ton vrai compte !) :
      créer compte bidon → créer une soirée + une photo → 👤 → Supprimer → mot de passe → confirmé
      → retour à l'écran de connexion, reconnexion impossible, la soirée a disparu de la liste des autres
- [ ] Sécurité : compte B (non membre d'une soirée de A) ne voit pas la soirée de A dans sa liste ; rejoindre par code marche toujours

## B. Régression rapide (le site fonctionne comme avant)
- [ ] Une soirée existante s'ouvre : tirage synchro téléphone ↔ écran, vérif, entracte, sons, présets OK
- [ ] F5 écran de salle → retour direct au tableau

## C. L'APK 📦
- [ ] Installation de l'APK sur ton Android (autoriser la source → Installer)
- [ ] L'app s'ouvre **SANS barre d'adresse** (plein écran) — si une barre apparaît : attendre ~10 min (propagation du fichier de propriété) puis fermer/rouvrir l'app ; si ça persiste → me le dire
- [ ] Connexion + une partie rapide depuis l'app (tirage, un son, une vérif)
- [ ] Icône Biiingo correcte sur l'écran d'accueil du téléphone
- [ ] Un `deploy.bat` (fait par moi à ta demande) → l'app du téléphone reçoit la MAJ après fermeture/réouverture (sans réinstaller l'APK)
- [ ] Si possible : installer l'APK sur le téléphone d'un 2ᵉ MC → tout pareil

## D. Divers
- [ ] La racine https://hnt-lab.github.io/ redirige vers Biiingo
- [ ] Le zip PWABuilder (clé de signature) est sauvegardé à 2 endroits ✅ À CONFIRMER

→ Tout vert = on passe en **v1.0.0** 🎉
