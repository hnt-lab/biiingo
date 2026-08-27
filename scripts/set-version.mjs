import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const packageUrl = new URL('package.json', root);
const versionUrl = new URL('js/version.js', root);
const indexUrl = new URL('index.html', root);

const packageData = JSON.parse(await readFile(packageUrl, 'utf8'));
const currentVersion = packageData.version;
const requestedVersion = process.argv[2];

function assertVersion(value) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value || '')) {
    throw new Error(`Version invalide : ${value || '(vide)'}`);
  }
}

async function readPublishedVersions() {
  const versionSource = await readFile(versionUrl, 'utf8');
  const indexSource = await readFile(indexUrl, 'utf8');
  const appVersion = versionSource.match(/APP_VERSION\s*=\s*'([^']+)'/)?.[1];
  const buildVersion = indexSource.match(/window\.__B='([^']+)'/)?.[1];
  return { appVersion, buildVersion, versionSource, indexSource };
}

if (!requestedVersion || requestedVersion === '--check') {
  const { appVersion, buildVersion } = await readPublishedVersions();
  if (appVersion !== currentVersion || buildVersion !== currentVersion) {
    throw new Error(
      `Versions incohérentes : package=${currentVersion}, application=${appVersion}, build=${buildVersion}`
    );
  }
  console.log(`Version cohérente : ${currentVersion}.`);
  process.exit(0);
}

assertVersion(requestedVersion);
const { versionSource, indexSource } = await readPublishedVersions();

packageData.version = requestedVersion;
await writeFile(packageUrl, `${JSON.stringify(packageData, null, 2)}\n`);
await writeFile(
  versionUrl,
  versionSource.replace(/APP_VERSION\s*=\s*'[^']+'/, `APP_VERSION = '${requestedVersion}'`)
);
await writeFile(
  indexUrl,
  indexSource.replace(/window\.__B='[^']+'/, `window.__B='${requestedVersion}'`)
);

console.log(`Version mise à jour vers ${requestedVersion}.`);
