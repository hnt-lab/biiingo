// Moteur de sons — joué UNIQUEMENT par l'écran de salle (PC branché à la sono).
// 3 niveaux : sons PERSONNALISÉS (envoyés depuis l'app, par compte) > fichiers du dossier sounds/ > silence.
// Variantes : si tirage1.mp3 / valid1.mp3 existent, l'app alterne aléatoirement pour casser la répétition.

const SOUND_FILES = {
  tirage:    'sounds/tirage.mp3',     // un numéro vient d'être tiré (discret — joué ~90 fois)
  tirage1:   'sounds/tirage1.mp3',    // variante optionnelle du tirage
  tirage2:   'sounds/tirage2.mp3',    // variante optionnelle du tirage
  valid:     'sounds/valid.mp3',      // vérification : numéro présent (sorti)
  valid1:    'sounds/valid1.mp3',     // variante optionnelle
  rate:      'sounds/rate.mp3',       // vérification : numéro ABSENT (pas sorti)
  suspense:  'sounds/suspense.mp3',   // boucle pendant la vérification en mode suspense
  gagne:     'sounds/gagne.mp3',      // verdict GAGNÉ
  fauxbingo: 'sounds/fauxbingo.mp3',  // verdict FAUX BINGO
  entracte:  'sounds/entracte.mp3',   // lancement d'un entracte
  reprise:   'sounds/reprise.mp3',    // reprise de la partie après l'entracte (sinon : son d'entracte)
  attente:   'sounds/attente.mp3',    // musique d'attente — boucle pendant l'écran d'accueil
  debut:     'sounds/debut.mp3',      // début de soirée (accueil → manche 1)
  fin:       'sounds/fin.mp3'         // fin de soirée (passage à l'écran de fin)
};

// Sons joués en boucle
const SOUND_LOOPS = { suspense: true, attente: true };

// Variantes possibles par son de base
const SOUND_VARIANTES = { tirage: ['tirage', 'tirage1', 'tirage2'], valid: ['valid', 'valid1'] };

const Sons = {
  unlocked: false,
  enabled: true,
  audios: {},
  custom: {},   // name → Audio personnalisé (envoyé depuis l'app)
  missing: {},

  init() {
    for (const name in SOUND_FILES) {
      const a = new Audio(SOUND_FILES[name]);
      a.preload = 'auto';
      a.addEventListener('error', () => { Sons.missing[name] = true; });
      if (SOUND_LOOPS[name]) a.loop = true;
      this.audios[name] = a;
    }
  },

  // Sons personnalisés (data audio envoyée depuis l'éditeur, stockée avec le compte)
  setCustom(name, dataUrl) {
    if (!dataUrl) { delete this.custom[name]; return; }
    const a = new Audio(dataUrl);
    a.preload = 'auto';
    if (SOUND_LOOPS[name]) a.loop = true;
    this.custom[name] = a;
  },
  clearCustom() { this.custom = {}; },

  _pick(name) {
    if (this.custom[name]) return this.custom[name];
    const variantes = (SOUND_VARIANTES[name] || [name]).filter(v => !this.missing[v]);
    if (!variantes.length) return null;
    const choisi = variantes[Math.floor(Math.random() * variantes.length)];
    return this.audios[choisi] || null;
  },

  has(name) { return !!this.custom[name] || !this.missing[name]; },

  // Les navigateurs bloquent le son tant qu'il n'y a pas eu un clic sur la page.
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
    if (!this.enabled || !this.unlocked) return;
    const a = this._pick(name);
    if (!a) return;
    try { a.currentTime = 0; a.play().catch(() => {}); } catch (e) {}
  },

  startLoop(name) {
    if (!this.enabled || !this.unlocked) return;
    const a = this._pick(name);
    if (!a || !a.paused) return;
    this._loopEnCours = a;
    try { a.currentTime = 0; a.play().catch(() => {}); } catch (e) {}
  },

  stopLoop(name) {
    const list = [this.audios[name], this.custom[name], this._loopEnCours];
    for (const a of list) {
      if (!a) continue;
      try { a.pause(); a.currentTime = 0; } catch (e) {}
    }
    this._loopEnCours = null;
  },

  stopAll() {
    for (const name in this.audios) this.stopLoop(name);
    for (const name in this.custom) this.stopLoop(name);
  }
};

Sons.init();
