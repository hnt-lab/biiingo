// MODE JOUEUR : rejoindre par QR/code, carton(s) dématérialisé(s), jetons physiques,
// alertes de quine, élimination en mort subite, fin de soirée + nudge compte.

const J = {
  code: null, soireeId: null, soiree: null, prev: null, unsub: null,
  uid: null, nom: '', invite: true,
  cartons: [],            // tableaux 3×9
  actif: 0,               // index du carton affiché
  marques: [],            // un Set de numéros marqués par carton
  alertes: {},            // niveaux déjà signalés cette manche
  elimine: false, etatAffiche: null
};

// ---------- Entrée (depuis ?join=CODE ou session reprise) ----------
function joueurInit(code) {
  J.code = code.toUpperCase();
  showScreen('joinScreen');
  $('#joinCodeLabel').textContent = J.code;
}

async function joueurRejoindreInvite() {
  const nom = $('#joinNom').value.trim();
  if (!nom) { toast('Dis-nous ton prénom ou surnom !'); return; }
  jetonsDemandePermissionMouvement(); // iOS : permission mouvement (nécessite un clic)
  try {
    if (!fauth.currentUser) await fauth.signInAnonymously();
    await joueurEntrer(nom, true);
  } catch (e) {
    toast('Connexion impossible. Vérifie ton réseau.');
  }
}

function joueurRejoindreCompte() {
  // Passe par l'écran de connexion normal ; le retour se fait via pendingJoin
  try { localStorage.setItem('biiingo_pending_join', J.code); } catch (e) {}
  showScreen('authScreen');
}

async function joueurEntrer(nom, invite) {
  // Trouve la soirée par code
  const snap = await db.collection('soirees').where('code', '==', J.code).get();
  let doc = null;
  snap.forEach(d => { if (!doc || d.data().statut === 'active') doc = d; });
  if (!doc) { toast('Aucune soirée avec ce code.'); showScreen('joinScreen'); return; }
  const s = doc.data();
  if (s.joueursActif === false) {
    modal(`<h3>😢 Mode joueur désactivé</h3><p class="modal-msg">L'animateur n'a pas activé les cartons
      dématérialisés pour cette soirée.</p>
      <div class="modal-btns"><button class="btn primary" onclick="closeModal()">OK</button></div>`);
    return;
  }
  J.soireeId = doc.id; J.uid = fauth.currentUser.uid; J.nom = nom; J.invite = invite;

  // Récupère ou crée mon document joueur (cartons générés une fois)
  const ref = db.collection('soirees').doc(doc.id).collection('joueurs').doc(J.uid);
  const moi = await ref.get();
  if (moi.exists && moi.data().cartons && moi.data().cartons.length) {
    const d = moi.data();
    J.cartons = cartonsDepuisDb(d.cartons);
    J.elimine = !!d.elimine;
    if (d.nom) J.nom = d.nom;
  } else {
    const nb = Math.min(JOUEUR_MAX_CARTONS, Math.max(1, s.nbCartons || 1));
    J.cartons = genCartons(nb);
    J.elimine = false;
    await ref.set({
      nom, invite, cartons: cartonsVersDb(J.cartons),
      elimine: false, wins: 0, ts: FV.serverTimestamp()
    });
    joueurCompteParticipation(s.ownerUid, nom, invite);
  }
  J.marques = J.cartons.map(() => new Set());
  J.actif = 0; J.alertes = {}; J.prev = null; J.soiree = null;
  try { localStorage.setItem('biiingo_joueur', JSON.stringify({ code: J.code, nom, invite })); } catch (e) {}

  // Plein écran paysage (le clic de l'utilisateur nous y autorise)
  try { document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {}
  try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) {}

  showScreen('joueurScreen');
  if (J.unsub) J.unsub();
  J.unsub = db.collection('soirees').doc(J.soireeId).onSnapshot(d => {
    if (!d.exists) { joueurQuitter(); toast('La soirée a été supprimée.'); return; }
    J.prev = J.soiree; J.soiree = d.data();
    if (window.S) S.soiree = J.soiree; // pour la détection de secousse (numéros tirés)
    joueurRender();
  });
}

// Participation comptée : invité → registre de l'organisateur ; compte → mes stats
function joueurCompteParticipation(ownerUid, nom, invite) {
  try {
    if (invite) {
      const key = slugName(nom);
      if (key) db.collection('registres').doc(ownerUid).set({
        noms: { [key]: { nom, participations: FV.increment(1) } }
      }, { merge: true });
    } else {
      db.collection('users').doc(J.uid).set({ stats: { participations: FV.increment(1) } }, { merge: true });
    }
  } catch (e) {}
}

