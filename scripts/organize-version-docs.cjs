#!/usr/bin/env node
'use strict';
/**
 * Preserve the clean repository layout when importing complete Sonic Display ZIPs.
 * Run after extraction, before staging. Idempotent and deliberately conservative.
 */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const versionsDir = path.join(root, 'docs', 'versions');
const changelogDir = path.join(root, 'changelog');
const versionFile = /^V\d+[.-].+\.md$/i;
const textFile = /\.(?:md|cjs|mjs|js|jsx|ts|tsx|py|yml|yaml)$/i;
const excludedDirs = new Set(['.git', '.next', 'node_modules', 'coverage', 'dist', 'build']);
const readUtf8 = file => fs.readFileSync(file, 'utf8');
const same = (a, b) => fs.readFileSync(a).equals(fs.readFileSync(b));
const normalize = s => s.replace(/\\/g, '/');

function moveChecked(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (fs.existsSync(destination)) {
    if (!same(source, destination)) throw new Error(`Different files at ${source} and ${destination}; migration stopped`);
    fs.unlinkSync(source);
  } else {
    fs.renameSync(source, destination);
  }
}
function allRelevantFiles(base, found = []) {
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!excludedDirs.has(entry.name) && !['docs/versions', 'changelog'].includes(normalize(path.relative(root,path.join(base, entry.name))))) {
        allRelevantFiles(path.join(base, entry.name), found);
      }
    } else if (entry.isFile() && textFile.test(entry.name)) {
      found.push(path.join(base, entry.name));
    }
  }
  return found;
}
function main() {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const versions = entries.filter(x => x.isFile() && versionFile.test(x.name));
  const moved = new Set();
  let count = 0;
  for (const entry of versions) {
    const name = entry.name;
    const isChangelog = /CHANGELOG/i.test(name);
    moveChecked(path.join(root, name), path.join(isChangelog ? changelogDir : versionsDir, name));
    if (!isChangelog) moved.add(name);
    count++;
  }
  const legacyRelease = 'RELEASE_NOTES_V880_HOTFIX2.md';
  if (fs.existsSync(path.join(root, legacyRelease))) {
    moveChecked(path.join(root, legacyRelease), path.join(changelogDir, legacyRelease));
    count++;
  }
  // Rewrite references in the remaining textual sources, README and architecture.
  // Version markdown documents stay untouched: their relative sibling links still work.
  const known = new Set(fs.existsSync(versionsDir) ? fs.readdirSync(versionsDir).filter(x => versionFile.test(x)) : []);
  const ref = /(?<![A-Za-z0-9_/])(?<dot>\.\/)?(?<file>V\d+[.-][A-Za-z0-9._-]+\.md)/gi;
  let updated = 0;
  for (const file of allRelevantFiles(root)) {
    const rel = normalize(path.relative(root, file));
    if (rel.startsWith('docs/versions/') || rel.startsWith('changelog/')) continue;
    const old = readUtf8(file);
    let next = old.replace(ref, (whole, _prefix, _name, offset, source, groups) => {
      const name = groups.file;
      if (!known.has(name)) return whole;
      const newPath = rel.endsWith('.md')
        ? normalize(path.relative(path.dirname(file), path.join(versionsDir, name)))
        : `docs/versions/${name}`;
      return `${groups.dot || ''}${newPath}`;
    });
    if (rel.endsWith('.md')) {
      next = next.replace(/\[docs\/versions\/(V\d+[.-][A-Za-z0-9._-]+\.md)\]/gi, '[$1]');
    }
    if (old !== next) { fs.writeFileSync(file, next, 'utf8'); updated++; }
  }
  if (fs.existsSync(versionsDir)) {
    const index = path.join(versionsDir, 'README.md');
    if (!fs.existsSync(index)) {
      const sorted = fs.readdirSync(versionsDir).filter(x => versionFile.test(x)).sort((a,b) => {
        const n = x => Number(x.match(/^V(\d+)/i)?.[1] || 0);
        return n(b) - n(a) || a.localeCompare(b);
      });
      const latest = sorted.filter(x => Number(x.match(/^V(\d+)/i)?.[1]) >= 958).slice(0,15);
      fs.writeFileSync(index, '# Versionsdokumentation\n\nHistorische Sonic-Display-Releases, Funktionsbeschreibungen und technische Verifikationen. Alle `V###-*.md`-Dateien liegen in diesem Ordner.\n\n## Neuere Versionen\n\n' + latest.map(name => `- [${name}](./${name})`).join('\n') + '\n\nDie offiziellen Changelogs liegen separat in [`changelog/`](../../changelog/README.md).\n');
    }
  }
  const remaining = fs.readdirSync(root).filter(x => versionFile.test(x));
  if (remaining.length) throw new Error(`${remaining.length} unexpected root version docs remain: ${remaining.slice(0,5)}`);
  console.log(`Version docs organized: ${count} moved/merged, ${updated} reference files updated, ${known.size} version docs indexed`);
}
if (require.main === module) main();
module.exports = { main };
