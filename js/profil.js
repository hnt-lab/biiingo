// Profil utilisateur : pseudo, mot de passe, suppression de compte, à propos.
// Les opérations sensibles (mot de passe, suppression) exigent une reconnexion récente
// → on redemande le mot de passe actuel (reauthenticate) avant d'agir.

function profilModal() {
  const email = (S.user && S.user.email) || '';
  const pseudo = (S.profile && S.profile.pseudo) || '';
  modal(`
    <h3>👤 Mon profil</h3>
    <label class="field"><span>Nom de scène / pseudo</span>
      <input id="profPseudo" type="text" maxlength="40" value="${escAttr(pseudo)}"></label>
    <button class="btn block" onclick="profSavePseudo()">💾 Enregistrer le pseudo</button>
    <p class="muted small" style="margin-top:10px">Email du compte : <b>${esc(email)}</b></p>
    <hr class="ed-sep">
    <p class="muted small">🎟 Mon jeton de joueur (posé sur mes cartons quand je joue) :</p>
    <div class="jeton-choix">
      ${JETONS_PRESETS.map(e => `<button class="jeton-btn ${S.profile && S.profile.jeton && S.profile.jeton.type === 'emoji' && S.profile.jeton.val === e ? 'on' : ''}"
        onclick="profJeton({type:'emoji',val:'${e}'})">${e}</button>`).join('')}
      ${S.profile && S.profile.jeton && S.profile.jeton.type === 'image' ? `<span class="jeton-btn on img" style="background-image:url(${escAttr(S.profile.jeton.val)})"></span>` : ''}
      <input type="file" id="profJetonImg" accept="image/*" style="display:none" onchange="profJetonImage(this)">
      <button class="jeton-btn" onclick="$('#profJetonImg').click()" title="Créer mon jeton à partir d'une image">📷</button>
    </div>
    ${S.profile && S.profile.stats ? `<p class="muted small">🎉 ${S.profile.stats.participations || 0} soirée(s) ·
      1️⃣ ${S.profile.stats.quine || 0} quine(s) · 2️⃣ ${S.profile.stats.double || 0} double(s) ·
      🏆 ${S.profile.stats.carton || 0} carton(s) · 💀 ${S.profile.stats.lose || 0} mort(s) subite(s)</p>` : ''}
    <hr class="ed-sep">
    <button class="btn block" onclick="profChangePwdModal()">🔑 Changer mon mot de passe</button>
    <button class="btn block" onclick="tutoModal()">📖 Revoir le tutoriel</button>
    <button class="btn block" onclick="feedbackModal('profil')">💬 Donner mon avis</button>
    <button class="btn block" onclick="confirmAction('Se déconnecter ?','Déconnexion','closeModal();doLogout()')">🚪 Se déconnecter</button>
    <hr class="ed-sep">
    <button class="btn block ghost danger" onclick="profDeleteModal()">🗑 Supprimer mon compte…</button>
    <p class="muted small center" style="margin-top:12px">Biiingo v${APP_VERSION} · outil d'animation de soirées bingo<br>
    Fait avec des outils libres de droit ❤️ · <a href="confidentialite.html" target="_blank">Confidentialité</a></p>
    <div class="modal-btns"><button class="btn primary" onclick="closeModal()">Fermer</button></div>`);
}

async function profSavePseudo() {
  const pseudo = $('#profPseudo').value.trim();
  if (!pseudo) { toast('Le pseudo ne peut pas être vide.'); return; }
  try {
    await db.collection('users').doc(S.user.uid).set({ pseudo }, { merge: true });
    S.profile = S.profile || {};
    S.profile.pseudo = pseudo;
    const el = $('#homePseudo');
    if (el) el.textContent = pseudo;
    toast('Pseudo enregistré ✨');
  } catch (e) {
    toast('Enregistrement impossible. Vérifie ta connexion.');
  }
}

// ---------- Jeton de joueur personnalisé ----------
async function profJeton(jeton) {
  try {
    await db.collection('users').doc(S.user.uid).set({ jeton }, { merge: true });
    S.profile = S.profile || {};
    S.profile.jeton = jeton;
    toast('Jeton enregistré 🎟');
    profilModal();
  } catch (e) { toast('Enregistrement impossible.'); }
}

