import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['SKILL.md', 'references/design-system.md', 'assets/tokens.css', 'docs/index.html', 'docs/styles.css', 'docs/tokens.css', 'docs/app.js', 'docs/vendor/lucide.min.js']) await fs.access(path.join(root, file));
async function walk(folder) {
  const files = [];
  for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) files.push(...await walk(file));
    else files.push(file);
  }
  return files;
}
const docs = path.join(root, 'docs');
for (const file of await walk(docs)) {
  if (!/\.(?:html|css|js)$/.test(file) || file.includes(`${path.sep}vendor${path.sep}`)) continue;
  const source = await fs.readFile(file, 'utf8');
  if (source.includes('\0')) throw new Error(`NUL byte in ${file}`);
  const targets = file.endsWith('.html')
    ? [...source.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match => match[1])
    : file.endsWith('.css') ? [...source.matchAll(/url\(["']?([^\s"')]+)["']?\)/g)].map(match => match[1]) : [];
  for (const target of targets) {
    if (/^(?:https?:|mailto:|tel:|#|data:)/.test(target)) continue;
    const resolved = path.resolve(path.dirname(file), target.split(/[?#]/)[0]);
    if (!resolved.startsWith(docs + path.sep)) throw new Error(`Invalid asset: ${target}`);
    await fs.access(resolved);
  }
  if (!file.endsWith('.js')) continue;
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) throw new Error(result.stderr);
}
const result = spawnSync(process.execPath, ['--check', path.join(root, 'scripts/scaffold.mjs')], { encoding: 'utf8', windowsHide: true });
if (result.status !== 0) throw new Error(result.stderr);
console.log('PASS skill resources, homepage/workspace assets, CSS URLs and JavaScript syntax');
