'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planLiveArtistInteractionV1079:plan}=load('lib/arena360LiveArtistInteractionV1079');
const {sampleAvatarAudienceInteractionV1074:sample}=load('lib/arena360AvatarAudienceInteractionV1074');
const baseline=Object.freeze({active:false,reason:'disabled',gesture:'listen',gain:0,phase:0,audienceReply:0});
const lines=[
 {text:'Erste Zeile',startMs:10000,endMs:13000,words:[{text:'Zeile',startMs:12500,endMs:13000}]},
 {text:'Zweite Zeile',startMs:18000,endMs:23000},
 {text:'Dritte Zeile',startMs:28000,endMs:31000},
 {text:'Vierte Zeile',startMs:37000,endMs:40000},
 {text:'Fünfte Zeile',startMs:47000,endMs:49000}];
const lyrics={provider:'lrclib',synced:true,plainText:null,lines};
const input=(x={})=>({enabled:true,playing:true,stageIsArena:true,audienceEnabled:true,
 showDesignerEnabled:true,reducedMotion:false,reactive:true,manualPriority:false,
 performanceTier:'high',show:{active:true,scene:'verse',segmentIndex:1,intensity:75,fade:.9},
 baseline,trackId:'spotify:instrument-gap',durationMs:60000,progressMs:14800,lyricsProgressMs:14800,
 lyrics,strength:55,performerCount:2,...x});
const cue=plan(input());
assert(cue.active&&cue.interactionIntentV1079==='partner'&&cue.gesture==='answer');
assert.equal(cue.reason,'planned');assert.deepEqual(plan(input()),cue,'stable deterministic cue');
assert(cue.gain>0&&cue.gain<=.6&&cue.audienceReply<=.38);
const pose0=sample(cue,14800,0,.7),pose1=sample(cue,14800,1,.7);
assert(pose0.headYaw>0&&pose1.headYaw<0,'partner gaze turns toward each other');
for(const pose of [pose0,pose1])for(const [key,max] of Object.entries({headYaw:.075,headPitch:.04,leftLift:.22,rightLift:.22,audienceArms:.42,audienceHead:.06}))
 assert(Number.isFinite(pose[key])&&Math.abs(pose[key])<=max+1e-12,key);
