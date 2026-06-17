// Cœur de l'application : état, navigation, soirées, synchro temps réel.

const S = {
  user: null,        // utilisateur Firebase connecté
  profile: null,     // document users/{uid}
  mode: null,        // 'mc' ou 'salle'
  soireeId: null,
  soiree: null,      // données temps réel de la soirée ouverte
  prev: null,        // état précédent (pour détecter les nouveautés côté salle)
  unsub: null,       // arrêt de l'écoute temps réel
  registre: {},      // registre des habitués (autocomplétion)
  mcTab: 'tirage'    // onglet actif de la télécommande
};

// ---------- Petits outils ----------
function $(sel) { return document.querySelector(sel); }
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escAttr(s) { return esc(s); }

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._tm);
  toast._tm = setTimeout(() => t.classList.remove('show'), 2200);
}

function modal(html) {
  $('#modalContent').innerHTML = html;
  $('#modalBack').classList.add('show');
}
function closeModal() { $('#modalBack').classList.remove('show'); }

function confirmAction(message, yesLabel, onYesJs) {
  modal(`
    <p class="modal-msg">${message}</p>
    <div class="modal-btns">
      <button class="btn ghost" onclick="closeModal()">Annuler</button>
      <button class="btn primary" onclick="closeModal();${onYesJs}">${esc(yesLabel)}</button>
    </div>`);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('#' + id).classList.add('active');
}

// ---------- Accueil (après connexion) ----------
function renderHome() {
  showScreen('homeScreen');
  $('#homePseudo').textContent = S.profile ? S.profile.pseudo : '';
  loadSoirees();
}

async function loadSoirees() {
  const list = $('#soireeList');
  list.innerHTML = '<p class="muted">Chargement…</p>';
  try {
    const snap = await db.collection('soirees')
      .where('mcUids', 'array-contains', S.user.uid).get();
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt && b.createdAt.seconds || 0) - (a.createdAt && a.createdAt.seconds || 0));
    if (!items.length) {
      list.innerHTML = '<p class="muted">Aucune soirée pour le moment. Crée ta première soirée !</p>';
      return;
    }
    list.innerHTML = items.map(s => `
      <div class="soiree-card ${s.statut === 'terminee' ? 'finie' : ''}">
        <div class="soiree-info">
          <div class="soiree-titre">${esc(s.titre)}</div>
          <div class="soiree-meta">Code : <b>${esc(s.code)}</b>${s.statut === 'terminee' ? ' · terminée' : ''}</div>
        </div>
        <div class="soiree-actions">
          <button class="btn small" onclick="openSoiree('${s.id}','mc')">📱 Animer</button>
          <button class="btn small ghost" onclick="openSoiree('${s.id}','salle')">🖥 Afficher</button>
        </div>
      </div>`).join('');
  } catch (e) {
    list.innerHTML = '<p class="muted">Impossible de charger les soirées. Vérifie ta connexion.</p>';
  }
}

// ---------- Création / rejoindre ----------
function genCode() {
  let c = '';
  for (let i = 0; i < CODE_LENGTH; i++) c += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return c;
}

async function createSoireeFlow() {
  let presetOptions = '<option value="">— Partir de zéro —</option>';
  try {
    const snap = await db.collection('users').doc(S.user.uid).collection('presets').get();
    snap.forEach(d => { presetOptions += `<option value="${d.id}">${esc(d.data().titre)}</option>`; });
  } catch (e) {}
  modal(`
    <h3>Nouvelle soirée</h3>
    <label class="field"><span>Titre de la soirée</span>
      <input id="newTitre" type="text" maxlength="60" placeholder="Bingo Drag du 14 juin"></label>
    <label class="field"><span>Préset (réglages enregistrés)</span>
      <select id="newPreset">${presetOptions}</select></label>
    <div class="modal-btns">
      <button class="btn ghost" onclick="closeModal()">Annuler</button>
      <button class="btn primary" onclick="createSoiree()">Créer ✨</button>
    </div>`);
}

async function createSoiree() {
  const titre = $('#newTitre').value.trim() || 'Soirée Biiingo';
  const presetId = $('#newPreset').value;
  let base = {
    programme: [],
    ecrans: { accueil: { texte: '', photo: '' }, fin: { texte: '', liens: [], qrUrl: '' } },
    bandeau: { texte: '', actif: false },
    deco: { haut: '', bas: '' },
    entracteFond: '',
    anims: {
      gagne: { style: 'pluie', parts: [], vedette: '' },
      faux: { style: 'douche', parts: [], vedette: '' }
    },
    son: { mute: false, volume: 0.85, off: [] }
  };
  if (presetId) {
    try {
      const p = await db.collection('users').doc(S.user.uid).collection('presets').doc(presetId).get();
      if (p.exists) {
        const d = p.data();
        base.programme = d.programme || [];
        base.ecrans = d.ecrans || base.ecrans;
        base.bandeau = { texte: d.bandeau || '', actif: false };
        base.deco = d.deco || base.deco;
        base.entracteFond = d.entracteFond || '';
        if (d.anims && d.anims.gagne) base.anims = d.anims;
        if (d.sonOff) base.son = { mute: false, volume: 0.85, off: d.sonOff };
      }
    } catch (e) {}
  }
  const doc = {
    code: genCode(), titre, ownerUid: S.user.uid,
    ownerPseudo: S.profile ? S.profile.pseudo : '',
    mcUids: [S.user.uid], statut: 'active',
    createdAt: FV.serverTimestamp(),
    etat: 'accueil', manche: 1, objectif: 'quine', tires: [],
    entracte: { nom: '', message: '', photo: '' },
    verification: { active: false, suspense: false, coches: [], verdict: '' },
    hallOfFame: [],
    son: { mute: false, volume: 0.85 },
    ...base
  };
  try {
    const ref = await db.collection('soirees').add(doc);
    closeModal();
    openSoiree(ref.id, 'mc');
  } catch (e) {
    toast('Création impossible. Vérifie ta connexion.');
  }
}

