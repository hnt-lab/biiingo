// Génère la "feature graphic" Google Play (1024×500) : grille de bingo stylisée
// avec diagonale gagnante or→rose, même langage visuel que l'icône.
// Usage : node _tools/make_banner.js → img/feature-graphic.png
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

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
function writePng(file, W, H, pixelFn) {
  const raw = Buffer.alloc(H * (1 + W * 4));
  let o = 0;
  for (let y = 0; y < H; y++) {
    raw[o++] = 0;
    for (let x = 0; x < W; x++) {
      const [r, g, b] = pixelFn(x, y);
      raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))
  ]));
  console.log('OK', file);
}

function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
const BG1 = hex('#241b35'), BG2 = hex('#14101e'), CELL = hex('#2d2244'), BORD = hex('#453564');
const OR = hex('#e8c558'), ROSE = hex('#ff5fa2');
function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function sdRoundRect(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r), qy = Math.abs(py - cy) - (hh - r);
  const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
  return Math.min(Math.max(qx, qy), 0) + Math.sqrt(ax * ax + ay * ay) - r;
}

const W = 1024, H = 500;
// Grille de cellules : 10 colonnes × 5 rangées, cellules arrondies
const COLS = 10, ROWS = 5, GAP = 14, M = 40;
const cw = (W - 2 * M - (COLS - 1) * GAP) / COLS;
const ch = (H - 2 * M - (ROWS - 1) * GAP) / ROWS;
// Cellules "gagnantes" : une diagonale montante + quelques étoiles éparses
const LIT = new Set(['0,4', '1,3', '2,3', '3,2', '4,2', '5,1', '6,1', '7,0', '9,3', '2,0', '8,4']);

writePng(path.join(__dirname, '..', 'img', 'feature-graphic.png'), W, H, (x, y) => {
  // fond en dégradé diagonal
  let col = mix(BG1, BG2, (x / W + y / H) / 2);
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      const cx = M + cw / 2 + i * (cw + GAP);
      const cy = M + ch / 2 + j * (ch + GAP);
      const d = sdRoundRect(x + .5, y + .5, cx, cy, cw / 2, ch / 2, 16);
      if (d < 1.5) {
        const a = Math.min(1, Math.max(0, .75 - d));
        let cc;
        if (LIT.has(i + ',' + j)) {
          const t = Math.min(1, Math.max(0, ((x - M) + (y - M)) / (W + H - 4 * M)));
          cc = mix(OR, ROSE, t);
        } else if (d > -3) {
          cc = BORD; // liseré
        } else {
          cc = CELL;
        }
        col = mix(col, cc, a);
      }
    }
  }
  return [Math.round(col[0]), Math.round(col[1]), Math.round(col[2])];
});
