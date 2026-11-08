'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planLaserExperienceV1080:plan,sampleLaserEndpointV1080:sample}=load('lib/arena360LaserExperienceV1080');
const {planIntelligentLaserV1057:base}=load('lib/arena360IntelligentLaserV1057');
const {generateArenaShowPlanV1040:generate,sampleArenaShowPlanV1040:show}=load('lib/arena360ShowDesignerV1040');
const p=generate({genre:'Hardtekk',durationMs:210000});
const director=at=>base({enabled:true,stageIsArena:true,fanEnabled:true,architectureEnabled:true,
 playing:true,reducedMotion:false,reactive:true,trackId:'song:live',progressMs:at,durationMs:210000,
 performanceTier:'high',strength:70,plan:p,show:show(p,{enabled:true,playing:true,
 reducedMotion:false,progressMs:at,durationMs:210000})});
const input=(at=103000)=>({enabled:true,playing:true,reducedMotion:false,reactive:true,
 manualPattern:false,performanceTier:'high',progressMs:at,durationMs:210000,
 director:director(at),energy:.8,beat:true,beatStrength:.9,strength:70});
const active=plan(input());assert(active.active&&active.reason==='planned');
assert.deepEqual(active,plan(input()),'deterministic cue');
assert(active.formation==='tunnel');
const chapters=[8000,28000,82000,108000,145000,174000,202000].map(at=>plan(input(at)));
assert.deepEqual(chapters.map(c=>c.formation),['fan','fan','helix','tunnel','crown','fan','crown']);
assert(chapters.every(c=>c.active),'seven distinct full-song chapter samples');
assert(plan({...input(),beat:false}).pulse===0,'no inventing real beats');
assert(plan({...input(),beatStrength:.1}).pulse===0,'reject weak beat');
assert(active.pulse>0&&active.pulse<=.22);
for(const [key,value] of Object.entries({enabled:false,playing:false,reducedMotion:true,
 reactive:false,manualPattern:true,performanceTier:'low',strength:0,progressMs:NaN,
 durationMs:Infinity,energy:NaN,director:null})){
 const cue=plan({...input(),[key]:value});
 if(key==='energy'){assert(cue.active&&cue.pulse===0);continue;}
 assert(!cue.active,'gate '+key);
}
assert(plan({...input(),playing:false}).reason==='paused');
assert(plan({...input(),reducedMotion:true}).reason==='motion');
assert(plan({...input(),performanceTier:'low'}).reason==='quality');
assert(plan({...input(),manualPattern:true}).reason==='disabled');
assert(plan({...input(),director:{...director(103000),reason:'show'}}).reason==='director');
const balanced=plan({...input(),performanceTier:'balanced'});
assert(balanced.active&&balanced.amount<active.amount);
for(const cue of chapters){
 assert(cue.amount>0&&cue.amount<=.8);
 assert(cue.twist>=0&&cue.twist<=.4);assert(cue.lift>=0&&cue.lift<=.27);
 assert(cue.pulse>=0&&cue.pulse<=.22);assert(cue.radius>=1.1&&cue.radius<=1.85);
 assert(cue.gain>=.65&&cue.gain<=1);
}
let samples=0;
for(const cue of chapters)for(const source of ['fan','architecture'])for(const count of [6,12,18]){
 for(let i=0;i<count;i++)for(let step=0;step<160;step++){
  const point={x:Math.cos(i)*2,y:1.2,z:Math.sin(i)*2};
  const t=step*.315;sample(cue,i,count,t,source,point);samples++;
  assert([point.x,point.y,point.z].every(Number.isFinite));
  assert(point.x>=-3.9&&point.x<=3.9&&point.z>=-3.9&&point.z<=3.9);
  assert(point.y>=.7&&point.y<=2.25,'safe bounded visual stage target');
 }
}
const original={x:1,y:1.2,z:2},unchanged={...original};
sample(plan({...input(),enabled:false}),0,6,1,'fan',unchanged);
assert.deepEqual(unchanged,original,'legacy path unchanged when opted out');
const fans=read('components/visualizer/stages/ArenaLaserFansV1036.tsx');
const tunnel=read('components/visualizer/stages/ArenaLaserTunnelsV1039.tsx');
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(fans.includes('sampleLaserEndpointV1080(')&&tunnel.includes('sampleLaserEndpointV1080('));
assert(stage.includes('planLaserExperienceV1080(')&&
 ((stage.match(/laserExperienceCueV1080={laserExperienceV1080}/g)||[]).length===2||
 ((stage.match(/laserExperienceCueV1080={epicTransformedV1086.laser}/g)||[]).length===2&&
 stage.includes('laser:laserExperienceV1080'))),'V1080 must feed both original laser batches');
assert(stage.includes("manualPattern:hologramPattern!=='auto'"),'manual pattern precedence');
assert.equal((fans.match(/<instancedMesh\b/g)||[]).length,1);
assert.equal((tunnel.match(/<instancedMesh\b/g)||[]).length,1);
for(const unsafe of ['fetch(','setTimeout(','setInterval(','Math.random(','Date.now(',
 'navigator.','localStorage','new SpotLight','new Camera','window.','Govee'])
 assert(!read('lib/arena360LaserExperienceV1080.ts').includes(unsafe),'pure visual-only: '+unsafe);
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0)>=1080&&lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version);
assert(pkg.scripts['test:v1080']&&pkg.scripts['test:v1080:types']);
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('v1080-laser-experience-regression.cjs')||read(file).includes('test:v1080'),file);
assert(pkg.scripts.prebuild.includes('npm run test:v1080 && npm run test:v1080:types'));
assert(read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
console.log(`PASS V1080 Laser Show Experience: ${samples} bounded samples, 7 chapters, measured beat gates, low-tier/manual precedence, zero new GPU batches`);
