const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const engine=read('components/visualizer/stageDirectorV287.ts');const stage=read('components/visualizer/VisualizerStage.tsx');const controls=read('components/visualizer/StageDirectorControlsV287.tsx');const settings=read('components/SettingsPanel.tsx');
for(const term of ['chooseDirectedStage','advanceStageDirector','manualStageOverride','minInterval','trackId !== state.trackId','STAGE_DIRECTOR_KEY'])assert.ok(engine.includes(term),term);
for(const term of ['stageDirectorRef.current','stageTheme={directedStage}','stage-director-transition-v287'])assert.ok(stage.includes(term),term);
assert.ok(controls.includes('Automatische Bühnenwechsel aktivieren'));assert.ok(settings.includes('<StageDirectorControlsV287 />'));assert.ok(read('app/globals.css').includes('prefers-reduced-motion'));assert.ok(Number(JSON.parse(read('package.json')).version.match(/-v(\d+)$/)?.[1] ?? 0) >= 287);
console.log('V287 Stage Director integration regression passed');
