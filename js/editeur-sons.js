// Réglages et fichiers audio personnalisés de l'éditeur de soirée.

function edSonOffSuivant(disabledNames, name) {
  const next = (disabledNames || []).slice();
  const index = next.indexOf(name);
  if (index >= 0) next.splice(index, 1);
  else next.push(name);
  return next;
}

function edSonToggle(name) {
  const current = (S.soiree.son && S.soiree.son.off) || [];
  const off = edSonOffSuivant(current, name);
  const enabled = off.length < current.length;
  soireeUpdate({ 'son.off': off });
  toast(enabled ? 'Son réactivé 🔊' : 'Son désactivé 🔇');
  editionRendered = false;
  setTimeout(() => { if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null); }, 600);
}

function edSonPlay(name) {
  const audio = Sons.custom[name] || Sons.audios[name];
  if (!audio || (Sons.missing[name] && !Sons.custom[name])) {
    toast('Aucun son pour le moment.');
    return;
  }
  try {
    audio.currentTime = 0;
    audio.play().catch(() => toast('Lecture impossible sur cet appareil.'));
  } catch (error) {}
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
        uid: owner,
        name,
        data: reader.result,
        updatedAt: FV.serverTimestamp()
      });
      Sons.setCustom(name, reader.result);
      S.sonsCustom = S.sonsCustom || {};
      S.sonsCustom[name] = true;
      toast('Son remplacé 🔊 (l\'écran de salle l\'utilisera après son prochain chargement)');
    } catch (error) {
      toast('Envoi impossible — vérifie la connexion et les droits de la soirée.');
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
  } catch (error) {}
  editionRendered = false;
  if (S.mcTab === 'edition' && S.soiree) renderMC(S.soiree, null);
}
