// Visite guidée pas à pas : un concept par écran, pour les utilisateurs pressés.
// S'ouvre automatiquement à la première visite, puis via ❓ (accueil) ou ⚙️ Soirée → Revoir le tutoriel.

const TUTO_STEPS = [
  {
    visu: '<div class="tg-scene">🖥<span class="tg-fleche">⇄</span>📱</div>',
    titre: 'Bienvenue sur Biiingo !',
    texte: 'Le principe est simple : <b>l\'ordinateur de la salle affiche</b> le tableau géant, et <b>vous pilotez tout depuis vos téléphones</b>. Tout est synchronisé en direct.'
  },
  {
    visu: `<div class="tg-scene"><span class="btn primary tg-btn">📱 Animer</span><span class="btn tg-btn">🖥 Afficher</span></div>`,
    titre: 'Ouvrir la soirée',
    texte: 'Sur ton téléphone : « ➕ Nouvelle soirée » puis <b>📱 Animer</b>.<br>Sur le PC branché au projecteur : la même soirée → <b>🖥 Afficher</b>. Et voilà, la salle voit le tableau.'
  },
  {
    visu: '<div class="tg-scene"><span class="tg-code">BZUM</span></div>',
    titre: 'Inviter les autres MC',
    texte: 'Le <b>code 4 lettres</b> (en haut à droite de la télécommande) permet aux autres MC de rejoindre avec leur propre compte : « 🔑 Rejoindre avec un code ». <b>Tout le monde peut taper en même temps.</b>'
  },
  {
    visu: `<div class="tg-scene tg-grille">
      <span class="tg-cell lit">7</span><span class="tg-cell">8</span><span class="tg-cell lit">9</span>
      <span class="tg-cell">10</span><span class="tg-cell lit">11</span><span class="tg-cell">12</span>
    </div>`,
    titre: 'Tirer les numéros',
    texte: 'La boule sort du boulier → <b>un tap sur le numéro</b> → il s\'illumine en salle avec son et animation.<br>Doigt qui glisse ? <b>Re-tap</b> sur le numéro : on te demande confirmation pour l\'annuler.'
  },
  {
    visu: '<div class="tg-scene">🎯 ➡️</div>',
    titre: 'Objectif & manches',
    texte: '« 🎯 Objectif » : <b>Quine</b> (1 ligne), <b>Double quine</b> (2 lignes) ou <b>Carton plein</b> — changeable à tout moment, la salle l\'affiche.<br>« ➡️ Manche suiv. » : la grille repart à zéro pour la manche suivante.'
  },
  {
    visu: `<div class="tg-scene"><span class="tg-cell coche-ok">23</span><span class="tg-cell coche-ok">41</span><span class="tg-cell coche-ko">67</span></div>`,
    titre: 'Quelqu\'un crie « Quine ! »',
    texte: 'Onglet <b>🔍 Vérif</b> → lance la vérification (avec le suspense si tu veux 🥁) → <b>tape les numéros de SON carton</b> : vert = sorti, rouge = pas sorti…<br>Verdict : <b>✨ GAGNÉ</b> (avec son nom pour le Hall of Fame) ou <b>💋 Faux bingo</b>. Après un gagné, l\'objectif passe tout seul au suivant.'
  },
  {
    visu: '<div class="tg-scene">🎭 ▶</div>',
    titre: 'Place au spectacle !',
    texte: 'Onglet <b>🎭 Entracte</b> : lance un numéro de ton programme (nom + photo de l\'artiste à l\'écran, fond personnalisable).<br>Le show est fini ? « <b>▶ Reprendre la partie</b> » — la grille revient comme avant.'
  },
  {
    visu: '<div class="tg-scene">✏️ 📢 🔊 💾</div>',
    titre: 'Tout est personnalisable',
    texte: 'Onglet <b>✏️ Édition</b> : tes artistes et leurs photos, le <b>bandeau défilant</b>, les écrans d\'accueil et de fin (avec QR code), la déco du tableau, et même <b>tous les sons</b>.<br>Sauve le tout en <b>💾 préset</b> pour le retrouver à la prochaine soirée.'
  },
  {
    visu: '<div class="tg-scene">🔊 📲</div>',
    titre: 'Deux derniers détails',
    texte: 'Le <b>son sort de l\'écran de salle</b> (le PC branché à la sono) — si un bouton rose « 🔊 Plein écran &amp; son » apparaît, un clic et c\'est réglé.<br>Et tu peux <b>installer Biiingo comme une appli</b> : menu du navigateur → « Ajouter à l\'écran d\'accueil ».<br><br>Pour revoir ce guide : <b>❓</b> à l\'accueil ou onglet <b>⚙️ Soirée</b>.'
  }
];

let tutoStep = 0;

function maybeShowTuto() {
  let vu = false;
  try { vu = !!localStorage.getItem('biiingo_tuto_vu'); } catch (e) {}
  if (!vu) tutoModal();
}

function tutoModal() {
  try { localStorage.setItem('biiingo_tuto_vu', '1'); } catch (e) {}
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
