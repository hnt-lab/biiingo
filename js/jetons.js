// Jetons à physique réelle (matter.js — MIT). Le joueur pose ses jetons sur son carton ;
// toute secousse du téléphone (ou changement d'appli) les décroche. Hardcore assumé 💅.

const Jetons = {
  engine: null, runner: false, world: null,
  aire: null,            // conteneur de l'aire de jeu (position:relative)
  bodies: [],            // { body, el, num (numéro marqué ou 0), statique }
  cellRects: {},         // numéro → {x,y,w,h} relatif à l'aire (cases du carton actif)
  marked: new Set(),     // numéros marqués (jeton posé) sur le carton ACTIF
  aidHalo: new Set(),    // numéros à remettre (étaient bien posés avant une chute)
  style: { type: 'emoji', val: '🔴' },
  onChange: null,        // callback(markedSet) à chaque pose/chute
  onLandscape: null,     // recalibrage du plateau après une rotation complète
  frozen: false,         // vérification en cours : tout est gelé
  reserve: null,         // zone-refuge {x,y,w,h} : les jetons y sont à l'abri des secousses
  _drag: null, _raf: null, _lastAccel: null, _lastDislodge: 0,

  init(aireEl, style, onChange, onLandscape) {
    this.destroy();
    this.aire = aireEl;
    if (style) this.style = style;
    this.onChange = onChange || null;
    this.onLandscape = onLandscape || null;
    const M = window.Matter;
    if (!M) return; // lib non chargée : mode dégradé (tap simple géré par joueur.js)
    this.engine = M.Engine.create();
    this.world = this.engine.world;
    this.engine.gravity.y = 1;
    try { this._orienteGravite(matchMedia('(orientation: portrait)').matches); } catch (e) {}
    const w = aireEl.clientWidth, h = aireEl.clientHeight, ep = 60;
    // murs autour de l'aire (les jetons ne quittent jamais l'écran)
    const opts = { isStatic: true };
    M.Composite.add(this.world, [
      M.Bodies.rectangle(w / 2, h + ep / 2, w * 2, ep, opts),
      M.Bodies.rectangle(w / 2, -ep / 2, w * 2, ep, opts),
      M.Bodies.rectangle(-ep / 2, h / 2, ep, h * 2, opts),
      M.Bodies.rectangle(w + ep / 2, h / 2, ep, h * 2, opts)
    ]);
    // le RÉSERVOIR (zone de droite) : muré → les jetons qui y dorment n'en sortent pas
    const resEl = aireEl.querySelector('.jetons-reserve');
    if (resEl) {
      const ar = aireEl.getBoundingClientRect(), rr = resEl.getBoundingClientRect();
      this.reserve = { x: rr.left - ar.left, y: rr.top - ar.top, w: rr.width, h: rr.height };
      M.Composite.add(this.world,
        M.Bodies.rectangle(this.reserve.x - 3, h / 2, 6, h * 2, { isStatic: true }));
    }
    this.frozen = false;
    this._loop();
    this._ecouteSecousses();
  },

  _dansReserve(body) {
    const r = this.reserve;
    return !!r
      && body.position.x >= r.x
      && body.position.x <= r.x + r.w
      && body.position.y >= r.y
      && body.position.y <= r.y + r.h;
  },

  // Vérification en cours : tout gelé (aucune pose, aucune chute)
  freeze(on) {
    const M = window.Matter;
    if (!M || this.frozen === on) return;
    this.frozen = on;
    this.bodies.forEach(j => {
      if (on) { j._etaitDyn = !j.body.isStatic; M.Body.setStatic(j.body, true); }
      else if (j._etaitDyn && !j.num) M.Body.setStatic(j.body, false);
      j.el.style.pointerEvents = on ? 'none' : '';
    });
  },

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    this.bodies.forEach(b => b.el.remove());
    this.bodies = [];
    this.marked = new Set();
    this.engine = null;
    this.world = null;
    this.aire = null;
    this.cellRects = {};
    this.reserve = null;
    this._drag = null;
    this._lastAccel = null;
  },

  // Rayon de jeton adapté à la taille des cases
  _rayon() {
    const r = Object.values(this.cellRects)[0];
    return r ? Math.min(r.w, r.h) * 0.38 : 18;
  },

  spawn(nb, placedNums, fallenCount) {
    // jetons posés (repris d'un état précédent) + le reste dans la réserve (droite)
    const M = window.Matter;
    if (!M || !this.aire) return;
    const w = this.aire.clientWidth, h = this.aire.clientHeight;
    const rayon = this._rayon();
    (placedNums || []).forEach(num => {
      const rect = this.cellRects[num];
      if (rect) this._creer(rect.x + rect.w / 2, rect.y + rect.h / 2, rayon, num);
    });
    const fallen = Math.max(0, Math.min(fallenCount || 0, nb - (placedNums || []).length));
    const minX = Math.max(rayon + 12, 64);
    const maxX = Math.max(minX, (this.reserve ? this.reserve.x : w) - rayon - 12);
    for (let i = 0; i < fallen; i++) {
      const ratio = (i + 1) / (fallen + 1);
      const x = minX + (maxX - minX) * ratio;
      const y = h - rayon - 10 - (i % 2) * Math.min(10, rayon * .35);
      this._creer(x, y, rayon, 0, true);
    }
    const restant = Math.max(0, nb - (placedNums || []).length - fallen);
    for (let i = 0; i < restant; i++) {
      const position = this._positionReserve(i, restant, rayon, w, h);
      this._creer(position.x, position.y, rayon, 0);
    }
    this._notifie();
  },

  _positionReserve(index, count, rayon, width, height) {
    const r = this.reserve;
    if (!r) return { x: width - rayon - 12, y: height - rayon - 12 };
    const padding = Math.max(6, rayon * .25);
    const minX = r.x + rayon + padding;
    const maxX = Math.max(minX, r.x + r.w - rayon - padding);
    const minY = r.y + rayon + padding;
    const maxY = Math.max(minY, r.y + r.h - rayon - padding);
    const diameterGap = rayon * 2 + 4;
    const columns = Math.max(1, Math.floor((maxX - minX) / diameterGap) + 1);
    const rows = Math.max(1, Math.ceil(count / columns));
    const column = index % columns;
    const row = Math.floor(index / columns);
    return {
      x: columns === 1 ? (minX + maxX) / 2 : minX + (maxX - minX) * column / (columns - 1),
      y: rows === 1 ? (minY + maxY) / 2 : maxY - (maxY - minY) * row / (rows - 1)
    };
  },

  _creer(x, y, rayon, num, fallen) {
    const M = window.Matter;
    const body = M.Bodies.circle(x, y, rayon, { restitution: .3, friction: .4, frictionAir: .02 });
    if (num) M.Body.setStatic(body, true);
    M.Composite.add(this.world, body);
    const el = document.createElement('div');
    el.className = 'jeton' + (num ? ' pose' : '');
    el.style.width = el.style.height = (rayon * 2) + 'px';
    if (this.style.type === 'image') {
      el.style.backgroundImage = `url(${this.style.val})`;
    } else {
      el.textContent = this.style.val;
      el.style.fontSize = (rayon * 1.3) + 'px';
    }
    this.aire.appendChild(el);
    const jeton = { body, el, num: num || 0, fallen: !!fallen };
    if (num) this.marked.add(num);
    this._pointer(jeton);
    this.bodies.push(jeton);
  },

  // Glisser-poser au doigt
  _pointer(jeton) {
    const M = window.Matter;
    jeton.el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      jeton.el.setPointerCapture(e.pointerId);
      this._drag = jeton;
      if (jeton.num) { this.marked.delete(jeton.num); jeton.num = 0; jeton.el.classList.remove('pose'); this._notifie(); }
      jeton.fallen = false;
      M.Body.setStatic(jeton.body, true);
    });
    jeton.el.addEventListener('pointermove', (e) => {
      if (this._drag !== jeton) return;
      const r = this.aire.getBoundingClientRect();
      M.Body.setPosition(jeton.body, { x: e.clientX - r.left, y: e.clientY - r.top });
    });
    const lacher = (e) => {
      if (this._drag !== jeton) return;
      this._drag = null;
      const p = jeton.body.position;
      // sur une case ? → on snap au centre
      for (const num in this.cellRects) {
        const c = this.cellRects[num];
        if (p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h && !this.marked.has(+num)) {
          M.Body.setPosition(jeton.body, { x: c.x + c.w / 2, y: c.y + c.h / 2 });
          jeton.num = +num;
          jeton.fallen = false;
          this.marked.add(+num);
          jeton.el.classList.add('pose');
          // pose CORRECTE (numéro réellement tiré) → mémorisée pour le halo d'aide après une chute
          const tires = (window.S && S.soiree && S.soiree.tires) || [];
          if (tires.includes(+num)) this.aidHalo.add(+num);
          this._notifie();
          return;
        }
      }
      jeton.fallen = !this._dansReserve(jeton.body);
      M.Body.setStatic(jeton.body, false); // sinon il tombe
    };
    jeton.el.addEventListener('pointerup', lacher);
    jeton.el.addEventListener('pointercancel', lacher);
  },

  // TOUT tombe (secousse, tentative de portrait) — SAUF les jetons à l'abri dans le réservoir.
  // Les cases bien marquées gagnent un halo d'aide.
  dislodge(tires) {
    const M = window.Matter;
    if (!M || this.frozen) return;
    const portrait = matchMedia('(orientation: portrait)').matches;
    let chute = false;
    this.bodies.forEach(j => {
      if (!j.num && this._dansReserve(j.body)) return; // au chaud dans le réservoir
      if (j.num) {
        if (tires && tires.includes(j.num)) this.aidHalo.add(j.num);
        this.marked.delete(j.num);
        j.num = 0;
        j.fallen = true;
        j.el.classList.remove('pose');
        chute = true;
      } else j.fallen = true;
      M.Body.setStatic(j.body, false);
      M.Body.setVelocity(j.body, portrait
        ? { x: 4 + Math.random() * 5, y: (Math.random() - .5) * 12 }
        : { x: (Math.random() - .5) * 12, y: -4 - Math.random() * 5 });
      M.Body.setAngularVelocity(j.body, (Math.random() - .5) * .6);
    });
    if (chute) {
      if (navigator.vibrate) navigator.vibrate(200);
      this._notifie();
    }
  },

  _declencheChute() {
    const now = Date.now();
    if (now - this._lastDislodge < 600) return;
    this._lastDislodge = now;
    this.dislodge(window.S && S.soiree ? S.soiree.tires : []);
  },

  _orienteGravite(portrait) {
    if (!this.engine) return;
    this.engine.gravity.x = portrait ? 1 : 0;
    this.engine.gravity.y = portrait ? 0 : 1;
  },

  _ecouteSecousses() {
    if (this._secousseOk) return;
    this._secousseOk = true;
    window.addEventListener('devicemotion', (e) => {
      if (!this.engine) return;
      const direct = e.acceleration;
      let mag = direct && [direct.x, direct.y, direct.z].some(Number.isFinite)
        ? Math.sqrt((direct.x || 0) ** 2 + (direct.y || 0) ** 2 + (direct.z || 0) ** 2)
        : 0;
      const gravity = e.accelerationIncludingGravity;
      if (!mag && gravity) {
        const current = { x: gravity.x || 0, y: gravity.y || 0, z: gravity.z || 0 };
        if (this._lastAccel) {
          mag = Math.sqrt(
            (current.x - this._lastAccel.x) ** 2 +
            (current.y - this._lastAccel.y) ** 2 +
            (current.z - this._lastAccel.z) ** 2
          );
        }
        this._lastAccel = current;
      }
      if (mag > SECOUSSE_SEUIL) this._declencheChute();
    });
    // Tenter de repasser en portrait = tout tombe 💅 (demande utilisateur)
    try {
      const portrait = matchMedia('(orientation: portrait)');
      const onOrientation = (e) => {
        this._orienteGravite(e.matches);
        if (e.matches && this.engine) this._declencheChute();
        else if (!e.matches && this.engine && this.onLandscape) {
          setTimeout(() => { if (this.engine && this.onLandscape) this.onLandscape(); }, 250);
        }
      };
      if (portrait.addEventListener) portrait.addEventListener('change', onOrientation);
      else portrait.addListener(onOrientation);
    } catch (e) {}
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.engine) this._declencheChute();
    });
  },

  _notifie() { if (this.onChange) this.onChange(this.marked); },

  _loop() {
    const M = window.Matter;
    let last = performance.now();
    const tick = (t) => {
      if (!this.engine) return;
      M.Engine.update(this.engine, Math.min(32, t - last));
      last = t;
      this.bodies.forEach(j => {
        j.el.style.transform = `translate(${j.body.position.x - j.el.offsetWidth / 2}px, ${j.body.position.y - j.el.offsetHeight / 2}px) rotate(${j.body.angle}rad)`;
      });
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }
};

// iOS : la détection de mouvement demande une permission (à appeler depuis un clic)
function jetonsDemandePermissionMouvement() {
  try {
    if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().catch(() => {});
    }
  } catch (e) {}
}
