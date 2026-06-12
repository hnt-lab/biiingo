// Onglet Édition : écrans personnalisables (accueil, fin), programme d'entractes, présets.
// Les photos sont compressées dans le navigateur puis stockées avec la soirée (pas de service externe).

function mcEditionHtml(s) {
  const acc = (s.ecrans && s.ecrans.accueil) || {};
  const fin = (s.ecrans && s.ecrans.fin) || {};
  const prog = s.programme || [];
  const liens = fin.liens || [];
  return `
  <div class="soiree-bloc">
    <h3 class="mc-h3">🏠 Écran d'accueil</h3>
    <label class="field"><span>Message d'accueil</span>
      <input id="edAccTexte" type="text" maxlength="120" value="${escAttr(acc.texte || '')}" placeholder="Ça commence bientôt… ✨"></label>
    <div class="photo-line">
      ${acc.photo ? `<img src="${escAttr(acc.photo)}" class="prog-photo" alt="">` : '<div class="prog-photo vide">🖼</div>'}
      <input type="file" id="edAccPhoto" accept="image/*" style="display:none" onchange="edPhotoAccueil(this)">
      <button class="btn small" onclick="$('#edAccPhoto').click()">📷 Photo</button>
      ${acc.photo ? `<button class="btn small ghost" onclick="edSaveAccueil(true)">🗑 Retirer</button>` : ''}
    </div>
    <button class="btn block" onclick="edSaveAccueil(false)">💾 Enregistrer l'accueil</button>
  </div>

  <div class="soiree-bloc">
    <h3 class="mc-h3">🎭 Programme d'entractes</h3>
    ${prog.length ? prog.map((a, i) => `
      <div class="prog-card">
        ${a.photo ? `<img src="${escAttr(a.photo)}" class="prog-photo" alt="">` : '<div class="prog-photo vide">🎭</div>'}
        <div class="prog-info"><b>${esc(a.nom)}</b>${a.message ? `<div class="muted small">${esc(a.message)}</div>` : ''}</div>
        <button class="btn icon small" onclick="edRemoveArtiste(${i})">🗑</button>
      </div>`).join('') : '<p class="muted">Aucun artiste au programme.</p>'}
    <button class="btn block" onclick="edArtisteModal()">➕ Ajouter un artiste</button>
  </div>

  <div class="soiree-bloc">
    <h3 class="mc-h3">🏆 Écran de fin</h3>
    <label class="field"><span>Message de remerciement</span>
      <input id="edFinTexte" type="text" maxlength="120" value="${escAttr(fin.texte || '')}" placeholder="Merci à toutes et tous ! 💖"></label>
    <div id="edLiensList">
      ${liens.map((l, i) => `<div class="hof-row"><span><b>${esc(l.label)}</b> · ${esc(l.url)}</span>
        <button class="btn icon small" onclick="edRemoveLien(${i})">🗑</button></div>`).join('')}
    </div>
    <button class="btn block" onclick="edLienModal()">➕ Ajouter un lien (réseaux…)</button>
    <label class="field"><span>Lien du QR code (optionnel — ex. votre Instagram)</span>
      <input id="edFinQr" type="url" value="${escAttr(fin.qrUrl || '')}" placeholder="https://instagram.com/..."></label>
    <button class="btn block" onclick="edSaveFin()">💾 Enregistrer l'écran de fin</button>
  </div>

  <div class="soiree-bloc">
    <h3 class="mc-h3">💾 Présets</h3>
    <p class="muted small">Enregistre les réglages de cette soirée (programme, écrans, bandeau) pour les réutiliser la prochaine fois.</p>
    <button class="btn block primary" onclick="edSavePresetModal()">💾 Sauver comme préset</button>
    <div id="edPresetList"></div>
  </div>`;
}

