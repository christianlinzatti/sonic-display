'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planEpicStageTransformationV1086:plan,coordinateEpicStageTransformationV1086:coordinate}=
 load('lib/arena360EpicStageTransformationV1086');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const channels=()=>({architecture:true,laser:true,led:true,holograms:true,projection:true});
const input=(scene='hook',patch={})=>({enabled:true,stageIsArena:true,playing:true,reducedMotion:false,
 reactive:true,showDesignerEnabled:true,showDirectorEnabled:true,performanceTier:'high',
 progressMs:85000,durationMs:210000,strength:70,mode:'auto',channels:channels(),
 show:{active:true,scene,segmentIndex:3,intensity:83,fade:.85},...patch});
const sources=()=>({
 architecture:{active:true,reason:'planned',formation:'gate',amount:.65,phase:.4,accent:0,slots:8},
 laser:{active:true,reason:'planned',formation:'fan',chapter:3,amount:.6,twist:.2,
  pulse:0,lift:.2,radius:1.4,gain:.86},
 led:{active:true,reason:'planned',look:'tunnel',gain:.43,chapter:3,lyric:'',dropAllowed:false},
 holograms:{active:true,look:'awakening',power:.55,phase:.5,sync:'show'},
 projection:{active:true,reason:'planned',mode:'aurora',gain:.6,time:85,beatAccent:0,chapter:3,
  floor:true,satellites:true,scenery:true,tier:'high'},
});
const looks={intro:['gate','fan','tunnel','awakening','aurora'],
 verse:['arcade','fan','geometry3d','reflection','lattice'],
 build:['staircase','helix','tunnel','vortex','orbit'],
 hook:['terraces','tunnel','geometry3d','duet','ripple'],
 interlude:['colonnade','fan','tunnel','breath','aurora'],
 finale:['crown','crown','geometry3d','finale','orbit']};
for(const [scene,want] of Object.entries(looks)){
 const c=plan(input(scene));assert(c.active&&c.count===5&&c.mix>0);
 assert.deepEqual(c,plan(input(scene)),'chapter plan deterministic '+scene);
 const result=coordinate(c,sources());
 assert.deepEqual([result.architecture.formation,result.laser.formation,result.led.look,
  result.holograms.look,result.projection.mode],want,scene);
 assert.equal(result.led.dropAllowed,false,'cannot manufacture drops');
}
for(const [mode,scene] of Object.entries({cinematic:'interlude',festival:'hook',minimal:'verse'}))
 assert.equal(plan(input('intro',{mode})).look,scene);
assert.equal(plan(input('intro',{mode:'unknown'})).look,'intro');
for(const patch of [{enabled:false},{stageIsArena:false},{reactive:false},
 {showDesignerEnabled:false},{showDirectorEnabled:false},{playing:false},
 {reducedMotion:true},{performanceTier:'low'},{performanceTier:null},
 {progressMs:-1},{progressMs:Infinity},{durationMs:1000},{durationMs:Infinity},
 {durationMs:1800001},{strength:0},{strength:NaN},{show:null},
 {show:{...input().show,fade:NaN}},{show:{...input().show,segmentIndex:-1}}])
 assert.equal(plan(input('hook',patch)).active,false,'fails closed '+JSON.stringify(patch));
const one=plan(input('hook',{channels:{architecture:true,laser:false,led:false,holograms:false,projection:false}}));
assert(!one.active&&one.reason==='channels');
assert(!plan(input('hook',{channels:{architecture:false,laser:false,led:false,holograms:false,projection:false}})).active);
const off=plan(input('hook',{playing:false})),s=sources();
assert.strictEqual(coordinate(off,s),s,'inactive coordinator does not allocate or mutate');
const c=plan(input());
for(const key of Object.keys(s)){
 const custom=sources();custom[key].active=false;
 assert.strictEqual(coordinate(c,custom)[key],custom[key],`disabled channel ${key} preserved`);
}
const manual=plan(input('hook',{channels:{architecture:false,laser:false,led:false,holograms:true,projection:true}}));
const custom=sources();let restricted=coordinate(manual,custom);
for(const key of ['architecture','laser','led'])assert.strictEqual(restricted[key],custom[key],`manual ${key} preserved`);
let lyrics=sources();lyrics.led.look='lyrics';lyrics.led.lyric='echte synchronisierte Zeile';
assert.equal(coordinate(c,lyrics).led.look,'lyrics','preserve verified lyric display');
assert.equal(coordinate(c,lyrics).led.lyric,lyrics.led.lyric,'no invented lyric text');
// Stress-test transitions; fixed-size inputs, no extra mesh, brightness increase or time dependence.
let samples=0;
for(let n=0;n<300000;n++){
 const scene=Object.keys(looks)[n%6];
 const fade=(n%1000+1)/1000;
 const intensity=(n%100)+1;
 const cue=plan(input(scene,{progressMs:n%210001,show:{active:true,scene,segmentIndex:n%28,intensity,fade}}));
 const base=sources(),o=coordinate(cue,base);
 assert(o.architecture.amount>=0&&o.architecture.amount<=base.architecture.amount);
 assert(o.laser.amount>=0&&o.laser.amount<=base.laser.amount);
 assert(o.laser.gain>=0&&o.laser.gain<=base.laser.gain);
 assert(o.led.gain>=0&&o.led.gain<=base.led.gain);
 assert(o.holograms.power>=0&&o.holograms.power<=base.holograms.power);
 assert(o.projection.gain>=0&&o.projection.gain<=base.projection.gain);
 assert(cue.mix>=0&&cue.mix<=.88);
 assert.deepEqual(Object.keys(o).sort(),Object.keys(base).sort());samples++;
}
assert.equal(samples,300000);
const packageJson=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(packageJson.version)?.[1]||0)>=1086);
assert.equal(packageJson.version,lock.version);assert.equal(packageJson.version,lock.packages[''].version);
assert(packageJson.scripts.prebuild.includes('npm run test:v1086 && npm run test:v1086:types'));
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('planEpicStageTransformationV1086({'));
assert(stage.includes('coordinateEpicStageTransformationV1086('));
for(const channel of ['architecture','laser','led','holograms','projection'])
 assert(stage.includes('epicTransformedV1086.'+channel),'active rendering uses coordinated '+channel);
for(const ban of ['Math.random(','Date.now(','fetch(','setInterval(','requestAnimationFrame(','navigator.'])
 assert(!read('lib/arena360EpicStageTransformationV1086.ts').includes(ban),'pure stage planner: '+ban);
assert(read('context/UiPreferencesContext.tsx').includes('arenaEpicTransformationEnabledV1086:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaEpicTransformationEnabledV1086:false'));
assert(read('scripts/v931-production-gate.cjs').includes('tests/v1086-epic-stage-transformation-regression.cjs'));
assert(read('scripts/vercel-production-build.cjs').includes('tests/v1086-epic-stage-transformation-regression.cjs'));
console.log(`PASS V1086: ${samples} coordinated show samples, manual/off guards, bounded optical budgets, no new hardware`);
