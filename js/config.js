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
