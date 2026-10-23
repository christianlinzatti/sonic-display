const assert = require('node:assert/strict');
const fs = require('node:fs');
const root = fs.readFileSync('components/SonicDisplay.tsx', 'utf8');
for (const component of ['KineticLyrics', 'AmbientStandby', 'TouchKioskControls', 'AutoApplyPerformanceProfile']) {
  assert.match(root, new RegExp(`const ${component} = dynamic\\(\\(\\) => import\\(`), `${component} must be dynamically imported`);
  assert.doesNotMatch(root, new RegExp(`import \\{[^\\n]*\\b${component}\\b[^\\n]*\\} from`), `${component} must not be eagerly imported`);
}
assert.match(root, /import \{ useSmartAmbient \}/, 'ambient hook remains mounted');
assert.match(root, /import \{ useTouchKiosk \}/, 'kiosk hook remains mounted');
const service = fs.readFileSync('services/monitoring/performanceOptimizationImpactV265.ts', 'utf8');
assert.match(service, /difference===null\|\|before===null\|\|before===0/, 'nullable baseline TS regression fixed');
assert.match(fs.readFileSync('package.json','utf8'), /test:v284/);
console.log('V284 bundle splitting regressions PASS');
