// Moteur de sons — joué UNIQUEMENT par l'écran de salle (PC branché à la sono).
// Les fichiers sont REMPLAÇABLES : déposer des .mp3 portant ces noms dans le dossier sounds/.
// Un fichier manquant est ignoré silencieusement (l'app fonctionne sans aucun son).

const SOUND_FILES = {
  tirage:    'sounds/tirage.mp3',     // un numéro vient d'être tiré (discret — joué ~90 fois)
  valid:     'sounds/valid.mp3',      // vérification : numéro présent (sorti)
  rate:      'sounds/rate.mp3',       // vérification : numéro ABSENT (pas sorti)
  suspense:  'sounds/suspense.mp3',   // boucle pendant la vérification en mode suspense
  gagne:     'sounds/gagne.mp3',      // verdict GAGNÉ
  fauxbingo: 'sounds/fauxbingo.mp3',  // verdict FAUX BINGO
  entracte:  'sounds/entracte.mp3'    // lancement d'un entracte
};

const Sons = {
  unlocked: false,
  enabled: true,
  audios: {},
  missing: {},

  init() {
    for (const name in SOUND_FILES) {
      const a = new Audio(SOUND_FILES[name]);
      a.preload = 'auto';
      a.addEventListener('error', () => { Sons.missing[name] = true; });
      this.audios[name] = a;
    }
    this.audios.suspense.loop = true;
  },

  // Les navigateurs bloquent le son tant qu'il n'y a pas eu un clic sur la page.
  // Appelé au clic « Lancer l'affichage » de l'écran de salle.
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    for (const name in this.audios) {
      const a = this.audios[name];
      if (this.missing[name]) continue;
      const vol = a.volume;
      a.volume = 0;
      const p = a.play();
      if (p && p.then) p.then(() => { a.pause(); a.currentTime = 0; a.volume = vol; })
                        .catch(() => { a.volume = vol; });
    }
  },

  play(name) {
    if (!this.enabled || !this.unlocked || this.missing[name]) return;
    const a = this.audios[name];
    if (!a) return;
    try { a.currentTime = 0; a.play().catch(() => {}); } catch (e) {}
  },

  startLoop(name) {
    if (!this.enabled || !this.unlocked || this.missing[name]) return;
    const a = this.audios[name];
    if (!a || !a.paused) return;
    try { a.currentTime = 0; a.play().catch(() => {}); } catch (e) {}
  },

  stopLoop(name) {
    const a = this.audios[name];
    if (!a) return;
    try { a.pause(); a.currentTime = 0; } catch (e) {}
  },

  stopAll() {
    for (const name in this.audios) this.stopLoop(name);
  }
};

Sons.init();
