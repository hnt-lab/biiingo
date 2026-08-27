import { createInterface } from 'node:readline';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { chromium } from 'playwright-core';

const targetUrl = (process.argv[2] || process.env.BIIINGO_PHYSICAL_URL || '').trim();
const existingCode = (process.argv[3] || '').trim().toUpperCase();
const browserCandidates = [
  process.env.BROWSER_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);
const executablePath = browserCandidates.find(candidate => existsSync(candidate));

if (!targetUrl) {
  throw new Error('URL du serveur physique manquante. Lancez npm run test:physical:mc -- http://ADRESSE:4173.');
}
if (!executablePath) throw new Error('Aucun navigateur Chromium compatible trouvé.');

const browser = await chromium.launch({ executablePath, headless: false, args: ['--start-maximized'] });
const context = await browser.newContext({ viewport: null });
await context.addInitScript(() => localStorage.setItem('biiingo_tuto_vu_v2', '1'));
const page = await context.newPage();
let displayContext = null;
let displayPage = null;
const suffix = Date.now();

await page.goto(targetUrl, { waitUntil: 'load', timeout: 30_000 });
await page.waitForSelector('#authScreen.active', { timeout: 30_000 });
await page.click('#authToSignup');
await page.fill('#authPseudo', 'MC Test physique');
await page.fill('#authEmail', `mc-physique-${suffix}@biiingo.test`);
await page.fill('#authPwd', 'Biiingo-Physique-2026');
await page.click('#authSignupBtn');
await page.waitForSelector('#homeScreen.active', { timeout: 20_000 });
if (existingCode) {
  await page.getByRole('button', { name: /Rejoindre avec un code/ }).click();
  await page.fill('#joinCode', existingCode);
  await page.getByRole('button', { name: /^Rejoindre$/ }).click();
} else {
  await page.getByRole('button', { name: /Nouvelle soirée/ }).click();
  await page.fill('#newTitre', 'Test physique Biiingo');
  await page.getByRole('button', { name: /Créer/ }).click();
}
await page.waitForSelector('#mcScreen.active', { timeout: 20_000 });
await page.waitForFunction(() => S.soiree?.code && S.soireeId);

const party = await page.evaluate(() => ({ id: S.soireeId, code: S.soiree.code }));
console.log(`\nSOIRÉE PHYSIQUE PRÊTE — CODE ${party.code}`);
console.log('Commandes : status, start, draw NUMERO, cards NOMBRE, display, display-ready, display-refresh, display-size LARGEURxHAUTEUR, display-maximize, home, pause, resume, end, qr, quit\n');

const terminal = createInterface({ input: process.stdin, output: process.stdout, terminal: false });
let commandQueue = Promise.resolve();
let controlServer;

async function setDisplayWindowBounds(bounds) {
  const cdpSession = await displayPage.context().newCDPSession(displayPage);
  const { windowId } = await cdpSession.send('Browser.getWindowForTarget');
  await cdpSession.send('Browser.setWindowBounds', { windowId, bounds });
  await cdpSession.detach();
}

