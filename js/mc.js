// Télécommande MC (téléphone) : tirage, objectifs, entractes, bandeau, soirée.

const MC_TABS = [
  { id: 'tirage',   icon: '🎲', label: 'Tirage' },
  { id: 'verif',    icon: '🔍', label: 'Vérif' },
  { id: 'entracte', icon: '🎭', label: 'Entracte' },
  { id: 'edition',  icon: '✏️', label: 'Édition' },
  { id: 'soiree',   icon: '⚙️', label: 'Soirée' }
];
let editionRendered = false;

function mcSetTab(tab) {
  S.mcTab = tab;
  editionRendered = false;
  if (S.soiree) renderMC(S.soiree, null);
}

function renderMC(s, prev) {
  // En-tête
  const obj = OBJECTIFS[s.objectif] || OBJECTIFS.quine;
  $('#mcHeader').innerHTML = `
    <button class="btn icon" onclick="confirmAction('Quitter la télécommande ? (la soirée continue)','Quitter','quitSoiree()')">←</button>
    <div class="mc-head-mid">
      <div class="mc-head-titre">${esc(s.titre)}</div>
      <div class="mc-head-sub">Manche ${s.manche} · ${obj.label} · ${s.tires.length}/${NB_NUMEROS}</div>
    </div>
    <div class="mc-head-code">${esc(s.code)}</div>`;

  // Barre d'onglets
  $('#mcTabs').innerHTML = MC_TABS.map(t =>
    `<button class="mc-tab ${S.mcTab === t.id ? 'on' : ''}" onclick="mcSetTab('${t.id}')">
      <span class="mc-tab-ico">${t.icon}</span><span>${t.label}</span></button>`).join('');

  // Contenu de l'onglet actif
  const c = $('#mcContent');
  if (S.mcTab === 'tirage') c.innerHTML = mcTirageHtml(s);
  else if (S.mcTab === 'verif') c.innerHTML = mcVerifHtml(s);
  else if (S.mcTab === 'entracte') c.innerHTML = mcEntracteHtml(s);
  else if (S.mcTab === 'edition') {
    if (!editionRendered) { c.innerHTML = mcEditionHtml(s); editionRendered = true; }
  }
  else if (S.mcTab === 'soiree') c.innerHTML = mcSoireeHtml(s);
}

// ---------- Onglet TIRAGE ----------
function mcTirageHtml(s) {
  const etatLabels = { accueil: 'l\'écran d\'accueil', entracte: 'l\'entracte', fin: 'l\'écran de fin', verification: 'la vérification' };
  let alerte = '';
  if (s.etat !== 'tirage') {
    alerte = `<div class="mc-alerte">🖥 La salle affiche ${etatLabels[s.etat] || s.etat}.
      <button class="btn small primary" onclick="soireeUpdate({etat:'tirage'})">▶ Afficher la partie</button></div>`;
  }
  let cells = '';
  for (let n = 1; n <= NB_NUMEROS; n++) {
    cells += `<button class="mc-cell ${s.tires.includes(n) ? 'lit' : ''}" onclick="mcTapNum(${n})">${n}</button>`;
  }
  const b = s.bandeau || {};
  return `
  ${alerte}
  <div class="mc-actions-row">
    <button class="btn" onclick="mcObjectifModal()">🎯 Objectif</button>
    <button class="btn" onclick="mcMancheSuivante()">➡️ Manche suiv.</button>
    <button class="btn ${b.actif ? 'primary' : ''}" onclick="mcBandeauModal()">📢 Bandeau${b.actif ? ' ●' : ''}</button>
  </div>
  <div class="mc-grille">${cells}</div>`;
}

function mcTapNum(n) {
  const s = S.soiree;
  if (!s) return;
  if (s.tires.includes(n)) {
    confirmAction(`Annuler le <b>${n}</b> ?<br><span class="muted">Il disparaîtra de l'écran de salle.</span>`,
      'Annuler le ' + n, `mcRemoveNum(${n})`);
  } else {
    const patch = { tires: FV.arrayUnion(n) };
    if (s.etat === 'accueil') patch.etat = 'tirage'; // premier numéro = la partie démarre
    soireeUpdate(patch);
  }
}
function mcRemoveNum(n) { soireeUpdate({ tires: FV.arrayRemove(n) }); }

