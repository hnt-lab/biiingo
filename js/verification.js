// Vérification d'un carton annoncé (« Quine ! ») — 100% boutons, jamais de clavier.

function mcVerifHtml(s) {
  const v = s.verification || {};
  const obj = OBJECTIFS[s.objectif] || OBJECTIFS.quine;

  // Pas de vérification en cours → écran de lancement
  if (!v.active) {
    return `
    <div class="verif-intro">
      <h3 class="mc-h3">🔍 Vérifier un carton</h3>
      <p class="muted">Quelqu'un a crié « ${obj.label} ! » ? Lance la vérification, puis appuie sur les numéros
      de SON carton : <span class="ok-txt">vert</span> = sorti, <span class="ko-txt">rouge</span> = pas sorti…</p>
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
  return `
  <div class="mc-alerte">${v.suspense ? '🥁' : '🔍'} Appuie sur les numéros du carton du joueur
    <span class="verif-bilan">${coches.length} pointé(s)${nbKo ? ` · <span class="ko-txt">${nbKo} pas sorti(s) !</span>` : ''}</span></div>
  <div class="mc-grille">${cells}</div>
  <div class="mc-actions-row verdict-row">
    <button class="btn ghost" onclick="verifCancel()">✖ Annuler</button>
    <button class="btn ko" onclick="verifVerdictFaux()">💋 Faux bingo</button>
    <button class="btn ok" onclick="verifGagneModal()">✨ GAGNÉ</button>
  </div>`;
}

function verifStart() {
  const suspense = $('#verifSuspense').checked;
  soireeUpdate({
    etat: 'verification',
    verification: { active: true, suspense, coches: [], verdict: '', gagnantNom: '' }
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

function verifVerdictFaux() {
  soireeUpdate({ 'verification.verdict': 'faux' });
}

// GAGNÉ → champ nom optionnel (autocomplétion depuis le registre des habitués), skippable d'un tap
function verifGagneModal() {
  const noms = Object.values(S.registre || {})
    .sort((a, b) => (b.victoires || 0) - (a.victoires || 0))
    .slice(0, 50);
  const datalist = noms.map(n => `<option value="${escAttr(n.nom)}">${n.victoires > 1 ? n.victoires + ' victoires' : ''}</option>`).join('');
  modal(`
    <h3>✨ On a un·e gagnant·e !</h3>
    <label class="field"><span>Son nom (pour le Hall of Fame — optionnel)</span>
      <input id="gagnantNom" type="text" maxlength="40" list="nomsConnus" placeholder="Jacqueline">
      <datalist id="nomsConnus">${datalist}</datalist></label>
    <div class="modal-btns">
      <button class="btn ghost" onclick="verifConfirmGagne('')">Passer →</button>
      <button class="btn primary" onclick="verifConfirmGagne($('#gagnantNom').value)">Valider 🏆</button>
    </div>`);
  setTimeout(() => $('#gagnantNom').focus(), 50);
}

function verifConfirmGagne(nomBrut) {
  closeModal();
  const nom = String(nomBrut || '').trim();
  const s = S.soiree;
  const entry = { nom, objectif: s.objectif, manche: s.manche, ts: Date.now() };
  soireeUpdate({
    'verification.verdict': 'gagne',
    'verification.gagnantNom': nom,
    hallOfFame: FV.arrayUnion(entry)
  });
  if (nom) saveWinnerToRegistre(nom);
}

function verifEnd() {
  soireeUpdate({ etat: 'tirage', verification: { active: false, suspense: false, coches: [], verdict: '', gagnantNom: '' } });
}
