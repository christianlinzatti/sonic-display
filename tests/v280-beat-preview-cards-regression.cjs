const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = p => fs.readFileSync(p, 'utf8');

const settings = read('components/SettingsPanel.tsx');
const grid = read('components/visualizer/StageThemePreviewGrid.tsx');
const css = read('app/globals.css');

assert.match(settings, /StageThemePreviewGrid[\s\S]*reactive=\{preferences\.stageReactive \?\? true\}/);
assert.match(settings, /lightStrength=\{preferences\.stageLightStrength \?\? 60\}/);
assert.match(settings, /reducedMotion=\{preferences\.reducedMotion\}/);

assert.match(grid, /stage-theme-mini-beam left/);
assert.match(grid, /stage-theme-mini-fog fog-a/);
assert.match(grid, /stage-theme-beat-orb/);
assert.match(grid, /Beat Preview/);
assert.match(grid, /reactive \? "reactive" : "static"/);

assert.match(css, /stage-theme-card\.reactive \.stage-theme-floor/);
assert.match(css, /stageMiniBeatFloor/);
assert.match(css, /stageMiniBeamLeft/);
assert.match(css, /stageMiniFog/);
assert.match(css, /stage-theme-live-chip/);

console.log('V280 beat preview cards PASS');
