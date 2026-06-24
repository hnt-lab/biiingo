// Visite guidée pas à pas : un concept par écran. Couvre toutes les fonctionnalités.
// S'ouvre automatiquement à la première visite, puis via ❓ (accueil) ou ⚙️ Soirée → Revoir le tutoriel.

const TUTO_STEPS = [
  {
    visu: '<div class="tg-scene">🖥<span class="tg-fleche">⇄</span>📱</div>',
    titre: 'Bienvenue sur Biiingo !',
    texte: 'Le principe : <b>l\'ordinateur de la salle affiche</b> le tableau géant, et <b>vous pilotez tout depuis vos téléphones</b>. Tout est synchronisé en direct — ce que vous tapez apparaît à l\'écran en une seconde.'
  },
  {
    visu: `<div class="tg-scene"><span class="btn primary tg-btn">📱 Animer</span><span class="btn tg-btn">🖥 Afficher</span>&nbsp;<span class="tg-code">BZUM</span></div>`,
    titre: 'Lancer une soirée',
    texte: 'Sur ton téléphone : « ➕ Nouvelle soirée » → <b>📱 Animer</b>. Sur le PC du projecteur : la même soirée → <b>🖥 Afficher</b>.<br>Le <b>code 4 lettres</b> (en haut de la télécommande) permet aux autres MC de rejoindre avec leur compte — <b>tout le monde peut taper en même temps</b>.'
  },
  {
    visu: `<div class="tg-scene tg-grille">
      <span class="tg-cell lit">7</span><span class="tg-cell">8</span><span class="tg-cell lit">9</span>
      <span class="tg-cell">10</span><span class="tg-cell lit">11</span><span class="tg-cell">12</span>
    </div>`,
    titre: 'Tirer les numéros',
    texte: 'La boule sort du boulier → <b>un tap</b> sur le numéro → il s\'illumine en salle avec son et animation, et s\'affiche en grand.<br>Doigt qui glisse ? <b>Re-tap</b> sur le numéro pour l\'annuler (avec confirmation).'
  },
  {
    visu: `<div class="tg-scene">1️⃣ 2️⃣ 🏆 <span class="tg-cell lose">💀</span></div>`,
    titre: 'Les objectifs',
    texte: '« 🎯 Objectif » : <b>Quine</b> (1 ligne) → <b>Double quine</b> (2 lignes) → <b>Carton plein</b>, changeable à tout moment.<br>Et le mode <b>💀 Partie de la lose</b> (mort subite) : dès qu\'un numéro sort, ceux qui l\'ont sont éliminés — le tableau passe en rouge, le·a dernier·e debout gagne !'
  },
  {
    visu: `<div class="tg-scene"><span class="tg-cell coche-ok">23</span><span class="tg-cell coche-ok">41</span><span class="tg-cell coche-ko">67</span></div>`,
    titre: 'La vérification',
    texte: 'Onglet <b>🔍 Vérif</b> → note le nom, lance (avec 🥁 suspense si tu veux), puis <b>tape les numéros du carton</b> : <span class="ok-txt">vert</span> = bon, <span class="ko-txt">rouge</span> = problème. Tu ne pointes que le nombre requis, et <b>re-taper corrige</b>.<br>Au bon compte, un <b>bouton de validation surgit en bas</b>. En mort subite, la logique s\'inverse : on vérifie que le carton n\'a <b>aucun</b> numéro sorti.'
  },
  {
    visu: '<div class="tg-scene">🎭 ▶</div>',
    titre: 'Place au spectacle !',
    texte: 'Onglet <b>🎭 Entracte</b> : lance un numéro de ton programme (nom + photo de l\'artiste, fond d\'écran personnalisable).<br>Show fini ? « <b>▶ Reprendre la partie</b> » — la grille revient exactement comme avant.'
  },
  {
    visu: '<div class="tg-scene">🏆 📜 🔗</div>',
    titre: 'Hall of Fame & écran de fin',
    texte: 'Chaque gagnant·e validé·e entre au <b>🏆 Hall of Fame</b> (les habitué·e·s sont reconnu·e·s d\'une soirée à l\'autre). Sur l\'<b>écran de fin</b> : remerciements, hall of fame qui défile, vos <b>liens réseaux</b> et un <b>QR code</b> à scanner.'
  },
  {
    visu: '<div class="tg-scene tg-flow">🏠→🎲→🔍→🎭→🏆</div>',
    titre: 'Tout personnaliser (✏️ Édition)',
    texte: 'L\'onglet <b>✏️ Édition</b> suit l\'ordre d\'une soirée : <b>Accueil</b> → <b>Partie</b> (déco + bandeau) → <b>Vérif</b> (animations de victoire avec tes images) → <b>Entracte</b> → <b>Fin</b>.<br>Tout se sauve en <b>💾 préset</b> pour retrouver tes réglages la prochaine fois.'
  },
  {
    visu: '<div class="tg-scene">🔊 🎚️ 🔇</div>',
    titre: 'Le son',
    texte: 'Les sons sortent de <b>l\'écran de salle</b> (le PC branché à la sono). Si un bouton rose « 🔊 Activer le son » apparaît, <b>un clic</b> et c\'est réglé.<br>Dans <b>⚙️ Soirée</b> : couper le son ou régler le volume. Dans <b>✏️ Édition → 🔊</b> : remplacer un son, ou en couper un seul (ex. le tirage trop répétitif).'
  },
  {
    visu: '<div class="tg-scene">📲 🔄</div>',
    titre: 'Installer & rester à jour',
    texte: 'Tu peux <b>installer Biiingo comme une appli</b> : menu du navigateur → « Ajouter à l\'écran d\'accueil ».<br>Le bouton <b>🔄</b> (en haut de l\'accueil ou dans ⚙️ Soirée) force la <b>mise à jour</b> vers la dernière version.<br><br>Pour revoir ce guide : <b>❓</b> à l\'accueil ou <b>⚙️ Soirée → 📖</b>.'
  }
];

