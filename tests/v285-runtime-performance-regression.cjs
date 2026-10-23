const fs=require('node:fs'); const assert=require('node:assert/strict');
const read=name=>fs.readFileSync(name,'utf8');
const runtimeModule=read('services/monitoring/runtimePerformanceV285.ts');
const panel=read('components/RuntimePerformancePanelV285.tsx');
const main=read('components/SonicDisplay.tsx');
const stage=read('components/visualizer/VisualizerStage.tsx');
const settings=read('components/SettingsPanel.tsx');
assert.match(runtimeModule,/getNavigationSnapshot/);assert.match(runtimeModule,/getJsHeapMiB/);
assert.match(runtimeModule,/getRuntimeCheckpoints/);assert.match(runtimeModule,/seen\.has\(name\)/);
assert.match(panel,/getSessionSummary/);assert.match(panel,/firstContentfulPaintMs/);
assert.match(panel,/setInterval\(update, 5000\)/);assert.match(panel,/clearInterval\(timer\)/);
assert.match(main,/recordRuntimeCheckpoint\("Sonic Display gemountet"\)/);
assert.match(main,/recordRuntimeCheckpoint\("Erster Track verfügbar"\)/);
assert.match(stage,/recordRuntimeCheckpoint\("Visualizer-Komponente gemountet"\)/);
assert.match(settings,/RuntimePerformancePanelV285 = dynamic/);
assert.match(settings,/RuntimePerformancePanelV285 \/>/);
console.log('V285 runtime performance instrumentation PASS');

assert.match(main,/if\(!isPlaying\)return/);assert.match(main,/if\(!document\.hidden\)setNow/);
