#!/usr/bin/env node
'use strict';
// Keep historical documentation organized after importing full-project ZIPs.
// Safe to rerun; never overwrite a different destination file.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const versions = path.join(root, 'docs', 'versions');
const changelog = path.join(root, 'changelog');
const versionName = /^V\d+[.-].+\.md$/i;
const textName = /\.(?:md|cjs|mjs|js|jsx|ts|tsx|py|yml|yaml)$/i;
const ignored = new Set(['.git', '.next', 'node_modules', 'coverage', 'dist', 'build']);
const slash = value => value.split(path.sep).join('/');
function mergeMove(src, dest) {
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  if (fs.existsSync(dest)) {
    if (!fs.readFileSync(src).equals(fs.readFileSync(dest))) {
      throw new Error('Different files exist at both locations: ' + src + ' and ' + dest);
    }
    fs.unlinkSync(src);
  } else {
    fs.renameSync(src, dest);
  }
}
function visit(dir, output) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const absolute = path.join(dir, entry.name);
    const relative = slash(path.relative(root, absolute));
    if (entry.isDirectory() && !ignored.has(entry.name)
      && relative !== 'docs/versions' && relative !== 'changelog') {
      visit(absolute, output);
    } else if (entry.isFile() && textName.test(entry.name)) {
      output.push(absolute);
    }
  }
}
function main() {
  const rootEntries = fs.readdirSync(root, {withFileTypes:true});
  let moved = 0;
  for (const item of rootEntries) {
    if (!item.isFile() || !versionName.test(item.name)) continue;
    const toChangelog = /CHANGELOG/i.test(item.name);
    mergeMove(path.join(root, item.name),
      path.join(toChangelog ? changelog : versions, item.name));
    moved++;
  }
  const releaseNote = 'RELEASE_NOTES_V880_HOTFIX2.md';
  if (fs.existsSync(path.join(root, releaseNote))) {
    mergeMove(path.join(root, releaseNote), path.join(changelog, releaseNote));
    moved++;
  }
  const known = new Set(fs.existsSync(versions)
    ? fs.readdirSync(versions).filter(name => versionName.test(name)) : []);
  // Rewrite only references to files which actually exist in the new archive.
  const reference = /(?<![A-Za-z0-9_\/])(?<dot>\.\/)?(?<file>V\d+[.-][A-Za-z0-9._-]+\.md)/gi;
  const files = [];
  visit(root, files);
  let rewritten = 0;
  for (const absolute of files) {
    const relative = slash(path.relative(root, absolute));
    if (relative.startsWith('docs/versions/') || relative.startsWith('changelog/')) continue;
    const previous = fs.readFileSync(absolute, 'utf8');
    let next = previous.replace(reference, (whole, unusedDot, unusedFile, position, text, groups) => {
      if (!known.has(groups.file)) return whole;
      const destination = relative.endsWith('.md')
        ? slash(path.relative(path.dirname(absolute), path.join(versions, groups.file)))
        : 'docs/versions/' + groups.file;
      return (groups.dot || '') + destination;
    });
    // Keep markdown link labels readable, only change the actual target.
    if (relative.endsWith('.md')) {
      next = next.replace(/\[docs\/versions\/(V\d+[.-][A-Za-z0-9._-]+\.md)\]/gi,'[$1]');
    }
    if (previous !== next) {
      fs.writeFileSync(absolute, next, 'utf8');
      rewritten++;
    }
  }
  const index = path.join(versions,'README.md');
  if (!fs.existsSync(index)) {
    fs.mkdirSync(versions,{recursive:true});
    const latest = Array.from(known).filter(name => {
      const match = name.match(/^V(\d+)/i);
      return match && Number(match[1]) >= 958;
    }).sort().reverse();
    const lines = [
      '# Versionsdokumentation',
      '',
      'Historische Sonic-Display-Releases, Funktionsbeschreibungen und Verifikationen.',
      'Alle Versionsdokumente liegen hier. Die eigentlichen Changelogs liegen in [changelog/](../../changelog/README.md).',
      '',
      '## Neuere Versionen',
      '',
      ...latest.map(name => '- ['+name+'](./'+name+')'),
      ''
    ];
    fs.writeFileSync(index,lines.join('\n'),'utf8');
  }
  const leftover = fs.readdirSync(root).filter(name => versionName.test(name));
  if (leftover.length) throw new Error('Root version docs remain: '+leftover.slice(0,5).join(', '));
  console.log('VERSION_DOCS_MIGRATION_SUCCESS: '+moved+' moved/merged, '+rewritten+
    ' references rewritten, '+known.size+' archived version docs');
}
if (require.main === module) main();
module.exports = {main};
