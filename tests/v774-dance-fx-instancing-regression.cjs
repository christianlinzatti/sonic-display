'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('./typescript-loader.cjs');
const root = path.resolve(__dirname, '..');
const policyPath = path.join(root, 'components/visualizer/danceFxInstancePlanV774.ts');
const source = fs.readFileSync(policyPath, 'utf8');
const result = ts.transpileModule(source, {fileName: policyPath, reportDiagnostics: true,
  compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS}});
assert.equal(result.diagnostics?.length ?? 0, 0, 'TypeScript parse and emit');
const mod = new Module(policyPath, module);
mod.filename = policyPath;
mod.paths = Module._nodeModulePaths(path.dirname(policyPath));
mod._compile(result.outputText, policyPath);
const {getDanceFxPoolLimitV774, writeDanceFxInstancesV774} = mod.exports;
assert.equal(getDanceFxPoolLimitV774('low'), 2);
assert.equal(getDanceFxPoolLimitV774('balanced'), 4);
assert.equal(getDanceFxPoolLimitV774('high'), 8);
const pulses = Array.from({length:8},(_,i)=>({active:true,age:i*.11,x:i*.08,z:.06,side:i%2?-1:1}));
const createSink = () => ({written:[],finished:-1,write(index,pulse,alpha){this.written.push({index,pulse,alpha});},finish(count){this.finished=count;}});
let scenarios=0;
for (const tier of ['low','balanced','high']) {
  for (const showRings of [false,true]) for (const showMarks of [false,true]) for (const showTrails of [false,true]) {
    const rings=createSink(),marks=createSink(),trails=createSink();
    const max=getDanceFxPoolLimitV774(tier);
    writeDanceFxInstancesV774(pulses,max,.8,{shockwaves:showRings,footprints:showMarks,trails:showTrails,tier},rings,marks,trails);
    const cap = tier === 'high' ? 8 : tier === 'balanced' ? 4 : 2;
    for (const sink of [rings,marks,trails]) {
      assert(sink.finished <= cap, 'no writes beyond adaptive pool');
      assert.equal(sink.finished,sink.written.length, 'only drawn instances were written');
      for (const [i,point] of sink.written.entries()) {
        assert.equal(point.index,i,'instances are packed from slot 0');
        assert(Number.isFinite(point.alpha)&&point.alpha>0&&point.alpha<=1,'legal per-instance opacity');
      }
    }
    assert.equal(rings.finished>0,showRings&&tier!=='low');
    assert.equal(marks.finished>0,showMarks);
    assert.equal(trails.finished>0,showTrails&&tier==='high');
    // The remaining 24 original effect meshes are no longer independent draw calls.
    assert([rings,marks,trails].filter(s=>s.finished>0).length<=3);
    scenarios++;
  }
}
const r=createSink(),m=createSink(),t=createSink();
for (const age of [0,.3,.7,1.1]) {
  pulses[0].age=age;
  for (let i=1;i<pulses.length;i++)pulses[i].active=false;
  r.written=[];m.written=[];t.written=[];
  writeDanceFxInstancesV774(pulses,8,1,{shockwaves:true,footprints:true,trails:true,tier:'high'},r,m,t);
  assert.equal(r.finished,age<.95?1:0,'shockwave alpha fades with age');
  assert.equal(m.finished,age<1.1?1:0,'footprint alpha fades with age');
  assert.equal(t.finished,age<.65?1:0,'trail alpha fades with age');
  if(age===0) {
    assert(Math.abs(r.written[0].alpha-.56)<1e-9);
    assert(Math.abs(m.written[0].alpha-.42)<1e-9);
    assert(Math.abs(t.written[0].alpha-.25)<1e-9);
  }
}
for (const pulse of pulses)pulse.active=false;
r.written=[];m.written=[];t.written=[];
writeDanceFxInstancesV774(pulses,8,1,{shockwaves:true,footprints:true,trails:true,tier:'high'},r,m,t);
assert.deepEqual([r.finished,m.finished,t.finished],[0,0,0],'idle effects consume no draws');
for (const weird of [-1,0,1,2.5,100]) {
  r.written=[];m.written=[];t.written=[];
  writeDanceFxInstancesV774(pulses,weird,1,{shockwaves:true,footprints:true,trails:true,tier:'high'},r,m,t);
  assert.deepEqual([r.finished,m.finished,t.finished],[0,0,0]);
}
const component=fs.readFileSync(path.join(root,'components/visualizer/DanceFX.tsx'),'utf8');
assert.equal((component.match(/<instancedMesh\b/g)||[]).length,3,'one instanced draw batch per effect family');
assert.equal((component.match(/<mesh\b/g)||[]).length,0,'no individual per-pulse Mesh draw calls');
assert.equal((component.match(/useFrame\(/g)||[]).length,1,'no second animation loop');
assert.match(component,/new InstancedBufferAttribute\(new Float32Array\(POOL\), 1\)/,'preallocated per-pulse alpha');
assert.match(component,/mesh\.setMatrixAt\(index, dummy\.matrix\)/,'actual GPU instance matrices written');
assert.match(component,/mesh\.count = count/,'compaction updates draw instance count');
assert.match(component,/instanceMatrix\.needsUpdate = true/,'GPU instance matrix updates');
assert.match(component,/alpha\.needsUpdate = true/,'GPU opacity attribute updates');
assert.match(component,/attribute float instanceOpacity/,'per-instance alpha supported in vertex shader');
assert.match(component,/gl_FragColor = vec4\(uColor, vInstanceOpacity\)/,'actual transparent alpha preserved');
assert.match(component,/NormalBlending/,'footprints retain correct alpha compositing');
assert.equal((component.match(/forceSinglePass: true/g)||[]).length,2,'transparent DoubleSide planes must not double draw');
assert.match(component,/AdditiveBlending/,'shockwaves and trails retain additive compositing');
assert.match(component,/\.ring\.dispose\(\)/);
assert.match(component,/\.trail\.dispose\(\)/);
assert.match(component,/material\.dispose\(\)/,'private materials cleaned up');
assert.match(component,/shouldSkipDormantFxV552\(enabled,\s*wasEnabledV552.current\)/,'V552 idle optimization survives');
assert.match(component,/lastBeat\.current = isBeat;/,'beat edge gating remains');
assert.match(component,/elapsed\.current - lastKick\.current >= \.24/,'beat cooldown preserved');
assert.doesNotMatch(component,/setInterval\(|setTimeout\(|requestAnimationFrame\(|new WebGLRenderer\(/);
const pkg=require('../package.json');
assert.match(pkg.version,/^0\.1\.0-v(?:77[4-9]|7[89]\d|[89]\d\d)$/,'V774 or newer');
assert(pkg.scripts['check:fast'].includes('npm run test:v774 && npm run test:v774:types && npm run test:v773 &&'));
assert(pkg.scripts['build:preflight'].includes('npm run test:v774 && npm run test:v774:types && npm run test:v773 &&'));
assert(pkg.scripts['test:v774:types'].includes('danceFxInstancePlanV774.ts'));
console.log(`PASS V774: ${scenarios} tier/visibility cases, opacity lifecycles, packed instances, 24→at most 3 draws, GPU cleanup, idle and beat guards`);
