# 09 — Sprint « v1 diffusable + APK » (théorisation, 2026-06-25)

> Objectif utilisateur : app diffusable au plus vite, fonctions de base complètes (comptes,
> personnalisation, stabilité), **APK propre sous ~1 semaine**. AUCUN code avant le GO.

## A. GAP ANALYSIS — ce qu'on a OUBLIÉ pour une vraie app diffusable

### Comptes utilisateur (le gros manque)
| Manque | Gravité | Note |
|---|---|---|
| **Mot de passe oublié** | 🔴 bloquant diffusion | Firebase Auth le fournit (email de réinitialisation) — juste à brancher (lien sur l'écran de connexion) |
| **Écran Profil** | 🔴 | N'existe pas. Regrouper : pseudo modifiable, email affiché, changer de mot de passe, revoir le tuto, version, déconnexion |
| **Supprimer son compte** | 🟠 (légal/confiance) | Suppression compte + données perso (profil, présets). Firebase demande une reconnexion récente → gérer ce cas |
| Vérification d'email | 🟢 optionnel | Pas nécessaire v1 |

### Stabilité / sécurité
| Manque | Gravité | Note |
|---|---|---|
| **Règles Firestore trop larges** | 🟠 | Aujourd'hui tout compte connecté peut écrire dans TOUTE soirée. Diffusable = resserrer : écriture soirée réservée aux mcUids (+ arrayUnion de soi-même pour rejoindre) |
| Messages d'erreur réseau uniformes | 🟢 | Déjà corrects pour l'essentiel |
| « À propos » (contact, version) | 🟢 | Petit bloc dans le Profil |

### Reste de la migration hnt-lab (préalable à tout push)
- [ ] `git remote set-url origin https://github.com/hnt-lab/biiingo.git` (je le fais)
- [ ] Domaine `hnt-lab.github.io` autorisé dans Firebase Auth (utilisateur — sinon la connexion échoue sur le nouveau site)
- [ ] Pousser les théorisations en attente (08, 09)

### Personnalisation / expérience : déjà couverte (présets, sons, images, animations, tuto). RAS pour v1.

## B. STRATÉGIE APK — options et recommandation

### ⭐ Option recommandée : TWA (Trusted Web Activity) via Bubblewrap
L'APK est une « coquille » officielle Android qui ouvre le site en plein écran (sans barre d'adresse).
- ✅ **L'app reste 100 % web** → chaque `deploy.bat` met à jour l'app de TOUT LE MONDE instantanément (pas de re-distribution d'APK à chaque correctif — énorme vu notre rythme)
- ✅ Bubblewrap (outil Google en ligne de commande) : je peux le piloter moi-même, il télécharge tout seul ses outils Android. Pas besoin d'installer Android Studio
- ✅ On a déjà le manifest + icônes
- ⚠️ Nécessite Chrome sur le téléphone (standard sur Android)
- ⚠️ **Clé de signature** générée au build : à SAUVEGARDER précieusement (la perdre = impossible de mettre à jour l'APK plus tard)
- ⚠️ Pour masquer la barre d'adresse : publier un petit fichier de « preuve de propriété » (assetlinks.json) à la racine `hnt-lab.github.io` → nécessite un **2ᵉ dépôt GitHub nommé `hnt-lab.github.io`** (je m'en occupe, l'utilisateur crée juste le dépôt)

### Option écartée : Capacitor (vraie app native)
Embarque le site DANS l'APK → chaque correctif exigerait de re-builder et re-distribuer l'APK. Contraire à notre rythme de MAJ. À reconsidérer seulement pour le Play Store un jour.

### Distribution : APK direct (sideload) vs Play Store
- **APK direct** (fichier à envoyer aux MC, « autoriser les sources inconnues ») : réaliste sous 1 semaine. ✅ recommandé v1
- **Play Store** : compte développeur (25 $), review Google, délais → PAS dans la semaine. Plus tard si besoin.

## C. PLAN DE SPRINT (au GO)
1. **Lot 1 — Migration + comptes** : remote git, push en attente, règles Firestore resserrées, mot de passe oublié, écran Profil (pseudo/mdp/suppression/à propos/tuto/version). L'utilisateur : domaine Firebase + republier les règles.
2. **Lot 2 — Préparation APK** : manifest peaufiné (icônes maskable), build Bubblewrap → APK signé + sauvegarde de la clé ; dépôt `hnt-lab.github.io` + assetlinks.
3. **Lot 3 — Feuille de test consolidée v1** (comptes + APK sur téléphones réels) → corrections en un lot → **v1.0.0**.

## D. LIMITES à rappeler (honnêteté)
- Je ne peux pas tester l'APK sur un vrai téléphone → l'utilisateur teste (Android d'abord).
- Bubblewrap sera piloté par moi mais peut poser des questions interactives → prévoir un passage guidé si blocage.
- L'idée 2 (cast) et l'idée 1 (bingo custom) sont HORS de ce sprint (design figé, à reprendre après la v1).

## E. Questions posées à l'utilisateur avant GO
1. Distribution v1 = **APK direct** (hors Play Store) : confirmé ?
2. GO sur le périmètre du Lot 1 (mot de passe oublié + Profil + suppression de compte + règles resserrées) ?
3. Confirmer que le renommage GitHub `hnt-lab` est bien FAIT et que le site actuel répond sur https://hnt-lab.github.io/biiingo/

*Statut : plan de sprint théorisé, EN ATTENTE DU GO.*
