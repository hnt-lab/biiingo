// Connexion / création de compte MC (email + mot de passe).

function initAuth() {
  fauth.onAuthStateChanged(async (user) => {
    S.user = user;
    if (!user) { showScreen('authScreen'); return; }
    try {
      const d = await db.collection('users').doc(user.uid).get();
      S.profile = d.exists ? d.data() : { pseudo: user.email.split('@')[0] };
    } catch (e) {
      S.profile = { pseudo: user.email ? user.email.split('@')[0] : 'MC' };
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