// ---------- Écran d'accueil ----------
let edAccPhotoData = null; // photo en attente d'enregistrement
async function edPhotoAccueil(input) {
  const data = await compressImage(input.files[0]);
  if (data) { edAccPhotoData = data; toast('Photo prête — pense à Enregistrer.'); }
}
function edSaveAccueil(retirerPhoto) {
  const s = S.soiree;
  const photo = retirerPhoto ? '' : (edAccPhotoData || ((s.ecrans && s.ecrans.accueil) || {}).photo || '');
  soireeUpdate({ 'ecrans.accueil': { texte: $('#edAccTexte').value.trim(), photo } });
  edAccPhotoData = null;
  editionRendered = false;
  toast('Écran d\'accueil enregistré ✨');
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

// ---------- Programme ----------
let edArtPhotoData = null;
function edArtisteModal() {
  edArtPhotoData = null;
  modal(`
    <h3>➕ Ajouter un artiste</h3>
    <label class="field"><span>Nom de scène</span>
      <input id="edArtNom" type="text" maxlength="60" placeholder="Lady Paillette"></label>
    <label class="field"><span>Message affiché (optionnel)</span>
      <input id="edArtMsg" type="text" maxlength="120" placeholder="Applaudissez bien fort !"></label>
    <div class="photo-line">
      <input type="file" id="edArtPhoto" accept="image/*" style="display:none" onchange="edPhotoArtiste(this)">
      <button class="btn small" onclick="$('#edArtPhoto').click()">📷 Photo</button>
      <span id="edArtPhotoOk" class="muted small"></span>
    </div>
    <div class="modal-btns">
      <button class="btn ghost" onclick="closeModal()">Annuler</button>
      <button class="btn primary" onclick="edAddArtiste()">Ajouter 🎭</button>
    </div>`);
}
async function edPhotoArtiste(input) {
  const data = await compressImage(input.files[0]);
  if (data) { edArtPhotoData = data; $('#edArtPhotoOk').textContent = '✓ photo prête'; }
}
function edAddArtiste() {
  const nom = $('#edArtNom').value.trim();
  if (!nom) { toast('Il faut au moins un nom.'); return; }
  const prog = (S.soiree.programme || []).slice();
  prog.push({ nom, message: $('#edArtMsg').value.trim(), photo: edArtPhotoData || '' });
  soireeUpdate({ programme: prog });
  closeModal();
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}
function edRemoveArtiste(i) {
  const prog = (S.soiree.programme || []).slice();
  prog.splice(i, 1);
  soireeUpdate({ programme: prog });
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

// ---------- Écran de fin ----------
function edLienModal() {
  modal(`
    <h3>➕ Ajouter un lien</h3>
    <label class="field"><span>Nom (ex. Instagram)</span>
      <input id="edLienLabel" type="text" maxlength="30" placeholder="Instagram"></label>
    <label class="field"><span>Adresse ou @pseudo</span>
      <input id="edLienUrl" type="text" maxlength="120" placeholder="@bingodrag"></label>
    <div class="modal-btns">
      <button class="btn ghost" onclick="closeModal()">Annuler</button>
      <button class="btn primary" onclick="edAddLien()">Ajouter</button>
    </div>`);
}
function edAddLien() {
  const label = $('#edLienLabel').value.trim();
  const url = $('#edLienUrl').value.trim();
  if (!label && !url) { closeModal(); return; }
  const fin = Object.assign({ texte: '', liens: [], qrUrl: '' }, (S.soiree.ecrans && S.soiree.ecrans.fin) || {});
  fin.liens = (fin.liens || []).concat([{ label, url }]);
  soireeUpdate({ 'ecrans.fin': fin });
  closeModal();
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}
function edRemoveLien(i) {
  const fin = Object.assign({}, (S.soiree.ecrans && S.soiree.ecrans.fin) || {});
  fin.liens = (fin.liens || []).slice();
  fin.liens.splice(i, 1);
  soireeUpdate({ 'ecrans.fin': fin });
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}
function edSaveFin() {
  const fin = Object.assign({ texte: '', liens: [], qrUrl: '' }, (S.soiree.ecrans && S.soiree.ecrans.fin) || {});
  fin.texte = $('#edFinTexte').value.trim();
  fin.qrUrl = $('#edFinQr').value.trim();
  soireeUpdate({ 'ecrans.fin': fin });
  toast('Écran de fin enregistré 🏆');
}

// ---------- Présets ----------
function edSavePresetModal() {
  modal(`
    <h3>💾 Sauver comme préset</h3>
    <label class="field"><span>Nom du préset</span>
      <input id="edPresetNom" type="text" maxlength="60" value="${escAttr(S.soiree.titre || '')}"></label>
    <div class="modal-btns">
      <button class="btn ghost" onclick="closeModal()">Annuler</button>
      <button class="btn primary" onclick="edSavePreset()">Sauver 💾</button>
    </div>`);
}
async function edSavePreset() {
  const titre = $('#edPresetNom').value.trim() || 'Mon préset';
  const s = S.soiree;
  try {
    await db.collection('users').doc(S.user.uid).collection('presets').add({
      titre,
      programme: s.programme || [],
      ecrans: s.ecrans || {},
      bandeau: (s.bandeau && s.bandeau.texte) || '',
      updatedAt: FV.serverTimestamp()
    });
    toast('Préset enregistré 💾');
  } catch (e) {
    toast('Enregistrement impossible (préset trop lourd en photos ?).');
  }
  closeModal();
}

// ---------- Compression d'image (max PHOTO_MAX_DIM px, JPEG) ----------
function compressImage(file) {
  return new Promise(resolve => {
    if (!file) { resolve(null); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width, h = img.height;
      const ratio = Math.min(1, PHOTO_MAX_DIM / Math.max(w, h));
      w = Math.round(w * ratio); h = Math.round(h * ratio);
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      const data = cv.toDataURL('image/jpeg', PHOTO_QUALITY);
      if (data.length > PHOTO_WARN_BYTES * 1.37) toast('Photo lourde — elle est gardée mais évite d\'en mettre trop.');
      resolve(data);
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast('Impossible de lire cette image.'); resolve(null); };
    img.src = url;
  });
}