function mcObjectifModal() {
  const s = S.soiree;
  modal(`
    <h3>🎯 Objectif de la manche</h3>
    <div class="obj-choices">
      ${Object.keys(OBJECTIFS).map(k => {
        const o = OBJECTIFS[k];
        return `<button class="btn obj ${s.objectif === k ? 'primary' : ''}"
          onclick="soireeUpdate({objectif:'${k}'});closeModal()">${o.emoji} ${o.label}<br><small>${o.detail}</small></button>`;
      }).join('')}
    </div>
    <div class="modal-btns"><button class="btn ghost" onclick="closeModal()">Fermer</button></div>`);
}

function mcMancheSuivante() {
  const s = S.soiree;
  confirmAction(
    `Passer à la <b>manche ${s.manche + 1}</b> ?<br><span class="muted">La grille repart à zéro (objectif : Quine).</span>`,
    'Manche suivante ➡️',
    `soireeUpdate({manche:${s.manche + 1},tires:[],objectif:'quine',etat:'tirage',verification:{active:false,suspense:false,coches:[],verdict:''}})`);
}

function mcBandeauModal() {
  const b = (S.soiree && S.soiree.bandeau) || {};
  modal(`
    <h3>📢 Bandeau défilant</h3>
    <p class="muted small">Défile en bas de l'écran de salle — pendant la partie si activé, et toujours pendant l'entracte.</p>
    <label class="field"><span>Texte du bandeau</span>
      <input id="bandeauTxt" type="text" maxlength="200" value="${escAttr(b.texte || '')}"
             placeholder="Pensez au bar 🍹 · Prochaine soirée le 28 juin !"></label>
    <div class="modal-btns">
      <button class="btn ghost" onclick="closeModal()">Fermer</button>
      <button class="btn" onclick="mcBandeauSave(false)">💾 Garder masqué</button>
      <button class="btn primary" onclick="mcBandeauSave(true)">📢 Afficher</button>
    </div>`);
}
function mcBandeauSave(actif) {
  const texte = $('#bandeauTxt').value.trim();
  soireeUpdate({ bandeau: { texte, actif: actif && !!texte } });
  closeModal();
}

// ---------- Onglet ENTRACTE ----------
function mcEntracteHtml(s) {
  let html = '';
  if (s.etat === 'entracte') {
    html += `<div class="mc-alerte on-air">🎭 Entracte en cours : <b>${esc((s.entracte && s.entracte.nom) || '')}</b>
      <button class="btn small primary" onclick="soireeUpdate({etat:'tirage'})">▶ Reprendre la partie</button></div>`;
  }
  const prog = s.programme || [];
  html += `<h3 class="mc-h3">Programme de la soirée</h3>`;
  if (!prog.length) {
    html += `<p class="muted">Aucun numéro au programme. Ajoute tes artistes dans l'onglet ✏️ Édition, ou lance un entracte libre ci-dessous.</p>`;
  } else {
    html += prog.map((a, i) => `
      <div class="prog-card">
        ${a.photo ? `<img src="${escAttr(a.photo)}" class="prog-photo" alt="">` : '<div class="prog-photo vide">🎭</div>'}
        <div class="prog-info"><b>${esc(a.nom)}</b>${a.message ? `<div class="muted small">${esc(a.message)}</div>` : ''}</div>
        <button class="btn small primary" onclick="mcLancerEntracte(${i})">▶</button>
      </div>`).join('');
  }
  html += `
    <h3 class="mc-h3">Entracte libre</h3>
    <button class="btn block" onclick="mcEntracteLibreModal()">🎤 Lancer un entracte libre…</button>`;
  return html;
}

function mcLancerEntracte(index) {
  const a = (S.soiree.programme || [])[index];
  if (!a) return;
  soireeUpdate({ etat: 'entracte', entracte: { nom: a.nom || '', message: a.message || '', photo: a.photo || '' } });
}

