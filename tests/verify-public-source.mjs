import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const src = new URL('src/', root);
const files = fs.readdirSync(src).filter(name => name.endsWith('.js'));
assert.equal(files.length, 13, 'Update installation documentation when adding source files');
for (const name of files) {
  const text = fs.readFileSync(new URL(name, src), 'utf8');
  new vm.Script(text, { filename: name });
  assert(!/[UCR][a-f0-9]{32}/i.test(text), `${name}: fixed LINE identity`);
  assert(!/AKfy[a-zA-Z0-9_-]{30,}/.test(text), `${name}: fixed deployed endpoint`);
  assert(!/notify-api\.line\.me|notify-bot\.line\.me/.test(text), `${name}: retired Notify endpoint`);
  assert(!/ya29\.[a-zA-Z0-9_-]{20,}/.test(text), `${name}: OAuth token`);
  assert(!/CHANNEL_ACCESS_TOKEN\s*=\s*['"][^'"]+['"]/.test(text), `${name}: literal channel token`);
}
for (const file of ['src/appsscript.json', 'package.json', '.clasp.example.json']) {
  JSON.parse(fs.readFileSync(new URL(file, root), 'utf8'));
}
for (const file of ['README.md', 'CONFIG.example.md', 'SECURITY.md', ...fs.readdirSync(new URL('docs/', root)).filter(x => x.endsWith('.md')).map(x => `docs/${x}`)]) {
  const text = fs.readFileSync(new URL(file, root), 'utf8');
  for (const match of text.matchAll(/\]\(([^\s)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    assert(fs.existsSync(new URL(path.posix.join(path.posix.dirname(file), target), root)), `${file}: missing linked file ${target}`);
  }
}
console.log('PASS public source: syntax, identity/credential guards, manifests and documentation links');
