const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const context = { window: {} };
runInNewContext(readFileSync(join(__dirname, '../js/joueur-state.js'), 'utf8'), context);

test('expose l’état joueur aux modules de navigation historiques', () => {
  assert.equal(context.window.J.soireeId, null);
  assert.equal(context.window.J.invite, true);
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.J.cartons)), []);
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.J.marques)), []);
  assert.equal(context.window.J.unsub, null);
});
