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
  firebase.initializeApp(FIREBASE_CONFIG);
  fauth = firebase.auth();
  db = firebase.firestore();
  FV = firebase.firestore.FieldValue;
  // Tolérance aux coupures réseau : cache local, renvoi automatique à la reconnexion
  db.enablePersistence({ synchronizeTabs: true }).catch(() => { /* multi-onglets ou non supporté : OK sans */ });
  return true;
}
