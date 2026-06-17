// Onglet Édition : écrans personnalisables (accueil, fin), programme d'entractes, présets.
// Les photos sont compressées dans le navigateur puis stockées avec la soirée (pas de service externe).

function mcEditionHtml(s) {
  const acc = (s.ecrans && s.ecrans.accueil) || {};
  const fin = (s.ecrans && s.ecrans.fin) || {};
  const prog = s.programme || [];
  const liens = fin.liens || [];
  const band = s.bandeau || {};
  const deco = s.deco || {};
  return `
  <p class="ed-intro muted small">Réglages dans l'ordre d'une soirée — de l'accueil jusqu'au générique de fin.</p>

  <!-- 1. AVANT : écran d'accueil -->
  <div class="soiree-bloc">
    <h3 class="mc-h3">1️⃣ 🏠 Accueil (avant le début)</h3>
    <label class="field"><span>Message d'accueil</span>
      <input id="edAccTexte" type="text" maxlength="120" value="${escAttr(acc.texte || '')}" placeholder="Ça commence bientôt… ✨"></label>
    <div class="photo-line">
      ${acc.photo ? `<img src="${escAttr(acc.photo)}" class="prog-photo" alt="">` : '<div class="prog-photo vide">🖼</div>'}
      <span class="muted small" style="flex:1">Grande image d'accueil</span>
      <input type="file" id="edAccPhoto" accept="image/*" style="display:none" onchange="edPhotoAccueil(this)">
      <button class="btn small" onclick="$('#edAccPhoto').click()">📷</button>
      ${acc.photo ? `<button class="btn small ghost" onclick="edSaveAccueil(true)">🗑</button>` : ''}
    </div>
    <button class="btn block" onclick="edSaveAccueil(false)">💾 Enregistrer l'accueil</button>
  </div>

  <!-- 2. PENDANT LA PARTIE : déco du tableau + bandeau -->
  <div class="soiree-bloc">
    <h3 class="mc-h3">2️⃣ 🎲 Pendant la partie</h3>
    <p class="muted small">Décoration de la colonne du dernier numéro (image en haut / en bas) :</p>
    <div class="photo-line">
      ${deco.haut ? `<img src="${escAttr(deco.haut)}" class="prog-photo" alt="">` : '<div class="prog-photo vide">🖼</div>'}
      <span class="muted small" style="flex:1">En haut</span>
      <input type="file" id="edDecoHaut" accept="image/*" style="display:none" onchange="edPhotoDeco(this,'haut')">
      <button class="btn small" onclick="$('#edDecoHaut').click()">📷</button>
      ${deco.haut ? `<button class="btn icon small" onclick="edRemoveDeco('haut')">🗑</button>` : ''}
    </div>
    <div class="photo-line">
      ${deco.bas ? `<img src="${escAttr(deco.bas)}" class="prog-photo" alt="">` : '<div class="prog-photo vide">🖼</div>'}
      <span class="muted small" style="flex:1">En bas</span>
      <input type="file" id="edDecoBas" accept="image/*" style="display:none" onchange="edPhotoDeco(this,'bas')">
      <button class="btn small" onclick="$('#edDecoBas').click()">📷</button>
      ${deco.bas ? `<button class="btn icon small" onclick="edRemoveDeco('bas')">🗑</button>` : ''}
    </div>
    <hr class="ed-sep">
    <p class="muted small">📢 Bandeau défilant (pendant la partie si affiché, toujours pendant l'entracte) :</p>
    <label class="field"><span>Texte du bandeau</span>
      <input id="edBandTxt" type="text" maxlength="200" value="${escAttr(band.texte || '')}"
             placeholder="Pensez au bar 🍹 · Prochaine soirée le 28 juin !"></label>
    <div class="mc-actions-row">
      <button class="btn" onclick="edBandeauSave(false)">💾 Garder masqué</button>
      <button class="btn ${band.actif ? 'primary' : ''}" onclick="edBandeauSave(true)">📢 Afficher</button>
    </div>
  </div>

  <!-- 3. VÉRIFICATION : animations de verdict -->
  <div class="soiree-bloc">
    <h3 class="mc-h3">3️⃣ 🔍 Vérification — animations de verdict</h3>
    ${edAnimInnerHtml(s, 'gagne', '🎉 Quand c\'est GAGNÉ')}
    <hr class="ed-sep">
    ${edAnimInnerHtml(s, 'faux', '💋 Quand c\'est FAUX BINGO')}
  </div>

  <!-- 4. ENTRACTE : programme + fond -->
  <div class="soiree-bloc">
    <h3 class="mc-h3">4️⃣ 🎭 Entracte</h3>
    <p class="muted small">Programme des artistes :</p>
    ${prog.length ? prog.map((a, i) => `
      <div class="prog-card">
        ${a.photo ? `<img src="${escAttr(a.photo)}" class="prog-photo" alt="">` : '<div class="prog-photo vide">🎭</div>'}
        <div class="prog-info"><b>${esc(a.nom)}</b>${a.message ? `<div class="muted small">${esc(a.message)}</div>` : ''}</div>
        <button class="btn icon small" onclick="edRemoveArtiste(${i})">🗑</button>
      </div>`).join('') : '<p class="muted">Aucun artiste au programme.</p>'}
    <button class="btn block" onclick="edArtisteModal()">➕ Ajouter un artiste</button>
    <hr class="ed-sep">
    <p class="muted small">🌌 Fond d'écran de l'entracte (derrière le nom de l'artiste) :</p>
    <div class="photo-line">
      ${s.entracteFond ? `<img src="${escAttr(s.entracteFond)}" class="prog-photo large" alt="">` : '<div class="prog-photo vide">🌌</div>'}
      <span class="muted small" style="flex:1"></span>
      <input type="file" id="edFond" accept="image/*" style="display:none" onchange="edPhotoFond(this)">
      <button class="btn small" onclick="$('#edFond').click()">📷</button>
      ${s.entracteFond ? `<button class="btn icon small" onclick="edRemoveFond()">🗑</button>` : ''}
    </div>
  </div>

  <!-- 5. FIN : écran de fin + fond -->
  <div class="soiree-bloc">
    <h3 class="mc-h3">5️⃣ 🏆 Écran de fin</h3>
    <label class="field"><span>Message de remerciement</span>
      <input id="edFinTexte" type="text" maxlength="120" value="${escAttr(fin.texte || '')}" placeholder="Merci à toutes et tous ! ❤️"></label>
    <div class="photo-line">
      ${fin.fond ? `<img src="${escAttr(fin.fond)}" class="prog-photo large" alt="">` : '<div class="prog-photo vide">🌠</div>'}
      <span class="muted small" style="flex:1">Image de fond (optionnelle)</span>
      <input type="file" id="edFinFond" accept="image/*" style="display:none" onchange="edPhotoFinFond(this)">
      <button class="btn small" onclick="$('#edFinFond').click()">📷</button>
      ${fin.fond ? `<button class="btn icon small" onclick="edRemoveFinFond()">🗑</button>` : ''}
    </div>
    <p class="muted small">Liens réseaux (affichés sur l'écran de fin) :</p>
    <div id="edLiensList">
      ${liens.map((l, i) => `<div class="hof-row"><span><b>${esc(l.label)}</b> · ${esc(l.url)}</span>
        <button class="btn icon small" onclick="edRemoveLien(${i})">🗑</button></div>`).join('')}
    </div>
    <button class="btn block" onclick="edLienModal()">➕ Ajouter un lien (réseaux…)</button>
    <label class="field"><span>Lien du QR code (optionnel — ex. votre Instagram)</span>
      <input id="edFinQr" type="url" value="${escAttr(fin.qrUrl || '')}" placeholder="https://instagram.com/..."></label>
    <button class="btn block" onclick="edSaveFin()">💾 Enregistrer l'écran de fin</button>
  </div>

  <!-- Avant-dernier : sons -->
  <div class="soiree-bloc">
    <h3 class="mc-h3">🔊 Sons (remplaçables — mp3 courts, max 700 Ko)</h3>
    ${SONS_LISTE.map(son => {
      const off = (s.son && s.son.off || []).includes(son.name);
      return `
      <div class="son-row ${off ? 'son-off' : ''}">
        <div class="son-info"><b>${son.label}</b>
          ${son.info ? `<span class="muted small"> · ${son.info}</span>` : ''}
          <span class="son-statut ${S.sonsCustom && S.sonsCustom[son.name] ? 'perso' : ''}">${S.sonsCustom && S.sonsCustom[son.name] ? 'perso' : 'base'}</span>
        </div>
        <div class="son-btns">
          <button class="btn icon small ${off ? '' : 'primary'}" onclick="edSonToggle('${son.name}')" title="${off ? 'Réactiver ce son' : 'Désactiver ce son'}">${off ? '🔇' : '🔊'}</button>
          <button class="btn icon small" onclick="edSonPlay('${son.name}')" title="Écouter">▶</button>
          <input type="file" id="edSon_${son.name}" accept="audio/*" style="display:none" onchange="edSonUpload(this,'${son.name}')">
          <button class="btn icon small" onclick="$('#edSon_${son.name}').click()" title="Remplacer">📁</button>
          ${S.sonsCustom && S.sonsCustom[son.name] ? `<button class="btn icon small" onclick="edSonReset('${son.name}')" title="Revenir au son de base">🗑</button>` : ''}
        </div>
      </div>`;
    }).join('')}
    <p class="muted small">🔇 désactive un seul son (les autres restent). Les sons personnalisés sont gardés avec le compte.</p>
  </div>

  <!-- Dernier : présets -->
  <div class="soiree-bloc">
    <h3 class="mc-h3">💾 Présets</h3>
    <p class="muted small">Enregistre TOUS ces réglages (écrans, images, bandeau, animations, sons coupés) pour les réutiliser la prochaine fois.</p>
    <button class="btn block primary" onclick="edSavePresetModal()">💾 Sauver comme préset</button>
    <div id="edPresetList"></div>
  </div>`;
}

