// Génère les icônes PNG de l'app (grille de bingo avec diagonale gagnante or→rose).
// Usage : node _tools/make_icons.js  → écrit img/icon-512.png, img/icon-192.png, img/apple-touch-icon.png
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---------- Encodeur PNG minimal (RGBA 8 bits) ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function writePng(file, size, pixelFn) {
  const raw = Buffer.alloc(size * (1 + size * 4));
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filtre none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
  fs.writeFileSync(file, png);
  console.log('OK', file, size + 'x' + size, png.length + ' octets');
}

// ---------- Dessin ----------
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
const BG = hex('#1a1426'), CELL = hex('#322753'), OR = hex('#e8c558'), ROSE = hex('#ff5fa2');
function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

// Distance signée à un rectangle arrondi (négatif = dedans)
function sdRoundRect(px, py, cx, cy, half, r) {
  const qx = Math.abs(px - cx) - (half - r);
  const qy = Math.abs(py - cy) - (half - r);
  const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
  return Math.min(Math.max(qx, qy), 0) + Math.sqrt(ax * ax + ay * ay) - r;
}

function makeIcon(size) {
  const s = size / 512;
  const m = 76 * s;                    // marge (zone sûre pour les icônes masquées)
  const gap = 26 * s;
  const cell = (size - 2 * m - 2 * gap) / 3;
  const half = cell / 2;
  const rad = 22 * s;
  const centres = [];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
    centres.push({ i, j, x: m + half + i * (cell + gap), y: m + half + j * (cell + gap) });
  }
  const gradMin = m, gradMax = size - m;
  return (x, y) => {
    let col = BG.slice();
    for (const c of centres) {
      const d = sdRoundRect(x + .5, y + .5, c.x, c.y, half, rad);
      if (d < 1) {
        const alpha = Math.min(1, Math.max(0, 0.5 - d)); // lissage des bords
        let cc;
        if (c.i === c.j) { // la diagonale gagnante or → rose
          const t = Math.min(1, Math.max(0, ((x - gradMin) + (y - gradMin)) / ((gradMax - gradMin) * 2)));
          cc = mix(OR, ROSE, t);
        } else {
          cc = CELL;
        }
        col = mix(col, cc, alpha);
      }
    }
    return [Math.round(col[0]), Math.round(col[1]), Math.round(col[2]), 255];
  };
}

const out = path.join(__dirname, '..', 'img');
if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });
writePng(path.join(out, 'icon-512.png'), 512, makeIcon(512));
writePng(path.join(out, 'icon-192.png'), 192, makeIcon(192));
writePng(path.join(out, 'apple-touch-icon.png'), 180, makeIcon(180));
