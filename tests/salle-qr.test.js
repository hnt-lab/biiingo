const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const context = {
  encodeURIComponent,
  location: { origin: 'https://example.test', pathname: '/biiingo/' }
};
runInNewContext(readFileSync(join(__dirname, '../js/salle-qr.js'), 'utf8'), context);

test('construit un lien joueur encodé pour le QR de salle', () => {
  assert.equal(
    context.salleJoinUrl({ code: 'A B&' }),
    'https://example.test/biiingo/?join=A%20B%26'
  );
});
