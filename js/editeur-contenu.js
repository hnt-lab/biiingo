// Écrans d'accueil et de fin, programme d'entracte et présets.

function edProgrammeAjoute(programme, artiste) {
  return (programme || []).concat([artiste]);
}

function edRetireIndex(items, index) {
  return (items || []).filter((item, currentIndex) => currentIndex !== index);
}

function edFinAvecLien(endScreen, link) {
  const next = Object.assign({ texte: '', liens: [], qrUrl: '' }, endScreen || {});
  next.liens = (next.liens || []).concat([link]);
  return next;
}

function edFinSansLien(endScreen, index) {
  const next = Object.assign({ texte: '', liens: [], qrUrl: '' }, endScreen || {});
  next.liens = edRetireIndex(next.liens, index);
  return next;
}

let edAccPhotoData = null;

async function edPhotoAccueil(input) {
  const data = await compressImage(input.files[0], 1920, 0.78);
  if (data) {
    edAccPhotoData = data;
    toast('Photo prête — pense à Enregistrer.');
  }
}

function edSaveAccueil(removePhoto) {
  soireeUpdate({ 'ecrans.accueil': { texte: $('#edAccTexte').value.trim(), photo: '' } });
  if (removePhoto) mediaDel('accueil');
  else if (edAccPhotoData) mediaSet('accueil', edAccPhotoData);
  edAccPhotoData = null;
  editionRendered = false;
  toast('Écran d\'accueil enregistré ✨');
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

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
  if (data) {
    edArtPhotoData = data;
    $('#edArtPhotoOk').textContent = '✓ photo prête';
  }
}

function edAddArtiste() {
  const name = $('#edArtNom').value.trim();
  if (!name) {
    toast('Il faut au moins un nom.');
    return;
  }
  const programme = edProgrammeAjoute(S.soiree.programme, {
    nom: name,
    message: $('#edArtMsg').value.trim(),
    photo: edArtPhotoData || ''
  });
  soireeUpdate({ programme });
  closeModal();
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

function edRemoveArtiste(index) {
  soireeUpdate({ programme: edRetireIndex(S.soiree.programme, index) });
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

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
  if (!label && !url) {
    closeModal();
    return;
  }
  const current = S.soiree.ecrans && S.soiree.ecrans.fin;
  soireeUpdate({ 'ecrans.fin': edFinAvecLien(current, { label, url }) });
  closeModal();
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

function edRemoveLien(index) {
  const current = S.soiree.ecrans && S.soiree.ecrans.fin;
  soireeUpdate({ 'ecrans.fin': edFinSansLien(current, index) });
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

function edSaveFin() {
  const current = S.soiree.ecrans && S.soiree.ecrans.fin;
  const endScreen = Object.assign({ texte: '', liens: [], qrUrl: '' }, current || {}, {
    texte: $('#edFinTexte').value.trim(),
    qrUrl: $('#edFinQr').value.trim()
  });
  soireeUpdate({ 'ecrans.fin': endScreen });
  toast('Écran de fin enregistré 🏆');
}

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
  const title = $('#edPresetNom').value.trim() || 'Mon préset';
  const party = S.soiree;
  try {
    await db.collection('users').doc(S.user.uid).collection('presets').add({
      titre: title,
      programme: party.programme || [],
      ecrans: party.ecrans || {},
      bandeau: (party.bandeau && party.bandeau.texte) || '',
      deco: party.deco || { haut: '', bas: '' },
      entracteFond: party.entracteFond || '',
      anims: party.anims || {},
      sonOff: (party.son && party.son.off) || [],
      joueursActif: party.joueursActif !== false,
      nbCartons: party.nbCartons || 1,
      jetonDefaut: party.jetonDefaut || { type: 'emoji', val: '🔴' },
      updatedAt: FV.serverTimestamp()
    });
    toast('Préset enregistré 💾');
  } catch (error) {
    toast('Enregistrement impossible (préset trop lourd en photos ?).');
  }
  closeModal();
}
