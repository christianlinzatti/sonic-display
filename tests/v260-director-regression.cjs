require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const logic=read('components/visualizer/adaptiveMultiAvatarDirectorV260.ts');
const avatar=read('components/visualizer/ThreeAvatar.tsx');const panel=read('components/AvatarFrameProfilerPanel.tsx');
assert.match(logic,/active.length < 2/);assert.match(logic,/s.frames >= 45/);assert.match(logic,/own.meanMs < 2/);assert.match(logic,/localStorage/);
assert.match(avatar,/readMultiAvatarDirectorEnabled\(\)/);assert.match(avatar,/decideMultiAvatarDirector\(/);assert.match(avatar,/chooseAvatarWorkloadTier\(/);assert.match(avatar,/stabilizeAvatarWorkload\(/);
assert.match(panel,/checked={directorEnabled}/);assert.match(panel,/setMultiAvatarDirectorEnabled\(/);
assert.match(JSON.parse(read('package.json')).version,/^0\.1\.0-v26[012]$/);console.log('PASS V260 director regression');
