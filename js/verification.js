// Vérification d'un carton annoncé (« Quine ! ») — 100% boutons, jamais de clavier.

function mcVerifHtml(s) {
  const v = s.verification || {};
  const obj = OBJECTIFS[s.objectif] || OBJECTIFS.quine;

  // Mode « partie de la lose » : pas de carton à vérifier (mort subite) → on déclare le·a survivant·e
  if (s.objectif === 'lose' && !v.verdict) {
    const noms = Object.values(S.registre || {})
      .sort((a, b) => (b.victoires || 0) - (a.victoires || 0)).slice(0, 50);
    const datalist = noms.map(n => `<option value="${escAttr(n.nom)}"></option>`).join('');
    return `
    <div class="verif-intro">
      <h3 class="mc-h3">💀 Mort subite</h3>
      <p class="muted">Pas de carton à vérifier : dès qu'un numéro sort, ceux qui l'ont sont éliminés.
      Quand il ne reste qu'une personne, déclare-la gagnante !</p>
      <label class="field"><span>Nom du·de la survivant·e (pour le Hall of Fame — optionnel)</span>
        <input id="loseNom" type="text" maxlength="40" list="nomsConnus" placeholder="Jacqueline">
        <datalist id="nomsConnus">${datalist}</datalist></label>
      <button class="btn block primary big" onclick="verifLoseWin()">🏆 Déclarer le·a survivant·e</button>
    </div>`;
  }

  // Pas de vérification en cours → écran de lancement
  if (!v.active) {
    const noms = Object.values(S.registre || {})
      .sort((a, b) => (b.victoires || 0) - (a.victoires || 0)).slice(0, 50);
    const datalist = noms.map(n => `<option value="${escAttr(n.nom)}"></option>`).join('');
    return `
    <div class="verif-intro">
      <h3 class="mc-h3">🔍 Vérifier un carton</h3>
      <p class="muted">Quelqu'un a crié « ${obj.label} ! » ? Note son nom, lance la vérification, puis appuie sur
      les numéros de SON carton : <span class="ok-txt">vert</span> = sorti, <span class="ko-txt">rouge</span> = pas sorti…</p>
      <label class="field"><span>Nom du joueur (pour le Hall of Fame — optionnel)</span>
        <input id="verifNom" type="text" maxlength="40" list="nomsConnus" placeholder="Jacqueline">
        <datalist id="nomsConnus">${datalist}</datalist></label>
      <label class="check-line">
        <input type="checkbox" id="verifSuspense" checked>
        <span>🥁 Mode suspense (ambiance + roulement à l'écran)</span>
      </label>
      <button class="btn block primary big" onclick="verifStart()">🔍 Lancer la vérification</button>
    </div>`;
  }

  // Verdict rendu → écran de reprise
  if (v.verdict) {
    return `
    <div class="verif-intro">
      <div class="verdict-mini ${v.verdict === 'gagne' ? 'ok' : 'ko'}">
        ${v.verdict === 'gagne' ? `✨ GAGNÉ${v.gagnantNom ? ' — ' + esc(v.gagnantNom) : ''} !` : '💋 Faux bingo !'}
      </div>
      <button class="btn block primary big" onclick="verifEnd()">▶ Reprendre la partie</button>
    </div>`;
  }

  // Vérification en cours → grille de pointage
  let cells = '';
  const coches = v.coches || [];
  for (let n = 1; n <= NB_NUMEROS; n++) {
    const tire = s.tires.includes(n);
    const coche = coches.includes(n);
    let cls = tire ? 'tire' : '';
    if (coche) cls = tire ? 'coche-ok' : 'coche-ko';
    cells += `<button class="mc-cell verif ${cls}" onclick="verifTap(${n})">${n}</button>`;
  }
  const nbKo = coches.filter(n => !s.tires.includes(n)).length;
  const cible = v.gagnantNom ? ' de <b>' + esc(v.gagnantNom) + '</b>' : ' du joueur';
  return `
  <div class="mc-alerte">${v.suspense ? '🥁' : '🔍'} Appuie sur les numéros du carton${cible}
    <span class="verif-bilan">${coches.length} pointé(s)${nbKo ? ` · <span class="ko-txt">${nbKo} pas sorti(s) !</span>` : ''}</span></div>
  <div class="mc-grille">${cells}</div>
  <div class="mc-actions-row verdict-row">
    <button class="btn ghost" onclick="verifCancel()">✖ Annuler</button>
    <button class="btn ko" onclick="verifVerdictFaux()">💋 Faux bingo</button>
    <button class="btn ok" onclick="verifConfirmGagne()">✨ GAGNÉ</button>
  </div>`;
}

