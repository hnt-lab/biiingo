const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const context = {};
runInNewContext(readFileSync(join(__dirname, '../js/public-display.js'), 'utf8'), context);

test('normalise les codes saisis sur un écran public', () => {
  assert.equal(context.normalizeDisplayCode('  abcd  '), 'ABCD');
  assert.equal(context.normalizeDisplayCode(null), '');
});
