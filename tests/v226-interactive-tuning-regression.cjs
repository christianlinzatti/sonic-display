const fs = require('fs'); const assert = require('assert');
const root = require('path').resolve(__dirname, '..');
const src = fs.readFileSync(`${root}/components/visualizer/InteractivePerformanceTuner.tsx`, 'utf8');
const integration = fs.readFileSync(`${root}/components/visualizer/PerformanceBenchmarkPanel.tsx`, 'utf8');
for (const token of ['compareTuningRuns','baseline','candidate','setPerformanceMode(candidate)','setPerformanceMode(run.current.original)','WARMUP_MS','SAMPLE_MS','performanceRef.current.mode','run.current = null','Abbrechen &amp; zurücksetzen','Testprofil übernehmen','diagnosticsRef.current']) assert(src.includes(token), `Missing: ${token}`);
assert(integration.includes('<InteractivePerformanceTuner disabled={running} />'));
console.log('V226 Interactive Performance Tuning: 13 structural checks passed');