function joueurQuitter() {
  if (J.unsub) { J.unsub(); J.unsub = null; }
  Jetons.destroy();
  try { localStorage.removeItem('biiingo_joueur'); } catch (e) {}
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  location.href = location.pathname; // retour à l'app normale
}

// ---------- Rendu ----------
function joueurRender() {
  const s = J.soiree;
  const etat = (J.elimine && s.objectif === 'lose' && s.etat === 'tirage') ? 'elimine' : s.etat;

  // Vibration au nouveau numéro + détections liées au tirage
  const tires = s.tires || [];
  if (J.prev && s.etat === 'tirage' && tires.length > (J.prev.tires || []).length) {
    if (navigator.vibrate) navigator.vibrate(60);
    // Mort subite : un de mes numéros vient de sortir → éliminé
    if (s.objectif === 'lose' && !J.elimine) {
      const nouveau = tires[tires.length - 1];
      if (J.cartons.some(c => cartonNums(c).includes(nouveau))) { joueurEliminer(nouveau); return; }
    }
  }
  // Nouvelle manche (grille vidée) → nouveaux cartons, tout le monde revient en jeu
  if (J.prev && (J.prev.tires || []).length > 0 && tires.length === 0) joueurNouvelleManche();
  // Victoire qui me correspond ? (le MC a validé mon nom)
  joueurDetecteVictoire();

  const rebuild = J.etatAffiche !== etat;
  J.etatAffiche = etat;
  if (etat === 'tirage') { joueurRenderJeu(rebuild); }
  else if (rebuild) {
    Jetons.destroy();
    if (etat === 'elimine') joueurRenderElimine();
    else if (etat === 'entracte') joueurRenderSimple('🎭', esc((s.entracte && s.entracte.nom) || 'Entracte'), 'On se retrouve juste après le spectacle !');
    else if (etat === 'fin') joueurRenderFin();
    else if (etat === 'verification') joueurRenderSimple('🥁', 'Vérification en cours…', 'Quelqu\'un a peut-être gagné !');
    else joueurRenderSimple('✨', esc(s.titre), 'Ça commence bientôt — garde ton carton prêt !');
  }
  joueurRenderBandeau();
}

function joueurRenderJeu(rebuild) {
  const s = J.soiree;
  const c = $('#joueurContent');
  const obj = OBJECTIFS[s.objectif] || OBJECTIFS.quine;
  const last = (s.tires || []).length ? s.tires[s.tires.length - 1] : '—';

  if (rebuild || !$('#cartonGrille')) {
    const minis = J.cartons.map((_, i) =>
      `<div class="carton-mini ${i === J.actif ? 'on' : ''}" onclick="joueurVaCarton(${i})">C${i + 1}</div>`).join('');
    c.innerHTML = `
      <div class="joueur-haut">
        <span class="joueur-obj">${s.objectif === 'lose' ? '💀' : '🎯'} ${obj.label}</span>
        <span class="joueur-dernier" id="joueurDernier">${last}</span>
        <button class="btn icon small" onclick="confirmAction('Quitter la partie ?','Quitter','joueurQuitter()')">✕</button>
      </div>
      <div class="joueur-aire" id="joueurAire">
        <div class="carton-minis">${J.cartons.length > 1 ? minis : ''}</div>
        <div class="carton-grille" id="cartonGrille"></div>
        <div class="jetons-reserve"></div>
      </div>`;
    joueurMonteCarton();
  }
  $('#joueurDernier').textContent = last;
  const d = $('#joueurDernier');
  d.classList.remove('bump'); void d.offsetWidth; d.classList.add('bump');
  joueurMajHalos();
}

