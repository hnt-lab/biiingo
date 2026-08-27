const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const context = {
  encodeURIComponent,
  location: { origin: 'https://example.test', pathname: '/biiingo/' },
  S: { soiree: { code: 'A B&' } }
};
runInNewContext(readFileSync(join(__dirname, '../js/mc-display.js'), 'utf8'), context);

test('construit un lien public encodé à partir de la soirée ouverte', () => {
  assert.equal(context.mcDisplayUrl(), 'https://example.test/biiingo/?display=A%20B%26');
});
