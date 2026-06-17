// Écran de salle (PC + projecteur + sono). PASSIF : affiche l'état de la soirée et joue les sons.

let salleEtatAffiche = null; // dernier état rendu (pour reconstruire uniquement quand ça change)
let salleQrUrl = null;

// Préparation de l'affichage. gesture = vrai si on arrive via un clic (autorise plein écran + son direct)
function salleOpenInit(gesture) {
  salleEtatAffiche = null;
  salleQrUrl = null;
  if (gesture) salleReadyClick();
  salleUpdateReadyBtn();
}

// Bouton flottant « 🔊 Plein écran & son » : nécessaire après un F5 (le navigateur exige un clic)
function salleReadyClick() {
  Sons.unlock();
  try { document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {}
  try { if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(() => {}); } catch (e) {}
  // Si l'accueil est affiché, la musique d'attente démarre dès que le son est débloqué
  setTimeout(() => { if (S.soiree && S.soiree.etat === 'accueil') Sons.startLoop('attente'); }, 250);
  salleUpdateReadyBtn();
}

function salleUpdateReadyBtn() {
  const b = $('#salleReady');
  if (!b) return;
  b.classList.toggle('hide', Sons.unlocked);
  if (Sons.unlocked) { b.classList.remove('alerte'); b.innerHTML = '🔊 Plein écran &amp; son'; }
}

// Garde-fou : un son devait jouer mais l'écran n'a pas encore été cliqué → alerte bien visible
Sons.onBlocked = function () {
  const b = $('#salleReady');
  if (!b || Sons.unlocked) return;
  b.classList.remove('hide');
  b.classList.add('alerte');
  b.textContent = '🔇 Cliquez ici pour activer le son !';
};

// Bouton ⛶ (visible au survol, comme le ✕) : remettre/quitter le plein écran à tout moment
function salleToggleFs() {
  try {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  } catch (e) {}
}
document.addEventListener('fullscreenchange', () => {
  const b = $('#salleFs');
  if (b) b.title = document.fullscreenElement ? 'Quitter le plein écran' : 'Plein écran';
});

function salleQuit() {
  confirmAction('Quitter l\'affichage de la salle ?', 'Quitter', 'quitSoiree()');
}

function renderSalle(s, prev) {
  // ----- Réglages son pilotés depuis la télécommande -----
  const son = s.son || {};
  Sons.enabled = !son.mute;
  Sons.setVolume(typeof son.volume === 'number' ? son.volume : 0.85);
  if (s.etat !== 'tirage') $('#salleScreen').classList.remove('mode-lose');

  // ----- Sons & détection des nouveautés -----
  const lose = s.objectif === 'lose';
  if (!prev && s.etat === 'accueil') Sons.startLoop('attente'); // arrivée directe sur l'accueil
  if (prev) {
    // Numéro tiré : en mode lose, son d'élimination (sinon le son de tirage)
    if (s.etat === 'tirage' && s.tires.length > (prev.tires ? prev.tires.length : 0)) {
      Sons.play(lose && Sons.has('elimination') ? 'elimination' : 'tirage');
    }
    if (s.etat === 'entracte' && prev.etat !== 'entracte') Sons.play('entracte');
    // Reprise de la partie après l'entracte (son dédié, sinon le son d'entracte)
    if (s.etat === 'tirage' && prev.etat === 'entracte') Sons.play(Sons.has('reprise') ? 'reprise' : 'entracte');
    // Début de soirée : on quitte l'accueil pour la 1re manche
    if (s.etat === 'tirage' && prev.etat === 'accueil' && s.manche === 1 && s.tires.length <= 1) Sons.play('debut');
    // Fin de soirée
    if (s.etat === 'fin' && prev.etat !== 'fin') Sons.play('fin');
    // Musique d'attente : boucle tant que l'écran d'accueil est affiché
    if (s.etat === 'accueil' && prev.etat !== 'accueil') Sons.startLoop('attente');
    if (s.etat !== 'accueil' && prev.etat === 'accueil') Sons.stopLoop('attente');
    const pc = (prev.verification && prev.verification.coches) || [];
    const nc = (s.verification && s.verification.coches) || [];
    if (nc.length > pc.length) {
      const nouveau = nc[nc.length - 1];
      Sons.play(s.tires.includes(nouveau) ? 'valid' : 'rate');
    }
    const pSusp = prev.etat === 'verification' && prev.verification && prev.verification.suspense && !prev.verification.verdict;
    const nSusp = s.etat === 'verification' && s.verification && s.verification.suspense && !s.verification.verdict;
    if (nSusp && !pSusp) Sons.startLoop('suspense');
    if (!nSusp && pSusp) Sons.stopLoop('suspense');
    const pv = (prev.verification && prev.verification.verdict) || '';
    const nv = (s.verification && s.verification.verdict) || '';
    if (nv && nv !== pv) {
      Sons.stopLoop('suspense');
      Sons.play(nv === 'gagne' ? 'gagne' : 'fauxbingo');
    }
  }

  // ----- Rendu -----
  const c = $('#salleContent');
  const rebuilt = salleEtatAffiche !== s.etat;
  salleEtatAffiche = s.etat;

  if (rebuilt && s.etat !== 'verification') AnimVerdict.stop();

  if (s.etat === 'accueil') c.innerHTML = salleAccueilHtml(s);
  else if (s.etat === 'tirage') renderSalleTirage(s, prev, rebuilt);
  else if (s.etat === 'verification') {
    // On ne reconstruit l'écran que si la vérification a changé (sinon l'animation serait coupée)
    const vNow = JSON.stringify(s.verification || {});
    const vPrev = prev ? JSON.stringify(prev.verification || {}) : null;
    if (rebuilt || vNow !== vPrev) {
      const pv = (prev && prev.verification && prev.verification.verdict) || '';
      const nv = (s.verification && s.verification.verdict) || '';
      const type = nv === 'gagne' ? 'gagne' : 'faux';
      if (nv && nv !== pv) AnimVerdict.choisir(type, s);
      if (!nv) AnimVerdict.stop();
      c.innerHTML = salleVerifHtml(s);
      if (nv && nv !== pv) AnimVerdict.run(type, s);
    }
  }
  else if (s.etat === 'entracte') c.innerHTML = salleEntracteHtml(s);
  else if (s.etat === 'fin') { c.innerHTML = salleFinHtml(s); salleMakeQr(s); }

  renderBandeau(s);
  salleUpdateReadyBtn();
}

// ---------- État : ACCUEIL ----------
function salleAccueilHtml(s) {
  const e = (s.ecrans && s.ecrans.accueil) || {};
  return `
  <div class="salle-center salle-accueil">
    ${e.photo ? `<img class="salle-photo" src="${escAttr(e.photo)}" alt="">` : ''}
    <h1 class="salle-titre-event">${esc(s.titre)}</h1>
    <p class="salle-soustitre">${e.texte ? esc(e.texte) : 'Ça commence bientôt… ✨'}</p>
    <div class="salle-dots"><span></span><span></span><span></span></div>
  </div>`;
}

// ---------- État : TIRAGE ----------
function renderSalleTirage(s, prev, rebuilt) {
  const c = $('#salleContent');
  if (rebuilt) {
    let cells = '';
    for (let n = 1; n <= NB_NUMEROS; n++) cells += `<div class="cell" id="cell${n}">${n}</div>`;
    c.innerHTML = `
    <div class="salle-tirage">
      <div class="salle-haut">
        <div class="salle-manche" id="salleManche"></div>
        <div class="salle-compteur-chip" id="salleCompteur"></div>
      </div>
      <div class="salle-corps">
        <div class="salle-grille" id="salleGrille">${cells}</div>
        <div class="salle-side">
          <div class="side-deco" id="decoHaut"></div>
          <div class="side-centre">
            <div class="dernier-label" id="dernierLabel">Dernier numéro</div>
            <div class="dernier-num" id="dernierNum">—</div>
            <div class="histo" id="histoNums"></div>
          </div>
          <div class="side-deco" id="decoBas"></div>
        </div>
      </div>
    </div>`;
  }
  const obj = OBJECTIFS[s.objectif] || OBJECTIFS.quine;
  const lose = s.objectif === 'lose';

  // Thème « battle royale » quand l'objectif est la partie de la lose
  $('#salleScreen').classList.toggle('mode-lose', lose);
  $('#dernierLabel').textContent = lose ? 'Numéro fatal' : 'Dernier numéro';
  $('#salleManche').innerHTML = lose
    ? `Manche ${s.manche} &nbsp;·&nbsp; <b>💀 ${obj.label}</b> <span class="obj-detail">(le dernier debout gagne)</span>`
    : `Manche ${s.manche} &nbsp;·&nbsp; <b>${obj.label}</b> <span class="obj-detail">(${obj.detail})</span>`;
  $('#salleCompteur').textContent = `${s.tires.length} / ${NB_NUMEROS}`;

  const deco = s.deco || {};
  salleSetDeco('decoHaut', deco.haut);
  salleSetDeco('decoBas', deco.bas);

  const prevTires = (prev && prev.tires) || [];
  let nouveauNum = null;
  for (let n = 1; n <= NB_NUMEROS; n++) {
    const cell = $('#cell' + n);
    if (!cell) continue;
    const lit = s.tires.includes(n);
    const wasLit = !rebuilt && prevTires.includes(n);
    cell.classList.toggle('lit', lit);
    if (lit && !wasLit) {
      cell.classList.remove('pop'); void cell.offsetWidth; cell.classList.add('pop');
      if (!rebuilt) nouveauNum = n;
    }
  }

  const last = s.tires.length ? s.tires[s.tires.length - 1] : null;
  const dn = $('#dernierNum');
  dn.textContent = last == null ? '—' : last;
  if (last != null && (!prev || (prev.tires || []).length !== s.tires.length || rebuilt)) {
    dn.classList.remove('bump'); void dn.offsetWidth; dn.classList.add('bump');
  }

  // 5 derniers numéros tirés (hors le tout dernier, déjà affiché en grand)
  const histo = s.tires.slice(0, -1).slice(-5).reverse();
  $('#histoNums').innerHTML = histo.map(n => `<span class="histo-num">${n}</span>`).join('');

  // Mode lose : coup de couperet sur le numéro fatal qui vient de sortir
  if (lose && nouveauNum != null) salleFlashElim(nouveauNum);
}

// Flash d'élimination plein écran (mode « partie de la lose »)
function salleFlashElim(n) {
  const host = document.querySelector('.salle-tirage');
  if (!host) return;
  const old = host.querySelector('.elim-flash');
  if (old) old.remove();
  const f = document.createElement('div');
  f.className = 'elim-flash';
  f.innerHTML = `<div class="elim-num">${n}</div><div class="elim-txt">ÉLIMINÉ·E !</div>`;
  host.appendChild(f);
  setTimeout(() => { if (f.isConnected) f.remove(); }, 2200);
}

function salleSetDeco(id, photo) {
  const el = $('#' + id);
  if (!el) return;
  const cur = el.dataset.photo || '';
  if (cur === (photo || '')) return;
  el.dataset.photo = photo || '';
  el.innerHTML = photo ? `<img src="${escAttr(photo)}" alt="">` : '';
}

// ---------- État : VÉRIFICATION ----------
function salleVerifHtml(s) {
  const v = s.verification || {};
  const coches = v.coches || [];
  const chips = coches.map(n =>
    `<span class="verif-chip ${s.tires.includes(n) ? 'ok' : 'ko'}">${n}</span>`).join('');
  const animCls = v.verdict ? 'anim-' + AnimVerdict.styleCourant : '';
  let verdict = '';
  if (v.verdict === 'gagne') {
    verdict = `<div class="verdict gagne ${animCls}"><div class="verdict-big">GAGNÉ&nbsp;!&nbsp;✨</div>
      ${v.gagnantNom ? `<div class="verdict-nom">Bravo ${esc(v.gagnantNom)} 💖</div>` : '<div class="verdict-nom">Bravo ! 💖</div>'}</div>`;
  } else if (v.verdict === 'faux') {
    verdict = `<div class="verdict faux ${animCls}"><div class="verdict-big">FAUX BINGO&nbsp;💋</div>
      <div class="verdict-nom">Il était moins une…</div></div>`;
  }
  return `
  <div class="salle-center salle-verif ${v.suspense && !v.verdict ? 'suspense' : ''} ${animCls}">
    ${verdict || `
      <h1 class="verif-titre">${v.suspense ? '🥁 Vérification en cours…' : '🔍 Vérification'}</h1>
      <div class="verif-chips">${chips || '<span class="muted">On vérifie le carton…</span>'}</div>`}
  </div>`;
}

// ---------- État : ENTRACTE ----------
function salleEntracteHtml(s) {
  const e = s.entracte || {};
  const fond = s.entracteFond
    ? ` style="background-image:linear-gradient(rgba(26,20,38,.78),rgba(26,20,38,.78)),url(${s.entracteFond});background-size:cover;background-position:center"`
    : '';
  return `
  <div class="salle-center salle-entracte"${fond}>
    <div class="entracte-tag">🎭 Entracte</div>
    ${e.photo ? `<img class="salle-photo grande" src="${escAttr(e.photo)}" alt="">` : ''}
    <h1 class="entracte-nom">${esc(e.nom || 'Place au spectacle !')}</h1>
    ${e.message ? `<p class="entracte-msg">${esc(e.message)}</p>` : ''}
  </div>`;
}

// ---------- État : FIN ----------
function salleFinHtml(s) {
  const e = (s.ecrans && s.ecrans.fin) || {};
  const hof = s.hallOfFame || [];
  const hofHtml = hof.length ? `
    <div class="hof">
      <h2>🏆 Hall of Fame de la soirée</h2>
      <div class="hof-list">
        ${hof.map(g => {
          const obj = OBJECTIFS[g.objectif] || { label: g.objectif };
          return `<div class="hof-item"><span class="hof-nom">${esc(g.nom || 'Mystère')}</span>
                  <span class="hof-obj">${obj.label} · manche ${g.manche}</span></div>`;
        }).join('')}
      </div>
    </div>` : '';
  const liens = (e.liens || []).map(l =>
    `<div class="fin-lien">${esc(l.label)}${l.label && l.url ? ' · ' : ''}${esc(l.url)}</div>`).join('');
  return `
  <div class="salle-center salle-fin">
    <h1 class="salle-titre-event">${e.texte ? esc(e.texte) : 'Merci à toutes et tous ! ❤️'}</h1>
    ${hofHtml}
    <div class="fin-bas">
      <div class="fin-liens">${liens}</div>
      ${e.qrUrl ? '<div id="qrBox" class="qr-box"></div>' : ''}
    </div>
  </div>`;
}

function salleMakeQr(s) {
  const e = (s.ecrans && s.ecrans.fin) || {};
  if (!e.qrUrl || !window.QRCode) return;
  const box = $('#qrBox');
  if (!box) return;
  if (salleQrUrl === e.qrUrl && box.childNodes.length) return;
  salleQrUrl = e.qrUrl;
  box.innerHTML = '';
  try {
    new QRCode(box, { text: e.qrUrl, width: 140, height: 140, colorDark: '#1a1426', colorLight: '#ffffff' });
  } catch (err) {}
}

// ---------- Bandeau défilant ----------
function renderBandeau(s) {
  const b = s.bandeau || {};
  const visible = !!b.texte && (s.etat === 'entracte' || (s.etat === 'tirage' && b.actif));
  const el = $('#salleBandeau');
  el.classList.toggle('show', visible);
  $('#salleScreen').classList.toggle('bandeau-on', visible); // réserve la place (la grille n'est plus recouverte)
  if (visible) {
    const txt = esc(b.texte);
    if (el.dataset.txt !== b.texte) {
      el.dataset.txt = b.texte;
      el.innerHTML = `<div class="bandeau-piste"><span>${txt}</span><span>${txt}</span></div>`;
    }
  } else {
    el.dataset.txt = '';
    el.innerHTML = '';
  }
}
