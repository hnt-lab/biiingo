// Moteur d'animations de verdict (GAGNÉ / FAUX BINGO).
// 3 couches : FOND (ambiance par style) + VEDETTE (grande image PNG optionnelle) + PARTICULES
// (PNG persos du MC, sinon emojis par défaut). Léger pour PC faible : CSS transform/opacity only.

const ANIM_EMOJIS = { gagne: ['✨', '💖', '💋', '⭐'], faux: ['💔', '🥀'] };
const ANIM_MAX_PARTICULES = 30;

const AnimVerdict = {
  styleCourant: '',   // style résolu pour le verdict en cours (fixé une fois, même si Surprise)
  _verdictKey: '',    // identifie le verdict en cours (évite de rejouer sur un simple re-rendu)
  _timers: [],

  // Appelé quand un NOUVEAU verdict apparaît : fixe le style (résout le mode Surprise)
  choisir(type, s) {
    const conf = (s.anims && s.anims[type]) || {};
    let style = conf.style || (type === 'gagne' ? 'pluie' : 'douche');
    const styles = type === 'gagne' ? ['pluie', 'feu', 'cabaret'] : ['douche', 'tampon', 'pschitt'];
    if (style === 'aleatoire' || !styles.includes(style)) {
      style = styles[Math.floor(Math.random() * styles.length)];
    }
    this.styleCourant = style;
    this._verdictKey = type + '_' + Date.now();
    return style;
  },

  stop() {
    this._timers.forEach(t => clearTimeout(t));
    this._timers = [];
    this._verdictKey = '';
  },

  _later(fn, ms) { this._timers.push(setTimeout(fn, ms)); },

  // Lance les couches dans le conteneur .salle-verif (appelé après le rendu du verdict)
  run(type, s) {
    const host = document.querySelector('.salle-verif');
    if (!host) return;
    const conf = (s.anims && s.anims[type]) || {};
    const style = this.styleCourant;
    const layer = document.createElement('div');
    layer.className = 'anim-layer';
    host.appendChild(layer);

    // Couche VEDETTE (grande image centrale, optionnelle)
    if (conf.vedette) {
      const v = document.createElement('img');
      v.src = conf.vedette;
      v.className = 'anim-vedette ' + (type === 'gagne' ? 'pop' : 'chute');
      layer.appendChild(v);
    }

    // Visuels de particules : PNG persos, sinon emojis
    const visuels = (conf.parts && conf.parts.length) ? conf.parts.map(p => ({ img: p }))
                                                      : ANIM_EMOJIS[type].map(e => ({ emoji: e }));

    if (style === 'pluie') this._pluie(layer, visuels);
    else if (style === 'feu') this._feu(layer, visuels);
    else if (style === 'cabaret') this._cabaret(layer, visuels);
    else if (style === 'douche') this._pluie(layer, visuels, true);
    else if (style === 'pschitt') this._pluie(layer, visuels, true);
    // tampon : pas de particules (le texte fait le spectacle), juste une secousse via CSS
  },

  _particule(layer, visuel, cls) {
    let el;
    if (visuel.img) { el = document.createElement('img'); el.src = visuel.img; }
    else { el = document.createElement('span'); el.textContent = visuel.emoji; }
    el.className = 'anim-part ' + cls;
    layer.appendChild(el);
    return el;
  },

  // GAGNÉ A — pluie de gloire (ou version molle pour les échecs : lente, clairsemée)
  _pluie(layer, visuels, molle) {
    const n = molle ? 10 : ANIM_MAX_PARTICULES;
    for (let i = 0; i < n; i++) {
      const el = this._particule(layer, visuels[i % visuels.length], molle ? 'chute-molle' : 'chute-gloire');
      el.style.left = (Math.random() * 96) + 'vw';
      el.style.setProperty('--taille', (molle ? 26 + Math.random() * 22 : 30 + Math.random() * 36) + 'px');
      el.style.setProperty('--rot', (Math.random() < .5 ? '-' : '') + (180 + Math.random() * 400) + 'deg');
      el.style.animationDuration = (molle ? 3.4 + Math.random() * 2 : 2.4 + Math.random() * 1.8) + 's';
      el.style.animationDelay = (Math.random() * (molle ? 2.4 : 4)) + 's';
    }
  },

  // GAGNÉ B — feu d'artifice : 4 explosions successives
  _feu(layer, visuels) {
    const bursts = [[30, 35, 0], [70, 30, 900], [50, 55, 1800], [25, 60, 2700], [75, 65, 3400]];
    bursts.forEach(([bx, by, delai]) => {
      this._later(() => {
        if (!layer.isConnected) return;
        for (let i = 0; i < 9; i++) {
          const el = this._particule(layer, visuels[i % visuels.length], 'explose');
          el.style.left = bx + 'vw';
          el.style.top = by + 'vh';
          const angle = (i / 9) * Math.PI * 2 + Math.random() * .6;
          const dist = 14 + Math.random() * 16;
          el.style.setProperty('--taille', (26 + Math.random() * 26) + 'px');
          el.style.setProperty('--dx', (Math.cos(angle) * dist) + 'vw');
          el.style.setProperty('--dy', (Math.sin(angle) * dist * .8 + 8) + 'vh');
          el.style.setProperty('--rot', (Math.random() * 360) + 'deg');
        }
      }, delai);
    });
  },

  // GAGNÉ C — cabaret : projecteurs croisés + bulles de champagne qui montent
  _cabaret(layer, visuels) {
    const s1 = document.createElement('div'); s1.className = 'anim-spot gauche';
    const s2 = document.createElement('div'); s2.className = 'anim-spot droite';
    layer.appendChild(s1); layer.appendChild(s2);
    for (let i = 0; i < 22; i++) {
      const el = this._particule(layer, visuels[i % visuels.length], 'bulle');
      el.style.left = (Math.random() * 96) + 'vw';
      el.style.setProperty('--taille', (22 + Math.random() * 30) + 'px');
      el.style.setProperty('--rot', (Math.random() < .5 ? '-' : '') + (90 + Math.random() * 220) + 'deg');
      el.style.animationDuration = (3 + Math.random() * 2.4) + 's';
      el.style.animationDelay = (Math.random() * 3.4) + 's';
    }
  }
};
