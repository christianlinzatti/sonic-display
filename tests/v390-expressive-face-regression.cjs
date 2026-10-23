const fs=require('node:fs');const assert=require('node:assert/strict');const root=require('node:path').resolve(__dirname,'..');const read=p=>fs.readFileSync(require('node:path').join(root,p),'utf8');
const model=read('components/visualizer/expressiveFacialV390.ts');assert.match(model,/if\(!input.active\|\|input.reducedMotion\)/);assert.match(model,/if\(!input.playing\)/);assert.match(model,/Math.sin\(Math.PI/);
const rig=read('components/visualizer/VocalRigV368.tsx');assert.match(rig,/expressiveFaceV390\(/);assert.match(rig,/target.blink=Math.max/);assert.match(rig,/demoV370==="off"/);
for(const path of ['types/music.ts','components/visualizer/registry.tsx','components/visualizer/VisualizerStage.tsx','components/SettingsPanel.tsx','context/UiPreferencesContext.tsx'])assert.match(read(path),/ExpressiveFaceEnabledV390|expressiveFaceEnabledV390/);
console.log('PASS V390 expressive face integration');
