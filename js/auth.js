// Connexion / création de compte MC (email + mot de passe).

function initAuth() {
  fauth.onAuthStateChanged(async (user) => {
    S.user = user;

    // ----- Parcours JOUEUR / ÉCRAN PUBLIC -----
    let jSess = null, dSess = null;
    try { jSess = JSON.parse(localStorage.getItem('biiingo_joueur') || 'null'); } catch (e) {}
    try { dSess = JSON.parse(localStorage.getItem('biiingo_display') || 'null'); } catch (e) {}

    if (!user) {
      // Écran public (?display=CODE ou session TV) : connexion anonyme invisible puis affichage
      if (window.__displayCode || (dSess && dSess.code)) {
        fauth.signInAnonymously().catch(() => {
          showScreen('loadScreen');
          $('#loadMsg').textContent = 'Connexion impossible — vérifie le réseau puis recharge.';
        });
        return; // le listener se redéclenchera avec l'utilisateur anonyme
      }
      if (window.__joinCode) { joueurInit(window.__joinCode); return; } // écran « rejoindre »
      showScreen('authScreen');
      return;
    }

    if (user.isAnonymous) {
      // Écran public d'abord (prioritaire sur le parcours joueur)
      if (window.__displayCode) { displayEnter(window.__displayCode); return; }
      if (dSess && dSess.code && !window.__joinCode) { displayEnter(dSess.code); return; }
      // Un invité : reprise de partie si session, sinon écran rejoindre, sinon on nettoie
      if (window.__joinCode && !jSess) { joueurInit(window.__joinCode); return; }
      if (jSess && jSess.code) {
        J.code = (window.__joinCode || jSess.code).toUpperCase();
        joueurEntrer(jSess.nom || 'Invité·e', true).catch(() => { showScreen('joinScreen'); });
        return;
      }
      fauth.signOut(); // anonyme orphelin → retour connexion
      return;
    }

    // Compte normal arrivé par un lien d'affichage : on lance l'écran public aussi
    if (window.__displayCode) { displayEnter(window.__displayCode); return; }

    // ----- Compte normal -----
    try {
      const d = await db.collection('users').doc(user.uid).get();
      S.profile = d.exists ? d.data() : { pseudo: user.email.split('@')[0] };
    } catch (e) {
      S.profile = { pseudo: user.email ? user.email.split('@')[0] : 'MC' };
    }

    // Il venait rejoindre une soirée en tant que joueur AVEC son compte ?
    let pending = null;
    try { pending = localStorage.getItem('biiingo_pending_join'); } catch (e) {}
    const joinCode = pending || window.__joinCode || (jSess && !jSess.invite ? jSess.code : null);
    if (joinCode) {
      try { localStorage.removeItem('biiingo_pending_join'); } catch (e) {}
      J.code = joinCode.toUpperCase();
      joueurEntrer(S.profile.pseudo || 'Joueur·se', false).catch(() => { showScreen('joinScreen'); });
      return;
    }

    // Après un F5 : retour direct là où on était (écran de salle ou télécommande)
    let sess = null;
    try { sess = JSON.parse(localStorage.getItem('biiingo_session') || 'null'); } catch (e) {}
    if (sess && sess.id) {
      openSoiree(sess.id, sess.mode === 'salle' ? 'salle' : 'mc', false);
    } else {
      renderHome();
      maybeShowTuto();
    }
  });
}

function authToggleMode(signup) {
  $('#authSignupFields').style.display = signup ? '' : 'none';
  $('#authLoginBtn').style.display = signup ? 'none' : '';
  $('#authSignupBtn').style.display = signup ? '' : 'none';
  $('#authToSignup').style.display = signup ? 'none' : '';
  $('#authToLogin').style.display = signup ? '' : 'none';
  $('#authError').textContent = '';
}

function authMessage(code) {
  const m = {
    'auth/invalid-email': 'Cet email ne semble pas valide.',
    'auth/user-not-found': 'Aucun compte avec cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/email-already-in-use': 'Un compte existe déjà avec cet email.',
    'auth/weak-password': 'Le mot de passe doit faire au moins 6 caractères.',
    'auth/network-request-failed': 'Pas de connexion internet.'
  };
  return m[code] || 'Une erreur est survenue. Réessaie.';
}

async function doLogin() {
  const email = $('#authEmail').value.trim();
  const pwd = $('#authPwd').value;
  if (!email || !pwd) { $('#authError').textContent = 'Remplis l\'email et le mot de passe.'; return; }
  try {
    await fauth.signInWithEmailAndPassword(email, pwd);
  } catch (e) {
    $('#authError').textContent = authMessage(e.code);
  }
}

async function doSignup() {
  const pseudo = $('#authPseudo').value.trim();
  const email = $('#authEmail').value.trim();
  const pwd = $('#authPwd').value;
  if (!pseudo) { $('#authError').textContent = 'Choisis un nom de scène / pseudo.'; return; }
  if (!email || !pwd) { $('#authError').textContent = 'Remplis l\'email et le mot de passe.'; return; }
  try {
    const cred = await fauth.createUserWithEmailAndPassword(email, pwd);
    await db.collection('users').doc(cred.user.uid).set({
      pseudo, email, createdAt: FV.serverTimestamp()
    });
  } catch (e) {
    $('#authError').textContent = authMessage(e.code);
  }
}

function doLogout() {
  if (S.unsub) { S.unsub(); S.unsub = null; }
  fauth.signOut();
}

// Mot de passe oublié : envoie l'email de réinitialisation Firebase
async function doResetPwd() {
  const email = $('#authEmail').value.trim();
  if (!email) {
    $('#authError').textContent = 'Écris d\'abord ton email dans le champ ci-dessus, puis re-clique.';
    return;
  }
  try {
    await fauth.sendPasswordResetEmail(email);
    $('#authError').textContent = '';
    modal(`
      <h3>📬 Email envoyé !</h3>
      <p class="modal-msg">Si un compte existe avec <b>${esc(email)}</b>, tu vas recevoir un email
      pour choisir un nouveau mot de passe (pense à vérifier les spams).</p>
      <div class="modal-btns"><button class="btn primary" onclick="closeModal()">OK</button></div>`);
  } catch (e) {
    $('#authError').textContent = authMessage(e.code);
  }
}
