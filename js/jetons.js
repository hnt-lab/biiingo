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
  _drag: null, _raf: null,

  init(aireEl, style, onChange) {
    this.destroy();
    this.aire = aireEl;
    if (style) this.style = style;
    this.onChange = onChange || null;
    const M = window.Matter;
    if (!M) return; // lib non chargée : mode dégradé (tap simple géré par joueur.js)
    this.engine = M.Engine.create();
    this.world = this.engine.world;
    this.engine.gravity.y = 1;
    const w = aireEl.clientWidth, h = aireEl.clientHeight, ep = 60;
    // murs autour de l'aire (les jetons ne quittent jamais l'écran)
    const opts = { isStatic: true };
    M.Composite.add(this.world, [
      M.Bodies.rectangle(w / 2, h + ep / 2, w * 2, ep, opts),
      M.Bodies.rectangle(w / 2, -ep / 2, w * 2, ep, opts),
      M.Bodies.rectangle(-ep / 2, h / 2, ep, h * 2, opts),
      M.Bodies.rectangle(w + ep / 2, h / 2, ep, h * 2, opts)
    ]);
    this._loop();
    this._ecouteSecousses();
  },

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    this.bodies.forEach(b => b.el.remove());
    this.bodies = [];
    this.marked = new Set();
    this.engine = null;
  },

  // Rayon de jeton adapté à la taille des cases
  _rayon() {
    const r = Object.values(this.cellRects)[0];
    return r ? Math.min(r.w, r.h) * 0.38 : 18;
  },

  spawn(nb, placedNums) {
    // jetons posés (repris d'un état précédent) + le reste dans la réserve (droite)
    const M = window.Matter;
    if (!M || !this.aire) return;
    const w = this.aire.clientWidth, h = this.aire.clientHeight;
    const rayon = this._rayon();
    (placedNums || []).forEach(num => {
      const rect = this.cellRects[num];
      if (rect) this._creer(rect.x + rect.w / 2, rect.y + rect.h / 2, rayon, num);
    });
    const restant = Math.max(0, nb - (placedNums || []).length);
    for (let i = 0; i < restant; i++) {
      this._creer(w - 30 - Math.random() * 60, h - 30 - Math.random() * 80, rayon, 0);
    }
    this._notifie();
  },

  _creer(x, y, rayon, num) {
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
    const jeton = { body, el, num: num || 0 };
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
          this.marked.add(+num);
          jeton.el.classList.add('pose');
          this._notifie();
          return;
        }
      }
      M.Body.setStatic(jeton.body, false); // sinon il tombe
    };
    jeton.el.addEventListener('pointerup', lacher);
    jeton.el.addEventListener('pointercancel', lacher);
  },

  // TOUT tombe (secousse, changement d'appli) — les cases bien marquées gagnent un halo d'aide
  dislodge(tires) {
    const M = window.Matter;
    if (!M) return;
    let chute = false;
    this.bodies.forEach(j => {
      if (j.num) {
        if (tires && tires.includes(j.num)) this.aidHalo.add(j.num);
        this.marked.delete(j.num);
        j.num = 0;
        j.el.classList.remove('pose');
        chute = true;
      }
      M.Body.setStatic(j.body, false);
      M.Body.setVelocity(j.body, { x: (Math.random() - .5) * 12, y: -4 - Math.random() * 5 });
      M.Body.setAngularVelocity(j.body, (Math.random() - .5) * .6);
    });
    if (chute) {
      if (navigator.vibrate) navigator.vibrate(200);
      this._notifie();
    }
  },

  _ecouteSecousses() {
    if (this._secousseOk) return;
    this._secousseOk = true;
    window.addEventListener('devicemotion', (e) => {
      const a = e.acceleration;
      if (!a || !this.engine) return;
      const mag = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
      if (mag > SECOUSSE_SEUIL) this.dislodge(window.S && S.soiree ? S.soiree.tires : []);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.engine) this.dislodge(window.S && S.soiree ? S.soiree.tires : []);
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
