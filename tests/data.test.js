const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const commits = [];
const pages = [
  Array.from({ length: 400 }, (_, index) => ({ ref: `page-1-${index}` })),
  Array.from({ length: 2 }, (_, index) => ({ ref: `page-2-${index}` }))
];

const db = {
  batch() {
    const deleted = [];
    return {
      delete(reference) { deleted.push(reference); },
      async commit() { commits.push(deleted); }
    };
  }
};

const query = {
  limit(size) {
    assert.equal(size, 400);
    return {
      async get() {
        const docs = pages.shift() || [];
        return { docs, empty: docs.length === 0, size: docs.length };
      }
    };
  }
};

const context = { db };
runInNewContext(readFileSync(join(__dirname, '../js/data.js'), 'utf8'), context);

test('supprime les résultats Firestore par lots sûrs', async () => {
  const deleted = await context.deleteQueryDocs(query);
  assert.equal(deleted, 402);
  assert.deepEqual(commits.map(batch => batch.length), [400, 2]);
});
