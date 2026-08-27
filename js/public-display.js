// Entrée et connexion d'un écran public en lecture seule.

function normalizeDisplayCode(value) {
  return String(value || '').trim().toUpperCase();
}

function displayCodeModal() {
  modal(`
    <h3>📺 Afficher une soirée</h3>
    <p class="muted small">Entre le code de la soirée (affiché sur la télécommande de l'animateur).</p>
    <label class="field"><span>Code (4 lettres)</span>
      <input id="displayCode" type="text" maxlength="4" autocapitalize="characters"
             style="text-transform:uppercase;letter-spacing:.3em;text-align:center;font-size:1.5em"></label>
    <div class="modal-btns">
      <button class="btn ghost" onclick="closeModal()">Annuler</button>
      <button class="btn primary big" onclick="displayLance()">📺 Afficher</button>
    </div>`);
  setTimeout(() => $('#displayCode').focus(), 50);
}

function displayLance() {
  const code = normalizeDisplayCode($('#displayCode').value);
  if (code.length !== CODE_LENGTH) { toast('Le code fait 4 lettres.'); return; }
  closeModal();
  try { localStorage.setItem('biiingo_display', JSON.stringify({ code })); } catch (error) {}
  if (fauth.currentUser) displayEnter(code);
  else fauth.signInAnonymously().catch(() => toast('Connexion impossible — vérifie le réseau.'));
}

async function displayEnter(rawCode) {
  const code = normalizeDisplayCode(rawCode);
  try {
    const snapshot = await db.collection('soirees').where('code', '==', code).get();
    let party = null;
    snapshot.forEach(document => {
      if (!party || document.data().statut === 'active') party = document;
    });
    if (!party) {
      showScreen('loadScreen');
      $('#loadMsg').innerHTML = '😢 Aucune soirée avec le code <b>' + esc(code) + '</b>.<br>Vérifie le lien et recharge la page.';
      return;
    }
    S.displayMode = true;
    try { localStorage.setItem('biiingo_display', JSON.stringify({ code })); } catch (error) {}
    openSoiree(party.id, 'salle', false);
  } catch (error) {
    showScreen('loadScreen');
    $('#loadMsg').innerHTML = 'Connexion impossible — vérifie le réseau de l\'écran puis recharge.';
  }
}
