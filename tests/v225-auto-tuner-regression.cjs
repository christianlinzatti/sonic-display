const assert = require('node:assert/strict');
const fs = require('node:fs'); const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const engine = read('components/visualizer/performanceAutoTuner.ts');
const panel = read('components/visualizer/PerformanceBenchmarkPanel.tsx');
const checks = ['createTuningAdvice', 'valid.length < 3', 'new Set(valid.map', 'targetFps', 'best', 'high.fps < balanced.fps', 'low.fps >= balanced.fps', 'highResources.calls > 300', 'highResources.triangles > 500000', 'keine automatische Modelländerung'].map(t => engine.includes(t));
checks.push(panel.includes('createTuningAdvice(results'), panel.includes('V225 – Performance Auto-Tuning Assistant'), panel.includes('Keine automatische Änderung'), require('../package.json').version === '0.1.0-v248');
checks.forEach((ok,i) => assert.ok(ok, `V225 check ${i+1}`));
console.log(`V225 auto-tuning regression: ${checks.length} checks passed`);
