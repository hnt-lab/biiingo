// Génération et logique des cartons de loto français.
// Format officiel : 3 lignes × 9 colonnes, 15 numéros (5 par ligne),
// colonnes par dizaines (col 0 : 1-9 … col 8 : 80-90), 1 à 3 numéros par colonne,
// triés du plus petit (haut) au plus grand (bas) dans chaque colonne.

function cartonColonneRange(col) {
  if (col === 0) return [1, 9];
  if (col === 8) return [80, 90];
  return [col * 10, col * 10 + 9];
}

// Génère UN carton : tableau de 3 lignes × 9 cases (numéro ou 0 si vide)
function genCarton() {
  // 1. Nombre de numéros par colonne : chacun 1-3, total 15
  const counts = new Array(9).fill(1); // 9 déjà placés
  let reste = 6;
  while (reste > 0) {
    const c = Math.floor(Math.random() * 9);
    if (counts[c] < 3) { counts[c]++; reste--; }
  }
  // 2. Répartir dans les lignes : chaque ligne doit avoir 5 numéros
  //    (colonnes traitées par nombre décroissant, affectées aux lignes les moins remplies)
  const rowLoad = [0, 0, 0];
  const cells = [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]];
  const ordre = [...Array(9).keys()].sort((a, b) => counts[b] - counts[a] || Math.random() - .5);
  for (const col of ordre) {
    const rows = [0, 1, 2]
      .filter(r => rowLoad[r] < 5)
      .sort((a, b) => rowLoad[a] - rowLoad[b] || Math.random() - .5)
      .slice(0, counts[col])
      .sort((a, b) => a - b);
    rows.forEach(r => { rowLoad[r]++; cells[r][col] = -1; }); // -1 = case à remplir
  }
  // 3. Tirer les numéros de chaque colonne (triés croissants vers le bas)
  for (let col = 0; col < 9; col++) {
    const [lo, hi] = cartonColonneRange(col);
    const pool = [];
    for (let n = lo; n <= hi; n++) pool.push(n);
    const pick = [];
    for (let k = 0; k < counts[col]; k++) {
      pick.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    pick.sort((a, b) => a - b);
    let i = 0;
    for (let r = 0; r < 3; r++) if (cells[r][col] === -1) cells[r][col] = pick[i++];
  }
  return cells;
}

function genCartons(n) {
  const out = [];
  const vus = new Set();
  while (out.length < n) {
    const c = genCarton();
    const cle = c.flat().filter(x => x).join(',');
    if (!vus.has(cle)) { vus.add(cle); out.push(c); }
  }
  return out;
}

// Numéros d'un carton (liste plate)
function cartonNums(carton) { return carton.flat().filter(n => n > 0); }

// Lignes "réellement complètes" : toutes les cases de la ligne MARQUÉES (jeton posé)
// ET tous leurs numéros réellement tirés. marked = Set de numéros marqués par le joueur.
function lignesGagnantes(carton, marked, tires) {
  const lignes = [];
  for (let r = 0; r < 3; r++) {
    const nums = carton[r].filter(n => n > 0);
    if (nums.every(n => marked.has(n) && tires.includes(n))) lignes.push(r + 1);
  }
  return lignes;
}

// Le carton entier est-il complet (marqué + tiré) ?
function cartonComplet(carton, marked, tires) {
  return lignesGagnantes(carton, marked, tires).length === 3;
}

// Sérialisation Firestore (tableaux imbriqués interdits → aplati)
function cartonsVersDb(cartons) { return cartons.map(c => c.flat().join(',')); }
function cartonsDepuisDb(arr) {
  return (arr || []).map(s => {
    const flat = s.split(',').map(Number);
    return [flat.slice(0, 9), flat.slice(9, 18), flat.slice(18, 27)];
  });
}
