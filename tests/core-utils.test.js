const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createContext, runInContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const listeners = new Map();
const context = createContext({
  console,
  Math,
  Set,
  URLSearchParams,
  clearTimeout,
  setTimeout,
  history: { pushState() {} },
  location: { href: '', pathname: '/', search: '' },
  localStorage: {
    getItem() { return null; },
    removeItem() {},
    setItem() {}
  },
  document: {
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; }
  },
  window: {
    addEventListener(type, listener) { listeners.set(type, listener); }
  }
});

for (const file of ['config.js', 'state.js', 'ui.js', 'core.js']) {
  const source = readFileSync(join(__dirname, `../js/${file}`), 'utf8');
  runInContext(source, context, { filename: file });
}

test('échappe les contenus injectés dans le HTML', () => {
  assert.equal(
    context.esc(`<script data-x="1">Tom & Jerry's</script>`),
    '&lt;script data-x=&quot;1&quot;&gt;Tom &amp; Jerry&#39;s&lt;/script&gt;'
  );
  assert.equal(context.esc(null), '');
});

test('normalise les noms utilisés comme identifiants', () => {
  assert.equal(context.slugName('  Élodie du Théâtre !  '), 'elodie-du-theatre');
  assert.equal(context.slugName("L'Œil & la Scène"), 'l-il-la-scene');
  assert.equal(context.slugName('---'), '');
});

test('génère uniquement des codes non ambigus de quatre lettres', () => {
  const codes = new Set();
  for (let index = 0; index < 5_000; index += 1) {
    const code = context.genCode();
    assert.match(code, /^[ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/);
    codes.add(code);
  }
  assert.ok(codes.size > 4_900);
});

test('enregistre les deux écouteurs de démarrage attendus', () => {
  assert.equal(typeof listeners.get('popstate'), 'function');
  assert.equal(typeof listeners.get('load'), 'function');
});