function mcEntracteLibreModal() {
  modal(`
    <h3>🎤 Entracte libre</h3>
    <label class="field"><span>Nom de l'artiste / du moment</span>
      <input id="entrNom" type="text" maxlength="60" placeholder="Lady Paillette"></label>
    <label class="field"><span>Message (optionnel)</span>
      <input id="entrMsg" type="text" maxlength="120" placeholder="Applaudissez bien fort !"></label>
    <div class="modal-btns">
      <button class="btn ghost" onclick="closeModal()">Annuler</button>
      <button class="btn primary" onclick="mcLancerEntracteLibre()">🎭 Lancer</button>
    </div>`);
}
function mcLancerEntracteLibre() {
  const nom = $('#entrNom').value.trim();
  const message = $('#entrMsg').value.trim();
  soireeUpdate({ etat: 'entracte', entracte: { nom: nom || 'Place au spectacle !', message, photo: '' } });
  closeModal();
}

// ---------- Onglet SOIRÉE ----------
function mcSoireeHtml(s) {
  const hof = s.hallOfFame || [];
  const isOwner = s.ownerUid === S.user.uid;
  return `
  <div class="soiree-bloc">
    <h3 class="mc-h3">Code de la soirée</h3>
    <div class="code-big">${esc(s.code)}</div>
    <p class="muted small">À donner à un·e autre MC pour qu'il/elle rejoigne avec son compte.</p>
  </div>
  <div class="soiree-bloc">
    <h3 class="mc-h3">🖥 Écran de salle</h3>
    <div class="mc-actions-row">
      <button class="btn ${s.etat === 'accueil' ? 'primary' : ''}" onclick="soireeUpdate({etat:'accueil'})">🏠 Accueil</button>
      <button class="btn ${s.etat === 'tirage' ? 'primary' : ''}" onclick="soireeUpdate({etat:'tirage'})">🎲 Partie</button>
      <button class="btn ${s.etat === 'fin' ? 'primary' : ''}" onclick="mcAfficherFin()">🏆 Fin</button>
    </div>
  </div>
  <div class="soiree-bloc">
    <h3 class="mc-h3">🏆 Hall of Fame (${hof.length})</h3>
    ${hof.length ? hof.map((g, i) => {
      const o = OBJECTIFS[g.objectif] || { label: g.objectif };
      return `<div class="hof-row"><span><b>${esc(g.nom || 'Mystère')}</b> · ${o.label} · m.${g.manche}</span>
        <button class="btn icon small" onclick="mcRemoveHof(${i})">🗑</button></div>`;
    }).join('') : '<p class="muted">Aucun gagnant pour l\'instant.</p>'}
  </div>
  <div class="soiree-bloc">
    ${s.statut === 'active'
      ? `<button class="btn block warn" onclick="confirmAction('Terminer la soirée ?<br><span class=&quot;muted&quot;>L\\'écran passera aux remerciements + hall of fame.</span>','Terminer 🏁','mcTerminer()')">🏁 Terminer la soirée</button>`
      : `<button class="btn block" onclick="soireeUpdate({statut:'active',etat:'tirage'})">🔓 Rouvrir la soirée</button>`}
    ${isOwner ? `<button class="btn block ghost danger" onclick="confirmAction('Supprimer DÉFINITIVEMENT cette soirée ?','Supprimer 🗑','mcSupprimer()')">🗑 Supprimer la soirée</button>` : ''}
  </div>`;
}

function mcAfficherFin() { soireeUpdate({ etat: 'fin' }); }
function mcTerminer() { soireeUpdate({ etat: 'fin', statut: 'terminee' }); }

function mcRemoveHof(index) {
  const hof = (S.soiree.hallOfFame || []).slice();
  hof.splice(index, 1);
  soireeUpdate({ hallOfFame: hof });
}

async function mcSupprimer() {
  try {
    if (S.unsub) { S.unsub(); S.unsub = null; }
    await db.collection('soirees').doc(S.soireeId).delete();
  } catch (e) {}
  quitSoiree();
}
