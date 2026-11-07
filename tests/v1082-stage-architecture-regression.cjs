'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planStageArchitectureV1082:plan,sampleStageArchitectureV1082:sample,
 stepArchitectureV1082:step,REST_ARCHITECTURE_V1082:rest}=load('lib/arena360StageArchitectureV1082');
const scenes=['intro','verse','build','hook','interlude','finale'];
const formations=['gate','arcade','staircase','terraces','colonnade','crown'];
const input=(scene='hook',changes={})=>({enabled:true,stageIsArena:true,playing:true,
 reducedMotion:false,reactive:true,showDesignerEnabled:true,showDirectorEnabled:true,
 outerStageEnabled:true,manualDeckMode:'auto',performanceTier:'high',
 progressMs:94000,durationMs:220000,strength:70,
 energy:.85,beat:true,beatStrength:.9,
 show:{active:true,scene,segmentIndex:3,intensity:80,fade:.85},...changes});
const all=scenes.map(s=>plan(input(s)));
assert.deepEqual(all.map(c=>c.formation),formations);
assert(all.every(c=>c.active&&c.reason==='planned'&&c.slots===8&&c.amount>0&&c.amount<=1));
assert.deepEqual(plan(input()),plan(input()),'deterministic stage plan');
assert.equal(plan(input('hook',{beat:false})).accent,0,'authored hook never invents a beat');
assert.equal(plan(input('hook',{beatStrength:.7})).accent,0,'weak beat ignored');
assert.equal(plan(input('hook',{energy:NaN})).accent,0,'invalid observed energy fails safe');
assert(plan(input('hook',{performanceTier:'balanced'})).amount<plan(input()).amount);
assert.equal(plan(input('hook',{performanceTier:'balanced'})).slots,6);
for(const [key,value] of Object.entries({enabled:false,stageIsArena:false,playing:false,
 reducedMotion:true,reactive:false,showDesignerEnabled:false,showDirectorEnabled:false,
 outerStageEnabled:false,manualDeckMode:'spiral',performanceTier:'low',strength:0,
 progressMs:-1,durationMs:29000,show:null})){
 assert(!plan(input('hook',{[key]:value})).active,'opt-in gate '+key);
}
for(const [key,value] of Object.entries({progressMs:NaN,durationMs:Infinity,strength:NaN,
 progressMsHuge:300000,durationMsHuge:1800001,showFade:NaN,showIntensity:110})){
 const changes=key==='progressMsHuge'?{progressMs:value}:key==='durationMsHuge'?{durationMs:value}:
 key==='showFade'?{show:{...input().show,fade:value}}:
 key==='showIntensity'?{show:{...input().show,intensity:value}}:{[key]:value};
 assert(!plan(input('hook',changes)).active,'invalid data '+key);
}
const out={};sample(0,8,all[3],out);assert.notDeepEqual(out,rest);
sample(8,8,all[3],out);assert.deepEqual(out,rest,'invalid index rests');
sample(0,0,all[3],out);assert.deepEqual(out,rest,'empty fixtures rest');
sample(0,8,plan(input('hook',{playing:false})),out);assert.deepEqual(out,rest);
const frozen=step({radius:4.10,rise:.14,height:.78,glow:.6,twist:.03},rest,.08,
 {enabled:true,playing:false,reducedMotion:false});
assert.equal(frozen.rise,.14,'paused scenic structures must hold');
assert.deepEqual(step(frozen,rest,.08,{enabled:true,playing:true,reducedMotion:true}),rest);
const deltaBound=step(frozen,rest,Infinity,{enabled:true,playing:true,reducedMotion:false});
assert(Object.values(deltaBound).every(Number.isFinite));
let count=0,formationsObserved=new Set(),risks=0;
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 for(const scene of scenes){
  for(let tick=0;tick<1000;tick++){
   const cue=plan(input(scene,{progressMs:3000+tick*179,beat:tick%11===0,
    beatStrength:tick%11===0?.91:0}));
   assert(cue.active);formationsObserved.add(cue.formation);
   for(let i=0;i<cue.slots;i++){
    sample(i,cue.slots,cue,out);
    count++;
    assert(Object.values(out).every(Number.isFinite));
    assert(out.radius>=3.98&&out.radius<=4.14,'outside stable 3.665m petal radius');
    assert(out.rise>=0&&out.rise<=.22);
    assert(out.height>=.38&&out.height<=.84);
    assert(out.glow>=.1&&out.glow<=.65);
    assert(Math.abs(out.twist)<=.09);
    const target={...out};const next=step(rest,target,.1,{enabled:true,playing:true,reducedMotion:false});
    assert(Object.values(next).every(Number.isFinite));
    risks+=next.radius<3.98?1:0;
   }
  }
 }
}
assert.equal(count,192000);assert.equal(formationsObserved.size,6);assert.equal(risks,0);
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0)>=1082);assert.equal(pkg.version,lock.version);
assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.includes('npm run test:v1082 && npm run test:v1082:types'));
for(const p of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
 'components/visualizer/stages/Arena360StageV1031.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(p).includes('DynamicArchitecture')||read(p).includes('dynamicArchitecture'),p);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('planStageArchitectureV1082({'));
assert(stage.includes('manualDeckMode:transformingDeckMode'));
assert(stage.includes('<ArenaDynamicArchitectureV1082'));
assert(read('context/UiPreferencesContext.tsx').includes('arenaDynamicArchitectureEnabledV1082:false'));
const render=read('components/visualizer/stages/ArenaDynamicArchitectureV1082.tsx');
assert.equal((render.match(/useFrame\(/g)||[]).length,1);
assert.equal((render.match(/<instancedMesh\b/g)||[]).length,3);
assert(render.includes("count=tier==='high'?8:tier==='balanced'?6:0"));
assert(render.includes('useLayoutEffect('),'reinitialize instanced buffers on tier change');
for(const ban of ['Math.random(','Date.now(','fetch(','navigator.','requestAnimationFrame(',
 'setInterval(','setTimeout(','new AudioContext(','new SpotLight('])
 assert(!read('lib/arena360StageArchitectureV1082.ts').includes(ban));
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('v1082-stage-architecture-regression.cjs'),f);
console.log(`PASS V1082: ${count} stable multi-level formation poses, 6 chapters, 4 genres, measured accents, paused/low-tier/manual guards`);
