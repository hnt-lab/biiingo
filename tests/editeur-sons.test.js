const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const context = {};
runInNewContext(readFileSync(join(__dirname, '../js/editeur-sons.js'), 'utf8'), context);

test('active ou désactive un son sans modifier la liste source', () => {
  const source = ['attente', 'gagne'];
  assert.deepEqual(Array.from(context.edSonOffSuivant(source, 'attente')), ['gagne']);
  assert.deepEqual(Array.from(context.edSonOffSuivant(source, 'faux')), ['attente', 'gagne', 'faux']);
  assert.deepEqual(source, ['attente', 'gagne']);
});
