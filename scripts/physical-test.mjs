import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { rm, writeFile } from 'node:fs/promises';

const root = path.resolve(import.meta.dirname, '..');
const addresses = Object.values(os.networkInterfaces())
  .flat()
  .filter(address => address && address.family === 'IPv4' && !address.internal)
  .map(address => address.address)
  .filter(address => /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(address));

if (!addresses.length) {
  throw new Error('Aucune adresse IPv4 privée détectée. Connectez le PC au même réseau que les appareils.');
}

const host = addresses[0];
const temporaryConfig = path.join(os.tmpdir(), `biiingo-physical-${process.pid}.json`);
const firebaseBin = path.join(root, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js');
const config = {
  firestore: { rules: path.join(root, '_setup', 'firestore.rules') },
  emulators: {
    firestore: { host, port: 8080 },
    auth: { host, port: 9099 },
    ui: { enabled: false },
    singleProjectMode: true
  }
};

await writeFile(temporaryConfig, JSON.stringify(config, null, 2));

const child = spawn(process.execPath, [
  firebaseBin,
  'emulators:exec',
  '--config', temporaryConfig,
  '--project', 'demo-biiingo',
  '--only', 'auth,firestore',
  `node scripts/physical-test-server.mjs --host ${host}`
], { cwd: root, stdio: 'inherit' });

const exitCode = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('exit', code => resolve(code ?? 1));
});

await rm(temporaryConfig, { force: true });
process.exitCode = exitCode;