function verifStart() {
  const suspense = $('#verifSuspense').checked;
  const nom = (($('#verifNom') && $('#verifNom').value) || '').trim();
  soireeUpdate({
    etat: 'verification',
    verification: { active: true, suspense, coches: [], verdict: '', gagnantNom: nom }
  });
}

function verifTap(n) {
  const v = S.soiree.verification || {};
  const coches = v.coches || [];
  if (coches.includes(n)) soireeUpdate({ 'verification.coches': FV.arrayRemove(n) });
  else soireeUpdate({ 'verification.coches': FV.arrayUnion(n) });
}

function verifCancel() {
  soireeUpdate({ etat: 'tirage', verification: { active: false, suspense: false, coches: [], verdict: '', gagnantNom: '' } });
}

// Après un verdict : l'écran de salle garde l'animation ~7 s puis revient tout seul à la grille
const VERDICT_DUREE_MS = 7000;
let verdictTimer = null;
function verifProgrammerRetour() {
  clearTimeout(verdictTimer);
  verdictTimer = setTimeout(() => {
    if (S.soiree && S.soiree.verification && S.soiree.verification.verdict) verifEnd();
  }, VERDICT_DUREE_MS);
}

function verifVerdictFaux() {
  soireeUpdate({ 'verification.verdict': 'faux' });
  S.mcTab = 'tirage'; // le MC revient au tirage, l'écran joue l'animation puis revient seul
  verifProgrammerRetour();
}

// Objectif suivant après un gagné : quine → double quine → carton plein (la lose reste la lose)
const OBJECTIF_SUIVANT = { quine: 'double', double: 'carton', carton: 'carton', lose: 'lose' };

// GAGNÉ : le nom a été saisi avant la vérification → on valide directement
function verifConfirmGagne() {
  const s = S.soiree;
  const nom = (s.verification && s.verification.gagnantNom || '').trim();
  const entry = { nom, objectif: s.objectif, manche: s.manche, ts: Date.now() };
  const patch = {
    'verification.verdict': 'gagne',
    'verification.gagnantNom': nom,
    hallOfFame: FV.arrayUnion(entry)
  };
  const suivant = OBJECTIF_SUIVANT[s.objectif] || 'quine';
  if (s.objectif === 'lose') {
    toast('Survivant·e enregistré·e ! 💀🏆');
  } else if (suivant !== s.objectif) {
    patch.objectif = suivant;
    toast('Objectif suivant : ' + OBJECTIFS[suivant].label + ' 🎯');
  } else {
    toast('Carton plein remporté — « Manche suiv. » quand vous voulez ! 🏆');
  }
  soireeUpdate(patch);
  if (nom) saveWinnerToRegistre(nom);
  S.mcTab = 'tirage'; // retour direct au tirage côté animateur (demande utilisateur)
  verifProgrammerRetour();
}

function verifEnd() {
  soireeUpdate({ etat: 'tirage', verification: { active: false, suspense: false, coches: [], verdict: '', gagnantNom: '' } });
}

// Mode lose : déclaration directe du·de la survivant·e (déclenche l'animation GAGNÉ)
function verifLoseWin() {
  const s = S.soiree;
  const nom = (($('#loseNom') && $('#loseNom').value) || '').trim();
  const entry = { nom, objectif: 'lose', manche: s.manche, ts: Date.now() };
  soireeUpdate({
    etat: 'verification',
    verification: { active: true, suspense: false, coches: [], verdict: 'gagne', gagnantNom: nom },
    hallOfFame: FV.arrayUnion(entry)
  });
  if (nom) saveWinnerToRegistre(nom);
  toast('Survivant·e déclaré·e ! 💀🏆');
  S.mcTab = 'tirage';
  verifProgrammerRetour();
}
