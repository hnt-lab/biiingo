const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const context = {};
runInNewContext(readFileSync(join(__dirname, '../js/editeur-contenu.js'), 'utf8'), context);

test('ajoute et retire un artiste sans modifier le programme source', () => {
  const source = [{ nom: 'A' }, { nom: 'B' }];
  const added = context.edProgrammeAjoute(source, { nom: 'C' });
  const removed = context.edRetireIndex(source, 0);

  assert.deepEqual(JSON.parse(JSON.stringify(added)), [{ nom: 'A' }, { nom: 'B' }, { nom: 'C' }]);
  assert.deepEqual(JSON.parse(JSON.stringify(removed)), [{ nom: 'B' }]);
  assert.deepEqual(source, [{ nom: 'A' }, { nom: 'B' }]);
});

test('ajoute et retire un lien sans modifier l’écran de fin source', () => {
  const source = { texte: 'Merci', liens: [{ label: 'Site', url: 'https://example.test' }], qrUrl: '' };
  const added = context.edFinAvecLien(source, { label: 'Insta', url: '@test' });
  const removed = context.edFinSansLien(source, 0);

  assert.equal(added.liens.length, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(removed.liens)), []);
  assert.equal(source.liens.length, 1);
});
