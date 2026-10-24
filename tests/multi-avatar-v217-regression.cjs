require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../components/visualizer/ThreeAvatar.tsx"), "utf8");
assert.match(source, /queuedStructurePhase\.current !==|choreoPhase!==queuedStructurePhase\.current/);
assert.match(source, /queuedStructurePhase\.current = choreoPhase/);
assert.match(source, /cue\.scene !== previous\.scene/);
assert.match(source, /cue\.role !== previous\.role/);
assert.match(source, /cue\.phrase !== previous\.phrase/);
assert.doesNotMatch(source, /const key=`\$\{cue\.scene\}/);
assert.match(source, /useMemo\(\(\) => \(\{\.\.\.props, multiAvatarMode: mode\}\), \[props, mode\]\)/);
let ts;
for(const name of ["typescript", "/usr/local/lib/node_modules/typescript", "/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript"]) {try { ts=require(name);break;}catch{}}
if(ts){const errors=(ts.transpileModule(source,{fileName:"ThreeAvatar.tsx",compilerOptions:{jsx:ts.JsxEmit.Preserve,module:ts.ModuleKind.ESNext},reportDiagnostics:true}).diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error); assert.equal(errors.length,0);}
console.log("V217 multi-avatar frame/render regression checks passed");
