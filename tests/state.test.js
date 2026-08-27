const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const context = { window: {} };
runInNewContext(readFileSync(join(__dirname, '../js/state.js'), 'utf8'), context);

test('expose un état initial complet aux modules historiques', () => {
  assert.equal(context.window.S.mode, null);
  assert.equal(context.window.S.displayMode, false);
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.S.medias)), {});
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.S.joueurs)), []);
  assert.equal(context.window.S.unsubMedias, null);
  assert.equal(context.window.S.unsubJoueurs, null);
});
