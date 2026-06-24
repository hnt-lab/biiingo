# 08 — Idées futures (backlog, non priorisé) — 2026-06-25

> Pistes d'évolution notées au fil de l'eau. Pas encore théorisées ni validées pour développement.

## 1. Bingo entièrement personnalisable (générateur de bingo custom)
Permettre aux utilisateurs de **créer leur propre bingo sur mesure**, au-delà du loto français 90 numéros :
- **Nombre de cases libre** (pas forcément 90) — ex. grille 25, 50, 100…
- **Contenu des cases entièrement personnalisable** : au lieu de numéros, mettre des mots, des images, des thèmes (ex. bingo de soirée, bingo de répliques, bingo d'événements…).
- **Objectifs éditables** eux aussi : définir ses propres conditions de victoire (au lieu de quine/double/carton imposés) — ex. une forme précise, X cases, une diagonale, un motif custom…

**Implications à théoriser (le jour venu) :**
- L'affichage de salle doit s'adapter à une grille de taille/forme variable (actuellement figé en 9×10 pour 1-90).
- La vérification (plafond, pointage) doit suivre les objectifs custom.
- Stockage : un « modèle de bingo » réutilisable (probablement dans les présets / un nouveau type d'objet).
- Gros chantier UX + technique — bien cadrer avant.

## 2. Configuration technique « un seul appareil » (stream / miroir d'écran)
Aujourd'hui : 2 appareils (PC salle + téléphone MC). Proposer une config alternative pour ceux qui n'ont **qu'un seul ordi OU qu'un seul mobile**, en diffusant l'écran vers le rétroprojecteur / la télé :
- **Cast / stream d'écran** (Chromecast, miroir d'écran Windows/Android, câble HDMI…) depuis l'appareil unique vers le grand écran.
- Nécessiterait sans doute un **mode « tout-en-un »** : la même fenêtre montre la télécommande ET ce qui est projeté (ou une bascule rapide), puisqu'il n'y a qu'un appareil.
- À étudier : comment éviter que les contrôles MC (boutons, modales) ne s'affichent sur le grand écran si on mire l'écran complet → peut-être un affichage « salle » dans un onglet/fenêtre séparé que l'on caste, pendant qu'on garde la télécommande sur l'appareil.

**Implications à théoriser :**
- Détecter / proposer le mode selon le matériel.
- Séparer proprement « ce qui se caste » (vue salle) de « ce qu'on touche » (télécommande) sur un seul appareil.
- Tester la faisabilité du cast d'un onglet seul vs écran complet selon les plateformes.

---
*Statut : idées brutes, à reprendre quand le produit de base sera stabilisé et qu'on voudra élargir.*
