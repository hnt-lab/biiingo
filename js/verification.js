// Vérification d'un carton annoncé (« Quine ! ») — 100% boutons, jamais de clavier.

function mcVerifHtml(s) {
  const v = s.verification || {};
  const lose = s.objectif === 'lose';

  // Verdict rendu → écran de reprise (commun)
  if (v.verdict) {
    const gagne = v.verdict === 'gagne';
    const txt = gagne
      ? (lose ? `🏆 Survivant·e${v.gagnantNom ? ' — ' + esc(v.gagnantNom) : ''} !` : `✨ GAGNÉ${v.gagnantNom ? ' — ' + esc(v.gagnantNom) : ''} !`)
      : (lose ? '💀 Éliminé·e — un numéro était sorti !' : '💋 Faux bingo !');
    return `
    <div class="verif-intro">
      <div class="verdict-mini ${gagne ? 'ok' : 'ko'}">${txt}</div>
      <button class="btn block primary big" onclick="verifEnd()">▶ Reprendre la partie</button>
    </div>`;
  }

  // Écran de lancement (pas de vérif en cours)
  if (!v.active) {
    const noms = Object.values(S.registre || {})
      .sort((a, b) => (b.victoires || 0) - (a.victoires || 0)).slice(0, 50);
    const datalist = noms.map(n => `<option value="${escAttr(n.nom)}"></option>`).join('');
    const intro = lose
      ? `<h3 class="mc-h3">💀 Vérifier le·a survivant·e</h3>
         <p class="muted">Mort subite : le·a survivant·e ne doit avoir <b>AUCUN</b> numéro sorti sur son carton.
         Lance la vérification, puis appuie sur les numéros de son carton :
         <span class="ok-txt">vert</span> = pas sorti (sauvé), <span class="ko-txt">rouge</span> = sorti (éliminé !).</p>`
      : `<h3 class="mc-h3">🔍 Vérifier un carton</h3>
         <p class="muted">Note son nom, lance la vérification, puis appuie sur les numéros de SON carton :
         <span class="ok-txt">vert</span> = sorti, <span class="ko-txt">rouge</span> = pas sorti…</p>`;
    return `
    <div class="verif-intro">
      ${intro}
      <label class="field"><span>Nom ${lose ? 'du·de la survivant·e' : 'du joueur'} (Hall of Fame — optionnel)</span>
        <input id="verifNom" type="text" maxlength="40" list="nomsConnus" placeholder="Jacqueline">
        <datalist id="nomsConnus">${datalist}</datalist></label>
      <label class="check-line">
        <input type="checkbox" id="verifSuspense" checked>
        <span>🥁 Mode suspense (ambiance + roulement à l'écran)</span>
      </label>
      <button class="btn block primary big" onclick="verifStart()">🔍 Lancer la vérification</button>
    </div>`;
  }

  // Vérification en cours → grille de pointage
  const coches = v.coches || [];
  const besoin = VERIF_BESOIN[s.objectif] || 5;
  const complet = coches.length >= besoin;
  // En mode lose, le danger c'est qu'un numéro pointé SOIT sorti (l'inverse du jeu normal)
  const nbSortis = coches.filter(n => s.tires.includes(n)).length;        // mauvais en lose
  const nbPasSortis = coches.length - nbSortis;                            // mauvais en normal
  let cells = '';
  for (let n = 1; n <= NB_NUMEROS; n++) {
    const tire = s.tires.includes(n);
    const coche = coches.includes(n);
    let cls;
    if (coche) {
      // normal : sorti = vert (ok) ; lose : sorti = rouge (éliminé)
      const bon = lose ? !tire : tire;
      cls = bon ? 'coche-ok' : 'coche-ko';
    } else if (lose) {
      // lose : on met en avant les numéros PAS encore tirés (les bons), on grise les sortis
      cls = tire ? 'lose-danger' : 'safe';
    } else {
      // normal : on met en avant les numéros sortis
      cls = tire ? 'tire' : '';
    }
    cells += `<button class="mc-cell verif ${cls}" onclick="verifTap(${n})">${n}</button>`;
  }
  const cible = v.gagnantNom ? ' de <b>' + esc(v.gagnantNom) + '</b>' : (lose ? ' du·de la survivant·e' : ' du joueur');

  // Bandeau d'action selon le mode
  let cta = '';
  if (lose) {
    if (nbSortis > 0) {
      cta = `<div class="verif-cta lose"><span>💀 ${nbSortis} numéro(s) sorti(s) — il·elle aurait dû perdre !</span>
        <button class="btn ko big" onclick="verifVerdictFaux()">Éliminé·e</button></div>`;
    } else if (complet) {
      cta = `<div class="verif-cta win"><span>✨ Carton complet, aucun numéro sorti !</span>
        <button class="btn ok big" onclick="verifConfirmGagne()">🏆 Survivant·e confirmé·e</button></div>`;
    }
  } else if (complet) {
    cta = nbPasSortis === 0
      ? `<div class="verif-cta win"><span>✨ Carton complet et tout est sorti !</span>
           <button class="btn ok big" onclick="verifConfirmGagne()">🏆 Valider la victoire</button></div>`
      : `<div class="verif-cta lose"><span>💋 ${nbPasSortis} numéro(s) pas sorti(s)…</span>
           <button class="btn ko big" onclick="verifVerdictFaux()">Faux bingo</button></div>`;
  }

  const bilan = lose
    ? `${coches.length} / ${besoin}${nbSortis ? ` · <span class="ko-txt">${nbSortis} sorti(s) !</span>` : ''}`
    : `${coches.length} / ${besoin}${nbPasSortis ? ` · <span class="ko-txt">${nbPasSortis} pas sorti(s) !</span>` : ''}`;
  return `
  <div class="mc-alerte">${v.suspense ? '🥁' : (lose ? '💀' : '🔍')} Appuie sur les numéros du carton${cible}
    <span class="verif-bilan ${complet ? 'complet' : ''}">${bilan}</span></div>
  ${cta}
  <div class="mc-grille ${complet ? 'verif-locked' : ''}">${cells}</div>
  <div class="mc-actions-row verdict-row">
    <button class="btn ghost" onclick="verifCancel()">✖ Annuler</button>
    <button class="btn ko" onclick="verifVerdictFaux()">${lose ? '💀 Éliminé' : '💋 Faux bingo'}</button>
    <button class="btn ok" onclick="verifConfirmGagne()">${lose ? '🏆 Survivant' : '✨ GAGNÉ'}</button>
  </div>`;
}