async function runCommand(line) {
  const [command, argument] = line.trim().split(/\s+/, 2);
  if (!command) return;
  if (command === 'status') {
    const status = await page.evaluate(() => ({
      code: S.soiree?.code,
      etat: S.soiree?.etat,
      joueurs: S.nbJoueurs,
      tires: S.soiree?.tires || []
    }));
    console.log(JSON.stringify(status));
  } else if (command === 'start' || command === 'resume') {
    await page.evaluate(() => soireeUpdate({ etat: 'tirage' }));
    console.log('Partie affichée.');
  } else if (command === 'draw') {
    const number = Number(argument);
    if (!Number.isInteger(number) || number < 1 || number > 90) throw new Error('Numéro attendu entre 1 et 90.');
    await page.evaluate(value => mcTapNum(value), number);
    console.log(`Numéro ${number} tiré.`);
  } else if (command === 'cards') {
    const count = Number(argument);
    if (!Number.isInteger(count) || count < 1 || count > 4) throw new Error('Nombre de cartons attendu entre 1 et 4.');
    await page.evaluate(value => soireeUpdate({ nbCartons: value }), count);
    console.log(`${count} carton(s) configuré(s).`);
  } else if (command === 'display') {
    if (!displayPage || displayPage.isClosed()) {
      displayContext = await browser.newContext({ viewport: null });
      displayPage = await displayContext.newPage();
      await displayPage.goto(`${targetUrl}/?display=${party.code}`, { waitUntil: 'load', timeout: 30_000 });
      await displayPage.waitForSelector('#salleScreen.active', { timeout: 20_000 });
    }
    await displayPage.bringToFront();
    console.log('Écran public ouvert.');
  } else if (command === 'display-ready') {
    if (!displayPage || displayPage.isClosed()) throw new Error('Ouvrir d’abord l’écran public avec display.');
    const ready = displayPage.locator('#salleReady:not(.hide)');
    if (await ready.count()) {
      const box = await ready.boundingBox();
      if (box) await displayPage.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
    await displayPage.waitForTimeout(250);
    const fullscreenActive = await displayPage.evaluate(() => Boolean(document.fullscreenElement));
    if (!fullscreenActive) {
      await setDisplayWindowBounds({ windowState: 'fullscreen' });
    }
    await displayPage.bringToFront();
    console.log('Plein écran et son demandés.');
  } else if (command === 'display-refresh') {
    if (!displayPage || displayPage.isClosed()) throw new Error('Ouvrir d’abord l’écran public avec display.');
    await displayPage.reload({ waitUntil: 'load' });
    await displayPage.waitForSelector('#salleScreen.active', { timeout: 20_000 });
    console.log('Écran public actualisé.');
  } else if (command === 'display-size') {
    if (!displayPage || displayPage.isClosed()) throw new Error('Ouvrir d’abord l’écran public avec display.');
    const match = /^(\d{3,4})x(\d{3,4})$/.exec(argument || '');
    if (!match) throw new Error('Taille attendue au format LARGEURxHAUTEUR.');
    const width = Number(match[1]);
    const height = Number(match[2]);
    await setDisplayWindowBounds({ windowState: 'normal' });
    await setDisplayWindowBounds({ left: 80, top: 60, width, height });
    await displayPage.bringToFront();
    console.log(`Écran public redimensionné à ${width}x${height}.`);
  } else if (command === 'display-maximize') {
    if (!displayPage || displayPage.isClosed()) throw new Error('Ouvrir d’abord l’écran public avec display.');
    await setDisplayWindowBounds({ windowState: 'maximized' });
    await displayPage.bringToFront();
    console.log('Écran public maximisé.');
  } else if (command === 'home') {
    await page.evaluate(() => soireeUpdate({ etat: 'accueil' }));
    console.log('Accueil affiché.');
  } else if (command === 'pause') {
    await page.evaluate(() => soireeUpdate({
      etat: 'entracte',
      entracte: { nom: 'Pause de test', message: 'Reprise dans un instant', photo: '' }
    }));
    console.log('Entracte affiché.');
  } else if (command === 'end') {
    await page.evaluate(() => mcAfficherFin());
    console.log('Écran de fin affiché.');
  } else if (command === 'qr') {
    await page.evaluate(() => soireeUpdate({ qrPopup: !S.soiree.qrPopup }));
    console.log('Affichage du QR inversé.');
  } else if (command === 'quit') {
    terminal.close();
    await browser.close();
    if (controlServer?.listening) controlServer.close();
  } else {
    console.log(`Commande inconnue : ${command}`);
  }
}

terminal.on('line', line => {
  commandQueue = commandQueue.then(() => runCommand(line)).catch(error => console.error(error.message));
});

controlServer = createServer(async (request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    if (url.pathname === '/state') {
      const status = await page.evaluate(() => ({
        code: S.soiree?.code,
        etat: S.soiree?.etat,
        joueurs: S.nbJoueurs,
        tires: S.soiree?.tires || []
      }));
      response.end(JSON.stringify(status));
      return;
    }
    if (url.pathname === '/command') {
      await runCommand(url.searchParams.get('value') || '');
      response.end(JSON.stringify({ ok: true }));
      return;
    }
    response.statusCode = 404;
    response.end(JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    response.statusCode = 500;
    response.end(JSON.stringify({ error: error.message }));
  }
});
await new Promise(resolve => controlServer.listen(4174, '127.0.0.1', resolve));
console.log('Contrôle local persistant : http://127.0.0.1:4174/state');

await new Promise(resolve => browser.once('disconnected', resolve));
if (controlServer.listening) await new Promise(resolve => controlServer.close(resolve));
