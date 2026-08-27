import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('../', import.meta.url));
const browserCandidates = [
  process.env.BROWSER_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean);
const executablePath = browserCandidates.find(candidate => existsSync(candidate));

if (!executablePath) {
  throw new Error('Aucun navigateur Chromium compatible trouvé. Définir BROWSER_PATH pour lancer le test.');
}

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png'
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = normalize(join(root, relativePath));
    if (!filePath.startsWith(root)) throw new Error('Chemin refusé');
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error('Fichier introuvable');
    response.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream' });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(404).end('Not found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const targetUrl = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath, headless: true });
const runtimeErrors = [];

async function createAppPage(pathname) {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    window.__BIIINGO_EMULATORS = true;
    localStorage.setItem('biiingo_tuto_vu_v2', '1');
  });
  const page = await context.newPage();
  page.on('pageerror', error => runtimeErrors.push(`${pathname}: ${error.message}`));
  page.on('requestfailed', request => {
    if (request.resourceType() === 'script') {
      runtimeErrors.push(`${pathname}: ${request.url()} : ${request.failure()?.errorText || 'échec'}`);
    }
  });
  await page.goto(targetUrl + pathname, { waitUntil: 'load', timeout: 30_000 });
  return { context, page };
}

let mcApp;
let displayApp;
let playerApp;
let accountPlayerApp;

