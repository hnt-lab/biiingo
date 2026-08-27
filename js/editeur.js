// Onglet Édition : écrans personnalisables (accueil, fin), programme d'entractes, présets.
// Les photos sont compressées dans le navigateur puis stockées avec la soirée (pas de service externe).

function mcEditionHtml(s) {
  const acc = (s.ecrans && s.ecrans.accueil) || {};
  const fin = (s.ecrans && s.ecrans.fin) || {};
  const prog = s.programme || [];
  const liens = fin.liens || [];
  const band = s.bandeau || {};
  const deco = s.deco || {};
  const accPhoto = mediaGet('accueil', acc.photo);
  const entrFond = mediaGet('entracteFond', s.entracteFond);
  const finFond = mediaGet('finFond', fin.fond);
  return `
  <p class="ed-intro muted small">Réglages dans l'ordre d'une soirée — de l'accueil jusqu'au générique de fin.</p>

  <!-- 1. AVANT : écran d'accueil -->
  <div class="soiree-bloc">
    <h3 class="mc-h3">1️⃣ 🏠 Accueil (avant le début)</h3>
    <label class="field"><span>Message d'accueil</span>
      <input id="edAccTexte" type="text" maxlength="120" value="${escAttr(acc.texte || '')}" placeholder="Ça commence bientôt… ✨"></label>
    <div class="photo-line">
      ${accPhoto ? `<img src="${escAttr(accPhoto)}" class="prog-photo" alt="">` : '<div class="prog-photo vide">🖼</div>'}
      <span class="muted small" style="flex:1">Grande image d'accueil</span>
      <input type="file" id="edAccPhoto" accept="image/*" style="display:none" onchange="edPhotoAccueil(this)">
      <button class="btn small" onclick="$('#edAccPhoto').click()">📷</button>
      ${accPhoto ? `<button class="btn small ghost" onclick="edSaveAccueil(true)">🗑</button>` : ''}
    </div>
    <button class="btn block" onclick="edSaveAccueil(false)">💾 Enregistrer l'accueil</button>
  </div>

  <!-- 1bis. LES JOUEURS (cartons dématérialisés) -->
  <div class="soiree-bloc">
    <h3 class="mc-h3">👥 Joueurs (cartons sur téléphone)</h3>
    <button class="btn block ${s.joueursActif !== false ? 'primary' : ''}" onclick="edJoueursToggle()">
      ${s.joueursActif !== false ? '✅ Mode joueur ACTIVÉ — désactiver' : '🚫 Mode joueur désactivé — activer'}</button>
    <label class="field"><span>Cartons par joueur</span>
      <select onchange="soireeUpdate({nbCartons:Number(this.value)})">
        ${[1, 2, 3, 4].map(n => `<option value="${n}" ${(s.nbCartons || 1) === n ? 'selected' : ''}>${n} carton${n > 1 ? 's' : ''}</option>`).join('')}
      </select></label>
    <p class="muted small">Jeton par défaut de la soirée (posé par les joueurs sur leur carton) :</p>
    <div class="jeton-choix">
      ${JETONS_PRESETS.map(e => `<button class="jeton-btn ${s.jetonDefaut && s.jetonDefaut.type === 'emoji' && s.jetonDefaut.val === e ? 'on' : ''}"
        onclick="soireeUpdate({jetonDefaut:{type:'emoji',val:'${e}'}});edAnimRefresh()">${e}</button>`).join('')}
      ${s.jetonDefaut && s.jetonDefaut.type === 'image' ? `<span class="jeton-btn on img" style="background-image:url(${escAttr(s.jetonDefaut.val)})"></span>` : ''}
      <input type="file" id="edJetonImg" accept="image/*" style="display:none" onchange="edJetonImage(this)">
      <button class="jeton-btn" onclick="$('#edJetonImg').click()" title="Créer un jeton à partir d'une image">📷</button>
    </div>
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
      ${entrFond ? `<img src="${escAttr(entrFond)}" class="prog-photo large" alt="">` : '<div class="prog-photo vide">🌌</div>'}
      <span class="muted small" style="flex:1"></span>
      <input type="file" id="edFond" accept="image/*" style="display:none" onchange="edPhotoFond(this)">
      <button class="btn small" onclick="$('#edFond').click()">📷</button>
      ${entrFond ? `<button class="btn icon small" onclick="edRemoveFond()">🗑</button>` : ''}
    </div>
  </div>

  <!-- 5. FIN : écran de fin + fond -->
  <div class="soiree-bloc">
    <h3 class="mc-h3">5️⃣ 🏆 Écran de fin</h3>
    <label class="field"><span>Message de remerciement</span>
      <input id="edFinTexte" type="text" maxlength="120" value="${escAttr(fin.texte || '')}" placeholder="Merci à toutes et tous ! ❤️"></label>
    <div class="photo-line">
      ${finFond ? `<img src="${escAttr(finFond)}" class="prog-photo large" alt="">` : '<div class="prog-photo vide">🌠</div>'}
      <span class="muted small" style="flex:1">Image de fond (optionnelle)</span>
      <input type="file" id="edFinFond" accept="image/*" style="display:none" onchange="edPhotoFinFond(this)">
      <button class="btn small" onclick="$('#edFinFond').click()">📷</button>
      ${finFond ? `<button class="btn icon small" onclick="edRemoveFinFond()">🗑</button>` : ''}
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

// ---------- Mode joueur (réglages) ----------
function edJoueursToggle() {
  const actif = S.soiree.joueursActif !== false;
  soireeUpdate({ joueursActif: !actif });
  edAnimRefresh();
}

async function edJetonImage(input) {
  const data = await compressImageCircle(input.files[0], JETON_IMG_SIZE);
  if (!data) return;
  soireeUpdate({ jetonDefaut: { type: 'image', val: data } });
  toast('Jeton personnalisé créé 🎉');
  edAnimRefresh();
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
  await mediaSet('entracteFond', data);
  soireeUpdate({ entracteFond: '' }); // vide l'ancien stockage inline
  toast('Fond d\'entracte mis à jour 🌌');
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}
function edRemoveFond() {
  mediaDel('entracteFond');
  soireeUpdate({ entracteFond: '' });
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

// ---------- Fond d'écran de fin ----------
async function edPhotoFinFond(input) {
  const data = await compressImage(input.files[0], FOND_MAX_DIM, FOND_QUALITY);
  if (!data) return;
  await mediaSet('finFond', data);
  soireeUpdate({ 'ecrans.fin.fond': '' }); // vide l'ancien stockage inline
  toast('Fond de l\'écran de fin mis à jour 🌠');
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}
function edRemoveFinFond() {
  mediaDel('finFond');
  soireeUpdate({ 'ecrans.fin.fond': '' });
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}
