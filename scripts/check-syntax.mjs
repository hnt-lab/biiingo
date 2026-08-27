import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const files = (await readdir(new URL('../js/', import.meta.url)))
  .filter(file => file.endsWith('.js'))
  .sort();

for (const file of files) {
  const scriptPath = fileURLToPath(new URL(`../js/${file}`, import.meta.url));
  const result = spawnSync(process.execPath, ['--check', scriptPath], {
    stdio: 'inherit'
  });

  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`${files.length} fichiers JavaScript valides.`);
