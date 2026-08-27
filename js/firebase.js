// Initialisation Firebase (Auth + Firestore temps réel).
// ⚠️ FIREBASE_CONFIG est rempli à l'étape d'installation (guide _setup/GUIDE_INSTALLATION.md).

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDnwT3sAag_y2oypV6uuG7whkEOoZWHB_U",
  authDomain: "biiingo.firebaseapp.com",
  projectId: "biiingo",
  storageBucket: "biiingo.firebasestorage.app",
  messagingSenderId: "295717643522",
  appId: "1:295717643522:web:d3ead2435ba1e6956a8e1b"
};

let db = null;
let fauth = null;
let FV = null; // FieldValue (arrayUnion, arrayRemove, increment, serverTimestamp)

function firebaseConfigured() {
  return !!(FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
}

function initFirebase() {
  if (!firebaseConfigured()) return false;
  const emulatorOptions = window.__BIIINGO_EMULATORS;
  const useEmulators = !!emulatorOptions &&
    (location.hostname === '127.0.0.1' || location.hostname === 'localhost' ||
      /^10\./.test(location.hostname) || /^192\.168\./.test(location.hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(location.hostname));
  const emulatorHost = useEmulators && typeof emulatorOptions === 'object' && emulatorOptions.host
    ? emulatorOptions.host
    : '127.0.0.1';
  const config = useEmulators
    ? Object.assign({}, FIREBASE_CONFIG, { projectId: 'demo-biiingo', authDomain: 'demo-biiingo.firebaseapp.com' })
    : FIREBASE_CONFIG;
  firebase.initializeApp(config);
  fauth = firebase.auth();
  db = firebase.firestore();
  FV = firebase.firestore.FieldValue;
  if (useEmulators) {
    fauth.useEmulator(`http://${emulatorHost}:9099`, { disableWarnings: true });
    db.useEmulator(emulatorHost, 8080);
  }
  // Tolérance aux coupures réseau : cache local, renvoi automatique à la reconnexion
  if (!useEmulators) {
    db.enablePersistence({ synchronizeTabs: true }).catch(() => { /* multi-onglets ou non supporté : OK sans */ });
  }
  return true;
}
