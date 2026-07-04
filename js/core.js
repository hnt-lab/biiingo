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

// Texte destiné à un titre en dégradé (background-clip:text) : on isole les emojis pour qu'ils
// gardent leurs vraies couleurs au lieu d'être découpés en silhouette par le dégradé.
let EMOJI_RE = null;
try { EMOJI_RE = new RegExp('(\\p{Extended_Pictographic}(\\uFE0F|\\u200D\\p{Extended_Pictographic})*)', 'gu'); }
catch (e) { EMOJI_RE = null; }
function gradTxt(str) {
  const s = esc(str);
  if (!EMOJI_RE) return s;
  return s.replace(EMOJI_RE, '<span class="emo">$1</span>');
}

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

// ---------- Bouton RETOUR Android : ne jamais éjecter l'utilisateur de l'app ----------
// On arme une entrée d'historique en entrant dans une vue ; le retour la consomme,
// on la ré-arme et on propose de quitter PROPREMENT (retour à l'accueil, pas fermeture).
function armeRetour() {
  try { history.pushState({ biiingo: 1 }, ''); } catch (e) {}
}
window.addEventListener('popstate', () => {
  // Un modal ouvert ? le retour le ferme, c'est tout.
  const mb = document.getElementById('modalBack');
  if (mb && mb.classList.contains('show')) { closeModal(); armeRetour(); return; }
  if (S.mode === 'salle') { armeRetour(); salleQuit(); return; }
  if (S.mode === 'mc') { armeRetour(); confirmAction('Quitter la télécommande ? (la soirée continue)', 'Quitter', 'quitSoiree()'); return; }
  if (window.J && J.soireeId) { armeRetour(); confirmAction('Quitter la partie ?', 'Quitter', 'joueurQuitter()'); return; }
});

// Saisie du code directement sur l'écran (le chemin simple pour les TV : site court + 4 lettres)
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
  const code = $('#displayCode').value.trim().toUpperCase();
  if (code.length !== CODE_LENGTH) { toast('Le code fait 4 lettres.'); return; }
  closeModal();
  // On mémorise puis on se connecte anonymement : le routage de connexion prend le relais
  try { localStorage.setItem('biiingo_display', JSON.stringify({ code })); } catch (e) {}
  if (fauth.currentUser) displayEnter(code);
  else fauth.signInAnonymously().catch(() => toast('Connexion impossible — vérifie le réseau.'));
}

// ---------- Feedback utilisateur (retours d'expérience, lus dans la console Firebase) ----------
function feedbackModal(origine) {
  modal(`
    <h3>💬 Ton avis sur Biiingo</h3>
    <p class="muted small">Un bug, une idée, un coup de cœur ? Dis-nous tout — ça nous aide énormément !</p>
    <label class="field"><span>Ton retour</span>
      <textarea id="fbTexte" rows="5" maxlength="2000" placeholder="J'adore les jetons qui tombent, mais…"></textarea></label>
    <label class="field"><span>Un contact pour te répondre (optionnel)</span>
      <input id="fbContact" type="text" maxlength="80" placeholder="email, Insta…"></label>
    <div class="modal-btns">
      <button class="btn ghost" onclick="closeModal()">Annuler</button>
      <button class="btn primary" onclick="feedbackEnvoyer('${origine}')">Envoyer 💌</button>
    </div>`);
}

async function feedbackEnvoyer(origine) {
  const texte = $('#fbTexte').value.trim();
  if (!texte) { toast('Écris-nous quelques mots d\'abord 🙂'); return; }
  const contact = $('#fbContact').value.trim();
  try {
    await db.collection('feedback').add({
      texte, contact, origine,
      nom: (S.profile && S.profile.pseudo) || (window.J && J.nom) || '',
      uid: (fauth.currentUser && fauth.currentUser.uid) || '',
      version: APP_VERSION,
      ts: FV.serverTimestamp()
    });
    closeModal();
    toast('Merci pour ton retour ! 💖');
  } catch (e) {
    toast('Envoi impossible — vérifie ta connexion.');
  }
}

