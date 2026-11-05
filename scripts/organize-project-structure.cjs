#!/usr/bin/env node
'use strict';
/**
 * V966: idempotent, conservative cleanup of the historic full-project ZIP layout.
 * Runs after GitHub's V965-compatible archive extraction and is safe to rerun.
 * Historical source duplicates are retired ONLY when their active equivalents exist.
 * Never touches user data, runtime source trees or protected GitHub workflows.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const here = (...parts) => path.join(root, ...parts);
const legacyVersions = [874, 875, 876, 877, 878];
const staleButPreserved = new Set([
  'v874/components/visualizer/IntelligentAudienceArmsV874.tsx',
  'v875/components/visualizer/FestivalWristbandsV875.tsx',
  'v878/tests/v878-smart-audience-emotion-regression.cjs',
]);
const results = { moved: [], retired: [], preserved: [] };
const slash = value => value.split(path.sep).join('/');
const fileHash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function moveChecked(src, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target)) {
    if (fileHash(src) !== fileHash(target)) {
      throw new Error(`Conflicting documents: ${slash(path.relative(root, src))} => ${slash(path.relative(root, target))}`);
    }
    fs.unlinkSync(src);
  } else fs.renameSync(src, target);
  results.moved.push(`${slash(path.relative(root,src))} => ${slash(path.relative(root,target))}`);
}
function topicFor(name) {
  const upper = name.toUpperCase();
  if (upper === 'SPOTIFY_LOCAL_SETUP.MD') return 'setup';
  if (/^(?:V\d+[._-])/.test(upper)) return 'versions';
  if (/AVATAR|RETARGET|FBX|\bLOD\b|FOOT|SKELET/.test(upper)) return 'features/avatars';
  if (/DANCE|MOTION|CHOREOGRAPH|ANIMATION|BONE|PARTNER|RAP_FLOW/.test(upper)) return 'features/dance';
  if (/LYRIC|KARAOKE|TYPOGRAPH|NEON_PULSE/.test(upper)) return 'features/lyrics';
  if (/STAGE|LASER|PYRO|PARTICLE|LIGHT|GALAXY|CONCERT|FX_/.test(upper)) return 'features/stage';
  if (/BEAT|MUSIC_STRUCTURE|MUSIC_REACTIVE|MUSIC_AWARE/.test(upper)) return 'features/audio';
  if (/PERFORMANCE|GPU|RENDER|BENCHMARK|BUILD|STABILIZATION/.test(upper)) return 'features/performance';
  if (/SPOTIFY|VERCEL|GOVEE|HISTORY/.test(upper)) return 'features/integrations';
  return 'features/application';
}
function checkRetirableVersions() {
  for (const version of legacyVersions) {
    const srcRoot = here(`v${version}`);
    if (!fs.existsSync(srcRoot)) continue;
    const collect = base => fs.readdirSync(base, { withFileTypes: true }).flatMap(entry => {
      const full = path.join(base, entry.name);
      return entry.isDirectory() ? collect(full) : entry.isFile() ? [full] : [];
    });
    // Plan & validate the whole folder BEFORE deleting a single file.
    const files = collect(srcRoot);
    for (const oldFile of files) {
      const rel = slash(path.relative(root, oldFile));
      const activeRel = slash(path.relative(srcRoot, oldFile));
      const active = here(activeRel);
      if (!fs.existsSync(active)) throw new Error(`Cannot retire ${rel}: active source ${activeRel} missing`);
      if (fileHash(oldFile) !== fileHash(active) && !staleButPreserved.has(rel)) {
        throw new Error(`Cannot retire divergent source ${rel} (not in explicit legacy preservation list)`);
      }
    }
    for (const oldFile of files) {
      const rel = slash(path.relative(root, oldFile));
      const active = here(path.relative(srcRoot, oldFile));
      if (fileHash(oldFile) !== fileHash(active)) {
        const dest = here('artifacts', 'legacy-snapshots', `${path.basename(oldFile)}.txt`);
        moveChecked(oldFile, dest);
        results.preserved.push(rel);
      } else fs.unlinkSync(oldFile);
    }
    fs.rmSync(srcRoot, { recursive: true });
    results.retired.push(`v${version}/`);
  }
}
function moveRootDocuments() {
  const moved = new Map();
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    if (entry.name === 'README.md' || entry.name === 'ARCHITECTURE.md') continue;
    const dest = `docs/${topicFor(entry.name)}/${entry.name}`;
    moveChecked(here(entry.name), here(dest));
    moved.set(entry.name, dest);
  }
  return moved;
}
function moveRootEvidence() {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const name = entry.name;
    if (!/\.(?:txt|json)$/i.test(name) || ['package.json','package-lock.json','tsconfig.json','tsconfig.v319-core.json','vercel.json'].includes(name)) continue;
    const type = /SHA256|MANIFEST|SOURCE|PACKAGE|CHANGES|CHANGED-FILES|FILE-MANIFEST/i.test(name) ? 'manifests' :
      /LOG|REGRESSION|TYPECHECK|TYPES|OFFLINE/i.test(name) ? 'logs' : 'reports';
    moveChecked(here(name), here('artifacts','historical',type,name));
  }
}
function retireLegacyInstallers() {
  const install = /^apply-v(?:874|875|876|877|878|880-hotfix3)\.cjs$/i;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile() || !(install.test(entry.name) || entry.name === 'edit_v759.py')) continue;
    // These installers require obsolete versioned staging payloads. Retain readable
    // historical sources, but make it impossible to accidentally execute them.
    moveChecked(here(entry.name), here('docs','history','retired-installers',`${entry.name}.txt`));
  }
}
function updateActiveReferences(movedDocs) {
  const files = [here('README.md'), here('tests/check-architecture.cjs'),
    here('tests/v888-laser-show-director-regression.cjs'),
    here('tests/v889-advanced-particle-director-regression.cjs'),
    here('tests/v890-professional-spotlight-show-regression.cjs')];
  // Old feature docs rarely appear in runtime code. Replace only known links and
  // exact source-test string constants; do not mutate immutable historic manifests.
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let data = fs.readFileSync(file, 'utf8');
    for (const [name, destination] of movedDocs) {
      if (file.endsWith('README.md')) data = data.replaceAll(`](${name})`, `](${destination})`);
      else data = data.replaceAll(`'${name}'`, `'${destination}'`).replaceAll(`"${name}"`, `"${destination}"`);
    }
    // Idempotency for an already-migrated archive overlaying an older checkout:
    for (const [name, destination] of Object.entries({
      'SPOTIFY_LOCAL_SETUP.md':'docs/setup/SPOTIFY_LOCAL_SETUP.md',
      'LASER_SHOW_DIRECTOR_V888.md':'docs/features/stage/LASER_SHOW_DIRECTOR_V888.md',
      'ADVANCED_PARTICLE_FX_V889.md':'docs/features/stage/ADVANCED_PARTICLE_FX_V889.md',
      'PROFESSIONAL_SPOTLIGHT_SHOW_V890.md':'docs/features/stage/PROFESSIONAL_SPOTLIGHT_SHOW_V890.md',
    })) {
      if (file.endsWith('README.md')) data = data.replaceAll(`](${name})`, `](${destination})`);
      else data = data.replaceAll(`'${name}'`, `'${destination}'`).replaceAll(`"${name}"`, `"${destination}"`);
    }
    fs.writeFileSync(file, data);
  }
}
function cleanOldTypeScriptExclusions() {
  const f = here('tsconfig.json');
  const value = JSON.parse(fs.readFileSync(f,'utf8'));
  value.exclude = (value.exclude || []).filter(x => !/^v(?:874|875|876|877|878)\/\*\*\/\*$/.test(x));
  fs.writeFileSync(f, JSON.stringify(value,null,2)+'\n');
}
function main() {
  checkRetirableVersions();
  const moved = moveRootDocuments();
  moveRootEvidence();
  retireLegacyInstallers();
  updateActiveReferences(moved);
  cleanOldTypeScriptExclusions();
  const dirs = fs.readdirSync(root).filter(name => /^v\d+$/.test(name) && fs.statSync(here(name)).isDirectory());
  if (dirs.length) throw new Error(`Unexpected versioned root directories: ${dirs.join(', ')}`);
  console.log(`V966 structure cleanup: moved ${results.moved.length}, retired ${results.retired.length} obsolete version folders, preserved ${results.preserved.length} divergent historic components`);
  return results;
}
if (require.main === module) main();
module.exports = { main, topicFor };
