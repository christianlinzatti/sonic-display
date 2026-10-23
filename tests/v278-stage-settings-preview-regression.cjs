const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

const settings=read('components/SettingsPanel.tsx');
const previewComponent=read('components/visualizer/StageThemePreviewGrid.tsx');
const stages=read('components/visualizer/stages/index.tsx');
const css=read('app/globals.css');

assert.match(settings,/StageThemePreviewGrid/);
assert.match(settings,/Die Vorschaukarten zeigen die visuelle Richtung der Bühne direkt in den Settings/);
assert.match(previewComponent,/stage-theme-grid/);
assert.match(previewComponent,/stage\.id === "rock"/);
assert.match(stages,/description:/);
assert.match(stages,/mood:/);
for(const key of ['classic','neon','festival','minimal','cyberpunk','vaporwave','galaxy','white','rock']){
  assert.match(css,new RegExp('stage-theme-preview-'+key));
}
console.log('V278 stage settings preview PASS');