// ---------- Animations de verdict (contenu interne, intégré au bloc Vérification) ----------
function edAnimInnerHtml(s, type, titre) {
  const conf = (s.anims && s.anims[type]) || {};
  const styleActif = conf.style || (type === 'gagne' ? 'pluie' : 'douche');
  const parts = conf.parts || [];
  return `
    <p class="muted small"><b>${titre}</b> — style :</p>
    <div class="anim-styles">
      ${ANIM_STYLES[type].map(st =>
        `<button class="btn small ${styleActif === st.id ? 'primary' : ''}"
          onclick="edAnimStyle('${type}','${st.id}')">${st.label}</button>`).join('')}
    </div>
    <p class="muted small">Images PNG transparentes (max ${ANIM_MAX_PARTS}) — remplacent les emojis :</p>
    <div class="photo-line">
      ${parts.map((p, i) => `
        <span class="anim-part-thumb"><img src="${escAttr(p)}" alt="">
          <button class="anim-part-del" onclick="edAnimDelPart('${type}',${i})">✕</button></span>`).join('')}
      ${parts.length < ANIM_MAX_PARTS ? `
        <input type="file" id="edAnimPart_${type}" accept="image/png,image/webp" style="display:none" onchange="edAnimAddPart(this,'${type}')">
        <button class="btn small" onclick="$('#edAnimPart_${type}').click()">➕ PNG</button>` : ''}
      ${conf.vedette ? `<img src="${escAttr(conf.vedette)}" class="prog-photo" alt="" title="image vedette">` : ''}
      <input type="file" id="edAnimVed_${type}" accept="image/png,image/webp" style="display:none" onchange="edAnimVedette(this,'${type}')">
      <button class="btn small" onclick="$('#edAnimVed_${type}').click()" title="Image vedette (grande entrée au centre)">🌟</button>
      ${conf.vedette ? `<button class="btn icon small" onclick="edAnimDelVedette('${type}')">🗑</button>` : ''}
    </div>`;
}

