const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');

function loadJetons() {
  const listeners = {};
  const media = {};
  const context = {
    Date,
    Math,
    Number,
    Set,
    setTimeout(callback) { callback(); },
    SECOUSSE_SEUIL: 12,
    document: {
      addEventListener(name, callback) { listeners[name] = callback; },
      visibilityState: 'visible'
    },
    navigator: {},
    matchMedia() {
      return { addEventListener(name, callback) { media[name] = callback; } };
    },
    window: {
      addEventListener(name, callback) { listeners[name] = callback; },
      Matter: {}
    }
  };
  context.window.S = { soiree: { tires: [42] } };
  context.S = context.window.S;
  const source = readFileSync(join(__dirname, '../js/jetons.js'), 'utf8');
  runInNewContext(`${source};globalThis.__Jetons=Jetons;`, context);
  return { Jetons: context.__Jetons, listeners, media };
}

test('déclenche la chute au retour dans l’application', () => {
  const { Jetons, listeners } = loadJetons();
  let falls = 0;
  Jetons.engine = {};
  Jetons.dislodge = () => { falls += 1; };
  Jetons._ecouteSecousses();
  listeners.visibilitychange();
  assert.equal(falls, 1);
});

test('utilise accelerationIncludingGravity en repli', () => {
  const { Jetons, listeners } = loadJetons();
  let falls = 0;
  Jetons.engine = {};
  Jetons.dislodge = () => { falls += 1; };
  Jetons._ecouteSecousses();
  listeners.devicemotion({ acceleration: null, accelerationIncludingGravity: { x: 0, y: 0, z: 9.8 } });
  listeners.devicemotion({ acceleration: null, accelerationIncludingGravity: { x: 15, y: 0, z: 9.8 } });
  assert.equal(falls, 1);
});

test('déclenche la chute au passage en portrait', () => {
  const { Jetons, media } = loadJetons();
  let falls = 0;
  let recalibrations = 0;
  Jetons.engine = { gravity: { x: 0, y: 1 } };
  Jetons.dislodge = () => { falls += 1; };
  Jetons.onLandscape = () => { recalibrations += 1; };
  Jetons._ecouteSecousses();
  media.change({ matches: true });
  assert.equal(falls, 1);
  assert.deepEqual(Jetons.engine.gravity, { x: 1, y: 0 });
  media.change({ matches: false });
  assert.deepEqual(Jetons.engine.gravity, { x: 0, y: 1 });
  assert.equal(recalibrations, 1);
});

test('restaure les jetons tombés hors du réservoir', () => {
  const { Jetons } = loadJetons();
  const created = [];
  Jetons.aire = { clientWidth: 800, clientHeight: 400 };
  Jetons.reserve = { x: 690, y: 0, w: 110, h: 400 };
  Jetons._rayon = () => 20;
  Jetons._creer = (x, y, radius, number, fallen) => created.push({ x, y, radius, number, fallen });
  Jetons.spawn(15, [], 3);
  const fallen = created.filter(token => token.fallen);
  assert.equal(fallen.length, 3);
  assert.equal(created.length, 15);
  assert.ok(fallen.every(token => token.x < Jetons.reserve.x && token.y > 350));
});
