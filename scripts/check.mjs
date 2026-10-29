import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const file of ['SKILL.md', 'references/design-system.md', 'assets/tokens.css', 'docs/index.html', 'docs/styles.css', 'docs/tokens.css', 'docs/app.js', 'docs/vendor/lucide.min.js']) await fs.access(path.join(root, file));
const html = await fs.readFile(path.join(root, 'docs/index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  const target = match[1];
  if (/^(?:https?:|mailto:|tel:|#|data:)/.test(target)) continue;
  const resolved = path.resolve(root, 'docs', target.split(/[?#]/)[0]);
  if (!resolved.startsWith(path.join(root, 'docs') + path.sep)) throw new Error(`Invalid asset: ${target}`);
  await fs.access(resolved);
}
for (const file of ['docs/app.js', 'scripts/scaffold.mjs']) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) throw new Error(result.stderr);
}
console.log('PASS skill resources, HTML assets and JavaScript syntax');
