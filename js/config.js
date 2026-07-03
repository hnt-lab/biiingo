// Constantes de l'application Biiingo

const OBJECTIFS = {
  quine:  { label: 'Quine',          detail: '1 ligne',        emoji: '1️⃣' },
  double: { label: 'Double quine',   detail: '2 lignes',       emoji: '2️⃣' },
  carton: { label: 'Carton plein',   detail: 'tout le carton', emoji: '🏆' },
  // Mode spécial « battle royale » : qui a le numéro tiré est éliminé, le dernier debout gagne
  lose:   { label: 'Partie de la lose', detail: 'le dernier debout gagne', emoji: '💀' }
};

// Alphabet sans lettres ambiguës (pas de I/O/L) pour les codes de soirée
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_LENGTH = 4;

// Compression des photos (stockées en base64 dans la base — pas de Firebase Storage)
const PHOTO_MAX_DIM = 560;      // px, côté le plus grand
const PHOTO_QUALITY = 0.72;     // qualité JPEG
const PHOTO_WARN_BYTES = 180000; // avertir si une photo dépasse ~180 Ko après compression

const NB_NUMEROS = 90;

// ---- Mode joueur ----
const JETONS_PRESETS = ['🔴', '💖', '⭐', '💋', '🍀', '💀']; // styles de jetons proposés
const JETON_IMG_SIZE = 128;          // px — jeton créé à partir d'une image (rond bordé)
const SECOUSSE_SEUIL = 5;            // m/s² — au-delà, les jetons se décrochent (hardcore)
const JOUEUR_MAX_CARTONS = 4;

// Sons personnalisés (envoyés depuis l'app, stockés avec le compte)
const SOUND_MAX_BYTES = 700000; // ~700 Ko max par son (limite technique de la base)
const SONS_LISTE = [
  { name: 'tirage',    label: 'Numéro tiré',              info: 'discret — joué à chaque numéro' },
  { name: 'valid',     label: 'Vérif : numéro sorti',     info: '' },
  { name: 'rate',      label: 'Vérif : numéro absent',    info: 'le faux espoir' },
  { name: 'suspense',  label: 'Suspense',                 info: 'tourne en boucle pendant la vérif' },
  { name: 'gagne',     label: 'GAGNÉ',                    info: '' },
  { name: 'fauxbingo', label: 'Faux bingo',               info: '' },
  { name: 'entracte',  label: 'Entracte',                 info: 'au lancement du spectacle' },
  { name: 'reprise',   label: 'Reprise de partie',        info: 'après l\'entracte (sinon : son d\'entracte)' },
  { name: 'attente',   label: 'Musique d\'attente',       info: 'en boucle sur l\'écran d\'accueil' },
  { name: 'debut',     label: 'Début de soirée',          info: 'accueil → manche 1' },
  { name: 'fin',       label: 'Fin de soirée',            info: 'au passage à l\'écran de fin' },
  { name: 'elimination', label: 'Élimination (lose)',     info: 'numéro fatal en partie de la lose (sinon : son de tirage)' }
];

// Fond d'écran d'entracte (compressé plus grand qu'un portrait)
const FOND_MAX_DIM = 1280;
const FOND_QUALITY = 0.65;

// Animations de verdict (styles + images PNG à transparence)
const ANIM_STYLES = {
  gagne: [
    { id: 'pluie',     label: '✨ Pluie de gloire' },
    { id: 'feu',       label: '🎆 Feu d\'artifice' },
    { id: 'cabaret',   label: '🍾 Cabaret' },
    { id: 'aleatoire', label: '🎲 Surprise' }
  ],
  faux: [
    { id: 'douche',    label: '🌧 Douche froide' },
    { id: 'tampon',    label: '📛 Tampon' },
    { id: 'pschitt',   label: '🎈 Pschitt' },
    { id: 'aleatoire', label: '🎲 Surprise' }
  ]
};
const ANIM_PNG_MAX_DIM = 320;      // particules (transparence conservée)
const ANIM_VEDETTE_MAX_DIM = 512;  // grande image centrale
const ANIM_MAX_PARTS = 3;          // nombre max d'images particules par verdict
