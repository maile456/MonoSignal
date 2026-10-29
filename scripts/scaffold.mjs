import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--dest' || !path.isAbsolute(args[1])) {
  console.error('Usage: node scripts/scaffold.mjs --dest <NEW_ABSOLUTE_DIRECTORY>');
  process.exit(1);
}
const target = path.resolve(args[1]);
const parent = path.dirname(target);
try {
  await fs.access(parent);
  await fs.mkdir(target);
} catch (error) {
  console.error(`Target must be new and its parent must exist: ${error.message}`);
  process.exit(1);
}
try {
  const source = path.join(root, 'docs');
  for (const entry of await fs.readdir(source)) {
    await fs.cp(path.join(source, entry), path.join(target, entry), { recursive: true, errorOnExist: true, force: false });
  }
  console.log(`CREATED ${target}`);
  console.log(`OPEN ${path.join(target, 'index.html')}`);
} catch (error) {
  console.error(`Copy failed; partial output retained: ${error.message}`);
  process.exitCode = 1;
}
