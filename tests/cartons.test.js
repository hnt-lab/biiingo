const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = readFileSync(join(__dirname, '../js/cartons.js'), 'utf8');
const context = { Math, Set };
runInNewContext(source, context);

const {
  cartonColonneRange,
  genCarton,
  genCartons,
  cartonNums,
  lignesGagnantes,
  cartonComplet,
  cartonsVersDb,
  cartonsDepuisDb,
  marquesVersDb,
  marquesDepuisDb
} = context;

function validateCarton(carton) {
  assert.equal(carton.length, 3);
  assert.deepEqual(Array.from(carton, row => row.length), [9, 9, 9]);

  for (const row of carton) {
    assert.equal(row.filter(Boolean).length, 5);
  }

  const numbers = cartonNums(carton);
  assert.equal(numbers.length, 15);
  assert.equal(new Set(numbers).size, 15);

  for (let column = 0; column < 9; column += 1) {
    const values = Array.from(carton, row => row[column]).filter(Boolean);
    const [minimum, maximum] = cartonColonneRange(column);
    assert.ok(values.length >= 1 && values.length <= 3);
    assert.ok(values.every(value => value >= minimum && value <= maximum));
    assert.deepEqual(values, [...values].sort((left, right) => left - right));
  }
}

test('génère des cartons français valides de façon répétée', () => {
  for (let index = 0; index < 2_000; index += 1) validateCarton(genCarton());
});

test('génère le nombre demandé de cartons distincts', () => {
  const cartons = genCartons(100);
  assert.equal(cartons.length, 100);
  assert.equal(new Set(cartonsVersDb(cartons)).size, 100);
});

test('détecte les lignes et le carton réellement complétés', () => {
  const carton = [
    [1, 10, 20, 30, 40, 0, 0, 0, 0],
    [0, 11, 21, 31, 0, 50, 60, 0, 0],
    [2, 0, 22, 0, 42, 52, 0, 80, 0]
  ];
  const numbers = cartonNums(carton);
  const firstLine = new Set(carton[0].filter(Boolean));

  assert.deepEqual(Array.from(lignesGagnantes(carton, firstLine, numbers)), [1]);
  assert.equal(cartonComplet(carton, firstLine, numbers), false);
  assert.equal(cartonComplet(carton, new Set(numbers), numbers), true);
  const incompleteDraw = numbers.filter(number => ![1, 11, 2].includes(number));
  assert.deepEqual(Array.from(lignesGagnantes(carton, new Set(numbers), incompleteDraw)), []);
});

test('préserve les cartons pendant un aller-retour Firestore', () => {
  const cartons = genCartons(4);
  assert.deepEqual(
    JSON.parse(JSON.stringify(cartonsDepuisDb(cartonsVersDb(cartons)))),
    JSON.parse(JSON.stringify(cartons))
  );
});

test('préserve et filtre les jetons marqués pendant un aller-retour Firestore', () => {
  const cartons = genCartons(2);
  const firstNumbers = cartonNums(cartons[0]);
  const secondNumbers = cartonNums(cartons[1]);
  const serialized = marquesVersDb([
    new Set(firstNumbers.slice(0, 3)),
    new Set(secondNumbers.slice(0, 2))
  ]);
  serialized[0] += ',999';
  const restored = marquesDepuisDb(serialized, cartons);
  assert.equal([...restored[0]].join(','), firstNumbers.slice(0, 3).sort((a, b) => a - b).join(','));
  assert.equal([...restored[1]].join(','), secondNumbers.slice(0, 2).sort((a, b) => a - b).join(','));
});
