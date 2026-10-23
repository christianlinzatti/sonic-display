const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = path => fs.readFileSync(path, 'utf8');

const grid = read('components/visualizer/StageThemePreviewGrid.tsx');
const scene = read('components/visualizer/StageThemeCardScene.tsx');
const settings = read('components/SettingsPanel.tsx');
const css = read('app/globals.css');

assert.match(grid, /useState/);
assert.match(grid, /hoveredStage/);
assert.match(grid, /StageThemeCardScene/);
assert.match(grid, /onMouseEnter=\{\(\) => setHoveredStage\(stage\.id\)\}/);
assert.match(grid, /onFocus=\{\(\) => setHoveredStage\(stage\.id\)\}/);
assert.match(grid, /3D Hover Preview/);

assert.match(scene, /Canvas/);
assert.match(scene, /Sparkles/);
assert.match(scene, /function StageThemeCardSceneComponent/);
assert.match(scene, /function renderStageSet/);
assert.match(scene, /const PALETTES/);

assert.match(settings, /kleine 3D-Vorschau/);

assert.match(css, /V281: interactive 3D hover previews/);
assert.match(css, /stage-theme-3d-shell/);
assert.match(css, /stage-theme-3d-canvas/);
assert.match(css, /preview-open/);

console.log('V281 stage card 3D preview PASS');
