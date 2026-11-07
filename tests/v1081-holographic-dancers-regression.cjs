'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planHolographicDancersV1081:plan,sampleHolographicDancerV1081:sample,
 REST_DANCER_V1081:rest}=load('lib/arena360HolographicDancersV1081');
const scenes=['intro','verse','build','hook','interlude','finale'];
const styles=['arrival','groove','build','duet','breath','encore'];
const base={active:true,look:'duet',phase:.52,power:.72,sync:'show'};
const input=(scene='hook',values={})=>({enabled:true,stageIsArena:true,hologramsEnabled:true,
 showDesignerEnabled:true,showDirectorEnabled:true,playing:true,reducedMotion:false,
 reactive:true,manualPattern:false,performanceTier:'high',progressMs:104000,durationMs:225000,
 strength:70,genre:'Hardtekk',energy:.85,beat:true,beatStrength:.92,
 show:{active:true,scene,segmentIndex:3,intensity:80,fade:.86},baseHolograms:base,...values});
const cues=scenes.map(s=>plan(input(s)));
assert.deepEqual(cues.map(c=>c.style),styles);
assert(cues.every(c=>c.active&&c.reason==='planned'));
assert.deepEqual(plan(input()),plan(input()),'deterministic planner');
assert(cues.every(c=>c.slots===9&&c.power>0&&c.power<=.75&&c.accent>0&&c.accent<=.18));
const normal=plan(input()),noBeat=plan(input('hook',{beat:false}));
assert.equal(noBeat.accent,0,'planned hook must not invent an observed beat');
assert.equal(plan(input('hook',{beatStrength:.74})).accent,0,'ignore weak beat');
assert.equal(plan(input('hook',{energy:NaN})).accent,0,'invalid energy fails safely');
assert(plan(input('hook',{performanceTier:'balanced'})).power<normal.power);
assert.equal(plan(input('hook',{performanceTier:'balanced'})).slots,6);
const gates={enabled:false,stageIsArena:false,hologramsEnabled:false,showDesignerEnabled:false,
 showDirectorEnabled:false,playing:false,reducedMotion:true,reactive:false,manualPattern:true,
 performanceTier:'low',strength:0,progressMs:-1,durationMs:900,durationMsInvalid:NaN,
 baseHolograms:{...base,active:false},show:{...input().show,active:false}};
for(const [k,v] of Object.entries(gates)){
 if(k==='durationMsInvalid')assert(!plan(input('hook',{durationMs:v})).active);
 else assert(!plan(input('hook',{[k]:v})).active,'must fail closed: '+k);
}
for(const [key,value] of Object.entries({strength:NaN,progressMs:NaN,progressMsInf:Infinity,
 durationMs:Infinity,durationHuge:1800001,show:null,baseHolograms:null,showFade:Infinity})){
 const changes=key==='progressMsInf'?{progressMs:value}:key==='durationHuge'?{durationMs:value}:
   key==='showFade'?{show:{...input().show,fade:value}}:{[key]:value};
 if(key==='progressMsInf'||key==='durationHuge'||key==='showFade'||key==='baseHolograms'||key==='show'||key==='durationMs'||key==='progressMs'||key==='strength')
  assert(!plan(input('hook',changes)).active,'invalid '+key);
}
const out={sideStep:99,bob:99,tilt:99,yaw:99,leftArm:99,rightArm:99,scale:99,glow:99};
sample(0,9,normal,out);assert.notDeepEqual(out,rest);
sample(9,9,normal,out);assert.deepEqual(out,rest,'out-of-range slot parked');
sample(0,9,plan(input('hook',{playing:false})),out);assert.deepEqual(out,rest,'paused pose parked');
sample(0,0,normal,out);assert.deepEqual(out,rest,'no division by zero');
let count=0;let active=0;let mirrored=false;
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 for(const [sectionIndex,scene] of scenes.entries()){
  for(let step=0;step<1250;step++){
   const t=1000+step*145+sectionIndex*2100;
   const cue=plan(input(scene,{genre,progressMs:t,beat:step%8===0,beatStrength:step%8===0?.9:0}));
   assert(cue.active);
   for(let i=0;i<cue.slots;i++){
    sample(i,cue.slots,cue,out);count++;active++;
    assert(Object.values(out).every(Number.isFinite));
    assert(Math.abs(out.sideStep)<=.12&&out.bob>=0&&out.bob<=.09);
    assert(Math.abs(out.tilt)<=.15&&Math.abs(out.yaw)<=.25);
    assert(Math.abs(out.leftArm)<=1.05&&Math.abs(out.rightArm)<=1.05);
    assert(out.scale>=.97&&out.scale<=1.035&&out.glow>=0&&out.glow<=.20);
   }
   if(scene==='hook'&&step===36){
    const a={},b={};sample(0,cue.slots,cue,a);sample(1,cue.slots,cue,b);
    mirrored ||= Math.sign(a.sideStep)!==Math.sign(b.sideStep);
   }
  }
 }
}
assert(mirrored,'paired holographic dancers vary mirrored steps');
assert.equal(count,270000);
for(const file of ['types/music.ts','context/UiPreferencesContext.tsx',
 'components/visualizer/registry.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
 'components/visualizer/stages/Arena360StageV1031.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('HolographicDancers')||read(file).includes('holographicDancers'),file);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('planHolographicDancersV1081({'));
assert(stage.includes('baseHolograms:flowHologramsV1071'),'stage and finale dimming retained');
assert(stage.includes("manualPattern:hologramPattern!=='auto'"),'manual portal precedence');
assert(stage.includes('dancerCueV1081={holographicDancersV1081}'));
const renderer=read('components/visualizer/stages/ArenaHologramPortalsV1039.tsx');
assert.equal((renderer.match(/useFrame\(/g)||[]).length,1,'no second frame owner');
assert(renderer.includes('sampleHolographicDancerV1081('));
assert(renderer.includes('fixtures.length*2'),'bounded 2 arms per fixture');
assert(renderer.includes('tier!==\'low\'&&concertCueV1068?.active&&dancerCueV1081?.active'));
assert.equal((renderer.match(/<instancedMesh\b/g)||[]).length,4,'3 old batches plus one opt-in arms batch');
assert(renderer.includes('silhouetteGeometry.dispose()'),'dispose owned geometry');
assert(renderer.includes('Math.min(.30,fx.echo*.28'),'no bypass of old material cap');
const pure=read('lib/arena360HolographicDancersV1081.ts');
for(const banned of ['Math.random(','Date.now(','fetch(','setInterval(','setTimeout(',
 'requestAnimationFrame(','navigator.','localStorage','Govee','new AnimationMixer(',
 'new AudioContext(','new Light('])assert(!pure.includes(banned),'pure planner: '+banned);
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,'0.1.0-v1081');assert.equal(pkg.version,lock.version);
assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.startsWith('npm run test:v1081 && npm run test:v1081:types'));
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('v1081-holographic-dancers-regression.cjs'),f);
const workflow=read('.github/workflows/v965-room-wave-production.yml');
assert(workflow.includes('Active imported release (regression and isolated type checks)')&&
 workflow.includes('npm run "test:v${version}"')&&
 workflow.includes('npm run "test:v${version}:types"'),
 'the protected workflow must run the dynamically imported release');
console.log(`PASS V1081: ${count} bounded hologram poses, six chapter styles, four genre tempi, measured beat gate, manual and low-tier protection`);