function joinFlow() {
  modal(`
    <h3>Rejoindre une soirée</h3>
    <label class="field"><span>Code de la soirée (4 lettres)</span>
      <input id="joinCode" type="text" maxlength="4" autocapitalize="characters"
             style="text-transform:uppercase;letter-spacing:.3em;text-align:center;font-size:1.4em"></label>
    <div class="modal-btns">
      <button class="btn ghost" onclick="closeModal()">Annuler</button>
      <button class="btn primary" onclick="joinByCode()">Rejoindre</button>
    </div>`);
  setTimeout(() => $('#joinCode').focus(), 50);
}

async function joinByCode() {
  const code = $('#joinCode').value.trim().toUpperCase();
  if (code.length !== CODE_LENGTH) { toast('Le code fait 4 lettres.'); return; }
  try {
    const snap = await db.collection('soirees').where('code', '==', code).get();
    let found = null;
    snap.forEach(d => { if (!found || (d.data().statut === 'active')) found = d; });
    if (!found) { toast('Aucune soirée avec ce code.'); return; }
    await found.ref.update({ mcUids: FV.arrayUnion(S.user.uid) });
    closeModal();
    openSoiree(found.id, 'mc');
  } catch (e) {
    toast('Impossible de rejoindre. Vérifie ta connexion.');
  }
}

// ---------- Ouverture & synchro temps réel ----------
function openSoiree(id, mode, gesture) {
  if (S.unsub) { S.unsub(); S.unsub = null; }
  S.soireeId = id; S.mode = mode; S.soiree = null; S.prev = null; S.mcTab = 'tirage';
  // On retient la session : après un F5, on revient directement ici (demande utilisateur)
  try { localStorage.setItem('biiingo_session', JSON.stringify({ id, mode })); } catch (e) {}
  if (mode === 'salle') {
    showScreen('salleScreen');
    salleOpenInit(gesture !== false); // ouvert via un clic → plein écran + son immédiats
  } else {
    showScreen('mcScreen');
  }
  S.unsub = db.collection('soirees').doc(id).onSnapshot(doc => {
    if (!doc.exists) { quitSoiree(); toast('Cette soirée a été supprimée.'); return; }
    const premier = !S.soiree;
    S.prev = S.soiree;
    S.soiree = doc.data();
    if (premier) { loadRegistre(); loadCustomSounds(); } // données liées au créateur de la soirée
    if (S.mode === 'salle') renderSalle(S.soiree, S.prev);
    else renderMC(S.soiree, S.prev);
  }, () => { /* erreur réseau passagère : Firestore réessaie tout seul */ });
}

// Sons personnalisés du compte créateur de la soirée (remplacent les sons de base)
async function loadCustomSounds() {
  S.sonsCustom = {};
  Sons.clearCustom();
  try {
    const owner = (S.soiree && S.soiree.ownerUid) || S.user.uid;
    const snap = await db.collection('sons').where('uid', '==', owner).get();
    snap.forEach(d => {
      const x = d.data();
      if (x.name && x.data) {
        Sons.setCustom(x.name, x.data);
        S.sonsCustom[x.name] = true;
      }
    });
  } catch (e) { /* règles pas encore à jour ou réseau : on reste sur les sons de base */ }
}

function quitSoiree() {
  if (S.unsub) { S.unsub(); S.unsub = null; }
  Sons.stopAll();
  Sons.clearCustom();
  S.sonsCustom = {};
  try { localStorage.removeItem('biiingo_session'); } catch (e) {}
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  S.soireeId = null; S.soiree = null; S.mode = null;
  renderHome();
}

function soireeUpdate(patch) {
  if (!S.soireeId) return Promise.resolve();
  return db.collection('soirees').doc(S.soireeId).update(patch).catch(() => toast('Connexion instable — la modification partira dès le retour du réseau.'));
}

// ---------- Registre des habitués (gagnants d'une soirée à l'autre) ----------
async function loadRegistre() {
  S.registre = {};
  try {
    const owner = S.soiree ? S.soiree.ownerUid : S.user.uid;
    const d = await db.collection('registres').doc(owner || S.user.uid).get();
    if (d.exists) S.registre = d.data().noms || {};
  } catch (e) {}
}

function slugName(nom) {
  return nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function saveWinnerToRegistre(nom) {
  const key = slugName(nom);
  if (!key) return;
  const owner = S.soiree.ownerUid;
  const patch = {};
  patch['noms.' + key] = { nom, victoires: FV.increment(1) };
  try {
    await db.collection('registres').doc(owner).set({
      noms: { [key]: { nom, victoires: FV.increment(1) } }
    }, { merge: true });
    if (!S.registre[key]) S.registre[key] = { nom, victoires: 0 };
    S.registre[key].victoires++;
  } catch (e) {}
}

// ---------- Démarrage ----------
window.addEventListener('load', () => {
  $('#verLabel') && ($('#verLabel').textContent = 'v' + APP_VERSION);
  if (!initFirebase()) {
    showScreen('loadScreen');
    $('#loadMsg').innerHTML = '⚙️ Configuration en attente.<br>L\'installation n\'est pas terminée (voir le guide d\'installation).';
    return;
  }
  initAuth();
});
