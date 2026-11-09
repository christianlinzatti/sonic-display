const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const {stagePlacementV1135,footContactV1135,portraitContrastV1135}=load('lib/stagePresenceV1135.ts');
const {jointSpringV1135,performerDynamicsV1135}=load('lib/performerDynamicsV1135.ts');
const {performerPersonaV1132}=load('lib/performerPersonalityV1132.ts');
const {concertScoreV1134}=load('lib/concertScoreV1134.ts');
const placement={bundled:true,adaptive:true,manual:false,scale:1,offsetY:0};
for(const scale of [.5,1,1.8,3]){const p=stagePlacementV1135({...placement,scale});assert(p.enabled);assert(Math.abs(p.y-scale+1.95)<1e-9);}
for(const patch of [{manual:true},{adaptive:false},{bundled:false},{offsetY:.2},{scale:NaN},{scale:0}])assert.deepEqual(stagePlacementV1135({...placement,...patch}).y,0);
assert(footContactV1135(-.88,-1,1).opacity>.31);assert(footContactV1135(-.70,-1,1).opacity<.03);assert.equal(footContactV1135(-.5,-1,1).opacity,0);assert.equal(footContactV1135(NaN,-1,1).opacity,0);
assert(footContactV1135(-.7,-1,1).width>footContactV1135(-.88,-1,1).width);
const outputs=[];
for(const hz of [30,60,120]){let s={value:0,velocity:0};for(let i=0;i<hz;i++){s=jointSpringV1135(s.value,s.velocity,.08,1/hz,12);assert(s.value>=0&&s.value<=.08);}outputs.push(s.value);}
assert(Math.max(...outputs)-Math.min(...outputs)<1e-10,'The damping must be frame-rate independent');
let s={value:0,velocity:0};for(let i=0;i<10000;i++){s=jointSpringV1135(s.value,s.velocity,i%29<15?.09:-.09,i%3===0?.1:1/60,14);assert(Number.isFinite(s.value));assert(Math.abs(s.value)<.091);}
assert(Number.isFinite(jointSpringV1135(NaN,Infinity,0,NaN,NaN).value));
const cue=concertScoreV1134({progressMs:8000,section:'verse',count:3,energy:.65});
const plan={active:true,reaction:'nod',offset:0,persona:performerPersonaV1132('sonic-luna-flow'),story:cue,interaction:{role:'lead'}};
const prepare=performerDynamicsV1135(plan,7.9),settle=performerDynamicsV1135(plan,.5);assert(prepare.prepare>.015);assert(settle.settle>0);assert(settle.prepare===0);
assert(performerDynamicsV1135({...plan,interaction:{role:'echo'}},7.9).prepare<prepare.prepare);
assert(performerDynamicsV1135({...plan,story:{...cue,reading:true}},7.9).prepare<prepare.prepare);
const guards={playing:true,reducedMotion:false,manual:false,blackout:false};const portrait=portraitContrastV1135(cue,guards);assert(portrait.key/portrait.fill>1.1);
for(const patch of [{playing:false},{reducedMotion:true},{manual:true},{blackout:true}])assert.deepEqual(portraitContrastV1135(cue,{...guards,...patch}),{key:1,fill:1});
console.log('PASS V1135: ground alignment/scaling/ownership, contact falloff, exact 30/60/120 Hz damping, role and reading restraint, portrait/manual/blackout guards');

const {lyrics}=require('./fixtures/concertMocksV1130.cjs');
const shots=[24600,65000,95000].map(progressMs=>concertScoreV1134({progressMs,lyrics,durationMs:100000,count:3,energy:.7}));
assert(shots[0].cameraScale<shots[1].cameraScale&&shots[1].cameraScale<shots[2].cameraScale);assert(shots[2].cameraScale<=1.13);
console.log('PASS V1135: restrained progressively wider refrain/finale shots');