// Recharge l'app en forçant une version fraîche (contourne le cache du navigateur/GitHub Pages).
// Indispensable en mode installé (pas de barre d'adresse) : recharge index.html via une URL neuve,
// qui re-télécharge alors les fichiers CSS/JS versionnés à jour.
function appReload() {
  toast('Mise à jour…');
  setTimeout(() => {
    try {
      const base = location.href.split('?')[0].split('#')[0];
      location.replace(base + '?u=' + Date.now());
    } catch (e) { location.reload(); }
  }, 150);
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
    son: { mute: false, volume: 0.85, off: [] },
    joueursActif: true, nbCartons: 1,
    jetonDefaut: { type: 'emoji', val: '🔴' },
    qrPopup: false
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
        if (d.sonOff) base.son = { mute: false, volume: 0.85, off: d.sonOff, };
        if (typeof d.joueursActif === 'boolean') base.joueursActif = d.joueursActif;
        if (d.nbCartons) base.nbCartons = d.nbCartons;
        if (d.jetonDefaut) base.jetonDefaut = d.jetonDefaut;
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
  // (en affichage public, la session est déjà mémorisée sous biiingo_display)
  if (!S.displayMode) try { localStorage.setItem('biiingo_session', JSON.stringify({ id, mode })); } catch (e) {}
  armeRetour(); // le bouton retour Android proposera de quitter au lieu de fermer l'app
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

  // Médias (grandes images) : stockés à part, hors de la fiche soirée (limite 1 Mo) — un doc par image
  S.medias = {};
  if (S.unsubMedias) { S.unsubMedias(); S.unsubMedias = null; }
  S.unsubMedias = db.collection('medias').where('soireeId', '==', id).onSnapshot(snap => {
    const m = {};
    snap.forEach(d => { const x = d.data(); if (x.key) m[x.key] = x.data; });
    S.medias = m;
    if (!S.soiree) return;
    if (S.mode === 'salle') { salleEtatAffiche = null; renderSalle(S.soiree, null); }
    else { editionRendered = false; renderMC(S.soiree, null); }
  }, () => {});

  // Joueurs connectés (mode joueur) — compteur + liste pour l'animateur
  S.nbJoueurs = 0;
  S.joueurs = [];
  if (S.unsubJoueurs) { S.unsubJoueurs(); S.unsubJoueurs = null; }
  if (mode === 'mc') {
    S.unsubJoueurs = db.collection('soirees').doc(id).collection('joueurs').onSnapshot(snap => {
      const list = [];
      snap.forEach(d => list.push({ uid: d.id, ...d.data() }));
      list.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
      S.joueurs = list;
      S.nbJoueurs = list.length;
      const el = $('#mcNbJoueurs');
      if (el) el.textContent = '👥 ' + S.nbJoueurs;
    }, () => {});
  }
}

// Image stockée hors fiche soirée — repli sur l'ancien champ inline (compat soirées existantes)
function mediaGet(key, legacy) {
  return (S.medias && S.medias[key]) || legacy || '';
}
function mediaSet(key, data) {
  if (!S.soireeId) return Promise.resolve();
  return db.collection('medias').doc(S.soireeId + '__' + key)
    .set({ soireeId: S.soireeId, key, data, ts: FV.serverTimestamp() })
    .catch(() => toast('Envoi de l\'image impossible — vérifie ta connexion.'));
}
function mediaDel(key) {
  if (!S.soireeId) return Promise.resolve();
  return db.collection('medias').doc(S.soireeId + '__' + key).delete().catch(() => {});
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
  if (S.unsubMedias) { S.unsubMedias(); S.unsubMedias = null; }
  if (S.unsubJoueurs) { S.unsubJoueurs(); S.unsubJoueurs = null; }
  S.medias = {};
  Sons.stopAll();
  Sons.clearCustom();
  S.sonsCustom = {};
  try { localStorage.removeItem('biiingo_session'); } catch (e) {}
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  // Écran public (TV) : pas de « maison » où revenir → on repart proprement de zéro
  if (S.displayMode) {
    S.displayMode = false;
    try { localStorage.removeItem('biiingo_display'); } catch (e) {}
    location.href = location.pathname;
    return;
  }
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
  // Type de victoire détaillé (quine / double / carton / lose) + total
  const type = ['quine', 'double', 'carton', 'lose'].includes(S.soiree.objectif) ? S.soiree.objectif : 'quine';
  try {
    await db.collection('registres').doc(owner).set({
      noms: { [key]: { nom, victoires: FV.increment(1), [type]: FV.increment(1) } }
    }, { merge: true });
    if (!S.registre[key]) S.registre[key] = { nom, victoires: 0 };
    S.registre[key].victoires = (S.registre[key].victoires || 0) + 1;
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
  // Liens spéciaux : ?join=CODE (joueur, QR) et ?display=CODE (écran public : TV/Chromecast)
  const params = new URLSearchParams(location.search);
  const join = (params.get('join') || '').trim();
  if (join) window.__joinCode = join.toUpperCase();
  const disp = (params.get('display') || '').trim();
  if (disp) window.__displayCode = disp.toUpperCase();
  initAuth();
});

// ---------- Affichage public (idée 2 — brique 1) ----------
// Un écran (Smart TV, navigateur, Chromecast) affiche la soirée EN LECTURE SEULE via son code,
// sans compte : connexion anonyme invisible, puis vue salle classique.
async function displayEnter(code) {
  try {
    const snap = await db.collection('soirees').where('code', '==', code.toUpperCase()).get();
    let doc = null;
    snap.forEach(d => { if (!doc || d.data().statut === 'active') doc = d; });
    if (!doc) {
      showScreen('loadScreen');
      $('#loadMsg').innerHTML = '😢 Aucune soirée avec le code <b>' + esc(code.toUpperCase()) + '</b>.<br>Vérifie le lien et recharge la page.';
      return;
    }
    S.displayMode = true;
    try { localStorage.setItem('biiingo_display', JSON.stringify({ code: code.toUpperCase() })); } catch (e) {}
    openSoiree(doc.id, 'salle', false);
  } catch (e) {
    showScreen('loadScreen');
    $('#loadMsg').innerHTML = 'Connexion impossible — vérifie le réseau de l\'écran puis recharge.';
  }
}
