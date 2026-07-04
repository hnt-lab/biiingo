# 14 — IDÉE 1 / PALIER A : formats de jeu configurables (théorisé 2026-07-04) ❓

> Théorisation détaillée du premier palier du « bingo personnalisable » (cf. doc 08).
> AUCUN code avant validation + GO.

## Ce que « configurable » implique VRAIMENT (audit de l'existant)
Aujourd'hui le loto français 90 est câblé partout : tableau 9×10, cartons 3×9/15,
objectifs quine/double/carton (5/10/15 à pointer), mort subite. Un « format » touche donc
4 sous-systèmes : tableau de salle, télécommande, cartons joueurs, vérification.

## Les 3 formats du palier A

### 1. Loto français 90 (existant) — inchangé, reste le défaut.

### 2. Bingo américain 75 (US) — le vrai morceau
- **Tableau** : 75 numéros en 5 rangées B·I·N·G·O (B=1-15, I=16-30, N=31-45, G=46-60, O=61-75).
  À l'annonce : « B-12 ! » (la lettre fait partie du jeu).
- **Carte joueur** : 5×5, colonne B tirée de 1-15, I de 16-30, etc., **case centrale FREE**
  (toujours acquise). Nouveau générateur + nouveau rendu carton (mode joueur).
- **Objectifs US ≠ FR** : ligne (horizontale/verticale/diagonale), deux lignes, **blackout**
  (carte pleine). → la liste d'objectifs devient DÉPENDANTE du format.
- **Vérification** : lignes H/V/diagonales avec FREE compté acquis ; carte affichée pour un
  joueur connecté (comme aujourd'hui) ; pointage papier = 5×5.
- Mort subite : fonctionne telle quelle (un numéro de ta carte sort = éliminé).

### 3. Format « libre » (1 à N numéros, ex. 50, 120…)
- **Tableau + télécommande** : grille adaptative (colonnes calculées).
- **Cartons : AUCUN format standard n'existe pour un N arbitraire** → proposition v1 :
  en format libre, le **mode joueur est automatiquement désactivé** (cartons papier maison
  fournis par l'organisateur). Les cartons custom appartiennent au palier B.
- Objectifs : annonce libre (l'organisateur juge) → garder quine/double/carton comme
  « étiquettes » d'affichage, vérification par pointage uniquement.

## Décisions de structure proposées ❓
- `soiree.format = { type: 'fr90' | 'us75' | 'libre', max: N }` — choisi **À LA CRÉATION**
  de la soirée, **NON modifiable ensuite** (trop de casse en cours de partie) — comme le titre.
- Présets : mémorisent le format préféré.
- OBJECTIFS par format (table de config), VERIF_BESOIN par format.
- Sons/anims/entractes/bandeau : inchangés (indépendants du format). ✓

## Découpage de réalisation proposé ❓
- **A1 — Format libre (tableau seul)** : rapide, peu risqué, débloque les bingos « maison »
  (mode joueur off). 
- **A2 — Bingo US 75 complet** : tableau B-I-N-G-O + cartes 5×5 FREE + objectifs US + vérif
  + mode joueur. Le gros du palier.

## Questions à trancher AVANT le GO
1. **Le besoin réel de tes MC** : le 75 US est-il demandé ? Ou le « libre » suffit-il en attendant
   les bingos custom du palier B ?
2. **Ordre** : A1 d'abord (rapide) puis A2 ? Ou directement tout ?
3. **75 US — objectifs par défaut** : 1 ligne → 2 lignes → blackout (progression classique US) ?
4. Format **fixé à la création** (non modifiable ensuite) : confirmé ?
5. Format libre **sans mode joueur** (cartons papier de l'organisateur) : accepté pour v1 ?

*Statut : EN ATTENTE des réponses → maquettes si besoin → GO → code d'un bloc.*