try {
  mcApp = await createAppPage('/');
  const mc = mcApp.page;
  await mc.waitForSelector('#authScreen.active', { timeout: 30_000 });
  await mc.click('#authToSignup');
  await mc.fill('#authPseudo', 'MC E2E');
  await mc.fill('#authEmail', 'mc-e2e@biiingo.test');
  await mc.fill('#authPwd', 'Biiingo-E2E-2026');
  await mc.click('#authSignupBtn');
  await mc.waitForSelector('#homeScreen.active', { timeout: 20_000 });

  await mc.getByRole('button', { name: /Nouvelle soirée/ }).click();
  await mc.fill('#newTitre', 'Soirée E2E');
  await mc.getByRole('button', { name: /Créer/ }).click();
  await mc.waitForSelector('#mcScreen.active', { timeout: 20_000 });
  await mc.waitForFunction(() => S.soiree && S.soiree.code && S.soireeId);

  const party = await mc.evaluate(() => ({ id: S.soireeId, code: S.soiree.code, uid: S.user.uid }));

  displayApp = await createAppPage(`/?display=${party.code}`);
  const display = displayApp.page;
  await display.waitForSelector('#salleScreen.active', { timeout: 20_000 });
  await display.waitForFunction(() => S.soiree?.titre === 'Soirée E2E');

  playerApp = await createAppPage('/');
  const player = playerApp.page;
  await player.waitForSelector('#authScreen.active', { timeout: 20_000 });
  await player.click('button:has-text("Rejoindre une soirée comme joueur")');
  await player.fill('#joueurCode', party.code);
  await player.click('button:has-text("Continuer")');
  await player.waitForSelector('#joinScreen.active', { timeout: 20_000 });
  await player.fill('#joinNom', 'Joueuse E2E');
  await player.getByRole('button', { name: /Jouer en invité/ }).click();
  await player.waitForSelector('#joueurScreen.active', { timeout: 20_000 });
  await player.waitForFunction(() => J.cartons.length === 1 && J.soireeId);

  accountPlayerApp = await createAppPage(`/?join=${party.code}`);
  const accountPlayer = accountPlayerApp.page;
  await accountPlayer.waitForSelector('#joinScreen.active', { timeout: 20_000 });
  await accountPlayer.getByRole('button', { name: /Mon compte Biiingo/ }).click();
  await accountPlayer.waitForSelector('#authScreen.active');
  await accountPlayer.click('#authToSignup');
  await accountPlayer.fill('#authPseudo', 'Compte E2E');
  await accountPlayer.fill('#authEmail', 'joueuse-e2e@biiingo.test');
  await accountPlayer.fill('#authPwd', 'Biiingo-E2E-2026');
  await accountPlayer.click('#authSignupBtn');
  await accountPlayer.waitForSelector('#joueurScreen.active', { timeout: 20_000 });
  await accountPlayer.waitForFunction(() => J.cartons.length === 1 && J.soireeId && J.nom === 'Compte E2E');
  await mc.waitForFunction(() => S.nbJoueurs === 2);

  await mc.getByRole('button', { name: /Afficher la partie/ }).click();
  await display.waitForSelector('#salleGrille');
  await player.waitForSelector('#cartonGrille');

  await mc.evaluate(() => mcTapNum(42));
  await display.waitForFunction(() => document.querySelector('#dernierNum')?.textContent === '42');
  await player.waitForFunction(() => document.querySelector('#joueurDernier')?.textContent === '42');

  await mc.evaluate(() => mcSetTab('edition'));
  await mc.waitForSelector('.ed-intro');
  await mc.evaluate(() => edArtisteModal());
  await mc.fill('#edArtNom', 'Artiste E2E');
  await mc.fill('#edArtMsg', 'Numéro automatisé');
  await mc.getByRole('button', { name: /Ajouter.*🎭/ }).click();
  await mc.waitForFunction(() => S.soiree?.programme?.some(item => item.nom === 'Artiste E2E'));

  await mc.evaluate(() => edSonToggle('tirage'));
  await mc.waitForFunction(() => S.soiree?.son?.off?.includes('tirage'));

  await mc.evaluate(() => soireeUpdate({ bandeau: { texte: 'Bandeau E2E', actif: true } }));
  await display.waitForFunction(() => document.querySelector('#salleBandeau')?.textContent.includes('Bandeau E2E'));

  const guestUid = await player.evaluate(() => J.uid);
  await mc.evaluate(uid => soireeUpdate({
    etat: 'verification',
    verification: {
      active: true,
      suspense: false,
      coches: [42],
      verdict: '',
      gagnantNom: 'Joueuse E2E',
      joueurUid: uid
    }
  }), guestUid);
  await display.waitForSelector('.salle-verif');
  await player.waitForFunction(() => {
    const overlay = document.querySelector('#joueurVerif');
    return overlay?.classList.contains('show') && overlay.textContent.includes('TON carton');
  });
  await accountPlayer.waitForFunction(() => {
    const overlay = document.querySelector('#joueurVerif');
    return overlay?.classList.contains('show') && overlay.textContent.includes('jetons sont gelés');
  });

  await mc.evaluate(() => soireeUpdate({
    etat: 'tirage',
    verification: { active: false, suspense: false, coches: [], verdict: '', gagnantNom: '', joueurUid: '' }
  }));
  await player.waitForFunction(() => !document.querySelector('#joueurVerif')?.classList.contains('show'));

  await mc.evaluate(() => mcLancerEntracte(0));
  await display.waitForFunction(() => document.querySelector('.salle-entracte')?.textContent.includes('Artiste E2E'));
  await player.waitForFunction(() => document.querySelector('#joueurContent')?.textContent.includes('Artiste E2E'));
  await mc.evaluate(() => soireeUpdate({ etat: 'tirage' }));
  await display.waitForSelector('#salleGrille');

  await mc.evaluate(() => mcAfficherFin());
  await display.waitForSelector('.salle-fin');
  await player.waitForFunction(() => document.querySelector('#joueurContent')?.textContent.includes("Merci d'avoir joué"));

  await displayApp.context.close();
  displayApp = null;
  await playerApp.context.close();
  playerApp = null;
  await accountPlayer.evaluate(async () => {
    if (J.unsub) { J.unsub(); J.unsub = null; }
    const uid = fauth.currentUser.uid;
    await db.collection('users').doc(uid).delete();
    await fauth.currentUser.delete();
  });
  await accountPlayerApp.context.close();
  accountPlayerApp = null;

  const cleanup = await mc.evaluate(async ({ id, uid }) => {
    if (S.unsub) { S.unsub(); S.unsub = null; }
    if (S.unsubMedias) { S.unsubMedias(); S.unsubMedias = null; }
    if (S.unsubJoueurs) { S.unsubJoueurs(); S.unsubJoueurs = null; }
    const playersBefore = await db.collection('soirees').doc(id).collection('joueurs').get();
    await deleteSoireeData(id);
    const deletedParty = await db.collection('soirees').doc(id).get();
    await db.collection('users').doc(uid).delete();
    await fauth.currentUser.delete();
    return { partyExists: deletedParty.exists, playersBefore: playersBefore.size };
  }, party);

  if (cleanup.partyExists || cleanup.playersBefore !== 2) {
    throw new Error(`Nettoyage incomplet : ${JSON.stringify(cleanup)}`);
  }
  if (runtimeErrors.length) throw new Error(runtimeErrors.join('\n'));

  console.log(`Parcours E2E MC + salle + joueur validé avec ${executablePath}.`);
} finally {
  if (displayApp) await displayApp.context.close();
  if (playerApp) await playerApp.context.close();
  if (accountPlayerApp) await accountPlayerApp.context.close();
  if (mcApp) await mcApp.context.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
