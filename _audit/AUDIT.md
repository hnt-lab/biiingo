# Registre d'audit — Biiingo

> Source de vérité sur ce qui est RÉELLEMENT vérifié (Règle Zéro : tout statut non audité est provisoire).
> ⚠️ Limitation connue : je ne peux pas exécuter l'app — vérifications par lecture de code (`node --check` = syntaxe seule).
> Les dimensions « Déclenche/Interagit » sont jugées sur la logique du code → le test utilisateur reste indispensable.

## 2026-06-12 — v0.1.0 : build initial complet

### Codé (couverture du cahier des charges 06)
| Élément | État | Notes |
|---|---|---|
| Auth (compte MC, email/mdp) | ✅ codé | messages d'erreur en français sans jargon |
| Accueil : mes soirées, créer (préset), rejoindre par code | ✅ codé | |
| Synchro temps réel téléphone ↔ écran | ✅ codé | onSnapshot sur le doc soirée |
| Écran de salle : 5 états (accueil/tirage/vérif/entracte/fin) | ✅ codé | |
| Grille 1-90 + animations (pop, gros numéro bump) | ✅ codé | CSS only, léger pour PC faible |
| Bandeau manche/objectif + compteur + historique 5 derniers | ✅ codé | |
| Tirage : tap = tiré, tap sur tiré = popup d'annulation | ✅ codé | option 1 validée |
| Objectif libre (quine/double/carton) à tout moment | ✅ codé | |
| Manche suivante = grille vidée + manche+1 (confirmation) | ✅ codé | objectif repart sur Quine |
| Vérification 100% boutons + suspense + verdicts | ✅ codé | sons valid/rate par numéro |
| Hall of fame + champ nom skippable + registre habitués (autocomplétion) | ✅ codé | registre partagé par compte créateur |
| Entractes : programme + entracte libre + reprise | ✅ codé | |
| Bandeau défilant (partie si actif, entracte toujours) | ✅ codé | |
| Écrans éditables (accueil/fin) + liens + QR | ✅ codé | QR généré côté client (lib CDN) |
| Photos compressées base64 (pas de Firebase Storage) | ✅ codé | max 560px, avertissement si lourd |
| Présets (sauver/réutiliser à la création) | ✅ codé | |
| Sons remplaçables + déblocage au clic « Lancer l'affichage » | ✅ codé | fichiers mp3 NON fournis (proposition à venir) |
| Robustesse : refresh, hors-ligne (persistence), multi-MC | ✅ codé | arrayUnion/Remove = zéro conflit |
| Terminer / rouvrir / supprimer la soirée | ✅ codé | suppression réservée au créateur |

### Vérifié
- [x] `node --check` sur tous les fichiers js (syntaxe) — voir session 2026-06-12
- [ ] Test runtime utilisateur (PC + téléphone) — EN ATTENTE (feuille de route de test)

### Reste à faire (bloquant avant test)
- [ ] Setup utilisateur : projet Firebase + config collée dans js/firebase.js (guide _setup/)
- [ ] Dépôt GitHub créé + push + GitHub Pages activé
- [ ] Proposition de sons libres de droits (ou fichiers fournis par l'utilisateur)

### Points connus / dette assumée
- Règles Firestore v1 permissives entre comptes connectés (outil privé de troupe) — à durcir si ouverture aux joueurs.
- Préset avec BEAUCOUP de photos d'artistes : risque de dépasser la limite d'1 Mo par document → message d'erreur prévu, à surveiller.
- L'écran de salle suppose un navigateur récent (Chrome/Edge) sur le PC.
