// Constantes de l'application Biiingo

const OBJECTIFS = {
  quine:  { label: 'Quine',        detail: '1 ligne',   emoji: '1️⃣' },
  double: { label: 'Double quine', detail: '2 lignes',  emoji: '2️⃣' },
  carton: { label: 'Carton plein', detail: 'tout le carton', emoji: '🏆' }
};

// Alphabet sans lettres ambiguës (pas de I/O/L) pour les codes de soirée
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_LENGTH = 4;

// Compression des photos (stockées en base64 dans la base — pas de Firebase Storage)
const PHOTO_MAX_DIM = 560;      // px, côté le plus grand
const PHOTO_QUALITY = 0.72;     // qualité JPEG
const PHOTO_WARN_BYTES = 180000; // avertir si une photo dépasse ~180 Ko après compression

const NB_NUMEROS = 90;

// Sons personnalisés (envoyés depuis l'app, stockés avec le compte)
const SOUND_MAX_BYTES = 700000; // ~700 Ko max par son (limite technique de la base)
const SONS_LISTE = [
  { name: 'tirage',    label: 'Numéro tiré',              info: 'discret — joué à chaque numéro' },
  { name: 'tirage1',   label: 'Numéro tiré (variante 2)', info: 'alterné aléatoirement' },
  { name: 'tirage2',   label: 'Numéro tiré (variante 3)', info: 'alterné aléatoirement' },
  { name: 'valid',     label: 'Vérif : numéro sorti',     info: '' },
  { name: 'valid1',    label: 'Vérif : sorti (variante)', info: 'alterné aléatoirement' },
  { name: 'rate',      label: 'Vérif : numéro absent',    info: 'le faux espoir' },
  { name: 'suspense',  label: 'Suspense',                 info: 'tourne en boucle pendant la vérif' },
  { name: 'gagne',     label: 'GAGNÉ',                    info: '' },
  { name: 'fauxbingo', label: 'Faux bingo',               info: '' },
  { name: 'entracte',  label: 'Entracte',                 info: 'au lancement du spectacle' },
  { name: 'reprise',   label: 'Reprise de partie',        info: 'après l\'entracte (sinon : son d\'entracte)' },
  { name: 'attente',   label: 'Musique d\'attente',       info: 'en boucle sur l\'écran d\'accueil' },
  { name: 'debut',     label: 'Début de soirée',          info: 'accueil → manche 1' },
  { name: 'fin',       label: 'Fin de soirée',            info: 'au passage à l\'écran de fin' }
];

// Fond d'écran d'entracte (compressé plus grand qu'un portrait)
const FOND_MAX_DIM = 1280;
const FOND_QUALITY = 0.65;
