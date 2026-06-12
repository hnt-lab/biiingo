# 07 — Animations de verdict GAGNÉ / FAUX BINGO (THÉORISATION ❓ — 2026-06-12)

> Demande utilisateur : une « super animation » pour les gagnants et les échecs,
> avec la possibilité d'ajouter des **.png personnalisés** (couches alpha) pour que
> chaque troupe mette ses propres images dans l'animation.

## Le concept central proposé : « les PNG deviennent l'animation »
L'idée la plus puissante : les images envoyées par les MC ne sont pas un décor,
elles sont **les particules et les acteurs** de l'animation. Système en **3 couches** :

1. **Couche FOND** (ambiance) : flash de lumière, assombrissement, balayage de projecteurs.
2. **Couche VEDETTE** (optionnelle) : UNE grande image PNG qui fait une entrée théâtrale
   (zoom + rebond, ou chute, ou glissement) au centre — ex. le visage de la drag, un logo.
3. **Couche PARTICULES** : une pluie/explosion de petites images. Par défaut des emojis
   (✨💖💋 / 💔🥀), remplacés par les **PNG perso** s'il y en a (cœurs, lèvres, diamants,
   têtes des queens… n'importe quoi avec de la transparence).

## Options d'animation GAGNÉ (à choisir)
- **A. « Pluie de gloire »** : flash doré → texte GAGNÉ qui claque (zoom-rebond) →
  pluie continue de particules qui tombent en tournoyant pendant ~7 s.
- **B. « Feu d'artifice »** : 3-4 explosions successives de particules depuis des points
  aléatoires, texte qui pulse à chaque explosion.
- **C. « Cabaret »** : rideau de lumière, 2 projecteurs qui balayent et se croisent sur le
  texte, particules qui montent comme des bulles de champagne.

## Options d'animation FAUX BINGO (à choisir)
- **A. « Douche froide »** : l'écran se désature/assombrit, le texte FAUX BINGO tombe
  d'en haut et atterrit de travers (légèrement penché), quelques particules qui chutent
  mollement (💔 ou PNG perso).
- **B. « Tampon REFUSÉ »** : gros tampon qui s'écrase sur l'écran avec secousse, à la
  manière d'un coup de tampon administratif — très comique.
- **C. « Pschitt »** : le texte gonfle comme un ballon… et se dégonfle en zigzag,
  particules qui retombent.

## Réglages côté MC (✏️ Édition → bloc « 🎉 Animations ») ❓
- **GAGNÉ** : jusqu'à **3 PNG particules** + **1 PNG vedette** (optionnels).
- **FAUX BINGO** : idem (3 + 1).
- Sans PNG : emojis par défaut (✨💖💋 / 💔). Tout sauvé dans les **présets**.
- (Plus tard si besoin : choix du style A/B/C par les MC eux-mêmes.)

## Contraintes techniques (PC faible + base de données)
- **Format PNG conservé** (la transparence alpha est le cœur de la demande) — donc PAS de
  conversion JPEG. Compression : réduction à **320 px max** (particules) / **512 px**
  (vedette), avertissement si trop lourd.
- Limite : ~3+1 images par verdict pour rester sous la limite de la base (1 Mo/document
  avec les autres photos de la soirée).
- **Performance** : max ~30 particules à l'écran, animations CSS pures (transform/opacity),
  nettoyées à la fin. Durée totale ≈ 7 s (= le retour auto à la grille existant).
- Sons : déjà synchronisés (gagne.mp3 / fauxbingo.mp3 au déclenchement).

## ✅ DÉCISION (utilisateur, 2026-06-12)
**« Et si on mettait les trois et on proposait le choix aux utilisateurs ? »**
→ Les **3 styles de chaque verdict sont implémentés**, le MC choisit dans ✏️ Édition →
🎉 Animations (+ mode **🎲 Surprise** = style aléatoire à chaque verdict). Couche vedette
incluse. Garde-fou son inclus (bouton d'alerte « 🔇 Activez le son » si un son a été
bloqué faute de clic). Choix + PNG sauvés dans les présets.

## Statut : VALIDÉ → codé en v0.7.0 (un bloc).
