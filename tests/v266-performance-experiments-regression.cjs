const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const service=read('services/monitoring/performanceExperimentsV266.ts');const component=read('components/PerformanceOptimizationAssistantV264.tsx');const pkg=require('../package.json');
assert.ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 266, 'Projektversion muss >= V266 sein');
for(const key of ['decodeExperiments','addExperiment','bestExperiment','scoreExperiment','isExperiment'])assert.match(service,new RegExp(`function ${key}\\(`));
assert.match(service,/MAX_EXPERIMENTS=20/);assert.match(service,/data.filter\(isExperiment\)/);assert.match(component,/localStorage\.setItem/);assert.match(component,/setRestorePreview\(e\)/);assert.match(component,/Gespeicherte Konfiguration übernehmen/);assert.match(component,/setPerformanceMode\(restorePreview\.after\.mode\)/);assert.match(component,/setUndo\(original\)/);assert.match(component,/impactResult\?\.status!=="ready"/);assert.match(component,/V266 · Smart Performance Experiment Manager/);console.log('V266 regression OK');