async function profJetonImage(input) {
  const data = await compressImageCircle(input.files[0], JETON_IMG_SIZE);
  if (data) profJeton({ type: 'image', val: data });
}

// ---------- Changement de mot de passe ----------
function profChangePwdModal() {
  modal(`
    <h3>🔑 Changer mon mot de passe</h3>
    <label class="field"><span>Mot de passe actuel</span>
      <input id="pwdOld" type="password" autocomplete="current-password"></label>
    <label class="field"><span>Nouveau mot de passe (6 caractères min.)</span>
      <input id="pwdNew" type="password" autocomplete="new-password"></label>
    <div id="pwdError" class="auth-error"></div>
    <div class="modal-btns">
      <button class="btn ghost" onclick="profilModal()">← Retour</button>
      <button class="btn primary" onclick="profDoChangePwd()">Changer 🔑</button>
    </div>`);
}

async function profDoChangePwd() {
  const oldPwd = $('#pwdOld').value;
  const newPwd = $('#pwdNew').value;
  if (!oldPwd || !newPwd) { $('#pwdError').textContent = 'Remplis les deux champs.'; return; }
  if (newPwd.length < 6) { $('#pwdError').textContent = 'Le nouveau mot de passe doit faire au moins 6 caractères.'; return; }
  try {
    const cred = firebase.auth.EmailAuthProvider.credential(S.user.email, oldPwd);
    await S.user.reauthenticateWithCredential(cred);
    await S.user.updatePassword(newPwd);
    closeModal();
    toast('Mot de passe changé 🔑');
  } catch (e) {
    $('#pwdError').textContent = (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')
      ? 'Mot de passe actuel incorrect.' : authMessage(e.code);
  }
}

// ---------- Suppression du compte ----------
function profDeleteModal() {
  modal(`
    <h3>🗑 Supprimer mon compte</h3>
    <p class="modal-msg">Ton compte, ton profil et tes présets seront <b>définitivement supprimés</b>.
    Les soirées que tu as créées seront aussi supprimées.<br><br>
    Pour confirmer, saisis ton mot de passe :</p>
    <label class="field"><span>Mot de passe</span>
      <input id="delPwd" type="password" autocomplete="current-password"></label>
    <div id="delError" class="auth-error"></div>
    <div class="modal-btns">
      <button class="btn ghost" onclick="profilModal()">← Annuler</button>
      <button class="btn danger" onclick="profDoDelete()">Supprimer définitivement</button>
    </div>`);
}

async function profDoDelete() {
  const pwd = $('#delPwd').value;
  if (!pwd) { $('#delError').textContent = 'Saisis ton mot de passe.'; return; }
  const uid = S.user.uid;
  try {
    const cred = firebase.auth.EmailAuthProvider.credential(S.user.email, pwd);
    await S.user.reauthenticateWithCredential(cred);
  } catch (e) {
    $('#delError').textContent = (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')
      ? 'Mot de passe incorrect.' : authMessage(e.code);
    return;
  }
  $('#delError').textContent = 'Suppression en cours…';
  try {
    // 1. Ses soirées (+ leurs images)
    const soirees = await db.collection('soirees').where('ownerUid', '==', uid).get();
    for (const d of soirees.docs) {
      const medias = await db.collection('medias').where('soireeId', '==', d.id).get();
      await Promise.all(medias.docs.map(m => m.ref.delete().catch(() => {})));
      await d.ref.delete().catch(() => {});
    }
    // 2. Ses sons personnalisés et son registre d'habitués
    const sons = await db.collection('sons').where('uid', '==', uid).get();
    await Promise.all(sons.docs.map(x => x.ref.delete().catch(() => {})));
    await db.collection('registres').doc(uid).delete().catch(() => {});
    // 3. Ses présets puis son profil
    const presets = await db.collection('users').doc(uid).collection('presets').get();
    await Promise.all(presets.docs.map(p => p.ref.delete().catch(() => {})));
    await db.collection('users').doc(uid).delete().catch(() => {});
    // 4. Le compte lui-même (déconnecte automatiquement)
    await S.user.delete();
    closeModal();
    toast('Compte supprimé. Au revoir 💜');
  } catch (e) {
    $('#delError').textContent = 'Suppression incomplète — réessaie, ou contacte le support.';
  }
}
