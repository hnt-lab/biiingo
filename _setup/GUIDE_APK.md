# Guide : fabriquer l'APK Biiingo (Android, hors Play Store)

> Méthode retenue : **PWABuilder** (pwabuilder.com) — outil **open source (licence MIT, projet Microsoft)**,
> gratuit, qui transforme notre site en APK signé **sans rien installer sur le PC**.
> L'APK reste connecté au site → chaque `deploy.bat` met à jour l'app de tout le monde, sans refaire d'APK.

## Étape 1 — Générer le paquet Android (~5 min)
1. Va sur **https://www.pwabuilder.com**
2. Dans le champ, colle l'adresse : **https://hnt-lab.github.io/biiingo/** → bouton **Start**
3. Attends l'analyse (des notes s'affichent — pas besoin du score parfait), puis clique **Package for stores**
4. Choisis **Android** → **Generate package**
5. Dans les options qui s'affichent :
   - **Package ID** : `io.github.hntlab.biiingo`
   - **App name** : `Biiingo` · **Version** : `1.0.0`
   - **Signing key** : laisse **« Create new »** (PWABuilder crée la clé de signature pour toi)
   - Le reste : valeurs par défaut
6. Clique **Download** → tu obtiens un **fichier .zip**

## Étape 2 — ⚠️ SAUVEGARDER LA CLÉ (CRUCIAL)
Le .zip contient : l'**APK**, un fichier **signing.keystore** + les mots de passe (`signing-key-info.txt`), et **assetlinks.json**.
- **Copie le .zip ENTIER dans au moins 2 endroits sûrs** (clé USB + cloud).
- ⚠️ **Si cette clé est perdue, impossible de publier une mise à jour de l'APK plus tard** (il faudrait tout réinstaller chez tout le monde).
- Ne JAMAIS mettre le keystore dans un dépôt GitHub public.

## Étape 3 — Le fichier de « propriété » (enlève la barre d'adresse)
1. Sur GitHub, crée un **nouveau dépôt public** nommé exactement : **`hnt-lab.github.io`** (rien d'autre, sans coche)
2. **Envoie-moi le contenu du fichier `assetlinks.json`** du zip → je préparerai et pousserai le fichier au bon endroit (`.well-known/assetlinks.json`)
3. Sans cette étape l'APK marche quand même, mais avec une barre d'adresse visible en haut.

## Étape 4 — Installer sur un téléphone (test)
1. Envoie le fichier **`Biiingo.apk`** (il est dans le zip) sur le téléphone (mail, câble, Drive…)
2. Ouvre-le sur le téléphone → Android demande d'**autoriser l'installation d'apps inconnues** pour l'appli utilisée (Fichiers/Chrome) → autorise → **Installer**
3. L'app Biiingo apparaît avec son icône ✨

## Distribution aux MC
Le même fichier APK s'envoie à tout le monde (WhatsApp/Drive/mail). Chacun l'installe pareil.
Les mises à jour du site sont automatiques ; on ne refait un APK que si on change l'icône/le nom/la clé.

## Rappel technique (pour mémoire)
- Technologie : TWA (Trusted Web Activity) — l'APK ouvre le site dans Chrome plein écran.
- Prérequis côté site (déjà en place) : manifest.json complet + service worker sans cache + HTTPS.
- iPhone : pas d'APK (Android seulement). Les MC iPhone utilisent le site / « Sur l'écran d'accueil ».
