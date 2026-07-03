# 10 — Modèle économique (brainstorm théorisé, 2026-06-25)

> Question utilisateur : au-delà de faire payer les gens, un modèle économique est-il possible ?
> Réflexion stratégique — AUCUN engagement de dev.

## D'abord, l'honnêteté sur le marché
- **Niche réelle mais étroite** : organisateurs de soirées bingo FR (drag bingo en vogue, bars à jeux,
  associations, EHPAD/résidences seniors [énorme vivier bingo !], campings/villages vacances, comités
  d'entreprise, agences événementielles).
- Les **joueurs ne sont pas le client** : le client naturel est l'ORGANISATEUR (B2B léger). Volume faible,
  mais un organisateur pro peut payer 5-15 €/mois sans sourciller si l'outil fait sa soirée.
- Coûts actuels ≈ 0 € → tout revenu est du bonus ; mais si l'app grossit, Firebase deviendra payant
  (le modèle doit au minimum couvrir l'infra).

## ⚠️ LIGNE ROUGE LÉGALE (avant tout modèle)
Le bingo/loto avec mise et lots est **réglementé en France** (régime des lotos traditionnels : cercle
restreint, lots non monétaires…). **L'app ne doit JAMAIS toucher à l'argent du jeu lui-même**
(pas de vente de cartons, pas de cagnotte, pas de lots dans l'app) — sinon on change de catégorie
juridique (jeu d'argent) et tout se complique (et adieu le Play Store). Tous les modèles ci-dessous
gardent l'app comme OUTIL D'ANIMATION, hors du flux d'argent du jeu.

## Les modèles crédibles (classés par pertinence)

### 1. ⭐ Freemium B2B « organisateur pro » — le plus naturel
Base actuelle GRATUITE à vie (la communauté drag/asso reste servie), et un palier payant pour pros
avec les features déjà théorisées comme différenciateurs :
- **Bingo entièrement personnalisable** (idée 1 : grilles custom, contenus, objectifs) = LA feature pro
- **Affichage public + Caster** (idée 2), multi-écrans
- **Marque blanche light** : logo/couleurs de l'établissement sur l'écran de salle
- Multi-soirées illimitées, stats de soirées, plusieurs comptes MC liés
→ 5-15 €/mois ou licence annuelle. Cible : bars, agences d'événementiel, groupes d'animation.

### 2. ⭐ Marque blanche / licences B2B ponctuelles
Vendre des versions personnalisées à des structures : chaînes de bars, campings (équipes d'animation !),
EHPAD/résidences (le bingo y est une institution), agences événementielles.
→ Setup payant unique (ex. 150-500 €) + éventuel abonnement. Peu de clients suffisent.

### 3. Marketplace de contenus (synergie avec l'idée 1)
Packs de thèmes visuels/sonores/grilles créés par des artistes (les drag queens elles-mêmes !) vendus
dans l'app, avec partage de revenus créateur/plateforme. Beau storytelling communautaire.
→ Pertinent seulement APRÈS l'idée 1 et avec une vraie base d'utilisateurs.

### 4. Sponsoring d'écran (l'organisateur vend, l'app facilite)
L'écran de salle est vu par toute une salle toute une soirée = espace précieux. Feature payante
« Sponsors » : slots dédiés dans le bandeau/entracte/écran de fin (« Soirée offerte par… »).
L'ORGANISATEUR vend ses sponsors locaux ; nous on vend juste la fonctionnalité (reste dans le freemium).

### 5. Dons / soutien communautaire
Bouton « soutenir Biiingo » (type Buy Me a Coffee). Honnête, cohérent avec l'esprit libre… et
généralement modeste (à voir comme complément, pas comme modèle).

## Les modèles à REFUSER (et pourquoi)
- **Publicité dans l'app** : détruit la DA/l'expérience scénique, revenus ridicules à cette échelle.
- **Vente de données** : contraire à l'éthique du projet, RGPD, et données sans valeur ici.
- **Vente de cartons virtuels / cagnottes** : ligne rouge légale ci-dessus.

## Recommandation (si un jour on y va)
1. Ne rien faire payer tant que la base d'utilisateurs organique grandit (le gratuit est notre pub).
2. Développer l'**idée 1** (bingo custom) comme socle du futur palier pro.
3. Premier test de monétisation : **marque blanche ponctuelle** auprès de 2-3 structures (campings/EHPAD/bars)
   — zéro dev de paiement, juste du service, valide la demande réelle.
4. Ensuite seulement : palier pro auto-servi (paiement type Stripe, statut auto-entrepreneur suffisant au début,
   et LÀ la question de l'entité se reposera — cf. théorisation store).

*Statut : brainstorm consigné. Aucune décision, aucun dev.*
