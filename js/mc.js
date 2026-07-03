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
    ${s.joueursActif !== false ? `<span class="mc-head-joueurs" id="mcNbJoueurs" onclick="mcJoueursModal()">👥 ${S.nbJoueurs || 0}</span>` : ''}
    <div class="mc-head-code">${esc(s.code)}</div>`;

  // Barre d'onglets
  $('#mcTabs').innerHTML = MC_TABS.map(t =>
    `<button class="mc-tab ${S.mcTab === t.id ? 'on' : ''}" onclick="mcSetTab('${t.id}')">
      <span class="mc-tab-ico">${t.icon}</span><span>${t.label}</span></button>`).join('');

  // Contenu de l'onglet actif, dans un conteneur intérieur centré : la zone de défilement
  // occupe TOUTE la largeur → la barre de scroll est au bord droit de la fenêtre, comme partout.
  const c = $('#mcContent');
  const enveloppe = (html) => `<div class="mc-inner">${html}</div>`;
  if (S.mcTab === 'tirage') c.innerHTML = enveloppe(mcTirageHtml(s));
  else if (S.mcTab === 'verif') c.innerHTML = enveloppe(mcVerifHtml(s));
  else if (S.mcTab === 'entracte') c.innerHTML = enveloppe(mcEntracteHtml(s));
  else if (S.mcTab === 'edition') {
    if (!editionRendered) { c.innerHTML = enveloppe(mcEditionHtml(s)); editionRendered = true; mcSplitCols(c); }
  }
  else if (S.mcTab === 'soiree') { c.innerHTML = enveloppe(mcSoireeHtml(s)); mcSplitCols(c); }
}

// Sur grand écran : répartit les panneaux en 2 colonnes ÉQUILIBRÉES (la moins remplie reçoit le suivant)
function mcSplitCols(c) {
  if (!matchMedia('(min-width: 900px)').matches) return;
  const inner = c.querySelector('.mc-inner') || c;
  const enfants = [...inner.children];
  const wrap = document.createElement('div'); wrap.className = 'mc-cols-wrap';
  const colA = document.createElement('div'); colA.className = 'mc-col';
  const colB = document.createElement('div'); colB.className = 'mc-col';
  let hA = 0, hB = 0;
  enfants.forEach(el => {
    if (el.classList.contains('ed-intro')) return; // l'intro reste en pleine largeur
    const h = el.offsetHeight || 100;
    if (hA <= hB) { colA.appendChild(el); hA += h; }
    else { colB.appendChild(el); hB += h; }
  });
  wrap.appendChild(colA); wrap.appendChild(colB);
  inner.appendChild(wrap);
}

// Traverser le seuil PC/mobile → on reconstruit la mise en page de l'onglet
let mcResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(mcResizeTimer);
  mcResizeTimer = setTimeout(() => {
    if (S.mode === 'mc' && S.soiree) { editionRendered = false; renderMC(S.soiree, null); }
  }, 350);
});

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
    if (s.etat !== 'tirage') {
      patch.etat = 'tirage'; // taper un numéro ramène toujours la salle sur la grille
      if (s.verification && s.verification.active) {
        patch.verification = { active: false, suspense: false, coches: [], verdict: '', gagnantNom: '' };
      }
    }
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
        // La partie de la lose démarre TOUJOURS sur un tableau vierge
        const action = k === 'lose'
          ? `closeModal();confirmAction('La partie de la lose démarre sur un tableau VIDE.<br><span class=&quot;muted&quot;>Les numéros déjà tirés seront effacés.</span>','💀 C\\'est parti','mcLanceLose()')`
          : `soireeUpdate({objectif:'${k}'});closeModal()`;
        return `<button class="btn obj ${s.objectif === k ? 'primary' : ''}"
          onclick="${action}">${o.emoji} ${o.label}<br><small>${o.detail}</small></button>`;
      }).join('')}
    </div>
    <div class="modal-btns"><button class="btn ghost" onclick="closeModal()">Fermer</button></div>`);
}

function mcLanceLose() {
  soireeUpdate({
    objectif: 'lose', tires: [], etat: 'tirage',
    verification: { active: false, suspense: false, coches: [], verdict: '', gagnantNom: '' }
  });
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
      <input id="entrNom" type="text" maxlength="60" placeholder="Diamond Dust"></label>
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
  const vol = Math.round(((s.son && typeof s.son.volume === 'number') ? s.son.volume : 0.85) * 100);
  return `
  <div class="soiree-bloc bloc-salle">
    <h3 class="mc-h3">🖥 Écran de salle — affichage</h3>
    <div class="salle-nav">
      <button class="btn big ${s.etat === 'accueil' ? 'primary' : ''}" onclick="soireeUpdate({etat:'accueil'})">🏠<br>Accueil</button>
      <button class="btn big ${s.etat === 'tirage' ? 'primary' : ''}" onclick="soireeUpdate({etat:'tirage'})">🎲<br>Partie</button>
      <button class="btn big ${s.etat === 'fin' ? 'primary' : ''}" onclick="mcAfficherFin()">🏆<br>Fin</button>
    </div>
    ${s.joueursActif !== false ? `
    <button class="btn block ${s.qrPopup ? 'primary' : ''}" onclick="soireeUpdate({qrPopup:${s.qrPopup ? 'false' : 'true'}})">
      ${s.qrPopup ? '📱 Masquer le QR en salle' : '📱 Afficher le QR en salle (rejoindre)'}</button>` : ''}
    <div class="mc-actions-row" style="margin-top:10px">
      ${'PresentationRequest' in window ? `<button class="btn" onclick="mcCasterTV()">📺 Caster sur la TV</button>` : ''}
      <button class="btn" onclick="mcEcranModal()">🔗 Lien pour un écran</button>
    </div>
    <p class="muted small">Pas besoin de PC : une Smart TV ou un Chromecast peut afficher le tableau tout seul.</p>
  </div>
  <div class="soiree-bloc">
    <h3 class="mc-h3">🔊 Son de la salle</h3>
    <button class="btn block ${(s.son && s.son.mute) ? 'warn' : 'primary'}" onclick="mcToggleMute()">
      ${(s.son && s.son.mute) ? '🔇 Son coupé — réactiver' : '🔊 Son activé — couper'}</button>
    <label class="field"><span>Volume : ${vol}%</span>
      <input type="range" min="0" max="100" value="${vol}"
             oninput="mcVolumeLabel(this)" onchange="mcSetVolume(this.value)" ${(s.son && s.son.mute) ? 'disabled' : ''}></label>
    <p class="muted small">Pour couper un seul son (ex. le tirage), va dans ✏️ Édition → 🔊 Sons.</p>
  </div>
  <div class="soiree-bloc">
    <h3 class="mc-h3">🏆 Hall of Fame (${hof.length})</h3>
    ${hof.length ? hof.map((g, i) => {
      const o = OBJECTIFS[g.objectif] || { label: g.objectif };
      return `<div class="hof-row"><span><b>${esc(g.nom || 'Mystère')}</b> · ${o.label} · m.${g.manche}</span>
        <button class="btn icon small" onclick="mcRemoveHof(${i})">🗑</button></div>`;
    }).join('') : '<p class="muted">Aucun gagnant pour l\'instant.</p>'}
  </div>
  <div class="soiree-bloc code-bloc">
    <span class="muted small">Code de la soirée (à donner aux autres MC)</span>
    <span class="code-mini">${esc(s.code)}</span>
  </div>
  <div class="soiree-bloc">
    <h3 class="mc-h3">📖 Aide</h3>
    <button class="btn block" onclick="tutoModal()">📖 Revoir le tutoriel</button>
    <button class="btn block" onclick="feedbackModal('mc')">💬 Donner mon avis</button>
    <button class="btn block" onclick="appReload()">🔄 Recharger / mettre à jour l'app</button>
    <p class="muted small" style="text-align:center;margin-top:6px">Biiingo v${APP_VERSION}</p>
  </div>
  <div class="soiree-bloc">
    ${s.statut === 'active'
      ? `<button class="btn block warn" onclick="confirmAction('Terminer la soirée ?<br><span class=&quot;muted&quot;>L\\'écran passera aux remerciements + hall of fame.</span>','Terminer 🏁','mcTerminer()')">🏁 Terminer la soirée</button>`
      : `<button class="btn block" onclick="soireeUpdate({statut:'active',etat:'tirage'})">🔓 Rouvrir la soirée</button>`}
    ${isOwner ? `<button class="btn block ghost danger" onclick="confirmAction('Supprimer DÉFINITIVEMENT cette soirée ?','Supprimer 🗑','mcSupprimer()')">🗑 Supprimer la soirée</button>` : ''}
  </div>`;
}

// Liste des joueurs connectés (tap sur le compteur 👥)
function mcJoueursModal() {
  const rows = (S.joueurs || []).map(j => `
    <div class="hof-row"><span>${j.elimine ? '💀 ' : ''}<b>${esc(j.nom || '?')}</b>
      <span class="muted small">${j.invite ? 'invité·e' : 'compte'}${j.wins ? ' · 🏆 ' + j.wins : ''}</span></span>
      <span class="muted small">${(j.cartons || []).length} carton(s)</span></div>`).join('');
  modal(`
    <h3>👥 Joueurs connectés (${S.nbJoueurs || 0})</h3>
    ${rows || '<p class="muted">Personne pour l\'instant — affiche le QR en salle !</p>'}
    <div class="modal-btns"><button class="btn primary" onclick="closeModal()">Fermer</button></div>`);
}

// ---------- Idée 2 : afficher la soirée sur un écran sans compte ----------
function mcDisplayUrl() {
  return location.origin + location.pathname + '?display=' + encodeURIComponent(S.soiree.code);
}

// Brique 2 — bouton Caster (Chrome Android + Chromecast). Repli : le modal lien/QR.
let mcPresentation = null;
function mcCasterTV() {
  try {
    const req = new PresentationRequest([mcDisplayUrl()]);
    req.start().then(conn => {
      mcPresentation = conn;
      toast('Tableau envoyé sur la TV 📺');
    }).catch(() => {
      // refus/annulation/pas d'écran trouvé → on propose le lien et le QR
      mcEcranModal();
    });
  } catch (e) {
    mcEcranModal();
  }
}

// Brique 1 — lien + QR d'affichage public (Smart TV avec navigateur, tablette, PC…)
function mcEcranModal() {
  const url = mcDisplayUrl();
  modal(`
    <h3>🔗 Afficher la soirée sur un écran</h3>
    <p class="muted small">Ouvre ce lien sur N'IMPORTE QUEL écran connecté (navigateur de Smart TV,
    tablette, PC…) : le tableau s'affiche tout seul, sans compte.</p>
    <div class="ecran-qr"><div id="ecranQrBox"></div></div>
    <label class="field"><span>Le lien (à taper ou envoyer sur la TV)</span>
      <input id="ecranUrl" type="text" readonly value="${escAttr(url)}" onclick="this.select()"></label>
    <div class="modal-btns">
      <button class="btn" onclick="mcCopieUrl()">📋 Copier le lien</button>
      <button class="btn primary" onclick="closeModal()">Fermer</button>
    </div>`);
  try {
    new QRCode($('#ecranQrBox'), { text: url, width: 170, height: 170, colorDark: '#1a1426', colorLight: '#ffffff' });
  } catch (e) {}
}

function mcCopieUrl() {
  const el = $('#ecranUrl');
  el.select();
  try { navigator.clipboard.writeText(el.value).then(() => toast('Lien copié 📋')); }
  catch (e) { document.execCommand('copy'); toast('Lien copié 📋'); }
}

function mcAfficherFin() { soireeUpdate({ etat: 'fin' }); }
function mcTerminer() { soireeUpdate({ etat: 'fin', statut: 'terminee' }); }

function mcToggleMute() {
  const cur = (S.soiree.son && S.soiree.son.mute) || false;
  soireeUpdate({ 'son.mute': !cur });
}
function mcVolumeLabel(input) {
  const span = input.parentElement.querySelector('span');
  if (span) span.textContent = 'Volume : ' + input.value + '%';
}
function mcSetVolume(v) {
  soireeUpdate({ 'son.volume': Math.max(0, Math.min(1, Number(v) / 100)) });
}

function mcRemoveHof(index) {
  const hof = (S.soiree.hallOfFame || []).slice();
  hof.splice(index, 1);
  soireeUpdate({ hallOfFame: hof });
}

async function mcSupprimer() {
  const id = S.soireeId;
  try {
    if (S.unsub) { S.unsub(); S.unsub = null; }
    if (S.unsubMedias) { S.unsubMedias(); S.unsubMedias = null; }
    // Supprime aussi les images associées (espace médias)
    const snap = await db.collection('medias').where('soireeId', '==', id).get();
    await Promise.all(snap.docs.map(d => d.ref.delete().catch(() => {})));
    await db.collection('soirees').doc(id).delete();
  } catch (e) {}
  quitSoiree();
}