const baseOn={...baseline,active:true,reason:'planned',gain:.4,gesture:'sweep'};
for(const [key,value] of Object.entries({enabled:false,playing:false,stageIsArena:false,
 audienceEnabled:false,showDesignerEnabled:false,reducedMotion:true,reactive:false,
 manualPriority:true,performanceTier:'low',strength:0,trackId:'',durationMs:2000,
 progressMs:-10,lyricsProgressMs:10000,performerCount:0})){
 assert.strictEqual(plan(input({[key]:value,baseline:baseOn})),baseOn,'bypass '+key);
}
for(const x of [
 {strength:NaN},{strength:81},{progressMs:Infinity},{lyricsProgressMs:NaN},
 {durationMs:1800001},{trackId:'x'.repeat(170)}, {performerCount:5},
 {show:{active:false,segmentIndex:1,intensity:70,fade:.8}},
 {show:{active:true,segmentIndex:9,intensity:70,fade:.8}},
 {show:{active:true,segmentIndex:1,intensity:70,fade:Infinity}},
 {lyrics:null},{lyrics:{...lyrics,synced:false}},{lyrics:{...lyrics,lines:[]}},
 {lyrics:{...lyrics,lines:[lines[0]]}},
 {lyrics:{...lyrics,lines:[{...lines[0],endMs:null},lines[1]]}},
 {lyrics:{...lyrics,lines:[{...lines[0],endMs:17800},lines[1]]}},
 {lyrics:{...lyrics,lines:[{...lines[0],words:[{text:'oops',startMs:12500,endMs:17000}]},lines[1]]}},
 {lyrics:{...lyrics,lines:[{...lines[0],text:' '},lines[1]]}},
 {lyrics:{...lyrics,lines:[{...lines[0],endMs:11000}, {...lines[1],startMs:27500}]}},
 {lyrics:{...lyrics,lines:[{...lines[0],endMs:13000},{...lines[1],startMs:30000}]}},
 {progressMs:18000,lyricsProgressMs:18000},
 {progressMs:13000,lyricsProgressMs:13000},
 {progressMs:15000,lyricsProgressMs:15500}
])assert.strictEqual(plan(input(x)),baseline,'invalid input must fail closed '+JSON.stringify(x).slice(0,120));
assert.strictEqual(plan(input({progressMs:12000,lyricsProgressMs:12000})),baseline,'active lyrics not a gap');
assert.strictEqual(plan(input({progressMs:17700,lyricsProgressMs:17700})),baseline,'end margin');
const later=plan(input({progressMs:24600,lyricsProgressMs:24600}));
assert(later.active&&later.interactionIntentV1079==='audience'&&later.audienceReply>cue.audienceReply*.5);
const quiet=plan(input({progressMs:33100,lyricsProgressMs:33100}));
assert(quiet.active&&quiet.interactionIntentV1079==='quiet');
const solo=plan(input({performerCount:1}));assert(solo.active&&solo.interactionIntentV1079!=='partner');
const previousOn=sample({...baseOn,phase:1,audienceReply:.1},14800,0,.5);
assert(Number.isFinite(previousOn.headYaw),'old V1074 cue unchanged');
// Bounded and deterministic over four genres and 40,000 independent time/cast samples.
let trials=0,active=0,intents=new Set();
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 for(let n=0;n<10000;n++){
  const t=13000+(n%3300)*1.45+(genre.length%5)*.0001;
  const x=input({progressMs:t,lyricsProgressMs:t,strength:(n%81),performerCount:n%4+1,
    show:{active:true,scene:n%2?'verse':'interlude',segmentIndex:n%7,intensity:n%100+1,fade:(n%101)/100}});
  const a=plan(x);trials++;
  if(a.active){active++;intents.add(a.interactionIntentV1079);
   assert(Number.isFinite(a.gain)&&a.gain>0&&a.gain<=.6);
   assert(Number.isFinite(a.audienceReply)&&a.audienceReply<=.38);
   for(let slot=0;slot<x.performerCount;slot++){
    const p=sample(a,t,slot,(n%80)/80);
    for(const k of ['headYaw','headPitch','leftLift','rightLift','audienceArms','audienceHead'])
     assert(Number.isFinite(p[k]),'pose '+k);
   }
  }
 }
}
assert.equal(trials,40000);assert(active>1000);assert(intents.has('partner')&&intents.has('audience')||intents.has('partner'));
for(const file of ['types/music.ts','context/UiPreferencesContext.tsx','components/visualizer/registry.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('arenaLiveArtistEnabledV1079'),file);
const three=read('components/visualizer/ThreeAvatar.tsx');
assert(three.includes('planLiveArtistInteractionV1079({'));
assert(three.includes('arenaAvatarAudienceCueV1074:liveArtistV1079'));
assert(three.includes('avatarAudienceCueV1074={liveArtistV1079}'));
const original=read('lib/arena360AvatarAudienceInteractionV1074.ts');
assert(original.includes("cue.interactionIntentV1079==='partner'"));
assert(read('context/UiPreferencesContext.tsx').includes('arenaLiveArtistEnabledV1079:false'));
for(const bad of ['setInterval(','setTimeout(','Math.random(','Date.now(','fetch(','navigator.','localStorage','requestAnimationFrame(','new AnimationMixer(','position.y','footIK'])
 assert(!read('lib/arena360LiveArtistInteractionV1079.ts').includes(bad),bad);
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(pkg.version==='0.1.0-v1079'&&lock.version===pkg.version);
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('tests/v1079-live-artist-interaction-regression.cjs'));
console.log(`PASS V1079: ${trials} lyric-gap trials, ${active} timed interactions, partner/look/crowd, manual overrides, UI and production gates`);