let tutoStep = 0;

// Clé versionnée : en la changeant, le tuto refait se réaffiche une fois à tout le monde
const TUTO_KEY = 'biiingo_tuto_vu_v2';

function maybeShowTuto() {
  let vu = false;
  try { vu = !!localStorage.getItem(TUTO_KEY); } catch (e) {}
  if (!vu) tutoModal();
}

function tutoModal() {
  try { localStorage.setItem(TUTO_KEY, '1'); } catch (e) {}
  tutoStep = 0;
  tutoRender();
}

function tutoRender() {
  const total = TUTO_STEPS.length;
  const s = TUTO_STEPS[tutoStep];
  const dernier = tutoStep === total - 1;
  const dots = TUTO_STEPS.map((_, i) =>
    `<span class="tg-dot ${i === tutoStep ? 'on' : ''}" onclick="tutoGoTo(${i})"></span>`).join('');
  modal(`
    <div class="tg-etape">${tutoStep + 1} / ${total}</div>
    ${s.visu}
    <h3 class="tg-titre">${s.titre}</h3>
    <p class="tg-texte">${s.texte}</p>
    <div class="tg-dots">${dots}</div>
    <div class="modal-btns tg-btns">
      ${tutoStep > 0
        ? '<button class="btn ghost" onclick="tutoGoTo(' + (tutoStep - 1) + ')">← Précédent</button>'
        : '<button class="btn ghost" onclick="closeModal()">Passer</button>'}
      ${dernier
        ? '<button class="btn primary big" onclick="closeModal()">C\'est parti ! ✨</button>'
        : '<button class="btn primary" onclick="tutoGoTo(' + (tutoStep + 1) + ')">Suivant →</button>'}
    </div>`);
}

function tutoGoTo(i) {
  tutoStep = Math.max(0, Math.min(TUTO_STEPS.length - 1, i));
  tutoRender();
}
