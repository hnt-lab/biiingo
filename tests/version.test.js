const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

function read(relativePath) {
  return readFileSync(join(__dirname, '..', relativePath), 'utf8');
}

test('maintient une version cohérente dans les sources publiées', () => {
  const packageVersion = JSON.parse(read('package.json')).version;
  const appVersion = read('js/version.js').match(/APP_VERSION\s*=\s*'([^']+)'/)[1];
  const buildVersion = read('index.html').match(/window\.__B='([^']+)'/)[1];

  assert.equal(appVersion, packageVersion);
  assert.equal(buildVersion, packageVersion);
});

test('charge tous les fichiers JavaScript applicatifs avec le cache-buster', () => {
  const index = read('index.html');
  const declaredFiles = index.match(/var files = \[([^\]]+)\]/)[1]
    .match(/'([^']+)'/g)
    .map(value => value.slice(1, -1));
  const expectedFiles = [
    'version', 'config', 'state', 'joueur-state', 'ui', 'image-utils', 'sons', 'firebase', 'data', 'public-display', 'feedback', 'auth', 'core', 'anims', 'salle-qr', 'salle',
    'verification', 'mc', 'mc-display', 'editeur-sons', 'editeur-contenu', 'editeur', 'tuto', 'profil', 'cartons', 'jetons', 'joueur'
  ];

  assert.deepEqual(declaredFiles, expectedFiles);
  assert.match(index, /files\[i\] \+ '\.js\?v=' \+ window\.__B/);
});

test('verrouille l’intégrité de toutes les bibliothèques externes', () => {
  const externalScripts = [...read('index.html').matchAll(/<script\s+src="https:[\s\S]*?<\/script>/g)]
    .map(match => match[0]);

  assert.equal(externalScripts.length, 5);
  for (const script of externalScripts) {
    assert.match(script, /integrity="sha384-[A-Za-z0-9+/=]+"/);
    assert.match(script, /crossorigin="anonymous"/);
  }
});