// Construit la grille du carton actif + branche la physique
function joueurMonteCarton() {
  const grille = $('#cartonGrille');
  const carton = J.cartons[J.actif];
  if (!grille || !carton) return;
  let html = '';
  for (let r = 0; r < 3; r++) for (let col = 0; col < 9; col++) {
    const n = carton[r][col];
    html += n ? `<div class="ccase" data-num="${n}">${n}</div>` : '<div class="ccase vide"></div>';
  }
  grille.innerHTML = html;
  // Mesure des cases pour la physique (repère = l'aire de jeu)
  requestAnimationFrame(() => {
    const aire = $('#joueurAire');
    if (!aire) return;
    const ar = aire.getBoundingClientRect();
    const rects = {};
    grille.querySelectorAll('.ccase[data-num]').forEach(el => {
      const r = el.getBoundingClientRect();
      rects[el.dataset.num] = { x: r.left - ar.left, y: r.top - ar.top, w: r.width, h: r.height };
    });
    Jetons.init(aire, joueurStyleJeton(), () => joueurApresPose());
    Jetons.cellRects = rects;
    Jetons.spawn(15, [...J.marques[J.actif]]);
    joueurMajHalos();
  });
}

function joueurStyleJeton() {
  if (!J.invite && window.S && S.profile && S.profile.jeton) return S.profile.jeton;              // jeton perso (compte)
  if (J.soiree && J.soiree.jetonDefaut && J.soiree.jetonDefaut.val) return J.soiree.jetonDefaut;  // jeton de la soirée
  return { type: 'emoji', val: '🔴' };
}

function joueurVaCarton(i) {
  J.marques[J.actif] = new Set([...Jetons.marked]);
  J.actif = i;
  joueurRenderJeu(true);
}

// Après chaque pose/chute : synchronise l'état + vérifie les alertes
function joueurApresPose() {
  J.marques[J.actif] = new Set([...Jetons.marked]);
  joueurMajHalos();
  joueurVerifieAlerte();
}

// Halos d'aide : cases dont le numéro est TIRÉ et dont le jeton bien placé est tombé
function joueurMajHalos() {
  const tires = (J.soiree && J.soiree.tires) || [];
  document.querySelectorAll('#cartonGrille .ccase[data-num]').forEach(el => {
    const n = +el.dataset.num;
    el.classList.toggle('aide', Jetons.aidHalo.has(n) && tires.includes(n) && !Jetons.marked.has(n));
  });
}

// « 👀 Psst… » — seulement si les jetons sont posés ET corrects
function joueurVerifieAlerte() {
  const s = J.soiree;
  if (!s || s.etat !== 'tirage' || s.objectif === 'lose') return;
  const tires = s.tires || [];
  const carton = J.cartons[J.actif];
  const lignes = lignesGagnantes(carton, Jetons.marked, tires);
  let msg = null, niveau = null;
  if (s.objectif === 'quine' && lignes.length >= 1) { niveau = 'quine' + J.actif; msg = `👀 Psst… ta ligne ${lignes[0]} est complète. À toi de crier !`; }
  if (s.objectif === 'double' && lignes.length >= 2) { niveau = 'double' + J.actif; msg = `👀 Psst… tes lignes ${lignes[0]} et ${lignes[1]} sont complètes. À toi de crier !`; }
  if (s.objectif === 'carton' && lignes.length === 3) { niveau = 'carton' + J.actif; msg = '👀 Psst… ton carton est COMPLET. À toi de crier !'; }
  if (msg && !J.alertes[niveau]) {
    J.alertes[niveau] = true;
    if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
    joueurBanniere(msg);
  }
}

function joueurBanniere(html, extraCls) {
  const b = document.createElement('div');
  b.className = 'joueur-alerte' + (extraCls ? ' ' + extraCls : '');
  b.innerHTML = html;
  $('#joueurScreen').appendChild(b);
  setTimeout(() => b.remove(), 6500);
}

// ---------- Mort subite ----------
async function joueurEliminer(numero) {
  J.elimine = true;
  J.numeroFatal = numero;
  J.styleElim = Math.random() < .5 ? 'fissure' : 'brule';
  try {
    await db.collection('soirees').doc(J.soireeId).collection('joueurs').doc(J.uid)
      .update({ elimine: true });
  } catch (e) {}
  if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
  J.etatAffiche = null; // force le re-rendu
  joueurRender();
}

function joueurRenderElimine() {
  const carton = J.cartons[0];
  let html = '';
  for (let r = 0; r < 3; r++) for (let col = 0; col < 9; col++) {
    const n = carton[r][col];
    html += n ? `<div class="ccase">${n}</div>` : '<div class="ccase vide"></div>';
  }
  $('#joueurContent').innerHTML = `
    <div class="joueur-elimine">
      <div class="carton-grille casse ${J.styleElim || 'fissure'}">${html}</div>
      <div class="elim-popup">
        <div class="elim-skull">💀</div>
        <div class="elim-titre">ÉLIMINÉ·E !</div>
        <p>Le ${J.numeroFatal || '?'} t'a été fatal…</p>
        <button class="btn primary" onclick="joueurSpectateur()">👀 Rester regarder</button>
      </div>
    </div>`;
}

