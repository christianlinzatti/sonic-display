'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planFestivalAtmosphereV1084:plan,stepFestivalBurstsV1084:step,
 sampleFestivalParticleV1084:sample,INITIAL_FESTIVAL_BURST_V1084:INITIAL}=load('lib/arena360FestivalAtmosphereV1084');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const input=(scene='hook',patch={})=>({enabled:true,stageIsArena:true,playing:true,reducedMotion:false,
 reactive:true,showDesignerEnabled:true,showDirectorEnabled:true,performanceTier:'high',
 progressMs:110000,durationMs:220000,strength:65,mode:'auto',observedSection:'hook',genre:'rap',
 fogEnabled:true,show:{active:true,scene,segmentIndex:3,intensity:82,fade:.95},...patch});
let cue=plan(input());
assert(cue.active&&cue.bubbles>0&&cue.confetti>0&&!cue.co2Ready&&cue.fogBoost>0);
assert.deepEqual(cue,plan(input()));
const intro=plan(input('intro'));
const verse=plan(input('verse'));
const build=plan(input('build'));
const interlude=plan(input('interlude'));
const finale=plan(input('finale'));
assert(intro.bubbles>intro.confetti&&verse.bubbles>verse.confetti);
assert(interlude.bubbles>build.bubbles&&finale.streamers>build.streamers);
assert.equal(plan(input('hook',{fogEnabled:false})).fogBoost,0,'manual fog setting is authoritative');
assert(plan(input('hook',{mode:'bubbles'})).confetti===0);
assert(plan(input('hook',{mode:'streamers'})).bubbles===0);
assert(plan(input('hook',{mode:'calm'})).streamers===0);
assert(plan(input('hook',{mode:'co2',observedSection:'hook'})).co2Ready===false);
assert(plan(input('hook',{mode:'co2',observedSection:'drop'})).co2Ready===true);
assert(plan(input('hook',{mode:'festival'})).confetti>=cue.confetti*.5);
assert(plan(input('hook',{performanceTier:'balanced'})).bubbles<cue.bubbles);
assert(plan(input('hook',{genre:'hard'})).confetti>cue.confetti);
assert(plan(input('hook',{mode:'invalid_mode'})).active);
for(const [key,value] of Object.entries({enabled:false,stageIsArena:false,playing:false,reducedMotion:true,
 reactive:false,showDesignerEnabled:false,showDirectorEnabled:false,performanceTier:'low',
 progressMs:-1,durationMs:5000,strength:0,show:null})){
 assert(!plan(input('hook',{[key]:value})).active,'fail-closed: '+key);
}
for(const [key,value] of Object.entries({progressMs:NaN,durationMs:Infinity,strength:NaN,progressMs2:undefined})){
 if(key==='progressMs2')continue;
 assert(!plan(input('hook',{[key]:value})).active,'reject invalid '+key);
}
const goodAudio={beat:true,beatStrength:.90,energyEnvelope:.90,bass:.87};
const weak={...goodAudio,beatStrength:.25};
const drop=plan(input('hook',{observedSection:'drop'}));
let b=step({...INITIAL},.016,drop,goodAudio,110000);
assert(b.co2===1&&b.burstCount===1&&b.cooldown>=5,'measured beat edge produces one virtual CO2 burst');
let held=step(b,.016,drop,goodAudio,110016);
assert(held.co2<1&&held.burstCount===1,'held beat is not a new edge');
for(let k=0;k<100;k++)held=step(held,.1,drop,{...goodAudio,beat:false},110016+k*100);
assert.equal(held.co2,0,'virtual jet decays');
const noAudio=step({...INITIAL},.016,drop,weak,110000);
assert.equal(noAudio.co2,0,'weak audio never triggers jet');
const noDrop=step({...INITIAL},.016,cue,goodAudio,110000);
assert.equal(noDrop.co2,0,'scheduled hook never fakes CO2');
assert(noDrop.confetti>0,'measured energetic hook can trigger virtual confetti');
const reset=step(b,.016,drop,{...goodAudio,beat:false},500);
assert(reset.burstCount===0&&reset.co2===0,'backwards seek clears a stale burst');
const seekBeat=step(b,.016,drop,goodAudio,500);
assert(seekBeat.co2===0&&seekBeat.burstCount===0,'seeking onto a beat cannot make a fake jet');
assert.equal(step(b,.016,{...drop,active:false},goodAudio,110010).co2,0,'pause disables jets');
let samples=0,visible=0;
for(const kind of ['bubble','confetti','streamer','co2']){
 for(let j=0;j<80;j++){
  for(let k=0;k<700;k++){
   const s=sample(kind,j,80,k*270,drop,b),v=Object.values(s);
   assert(v.every(x=>Number.isFinite(x)),'finite sample '+kind);
   assert(Math.abs(s.x)<=3.9&&Math.abs(s.z)<=3.9&&s.y>=-1.8&&s.y<=2.2);
   assert(s.scaleX>=0&&s.scaleX<=.40&&s.scaleY>=0&&s.scaleY<=.55);
   assert(s.alpha>=0&&s.alpha<=1);
   visible+=s.scaleX>0?1:0;samples++;
  }
 }
}
assert.equal(samples,224000);
assert(visible>0,'new atmosphere actually renders visible virtual particles');
assert.deepEqual(sample('bubble',0,8,Infinity,drop,b),sample('bubble',0,8,0,{...drop,active:false},b));
assert.equal(sample('co2',0,8,1000,cue,b).scaleX,0,'unverified CO2 never draws');
assert.equal(sample('bubble',100,8,1000,cue,b).scaleX,0);
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0)>=1084);assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.includes('npm run test:v1084 && npm run test:v1084:types'));
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('planFestivalAtmosphereV1084({')&&stage.includes('observedSection:section'));
assert(stage.includes('festivalCueV1084.active && <ArenaFestivalAtmosphereV1084'));
const fog=read('components/visualizer/stages/ArenaLowFogV1036.tsx');
assert(fog.includes('festivalCueV1084?.active')&&fog.includes('Math.min(.16,')&&fog.includes('Math.min(.095,'));
const fx=read('components/visualizer/stages/ArenaFestivalAtmosphereV1084.tsx');
assert.equal((fx.match(/<instancedMesh\b/g)||[]).length,3,'three pooled particle batches');
assert(!fx.includes('setInterval(')&&!fx.includes('fetch(')&&!fx.includes('new PointLight('));
for(const file of ['types/music.ts','components/visualizer/registry.tsx','context/UiPreferencesContext.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/ThreeAvatar.tsx',
 'components/visualizer/stages/index.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('FestivalFx')||read(file).includes('festivalFx'),file);
assert(read('context/UiPreferencesContext.tsx').includes('arenaFestivalFxEnabledV1084:false'));
assert(read('scripts/v931-production-gate.cjs').includes('tests/v1084-festival-atmosphere-regression.cjs'));
assert(read('scripts/vercel-production-build.cjs').includes('tests/v1084-festival-atmosphere-regression.cjs'));
for(const ban of ['Math.random(','Date.now(','fetch(','navigator.','requestAnimationFrame(','setInterval('])
 assert(!read('lib/arena360FestivalAtmosphereV1084.ts').includes(ban),'planner must be pure: '+ban);
console.log(`PASS V1084: ${samples} bounded 3D samples, ${visible} visible; deterministic genres/chapters; measured audio CO2 guard; no additional hardware`);
