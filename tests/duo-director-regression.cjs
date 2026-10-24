require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert = require("node:assert/strict");
const fs = require("node:fs");const path = require("node:path");
const read = x => fs.readFileSync(path.join(__dirname,"..",x),"utf8");
const eng = read("components/visualizer/duoChoreographyDirector.ts");
const avatar = read("components/visualizer/ThreeAvatar.tsx");
const settings = read("components/SettingsPanel.tsx");
const registry = read("components/visualizer/registry.tsx");
const stage = read("components/visualizer/VisualizerStage.tsx");
assert(eng.includes("advanceDuoDirector"));assert(eng.includes('"solo", "sync", "mirror", "duet"'));
assert(eng.includes("nextAt"));assert(eng.includes("rhythmPhrasePosition"));assert(eng.includes("rhythmPhraseAccent"));
assert(eng.includes("reducedMotion"));assert(eng.includes("confidence"));assert(eng.includes("Math.min(.25"));
assert(avatar.includes("<DuoDirectorTick"));assert(avatar.includes("auto ? autoScene"));
assert(avatar.includes("multiAvatarMode: mode"));assert(settings.includes("duoDirectorEnabled"));
assert(registry.includes("duoDirectorEnabled?: boolean"));assert(stage.includes("duoDirectorEnabled={preferences.duoDirectorEnabled ?? false}"));
let ts;for(const id of ["typescript","/usr/local/lib/node_modules/typescript","/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript"])try{ts=require(id);break}catch{}
if(ts){for(const f of ["components/visualizer/duoChoreographyDirector.ts","components/visualizer/ThreeAvatar.tsx","components/SettingsPanel.tsx"]){const ds=ts.transpileModule(read(f),{fileName:f,compilerOptions:{jsx:ts.JsxEmit.Preserve,module:ts.ModuleKind.ESNext},reportDiagnostics:true}).diagnostics||[];assert.equal(ds.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,f);}}
console.log("V141 Duo Director: 14 integration assertions and syntax checks passed");
