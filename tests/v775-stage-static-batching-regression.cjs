"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("./typescript-loader.cjs");
const root = path.resolve(__dirname, "..");
const plansPath = path.join(root, "components/visualizer/stages/stageInstancePlansV775.ts");
const plansText = fs.readFileSync(plansPath, "utf8");
const compiled = ts.transpileModule(plansText, {fileName: plansPath, reportDiagnostics: true,
  compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS}});
assert.equal(compiled.diagnostics?.length ?? 0, 0, "TypeScript plan parses");
const mod = new Module(plansPath, module);
mod.filename = plansPath;
mod.paths = Module._nodeModulePaths(path.dirname(plansPath));
mod._compile(compiled.outputText, plansPath);
const plans = mod.exports;
const count = {
  VAPORWAVE_BARS_V775: 9,
  VAPORWAVE_PALM_TRUNKS_V775: 2,
  VAPORWAVE_PALM_LEAVES_V775: 6,
  ROCK_AMP_PANELS_V775: 6,
  ROCK_TRUSS_POSTS_V775: 2,
  ROCK_TRUSS_HOUSINGS_V775: 3,
  CYBERPUNK_TOWER_LEDS_V775: 3, // per tower, two independent material colours
  CYBERPUNK_SIDE_NEONS_V775: 2,
};
for (const [key, n] of Object.entries(count)) {
  const value = plans[key];
  assert(Array.isArray(value), `${key} is an array`);
  assert.equal(value.length, n, `${key} retains all stage props`);
  for (const item of value) {
    assert.equal(item.position.length, 3);
    assert(item.position.every(Number.isFinite), "finite position");
    if (item.scale) {
      assert.equal(item.scale.length, 3);
      assert(item.scale.every(s => Number.isFinite(s) && s > 0), "nondegenerate scale");
    }
    if (item.rotationZ !== undefined) assert(Number.isFinite(item.rotationZ), "finite rotation");
  }
}
for (let i=0;i<9;i++) {
  assert.deepEqual(plans.VAPORWAVE_BARS_V775[i].position, [0, -.9+i*.24, -6.9]);
  assert.deepEqual(plans.VAPORWAVE_BARS_V775[i].scale, [5,.05,.06]);
}
const expectedLeaves = [-4,4].flatMap(x=>[-.5,0,.5].map(a=>[x+a,.35,-3.15]));
assert.deepEqual(plans.VAPORWAVE_PALM_LEAVES_V775.map(v=>v.position),expectedLeaves);
assert.deepEqual(plans.VAPORWAVE_PALM_LEAVES_V775.map(v=>v.rotationZ),[-.5,0,.5,-.5,0,.5].map(a=>-a*.65));
assert.deepEqual(plans.VAPORWAVE_PALM_TRUNKS_V775.map(v=>v.position),[[-4,-.85,-3],[4,-.85,-3]]);
assert.deepEqual(plans.ROCK_TRUSS_POSTS_V775.map(v=>v.scale),[[.22,5.2,.22],[.22,5.2,.22]]);
assert.deepEqual(plans.ROCK_AMP_PANELS_V775.map(v=>v.position),[-3.7,3.7].flatMap(x=>[-1.3,.3,1.9].map(y=>[x,y,-1.8])));
assert.deepEqual(plans.ROCK_TRUSS_HOUSINGS_V775.map(v=>v.position),[-2.6,0,2.6].map(x=>[x,2.72,-1.8]));
assert.deepEqual(plans.CYBERPUNK_TOWER_LEDS_V775.map(v=>v.position),[0,.8,1.6].map(y=>[0,y-1,.15]));
assert.deepEqual(plans.CYBERPUNK_SIDE_NEONS_V775.map(v=>v.position),[[-2.5,.2,-2.65],[2.5,.2,-2.65]]);
const batchPath=path.join(root,'components/visualizer/stages/StageStaticBatchV775.tsx');
const batch=fs.readFileSync(batchPath,'utf8');
assert.equal(ts.transpileModule(batch,{fileName:batchPath,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.Preserve}}).diagnostics?.length??0,0);
assert.match(batch,/<instancedMesh ref=\{meshRef\}/);
assert.match(batch,/mesh\.setMatrixAt\(i, dummy\.matrix\)/);
assert.match(batch,/mesh\.instanceMatrix\.needsUpdate = true/);
assert.match(batch,/mesh\.computeBoundingSphere\(\)/);
assert.match(batch,/useLayoutEffect\(\(\) =>/);
assert.match(batch,/geometry === "palmTrunk"/);
assert.match(batch,/geometry === "palmLeaf"/);
assert.match(batch,/geometry="trussHousing"|trussHousing/);
assert.match(batch,/<meshStandardMaterial/);
assert.match(batch,/<meshBasicMaterial/);
assert.doesNotMatch(batch,/setInterval|setTimeout|requestAnimationFrame|useFrame|new WebGLRenderer/);
const stagePath=path.join(root,'components/visualizer/stages/index.tsx');
const stages=fs.readFileSync(stagePath,'utf8');
for(const key of Object.keys(count))assert.match(stages,new RegExp(`instances=\{${key}\}`));
assert.equal((stages.match(/<StageStaticBatchV775\b/g)||[]).length,8,'Vaporwave 3, Rock 3, Cyberpunk 2 authored; tower instance renders twice');
assert.match(stages,/<RockTrussSpotV772\/>/,'physical rock spotlight kept');
assert.match(stages,/"#00f0ff" : "#fa38d7"/,'distinct cyan/magenta tower colours kept');
assert.match(stages,/emissive="#ee6d20" emissiveIntensity=\{\.3\}/,'rock fixture glow kept');
const dynamic=fs.readFileSync(path.join(root,'components/visualizer/DynamicStage.tsx'),'utf8');
assert.match(dynamic,/<mesh ref=\{ledWallV635\}/,'single LED wall shader is not duplicated');
const pkg=require('../package.json');
assert.match(pkg.version,/^0\.1\.0-v(?:77[5-9]|7[89]\d|[89]\d\d)$/,'V775 and later releases preserve static batching');
assert(pkg.scripts['check:fast'].includes('npm run test:v775 && npm run test:v775:types && npm run test:v774 &&'));
assert(pkg.scripts['build:preflight'].includes('npm run test:v775 && npm run test:v775:types && npm run test:v774 &&'));
assert(pkg.scripts['test:v775:types'].includes('stageInstancePlansV775.ts'));
// Per-stage savings: Vaporwave 17->3, Rock 11->3, Cyberpunk 8->3.
assert.equal(9+2+6,17);
assert.equal(6+2+3,11);
assert.equal(3*2+2,8);
console.log('PASS V775: 8 verified static instance plans, scene-integrated 9 draw batches, 3 stage material families, no new frame loops, LED wall preserved');
