# Guide : publier Biiingo sur le Play Store (pas à pas)

> Pré-requis faits : compte développeur ✅ · AAB signé ✅ (`Bureau\Biiingo-CLES-APK-NE-PAS-SUPPRIMER\...\Biiingo.aab`)
> · politique de confidentialité en ligne ✅ · icône 512 ✅ · bannière 1024×500 ✅ (`img/feature-graphic.png`)

## Étape 1 — Créer l'application dans la Play Console
1. https://play.google.com/console → **Créer une application**
2. Nom : **Biiingo** · Langue par défaut : **Français (France)** · **Application** (pas Jeu — important pour éviter les questions de jeu d'argent !) · **Gratuite** → accepte les déclarations → Créer

## Étape 2 — La fiche du store (textes prêts à coller)

**Nom (30 car. max)** : `Biiingo – Animation de bingo`

**Description courte (80 car. max)** :
`Animez vos soirées bingo : écran de salle + télécommande, en temps réel.`

**Description complète** (colle tel quel) :
```
Biiingo est l'outil des animateurs et maîtres de cérémonie de soirées bingo (loto).

🖥 UN ÉCRAN DE SALLE SPECTACULAIRE
Branchez un ordinateur au projecteur ou à la TV : grille géante animée, dernier
numéro en grand, sons d'ambiance, animations de victoire personnalisables.

📱 VOTRE TÉLÉPHONE COMME TÉLÉCOMMANDE
Tirez les numéros d'un simple tap, en vous déplaçant librement dans la salle.
Plusieurs animateurs peuvent piloter la même soirée en simultané.

🎯 TOUS LES MODES DE JEU
Quine, double quine, carton plein… et la « mort subite » pour des fins de
soirée haletantes. Vérification des cartons rapide et fiable.

🎭 PENSÉ POUR LE SPECTACLE
Entractes avec photo de l'artiste, bandeau défilant, hall of fame des
gagnants, écrans personnalisables (images, sons, animations), présets
réutilisables d'une soirée à l'autre.

⚠️ IMPORTANT : Biiingo est un outil d'AFFICHAGE ET D'ANIMATION pour des
événements physiques. L'application ne propose aucun jeu d'argent : aucune
mise, aucun paiement, aucun lot n'y transite.

Gratuit, sans publicité, sans achats intégrés.
```

**Éléments graphiques** :
- Icône : `img/icon-512.png` (512×512)
- Image de présentation (feature graphic) : `img/feature-graphic.png` (1024×500)
- **Captures d'écran (minimum 2, à faire par toi)** :
  - Téléphone : la télécommande (onglet Tirage), l'onglet Vérif, l'Édition
  - Idéal en +: une capture PC de l'écran de salle (utilisable en « tablette 7 pouces »)

**Catégorie** : Application → **Divertissement** · Coordonnées : ton email
**Politique de confidentialité** : `https://hnt-lab.github.io/biiingo/confidentialite.html`

## Étape 3 — Les questionnaires (réponses préparées)

### « Sécurité des données » (Data safety)
- Collecte de données : **OUI** → types :
  - **Adresse e-mail** (Gestion du compte) — collectée, non partagée, chiffrée en transit, suppression possible
  - **Identifiants utilisateur** (Gestion du compte) — idem
  - **Autres contenus créés par l'utilisateur** (Fonctionnalité de l'appli : textes/images/sons des soirées) — idem
- Données partagées avec des tiers : **NON** · Données chiffrées en transit : **OUI**
- Possibilité de demander la suppression : **OUI** (dans l'app : Profil → Supprimer mon compte)

### « Classification du contenu » (questionnaire IARC)
- Catégorie : **Application de référence/divertissement** (pas « Jeu »)
- Violence/sexe/drogues/langage : **Non** partout
- **Jeux d'argent : NON** — l'app ne propose ni jeu d'argent réel, ni simulation de jeu d'argent
  (c'est un outil d'affichage pour événements physiques ; aucune mise dans l'app)
- Résultat attendu : PEGI 3 / Tous publics

### « Public cible »
- Tranche d'âge : **18 ans et plus** (le plus simple : évite toutes les règles « enfants »)

### « Accès à l'appli » (pour les vérificateurs Google)
- L'app demande une connexion → fournir un **compte de démonstration** :
  crée un compte dédié (ex. `demo.biiingo@gmail.com` / mot de passe robuste) et renseigne-le ici.
  ⚠️ Ne donne JAMAIS ton compte perso.

### Autres déclarations
- Annonces (publicité) : **NON** (aucune pub actuellement)
- Applis gouvernementales / actualités / COVID : Non · Sécurité des enfants : sans objet

## Étape 4 — Le test fermé (obligatoire : 12 testeurs × 14 jours)
1. Menu **Tests → Test fermé** → Créer une version (piste par défaut)
2. **Importer `Biiingo.aab`** (depuis le dossier de clés sur le Bureau)
3. Notes de version : « Première version de test de Biiingo »
4. Onglet **Testeurs** : crée une **liste d'adresses e-mail** avec AU MOINS 12 comptes Google réels
   (les MC, leurs proches, toi) → enregistre → copie le **lien d'activation (opt-in)** → envoie-le aux testeurs
5. Chaque testeur : clique le lien opt-in avec son compte Google → installe l'app depuis le Play Store
6. ⏳ **14 jours consécutifs** — les testeurs doivent garder l'app installée (idéalement l'ouvrir de temps en temps)

## Étape 5 — Passage en production
1. Après les 14 jours : la Play Console débloque « **Demander l'accès à la production** »
2. Réponds au questionnaire (qui a testé, ce que tu as appris, à qui s'adresse l'app — sois concret : les MC, les soirées réelles)
3. Une fois accordé : **Production → Créer une version** → même AAB → examen Google (quelques jours) → 🎉 PUBLIÉE

## Rappels
- L'app du Play Store = la même TWA → les mises à jour du site restent instantanées, pas de re-soumission.
- On ne re-soumet un AAB que pour changer coquille/icône/nom (version Android).
- En cas de question d'un vérificateur Google sur le « bingo » : la réponse est toujours
  « outil d'affichage pour événements physiques, aucun flux d'argent dans l'application ».
