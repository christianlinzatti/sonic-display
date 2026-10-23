const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const engine = read('components/visualizer/intelligentLightingDirector.ts');
const stage = read('components/visualizer/DynamicStage.tsx');
const checks = [
 ['version', Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=248],
 ['four phases', ['intro','build','drop','break'].every(p=>engine.includes('"'+p+'"'))],
 ['state reset', engine.includes('if (!active)')],
 ['deterministic bounded timestep', engine.includes('Math.min(.1')],
 ['debounced transition', engine.includes('s.holdSeconds >= 1.5')],
 ['reduced motion', engine.includes('if (reducedMotion)')],
 ['audio kick input', engine.includes('audio.kickAccentIntensity')],
 ['source wiring', stage.includes('advanceLightingDirector(directorState.current')],
 ['opt in only', stage.includes('Boolean(musicPalette && reactive && isPlaying)')],
 ['quality cap', stage.includes('tier === "low" ? 1.06')],
 ['existing cue pipeline', stage.includes('advanceStageCue(cueState.current')],
 ['no new lights', (stage.match(/<pointLight /g)||[]).length===3 && (stage.match(/<spotLight /g)||[]).length===1],
 ['no shadows', !stage.includes('castShadow')],
 ['render loop', stage.includes('useFrame((state, delta)')]
];
for (const [name, ok] of checks) assert.ok(ok, name);
console.log(`${checks.length} V170 lighting director checks passed`);
