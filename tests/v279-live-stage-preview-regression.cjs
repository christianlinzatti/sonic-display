const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

const settings=read('components/SettingsPanel.tsx');
const livePreview=read('components/visualizer/StageThemeLivePreview.tsx');
const css=read('app/globals.css');

assert.match(settings,/StageThemeLivePreview/);
assert.match(settings,/theme=\{preferences\.stageTheme \?\? "classic"\}/);
assert.match(livePreview,/Bewegende Scheinwerfer/);
assert.match(livePreview,/stage-live-preview-flare flare-right/);
assert.match(css,/stage-live-preview/);
assert.match(css,/stageFogDrift/);
assert.match(css,/stageBeamSweepLeft/);
assert.match(css,/theme-cyberpunk/);
assert.match(css,/theme-vaporwave/);
assert.match(css,/theme-rock/);
console.log('V279 live stage preview FX PASS');
