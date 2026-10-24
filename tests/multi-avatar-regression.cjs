require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = f => fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const avatar=read('components/visualizer/ThreeAvatar.tsx');
const stage=read('components/visualizer/VisualizerStage.tsx');
const prefs=read('context/UiPreferencesContext.tsx');
const settings=read('components/SettingsPanel.tsx');
const registry=read('components/visualizer/registry.tsx');
for(const mode of ['solo','sync','mirror','duet'])assert(settings.includes(`value="${mode}"`));
assert(avatar.includes('mode !== "solo"'));
assert(avatar.includes('mode === "mirror" ? -1 : 1'));
assert(avatar.includes('<Dancer props={props} secondary />') || avatar.includes('<Dancer props={{...props, multiAvatarMode: mode}} secondary />') || avatar.includes('<Dancer props={partnerProps} secondary />'));
assert(avatar.includes('secondaryDancePreset'));
assert(avatar.includes('dual || auto ? 5.9 : 4.2')); 
assert(stage.includes('useAvatarModel(secondaryAvatarId)'));
assert(stage.includes('secondaryAvatarModelUrl={secondaryAvatar.url}'));
assert(prefs.includes('multiAvatarMode: "solo"'));
assert(registry.includes('secondaryAvatarModelUrl?: string | null'));
let ts;for(const loc of ['typescript','/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript','/usr/local/lib/node_modules/typescript']){try{ts=require(loc);break}catch{}}
if(ts){for(const file of ['components/visualizer/ThreeAvatar.tsx','components/SettingsPanel.tsx','components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx']){const diagnostics=ts.transpileModule(read(file),{fileName:file,compilerOptions:{jsx:ts.JsxEmit.Preserve,module:ts.ModuleKind.ESNext},reportDiagnostics:true}).diagnostics||[];assert.equal(diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,file)}}
console.log('V140 multi-avatar integration: 14 assertions and JSX transpile checks passed');
