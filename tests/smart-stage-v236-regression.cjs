require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const root=path.join(__dirname,'..');const file=p=>fs.readFileSync(path.join(root,p),'utf8');
const s=file('components/visualizer/smartStageDirectorV236.ts');const camera=file('components/visualizer/SmartStageCameraV236.tsx');const scene=file('components/visualizer/DynamicStage.tsx');const avatar=file('components/visualizer/ThreeAvatar.tsx');
for(const x of ['createStageDirectorState','advanceStageDirector','Number.isFinite(dt)','reducedMotion','hardstyle','s.hold>.28'])assert.ok(s.includes(x),x);
for(const x of ['useFrame','camera.position.x','camera.position.z','camera.lookAt','SmartStageCameraV236'])assert.ok(camera.includes(x),x);
assert.match(scene,/smartCue\.sweep/);assert.match(avatar,/<SmartStageCameraV236 /);assert.match(avatar,/<DynamicStage /);
assert.equal(JSON.parse(file('package.json')).version,'0.1.0-v248'); console.log('V236 stage director regression checks passed');
