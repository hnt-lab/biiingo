# 06 — CAHIER DES CHARGES CONSOLIDÉ « Biiingo » (2026-06-12)

> Document de référence : consolide les fichiers 01 → 05 (qui restent la source détaillée).
> Statut global : **théorisation fonctionnelle + architecture VALIDÉES** — en attente du GO final pour coder.
> Nom provisoire : **Biiingo** (⚠️ biingo.fr existe — re-vérifier le nom avant toute distribution large).

---

## A. VISION
Outil d'animation pour soirées **bingo-drag** (loto français 90 numéros, manches quine → double quine → carton plein, spectacles drag entre les manches). Deux interfaces synchronisées en temps réel :
- **Écran de salle** : page web affichée par le PC (faible) branché au projecteur + à la sono (jack). Passif : il affiche et joue les sons.
- **Télécommande MC** : téléphone(s) des maîtres/maîtresses de cérémonie, qui pilotent tout en se déplaçant dans la salle. Multi-MC simultané.

## B. COMPTES & SOIRÉES
- Compte MC (email/mot de passe). Un compte peut être connecté sur plusieurs appareils à la fois.
- Après connexion, choix du mode : **🖥 Affichage** ou **📱 MC**.
- **Soirée** : créée depuis un préset ou de zéro → **code court** pour qu'un autre compte MC rejoigne.
- **Préset réutilisable** : titre, programme d'entractes (artistes + photos + messages), écrans accueil/fin, bandeaux types.
- **Registre des habitués** (par compte) : noms des gagnants conservés entre les soirées → autocomplétion + reconnaissance des récurrents.

## C. ÉCRAN DE SALLE — 5 états
1. **Accueil** (éditable) : visuel d'attente, titre de la soirée.
2. **Tirage** : grille 1-90 (numéros tirés illuminés avec animation), **dernier numéro en énorme** (pulse/mise en forme distincte), bandeau « Manche X — Objectif », bandeau défilant optionnel (bas d'écran, style news).
3. **Vérification** : mode suspense optionnel → verdict **GAGNÉ** (animation glamour) ou **FAUX BINGO** (animation humoristique).
4. **Entracte** (éditable) : nom + photo de l'artiste, message animé, bandeau défilant en continu.
5. **Fin** (éditable) : remerciements + **HALL OF FAME** de la soirée + liens réseaux + QR code.
- Ambiance : **cabaret glamour** (Lido/Drag Race) — PAS kermesse. DA réelle différée (consultation des MC) → v1 fonctionnelle, propre et sobre.

## D. TÉLÉCOMMANDE MC
- **Vue Tirage** : grille compacte 1-90 par dizaines, 1 tap = tiré (synchro instantanée). Bandeau d'état (manche, objectif, compteur X/90). Actions : 🎯 Objectif (libre, à tout moment) · 🔍 Vérification · 🎭 Entracte · ➡️ **Manche suivante** (= vide la grille + manche +1, avec confirmation).
- **Annulation** : tap sur un numéro coché → popup « Annuler le N ? ».
- **Vérification** (100% boutons) : les 90 numéros triés par dizaine, tirés mis en évidence ; le MC appuie sur les numéros du carton du joueur → vert + son de validation / rouge + son raté. Toggle **Suspense**. Verdict : « GAGNÉ ✨ » (→ champ optionnel skippable : nom du gagnant, autocomplété depuis les habitués) ou « Faux bingo ».
- **Bandeau** : activer/éditer le texte défilant.
- **Entracte** : choisir l'artiste dans le programme ou saisie libre.
- **Éditeur** : écrans accueil/entracte/fin (texte, photo, liens, QR généré dans l'app), présets.

## E. SONS 🔊 (joués par l'écran de salle uniquement)
- Fichiers **remplaçables** dans `sounds/` (noms standards) : tirage, validation, raté, suspense, gagné, faux bingo, entracte.
- Direction : cabaret glamour. Je ferai une **proposition de sons libres de droits** ; l'utilisateur tranchera ou fournira les siens.

## F. ARCHITECTURE (validée)
- **GitHub Pages** (nouveau dépôt « Biiingo ») + **nouveau projet Firebase** (Spark gratuit) : Auth + Firestore temps réel.
- HTML/CSS/JS pur, scripts séquentiels, **pas de service worker** (pas de problème de cache/version), `version.js` d'affichage.
- **Photos : compressées côté client → base64 dans Firestore** (pas de Firebase Storage = pas de carte bancaire). Vérifié 3 sources.
- Robustesse live : tout survit au refresh, reconnexion auto, hors-ligne téléphone toléré (cache Firestore natif).
- Structure de fichiers : voir 05.

## G. HORS PÉRIMÈTRE v1 (notés pour plus tard)
- Joueurs dans l'app (cartons virtuels) — la base comptes/soirées le permet déjà.
- Statistiques de soirée. Sons/visuels custom par compte. DA pailletée définitive (après consultation MC). Chrono (refusé : spectacles à durée variable).

---

## H. FEUILLE DE ROUTE DE CODAGE (d'un bloc, sans arrêt de test intermédiaire)
1. **Setup guidé** (actions manuelles utilisateur, pas à pas) : dépôt GitHub + Pages, projet Firebase (Auth email/mdp + Firestore + règles).
2. **Socle app** : index.html, css, version.js, firebase.js, auth.js, core.js — connexion, choix de mode, créer/rejoindre une soirée (code court).
3. **Écran de salle** : 5 états, grille, gros numéro, bandeaux.
4. **Télécommande** : tirage, annulation, objectifs, manche suivante.
5. **Vérification** : écran boutons, suspense, verdicts, hall of fame + registre habitués.
6. **Entractes & éditeur** : écrans éditables, présets, photos compressées, QR.
7. **Sons** : moteur de lecture + fichiers placeholder + proposition de sons.
8. **Robustesse & responsive** : refresh/reconnexion, 16:9 salle, portrait téléphone.
9. **Checklist de clôture** (cf. CLAUDE.md) point par point ✅/❌.
10. **Déploiement + UNE feuille de route de test consolidée** (le seul moment où l'utilisateur teste).

## I. CHECKLIST DE CLÔTURE SPÉCIFIQUE BIIINGO (s'ajoute à celle du CLAUDE.md)
- [ ] Chaque action MC visible sur l'écran de salle en < 2 s.
- [ ] Chaque fonctionnalité passée aux 4 dimensions (Affiche/Calcule/Déclenche/Interagit).
- [ ] Testable à deux appareils (PC + téléphone) — scénario complet d'une soirée de bout en bout.
- [ ] F5 en pleine manche : état intégralement restauré.
- [ ] Aucun texte technique visible (zéro jargon pour les MC).
- [ ] Sons remplaçables sans toucher au code.
- [ ] Page de salle fluide sur PC faible (animations CSS légères uniquement).
