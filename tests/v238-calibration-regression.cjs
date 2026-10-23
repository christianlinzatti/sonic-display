const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const ui=fs.readFileSync(path.join(root,'components/visualizer/AutomaticPerformanceCalibrationWizard.tsx'),'utf8');const core=fs.readFileSync(path.join(root,'components/visualizer/autoCalibrationAdvisor.ts'),'utf8');const parent=fs.readFileSync(path.join(root,'components/visualizer/PerformanceBenchmarkPanel.tsx'),'utf8');
for(const part of ['calibrationCandidates','recommendCalibration','stable.length','recommended: null'])assert.ok(core.includes(part),part);
for(const part of ['setPerformanceMode','setSceneDetail','restoreAndStop','updatedAt','WARMUP_MS','readings.length<2','qualityRef.current.tier','Empfehlung übernehmen','Zurücksetzen'])assert.ok(ui.includes(part),part);
assert.ok(parent.includes('<AutomaticPerformanceCalibrationWizard disabled={running} />'));
assert.equal(require('../package.json').version,'0.1.0-v248');
console.log('V238 calibration wiring: OK');