// Nombre de cases à pointer (quine 5, double 10, carton 15, lose = carton complet 15)
const VERIF_BESOIN = { quine: 5, double: 10, carton: 15, lose: 15 };

function verifStart() {
  const suspense = $('#verifSuspense').checked;
  const nom = (($('#verifNom') && $('#verifNom').value) || '').trim();
  soireeUpdate({
    etat: 'verification',
    verification: { active: true, suspense, coches: [], verdict: '', gagnantNom: nom }
  });
}

function verifTap(n) {
  const s = S.soiree;
  const v = s.verification || {};
  const coches = v.coches || [];
  if (coches.includes(n)) { soireeUpdate({ 'verification.coches': FV.arrayRemove(n) }); return; }
  const besoin = VERIF_BESOIN[s.objectif] || 5;
  if (coches.length >= besoin) {
    toast(`${besoin} cases suffisent pour ${(OBJECTIFS[s.objectif] || {}).label || 'cet objectif'} (retire-en une d'abord).`);
    return;
  }
  soireeUpdate({ 'verification.coches': FV.arrayUnion(n) });
}

function verifCancel() {
  soireeUpdate({ etat: 'tirage', verification: { active: false, suspense: false, coches: [], verdict: '', gagnantNom: '' } });
}

// Après un verdict : l'écran de salle garde l'animation ~7 s puis revient tout seul à la grille
const VERDICT_DUREE_MS = 7000;
let verdictTimer = null;
function verifProgrammerRetour() {
  clearTimeout(verdictTimer);
  verdictTimer = setTimeout(() => {
    if (S.soiree && S.soiree.verification && S.soiree.verification.verdict) verifEnd();
  }, VERDICT_DUREE_MS);
}

function verifVerdictFaux() {
  soireeUpdate({ 'verification.verdict': 'faux' });
  S.mcTab = 'tirage'; // le MC revient au tirage, l'écran joue l'animation puis revient seul
  verifProgrammerRetour();
}

// Objectif suivant après un gagné : quine → double quine → carton plein (la lose reste la lose)
const OBJECTIF_SUIVANT = { quine: 'double', double: 'carton', carton: 'carton', lose: 'lose' };

// GAGNÉ : le nom a été saisi avant la vérification → on valide directement
function verifConfirmGagne() {
  const s = S.soiree;
  const nom = (s.verification && s.verification.gagnantNom || '').trim();
  const entry = { nom, objectif: s.objectif, manche: s.manche, ts: Date.now() };
  const patch = {
    'verification.verdict': 'gagne',
    'verification.gagnantNom': nom,
    hallOfFame: FV.arrayUnion(entry)
  };
  const suivant = OBJECTIF_SUIVANT[s.objectif] || 'quine';
  if (s.objectif === 'lose') {
    toast('Survivant·e enregistré·e ! 💀🏆');
  } else if (suivant !== s.objectif) {
    patch.objectif = suivant;
    toast('Objectif suivant : ' + OBJECTIFS[suivant].label + ' 🎯');
  } else {
    toast('Carton plein remporté — « Manche suiv. » quand vous voulez ! 🏆');
  }
  soireeUpdate(patch);
  if (nom) saveWinnerToRegistre(nom);
  S.mcTab = 'tirage'; // retour direct au tirage côté animateur (demande utilisateur)
  verifProgrammerRetour();
}

function verifEnd() {
  soireeUpdate({ etat: 'tirage', verification: { active: false, suspense: false, coches: [], verdict: '', gagnantNom: '' } });
}