function edAnimRefresh() {
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

function edAnimStyle(type, style) {
  const patch = {};
  patch['anims.' + type + '.style'] = style;
  soireeUpdate(patch);
  edAnimRefresh();
}

async function edAnimAddPart(input, type) {
  const data = await compressImagePng(input.files[0], ANIM_PNG_MAX_DIM);
  if (!data) return;
  const conf = (S.soiree.anims && S.soiree.anims[type]) || {};
  const parts = (conf.parts || []).slice();
  if (parts.length >= ANIM_MAX_PARTS) return;
  parts.push(data);
  const patch = {};
  patch['anims.' + type + '.parts'] = parts;
  soireeUpdate(patch);
  toast('Image ajoutée à l\'animation 🎉');
  edAnimRefresh();
}

function edAnimDelPart(type, i) {
  const conf = (S.soiree.anims && S.soiree.anims[type]) || {};
  const parts = (conf.parts || []).slice();
  parts.splice(i, 1);
  const patch = {};
  patch['anims.' + type + '.parts'] = parts;
  soireeUpdate(patch);
  edAnimRefresh();
}

async function edAnimVedette(input, type) {
  const data = await compressImagePng(input.files[0], ANIM_VEDETTE_MAX_DIM);
  if (!data) return;
  const patch = {};
  patch['anims.' + type + '.vedette'] = data;
  soireeUpdate(patch);
  toast('Image vedette enregistrée 🌟');
  edAnimRefresh();
}

function edAnimDelVedette(type) {
  const patch = {};
  patch['anims.' + type + '.vedette'] = '';
  soireeUpdate(patch);
  edAnimRefresh();
}

// Compression PNG (conserve la TRANSPARENCE — pas de conversion JPEG)
function compressImagePng(file, maxDim) {
  return new Promise(resolve => {
    if (!file) { resolve(null); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width, h = img.height;
      const ratio = Math.min(1, maxDim / Math.max(w, h));
      w = Math.round(w * ratio); h = Math.round(h * ratio);
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      const data = cv.toDataURL('image/png');
      if (data.length > 420000) { toast('Cette image reste trop lourde même réduite — choisis un PNG plus simple.'); resolve(null); return; }
      resolve(data);
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast('Impossible de lire cette image.'); resolve(null); };
    img.src = url;
  });
}

// ---------- Bandeau (éditable en cours de route) ----------
function edBandeauSave(actif) {
  const texte = $('#edBandTxt').value.trim();
  soireeUpdate({ bandeau: { texte, actif: actif && !!texte } });
  toast(actif && texte ? 'Bandeau affiché 📢' : 'Bandeau enregistré (masqué)');
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

// ---------- Décoration de l'écran de salle ----------
async function edPhotoDeco(input, position) {
  const data = await compressImage(input.files[0]);
  if (!data) return;
  const patch = {};
  patch['deco.' + position] = data;
  soireeUpdate(patch);
  toast('Décoration mise à jour 🖼');
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}
function edRemoveDeco(position) {
  const patch = {};
  patch['deco.' + position] = '';
  soireeUpdate(patch);
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

// ---------- Fond d'écran de l'entracte ----------
async function edPhotoFond(input) {
  const data = await compressImage(input.files[0], FOND_MAX_DIM, FOND_QUALITY);
  if (!data) return;
  soireeUpdate({ entracteFond: data });
  toast('Fond d\'entracte mis à jour 🌌');
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}
function edRemoveFond() {
  soireeUpdate({ entracteFond: '' });
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

// ---------- Fond d'écran de fin ----------
async function edPhotoFinFond(input) {
  const data = await compressImage(input.files[0], FOND_MAX_DIM, FOND_QUALITY);
  if (!data) return;
  soireeUpdate({ 'ecrans.fin.fond': data });
  toast('Fond de l\'écran de fin mis à jour 🌠');
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}
function edRemoveFinFond() {
  soireeUpdate({ 'ecrans.fin.fond': '' });
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

// ---------- Désactiver / réactiver un son individuel ----------
function edSonToggle(name) {
  const off = ((S.soiree.son && S.soiree.son.off) || []).slice();
  const i = off.indexOf(name);
  if (i >= 0) off.splice(i, 1); else off.push(name);
  soireeUpdate({ 'son.off': off });
  toast(i >= 0 ? 'Son réactivé 🔊' : 'Son désactivé 🔇');
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

// ---------- Sons personnalisés (changeables depuis l'app) ----------
function edSonPlay(name) {
  // Écoute locale sur le téléphone (en soirée, les sons sortent de l'écran de salle)
  const a = (Sons.custom[name]) || Sons.audios[name];
  if (!a || (Sons.missing[name] && !Sons.custom[name])) { toast('Aucun son pour le moment.'); return; }
  try { a.currentTime = 0; a.play().catch(() => toast('Lecture impossible sur cet appareil.')); } catch (e) {}
}

function edSonUpload(input, name) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > SOUND_MAX_BYTES) {
    toast('Fichier trop lourd (max 700 Ko). Choisis un son plus court.');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const owner = S.soiree.ownerUid;
      await db.collection('sons').doc(owner + '_' + name).set({
        uid: owner, name, data: reader.result, updatedAt: FV.serverTimestamp()
      });
      Sons.setCustom(name, reader.result);
      S.sonsCustom = S.sonsCustom || {};
      S.sonsCustom[name] = true;
      toast('Son remplacé 🔊 (l\'écran de salle l\'utilisera après son prochain chargement)');
    } catch (e) {
      toast('Envoi impossible — les règles de la base doivent être mises à jour (voir Claude).');
    }
    editionRendered = false;
    if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null);
  };
  reader.readAsDataURL(file);
}

async function edSonReset(name) {
  try {
    await db.collection('sons').doc(S.soiree.ownerUid + '_' + name).delete();
    Sons.setCustom(name, null);
    if (S.sonsCustom) delete S.sonsCustom[name];
    toast('Retour au son de base.');
  } catch (e) {}
  editionRendered = false;
  if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null);
}

// ---------- Écran d'accueil ----------
let edAccPhotoData = null; // photo en attente d'enregistrement
async function edPhotoAccueil(input) {
  // Grande image d'accueil : compressée en haute définition (pour remplir l'écran sans flou)
  const data = await compressImage(input.files[0], FOND_MAX_DIM, FOND_QUALITY);
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
      <input id="edArtNom" type="text" maxlength="60" placeholder="Aude Dubain"></label>
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
      deco: s.deco || { haut: '', bas: '' },
      entracteFond: s.entracteFond || '',
      anims: s.anims || {},
      sonOff: (s.son && s.son.off) || [],
      updatedAt: FV.serverTimestamp()
    });
    toast('Préset enregistré 💾');
  } catch (e) {
    toast('Enregistrement impossible (préset trop lourd en photos ?).');
  }
  closeModal();
}

// ---------- Compression d'image (JPEG, taille max paramétrable) ----------
function compressImage(file, maxDim, quality) {
  maxDim = maxDim || PHOTO_MAX_DIM;
  quality = quality || PHOTO_QUALITY;
  return new Promise(resolve => {
    if (!file) { resolve(null); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width, h = img.height;
      const ratio = Math.min(1, maxDim / Math.max(w, h));
      w = Math.round(w * ratio); h = Math.round(h * ratio);
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      const data = cv.toDataURL('image/jpeg', quality);
      if (data.length > PHOTO_WARN_BYTES * 1.37 * (maxDim / PHOTO_MAX_DIM)) toast('Photo lourde — elle est gardée mais évite d\'en mettre trop.');
      resolve(data);
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast('Impossible de lire cette image.'); resolve(null); };
    img.src = url;
  });
}
