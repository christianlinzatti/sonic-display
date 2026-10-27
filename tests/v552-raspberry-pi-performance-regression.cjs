'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {shouldDrawTransparentV552:gate,needsSpotTargetMatrixV552:matrix,shouldSkipDormantFxV552:skip}=load('components/visualizer/piConcertDrawBudgetV552');
let frames=0,hidden=0;
for(const piEnabled of [false,true])for(const level of ['full','balanced','eco'])
for(const authored of [false,true])for(const initial of [false,true]){
 let visible=initial;
 const cut=authored||!piEnabled?0.0001:level==='eco'?.006:level==='balanced'?.002:.0001;
 for(let t=0;t<1800;t++){
  const opacity=Math.max(0,Math.min(.15,(Math.sin(t*.021)+1)*.075));
  const next=gate(opacity,visible,piEnabled,level,authored);
  assert.equal(typeof next,'boolean');
  if(opacity>=cut)assert(next,`${piEnabled}/${level}/${authored}/${initial}: visible above cutoff`);
  if(opacity<cut*.5)assert(!next,`${piEnabled}/${level}/${authored}/${initial}: hidden below cutoff`);
  visible=next;
  if(!visible)hidden++;
  frames++;
 }
}
assert.equal(frames,43200);
assert(hidden>0);
for(const l of ['full','balanced','eco'])for(const pi of [false,true])for(const manual of [false,true]){
 assert.equal(gate(0,true,pi,l,manual),false);
 assert.equal(gate(NaN,true,pi,l,manual),false);
 assert.equal(gate(Infinity,true,pi,l,manual),false);
 assert.equal(gate(-.7,true,pi,l,manual),false);
 assert.equal(gate(.1,false,pi,l,manual),true);
 assert.equal(gate(0.00011,false,pi,l,true),true);
}
assert.equal(gate(.004,false,true,'eco',false),false);
assert.equal(gate(.004,true,true,'eco',false),true);
assert.equal(gate(.002,false,true,'eco',false),false);
assert.equal(gate(.00015,false,false,'eco',false),true);
assert.equal(gate(.00015,false,true,'eco',true),true);
assert.equal(matrix(NaN,0),true);
assert.equal(matrix(0,0),false);
assert.equal(matrix(0,.00001),false);
assert.equal(matrix(0,.001),true);
assert.equal(matrix(0,Infinity),false);
assert.equal(skip(false,false),true);
assert.equal(skip(false,true),false);
assert.equal(skip(true,false),false);
const stage=fs.readFileSync('components/visualizer/ConcertAtmosphereRendererV308.tsx','utf8');
const dance=fs.readFileSync('components/visualizer/DanceFX.tsx','utf8');
const effect=fs.readFileSync('components/visualizer/StageVisualEffectsV353.tsx','utf8');
const performance=fs.readFileSync('components/visualizer/adaptivePerformance.tsx','utf8');
const pi=fs.readFileSync('components/visualizer/piConcertRuntimeV479.tsx','utf8');
for(const name of ['leftBeamMeshV552','rightBeamMeshV552','floorHazeMeshV552','backHazeMeshV552']){
 assert(stage.includes(`ref={${name}}`),`missing mesh ${name}`);
 assert(stage.includes(`gateV552(${name}.current`),`missing draw gate ${name}`);
}
for(const tok of ['readPiConcertBudgetV479()','shouldDrawTransparentV552(','laserFanV394.current.visible=lasersOn','needsSpotTargetMatrixV552(','previousX.current=targetX','planStageAtmosphereV551('])
 assert(stage.includes(tok),`lost V551/V552 stage integration: ${tok}`);
for(const tok of ['shouldSkipDormantFxV552(enabled,wasEnabledV552.current)','if(!enabled){','wasEnabledV552.current=true','pulse.active=false','lastBeat.current = isBeat;'])
 assert(dance.includes(tok),`lost idle-state protection: ${tok}`);
assert(effect.includes('if(lastDrawCountV552.current!==count)'));
assert(performance.includes('samplePiConcertV479('));
assert(pi.includes('advancePiConcertBudgetV479('));
assert.equal((stage.match(/useFrame\(/g)||[]).length,1);
assert.equal((dance.match(/useFrame\(/g)||[]).length,1);
assert.equal((effect.match(/useFrame\(/g)||[]).length,1);
assert.equal((stage.match(/<spotLight /g)||[]).length,2);
const policy=fs.readFileSync('components/visualizer/piConcertDrawBudgetV552.ts','utf8');
for(const forbidden of ['Math.random(', 'requestAnimationFrame(', 'setTimeout(', 'setInterval(', 'localStorage', 'document.', 'window.', 'new Mesh(', 'new ShaderMaterial('])
 assert(!policy.includes(forbidden),forbidden);
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=552);
assert(pkg.scripts['build:preflight'].includes('npm run test:v552 && npm run test:v552:types'));
assert(pkg.scripts['verify:v552'].includes('test:v551'));
console.log(`PASS V552: ${frames} deterministic alpha-gating frames; ${hidden} avoided transparent draws; GPU-opacity, manual precedence, spot matrices, dormant dance FX, zero extra loops`);
