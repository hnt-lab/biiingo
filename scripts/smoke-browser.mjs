import { createReadStream, existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('../', import.meta.url));
const packageData = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
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

const externalUrl = process.env.SMOKE_URL?.replace(/\/$/, '');
if (!externalUrl) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const targetUrl = externalUrl || `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath, headless: true });

try {
  const page = await browser.newPage();
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  page.on('requestfailed', request => {
    if (request.resourceType() === 'script') {
      runtimeErrors.push(`${request.url()} : ${request.failure()?.errorText || 'échec de chargement'}`);
    }
  });

  await page.goto(`${targetUrl}/`, { waitUntil: 'load', timeout: 30_000 });
  await page.waitForSelector('#authScreen.active', { timeout: 15_000 });

  const state = await page.evaluate(() => ({
    firebaseLoaded: typeof firebase !== 'undefined',
    version: document.querySelector('#verLabel')?.textContent,
    title: document.title
  }));

  if (runtimeErrors.length) throw new Error(runtimeErrors.join('\n'));
  if (!state.firebaseLoaded) throw new Error('Firebase ne s’est pas chargé.');
  if (state.version !== `v${packageData.version}`) throw new Error(`Version inattendue : ${state.version}`);
  if (state.title !== 'Biiingo ✨') throw new Error(`Titre inattendu : ${state.title}`);

  await page.goto(`${targetUrl}/?display=CODEX-NONEXISTANT`, { waitUntil: 'load', timeout: 30_000 });
  await page.waitForFunction(() => {
    const screen = document.querySelector('#loadScreen');
    const message = document.querySelector('#loadMsg')?.textContent || '';
    return screen?.classList.contains('active') && message.includes('Aucune soirée');
  }, { timeout: 20_000 });

  if (runtimeErrors.length) throw new Error(runtimeErrors.join('\n'));

  await page.evaluate(async () => {
    if (typeof fauth !== 'undefined' && fauth.currentUser?.isAnonymous) {
      await fauth.currentUser.delete();
    }
  });

  console.log(`Chargement et connexion Firebase validés sur ${targetUrl} avec ${executablePath}.`);
} finally {
  await browser.close();
  if (server.listening) await new Promise(resolve => server.close(resolve));
}
