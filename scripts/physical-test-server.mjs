import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';

const root = path.resolve(import.meta.dirname, '..');
const port = 4173;
const hostArgument = process.argv.indexOf('--host');
const host = hostArgument >= 0 ? process.argv[hostArgument + 1] : null;
const publicDirectories = new Set(['css', 'img', 'js', 'sounds']);
const publicRootFiles = new Set(['index.html', 'confidentialite.html', 'manifest.json', 'sw.js']);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function localAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter(address => address && address.family === 'IPv4' && !address.internal)
    .map(address => address.address);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const segments = relative.split('/');
  const isPublic = segments.length === 1
    ? publicRootFiles.has(segments[0]) || segments[0].endsWith('.html')
    : publicDirectories.has(segments[0]);
  if (!isPublic || segments.some(segment => segment === '..' || segment.startsWith('.'))) return null;
  const resolved = path.resolve(root, relative);
  return resolved.startsWith(root + path.sep) || resolved === root ? resolved : null;
}

function injectEmulatorBootstrap(html) {
  const bootstrap = `<script>
    window.__BIIINGO_EMULATORS={host:location.hostname};
    window.__BIIINGO_PHYSICAL_TEST=true;
    window.addEventListener('load',function(){
      setInterval(function(){
        var active=document.querySelector('#joueurScreen.active');
        var button=document.querySelector('#physicalDropTest');
        if(!active){if(button)button.remove();return;}
        if(button)return;
        button=document.createElement('button');
        button.id='physicalDropTest';
        button.className='btn warn';
        button.textContent='💥 Test chute';
        button.style.cssText='position:fixed;right:8px;bottom:8px;z-index:120;padding:8px 12px;font-size:13px';
        button.onclick=function(){
          if(typeof Jetons!=='undefined')Jetons.dislodge(window.S&&S.soiree?S.soiree.tires:[]);
        };
        document.body.appendChild(button);
      },500);
    });
  </script>`;
  return html.includes('<head>') ? html.replace('<head>', `<head>${bootstrap}`) : bootstrap + html;
}

const server = http.createServer(async (request, response) => {
  try {
    let filePath = safePath(request.url || '/');
    if (!filePath) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) filePath = path.join(filePath, 'index.html');
    const extension = path.extname(filePath).toLowerCase();
    let body = await readFile(filePath);
    if (extension === '.html') body = Buffer.from(injectEmulatorBootstrap(body.toString('utf8')));
    response.writeHead(200, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    response.end(body);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 500).end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
  }
});

if (!host || !localAddresses().includes(host)) {
  throw new Error('Adresse réseau locale invalide pour la session physique.');
}

server.listen(port, host, () => {
  console.log('\nBiiingo — session de tests physiques isolée');
  console.log('Les données restent dans les émulateurs locaux et disparaissent à l’arrêt.\n');
  console.log(`  http://${host}:${port}/`);
  console.log('\nOuvrez la même adresse sur les appareils connectés au même réseau Wi-Fi.');
  console.log('Appuyez sur Ctrl+C ici pour terminer et effacer la session.\n');
});
