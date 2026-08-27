// Collecte des retours facultatifs envoyés depuis les différentes interfaces.

function feedbackModal(origin) {
  modal(`
    <h3>💬 Ton avis sur Biiingo</h3>
    <p class="muted small">Un bug, une idée, un coup de cœur ? Dis-nous tout — ça nous aide énormément !</p>
    <label class="field"><span>Ton retour</span>
      <textarea id="fbTexte" rows="5" maxlength="2000" placeholder="J'adore les jetons qui tombent, mais…"></textarea></label>
    <label class="field"><span>Un contact pour te répondre (optionnel)</span>
      <input id="fbContact" type="text" maxlength="80" placeholder="email, Insta…"></label>
    <div class="modal-btns">
      <button class="btn ghost" onclick="closeModal()">Annuler</button>
      <button class="btn primary" id="fbSubmit">Envoyer 💌</button>
    </div>`);
  $('#fbSubmit').addEventListener('click', () => feedbackEnvoyer(origin));
}

async function feedbackEnvoyer(origin) {
  const text = $('#fbTexte').value.trim();
  if (!text) { toast('Écris-nous quelques mots d\'abord 🙂'); return; }
  const contact = $('#fbContact').value.trim();
  try {
    await db.collection('feedback').add({
      texte: text,
      contact,
      origine: origin,
      nom: (S.profile && S.profile.pseudo) || (window.J && J.nom) || '',
      uid: (fauth.currentUser && fauth.currentUser.uid) || '',
      version: APP_VERSION,
      ts: FV.serverTimestamp()
    });
    closeModal();
    toast('Merci pour ton retour ! 💖');
  } catch (error) {
    toast('Envoi impossible — vérifie ta connexion.');
  }
}