function joueurSpectateur() {
  const p = document.querySelector('#joueurContent .elim-popup');
  if (p) p.style.display = 'none';
}

function joueurNouvelleManche() {
  const s = J.soiree;
  const nb = Math.min(JOUEUR_MAX_CARTONS, Math.max(1, s.nbCartons || 1));
  J.cartons = genCartons(nb);
  J.marques = J.cartons.map(() => new Set());
  J.alertes = {}; J.elimine = false; J.actif = 0;
  Jetons.aidHalo = new Set();
  db.collection('soirees').doc(J.soireeId).collection('joueurs').doc(J.uid)
    .update({ cartons: cartonsVersDb(J.cartons), elimine: false }).catch(() => {});
  J.etatAffiche = null;
}

// ---------- Victoire (le MC a validé mon nom) ----------
function joueurDetecteVictoire() {
  const s = J.soiree, p = J.prev;
  if (!p) return;
  const nv = (s.verification && s.verification.verdict) || '';
  const pv = (p.verification && p.verification.verdict) || '';
  if (nv === 'gagne' && pv !== 'gagne') {
    const nomGagnant = (s.verification.gagnantNom || '').trim();
    if (nomGagnant && slugName(nomGagnant) === slugName(J.nom)) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 300]);
      db.collection('soirees').doc(J.soireeId).collection('joueurs').doc(J.uid)
        .update({ wins: FV.increment(1) }).catch(() => {});
      if (!J.invite) db.collection('users').doc(J.uid).set({ stats: { victoires: FV.increment(1) } }, { merge: true }).catch(() => {});
      joueurBanniere(`🎉 Bravo ${esc(J.nom)}, victoire validée !${J.invite ? '<br><small>Crée ton compte à la fin pour garder tes stats ✨</small>' : ''}`, 'victoire');
    }
  }
}

// ---------- Écrans simples / fin ----------
function joueurRenderSimple(emoji, titre, texte) {
  $('#joueurContent').innerHTML = `
    <div class="joueur-simple">
      <div class="js-emoji">${emoji}</div>
      <h2>${titre}</h2>
      <p class="muted">${texte}</p>
    </div>`;
}

function joueurRenderFin() {
  const s = J.soiree;
  const hof = (s.hallOfFame || []).map(g => {
    const o = OBJECTIFS[g.objectif] || { label: g.objectif };
    return `<div class="hof-row"><b>${esc(g.nom || 'Mystère')}</b><span class="muted small">${o.label} · m.${g.manche}</span></div>`;
  }).join('');
  $('#joueurContent').innerHTML = `
    <div class="joueur-simple fin">
      <h2>Merci d'avoir joué, ${esc(J.nom)} ! ❤️</h2>
      ${hof ? `<div class="joueur-hof"><b>🏆 Hall of Fame</b>${hof}</div>` : ''}
      ${J.invite ? `
        <button class="btn primary big" onclick="joueurNudgeCompte()">👤 Créer mon compte pour garder mes stats</button>
        <p class="muted small">Avec un compte, tes victoires te suivent à toutes les soirées — et tu peux
        personnaliser tes jetons ✨</p>` : ''}
      <button class="btn ghost" onclick="joueurQuitter()">Quitter</button>
    </div>`;
}

function joueurNudgeCompte() {
  try { localStorage.removeItem('biiingo_joueur'); } catch (e) {}
  location.href = location.pathname; // écran de connexion → « créer un compte »
}

// ---------- Bandeau de l'animateur ----------
function joueurRenderBandeau() {
  const s = J.soiree;
  const b = (s && s.bandeau) || {};
  const visible = !!b.texte && (s.etat === 'entracte' || s.etat === 'fin' || (s.etat === 'tirage' && b.actif));
  const el = $('#joueurBandeau');
  if (!el) return;
  el.classList.toggle('show', visible);
  if (visible && el.dataset.txt !== b.texte) {
    el.dataset.txt = b.texte;
    const seg = `${esc(b.texte)}<span class="bandeau-sep">✦</span>`;
    el.innerHTML = `<div class="bandeau-piste"><span>${seg}</span><span>${seg}</span></div>`;
  } else if (!visible) { el.dataset.txt = ''; el.innerHTML = ''; }
}
