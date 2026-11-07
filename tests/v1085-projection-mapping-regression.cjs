'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planProjectionMappingV1085:plan,sampleProjectionMappingV1085:sample}=load('lib/arena360ProjectionMappingV1085');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const input=(scene='hook',patch={})=>({enabled:true,stageIsArena:true,playing:true,reducedMotion:false,
 reactive:true,showDesignerEnabled:true,showDirectorEnabled:true,performanceTier:'high',
 progressMs:110000,durationMs:220000,strength:65,mode:'auto',floorEnabled:true,
 satellitesEnabled:true,sceneryEnabled:true,beat:false,beatStrength:0,energy:.55,
 show:{active:true,scene,segmentIndex:3,intensity:82,fade:.95},...patch});
const modes={intro:'aurora',verse:'lattice',build:'orbit',hook:'ripple',interlude:'aurora',finale:'orbit'};
for(const [section,expected] of Object.entries(modes)){
 const cue=plan(input(section));assert.equal(cue.active,true);
 assert.equal(cue.mode,expected,section);
 assert.deepEqual(cue,plan(input(section)),'deterministic '+section);
}
for(const mode of ['ripple','lattice','orbit','aurora'])assert.equal(plan(input('hook',{mode})).mode,mode);
assert.equal(plan(input('hook',{mode:'invalid'})).mode,'ripple');
const cue=plan(input());assert(cue.gain>0&&cue.gain<=.72&&cue.beatAccent===0);
const accented=plan(input('hook',{beat:true,beatStrength:.9,energy:.9}));assert(accented.beatAccent>0);
for(const patch of [{beat:true,beatStrength:.1},{beat:true,energy:.1},{beat:false,beatStrength:1}])
 assert.equal(plan(input('hook',patch)).beatAccent,0,'only measured meaningful beats add accents');
assert(plan(input('hook',{performanceTier:'balanced'})).gain<cue.gain);
for(const [key,value] of Object.entries({enabled:false,stageIsArena:false,playing:false,reducedMotion:true,reactive:false,
 showDesignerEnabled:false,showDirectorEnabled:false,performanceTier:'low',progressMs:-1,
 durationMs:5000,durationMs2:undefined,strength:0,show:null,floorEnabled:false})){
 if(key==='durationMs2'||key==='floorEnabled')continue;
 assert.equal(plan(input('hook',{[key]:value})).active,false,key);
}
assert.equal(plan(input('hook',{floorEnabled:false,satellitesEnabled:false,sceneryEnabled:false})).active,false);
for(const patch of [{progressMs:NaN},{durationMs:Infinity},{strength:Infinity},{show:{...input().show,fade:NaN}},
 {show:{...input().show,segmentIndex:-1}}])assert.equal(plan(input('hook',patch)).active,false);
assert.equal(plan(input('hook',{satellitesEnabled:false})).satellites,false);
assert.equal(plan(input('hook',{sceneryEnabled:false})).scenery,false);
let n=0,visible=0;
for(const mode of ['ripple','lattice','orbit','aurora']){
 for(const surface of ['floor','satellite','scenery']){
  for(let i=0;i<24;i++)for(let k=0;k<840;k++){
   const c=plan(input('hook',{mode,progressMs:Math.min(220000,k*260)}));
   const p=sample(surface,i,24,c);
   assert(Object.values(p).every(Number.isFinite),`${surface} finite`);
   assert(p.glow>=0&&p.glow<=.72,`${surface} glow`);
   assert(p.width>=0&&p.width<=.4,`${surface} width`);
   assert(p.height>=0&&p.height<=.62,`${surface} height`);
   if(surface==='floor')assert(p.radius>=1&&p.radius<=2.6&&p.y===-1.807);
   if(surface==='satellite')assert(p.radius>=.09&&p.radius<=.2);
   if(surface==='scenery')assert(p.radius>=4&&p.radius<=4.16);
   n++;if(p.glow>0)visible++;
  }
 }
}
assert.equal(n,241920);assert(visible>10000);
assert.equal(sample('floor',0,24,plan(input('hook',{playing:false}))).glow,0);
assert.equal(sample('floor',24,24,cue).glow,0);
assert.equal(sample('floor',0,24,{...cue,time:Infinity}).glow,0);
assert.equal(sample('scenery',0,24,plan(input('hook',{sceneryEnabled:false}))).glow,0);
const a=sample('floor',5,24,plan(input('hook',{progressMs:75000}))),
 b=sample('floor',5,24,plan(input('hook',{progressMs:150000})));
assert.notDeepEqual(a,b,'patterns progress with authoritative song clock');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=1085,
 'V1085 must remain installed on V1085 and later releases');assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].version,pkg.version);
assert(pkg.scripts.prebuild.includes('npm run test:v1085 && npm run test:v1085:types'),
 'V1085 checks must remain part of subsequent release prebuilds');
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('planProjectionMappingV1085({'));
assert(stage.includes('projectionCueV1085.active&&projectionCueV1085.floor'));
assert(stage.includes('projectionCueV1085.active&&projectionCueV1085.scenery'));
assert(stage.includes('sceneryEnabled:dynamicArchitectureEnabledV1082&&dynamicArchitectureV1082.active'));
assert(stage.includes('satellitesEnabled:floatingStageEnabled'));
const floating=read('components/visualizer/stages/ArenaFloatingPlatformsV1038.tsx');
assert(floating.includes('v1085-satellite-projection')&&floating.includes('mappingCueV1085?.active'));
const fx=read('components/visualizer/stages/ArenaProjectionMappingV1085.tsx');
assert.equal((fx.match(/<instancedMesh\b/g)||[]).length,1);
assert(fx.includes("tier==='high'?")&&fx.includes("tier==='balanced'?"));
for(const ban of ['Math.random(','Date.now(','fetch(','setInterval(','requestAnimationFrame(','navigator.'])
 assert(!read('lib/arena360ProjectionMappingV1085.ts').includes(ban),'planner pure '+ban);
assert(read('context/UiPreferencesContext.tsx').includes('arenaProjectionEnabledV1085:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaProjectionEnabledV1085:false'));
assert(read('scripts/v931-production-gate.cjs').includes('tests/v1085-projection-mapping-regression.cjs'));
assert(read('scripts/vercel-production-build.cjs').includes('tests/v1085-projection-mapping-regression.cjs'));
console.log(`PASS V1085: ${n} bounded projection samples, ${visible} visible; deterministic chapter looks and measured beats, no hardware`);
