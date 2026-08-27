const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const context = { Math, Promise };
runInNewContext(readFileSync(join(__dirname, '../js/image-utils.js'), 'utf8'), context);

test('réduit une image sans jamais l’agrandir', () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.imageFitInside(2000, 1000, 500))),
    { width: 500, height: 250 }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.imageFitInside(320, 200, 500))),
    { width: 320, height: 200 }
  );
});

test('calcule un recadrage carré centré en mode cover', () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.imageCoverSquare(1200, 600, 100))),
    { width: 200, height: 100, x: -50, y: 0 }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.imageCoverSquare(600, 1200, 100))),
    { width: 100, height: 200, x: 0, y: -50 }
  );
});
