'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {DEFAULT_CHOREOGRAPHY_V993,normalizeChoreographyV993,sampleChoreographyV993,previewChoreographyV993}=load('components/visualizer/aiChoreographyDirectorV993');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const base={headNod:.5,headTurn:.2,spineSway:.4,hipSway:.3,shoulderRoll:.5,
 followThrough:.3,headLag:.2,chestPulse:.5,armSwing:.4,legGroove:.3,
 footStep:.3,weightShift:.1,beatImpulse:.6,expressionJaw:.3,expressionBrow:.2,
 expressionEyeNarrow:.1,expressionHeadTilt:.2,leftArmAccent:.3,rightArmAccent:.3,torsoTwist:.25,
 hipPitch:.13,hipRoll:.13,hipVertical:.04,naturalLeftLeg:.14,naturalRightAnkle:.12};
const plan={source:'verified-v604',trackId:'track-A',durationMs:120000,scenes:[
 {index:0,startMs:0,endMs:20000,section:'intro',focus:'stage'},
 {index:1,startMs:20000,endMs:60000,section:'verse',focus:'performer'},
 {index:2,startMs:60000,endMs:100000,section:'hook',focus:'ensemble'},
 {index:3,startMs:100000,endMs:120000,section:'finale',focus:'impact'}]};
const settings={...DEFAULT_CHOREOGRAPHY_V993,enabled:true};
const input=(p={})=>({settings,plan,trackId:'track-A',durationMs:120000,positionMs:70000,
 genre:'Deutschrap',playing:true,autoEnabled:true,directorEnabled:true,danceEnabled:true,
 tier:'high',reducedMotion:false,slot:0,count:3,...p});
const sample=p=>sampleChoreographyV993(base,input(p));
let n=0;const check=(name,fn)=>{try{fn();n++;console.log('PASS V993 '+name);}catch(e){e.message='V993 '+name+': '+e.message;throw e;}};
check('default opt-out and fail-closed normalization',()=>{
 assert.equal(DEFAULT_CHOREOGRAPHY_V993.enabled,false);
 assert.equal(normalizeChoreographyV993({enabled:'true'}).enabled,false);
 assert.equal(normalizeChoreographyV993({enabled:true,style:'hacked',intensity:Infinity}).style,'auto');
 assert.equal(normalizeChoreographyV993({intensity:-5}).intensity,0);
 assert.equal(normalizeChoreographyV993({intensity:180}).intensity,100);
 assert.equal(normalizeChoreographyV993({enabled:true,ensembleSync:'false'}).ensembleSync,true);
});
check('verified song, live playback and director must authorize',()=>{
 for(const p of [{plan:null},{plan:{...plan,source:'unavailable'}},{plan:{...plan,trackId:'wrong'}},
  {plan:{...plan,durationMs:100000}},{trackId:'wrong'},{durationMs:100000},{positionMs:-1},
  {positionMs:120000},{positionMs:15000,plan:{...plan,scenes:[]}},
  {plan:{...plan,scenes:[{...plan.scenes[2],startMs:100000,endMs:300000}]}}]){
  const c=sample(p);assert.equal(c.active,false,JSON.stringify(p));assert.strictEqual(c.motion,base);
 }
});
check('manual, motion, foot and cinematic lyrics protections',()=>{
 for(const p of [{settings:{...settings,enabled:false}},{settings:{...settings,intensity:0}},
 {playing:false},{autoEnabled:false},{directorEnabled:false},{danceEnabled:false},
 {manualPriority:true},{manualFx:true},{seekBlocked:true},{blackout:true},
 {reducedMotion:true},{tier:'low'},{collisionRisk:true},{lyricsVisible:true},
 {slot:4},{slot:-1},{count:5},{count:0}]){
  const c=sample(p);assert.equal(c.active,false,JSON.stringify(p));assert.strictEqual(c.motion,base);
 }
});
check('Deutschrap and Hardtekk have different upper-body accents',()=>{
 const rap=sample(),tekk=sample({genre:'Hardtekk'});
 assert(rap.active&&tekk.active);assert.equal(rap.style,'deutschrap');assert.equal(tekk.style,'hardtekk');
 assert(rap.motion.shoulderRoll>tekk.motion.shoulderRoll);
 assert(tekk.motion.chestPulse>rap.motion.chestPulse);
 assert(rap.motion.armSwing>base.armSwing&&tekk.motion.armSwing>base.armSwing);
});
check('hardstyle rock pop explicit genre support and unknown genre fail closed',()=>{
 for(const [genre,style] of [['rawstyle','hardstyle'],['Industrial Rock','rock'],['pop','pop']]){
  const c=sample({genre});assert.equal(c.style,style);assert(c.active);
 }
 const unknown=sample({genre:'nonsense'});assert.equal(unknown.active,false);
 assert(sample({genre:null,settings:{...settings,style:'deutschrap'}}).active);
});
check('confirmed section shapes choreography and fades smoothly',()=>{
 const intro=sample({positionMs:6000}),verse=sample({positionMs:35000}),hook=sample(),outro=sample({positionMs:110000});
 assert(intro.active&&verse.active&&hook.active&&outro.active);
 assert(intro.gain<verse.gain&&verse.gain<hook.gain);
 assert(outro.gain>=hook.gain*.8);
 assert.equal(sample({positionMs:60000}).active,false,'scene cut must be neutral');
 assert(sample({positionMs:62000}).active);
 assert(sample({positionMs:99999}).gain<hook.gain);
});
check('energy accent only from fresh genuine V896 data',()=>{
 const energy={source:'live-normalized-audio',trackId:'track-A',durationMs:120000,
  positionMs:70000,samples:8,smoothed:.8,pulse:.85};
 const recorded=sample({energy});assert(recorded.active&&recorded.energyUsed);
 assert(recorded.gain>sample().gain);
 for(const e of [{...energy,trackId:'other'},{...energy,positionMs:68000},
  {...energy,samples:1},{...energy,pulse:Infinity},{...energy,source:'estimated'}]){
  const c=sample({energy:e});assert(c.active&&!c.energyUsed);
  assert.equal(c.gain,sample().gain);
 }
});
check('ensemble shares one cue, optionally varies safe arm accents',()=>{
 const left=sample({slot:0}),right=sample({slot:1});
 assert.equal(left.gain,right.gain);
 assert.equal(left.motion.headNod,right.motion.headNod);
 const free=sample({slot:1,settings:{...settings,ensembleSync:false}});
 assert(free.active&&free.gain<left.gain);
 assert.equal(free.motion.footStep,base.footStep);
});
check('grounding, clip, facial and foot channels never change',()=>{
 const c=sample({footContactKnown:true,plantedLeft:true,plantedRight:true});
 assert(c.active);
 for(const key of ['hipSway','hipPitch','hipRoll','hipVertical','naturalLeftLeg','naturalRightAnkle',
  'legGroove','footStep','weightShift','beatImpulse','expressionJaw','expressionBrow',
  'expressionEyeNarrow','expressionHeadTilt','headTurn'])assert.equal(c.motion[key],base[key],key);
 assert.equal(base.shoulderRoll,.5,'input not mutated');
});
check('12 section previews never invent timings or auto-enable',()=>{
 assert.deepEqual(previewChoreographyV993(null,settings,'rap'),[]);
 assert.deepEqual(previewChoreographyV993({...plan,source:'unavailable'},settings,'rap'),[]);
 const view=previewChoreographyV993(plan,settings,'rap');
 assert.deepEqual(view.map(x=>x.startMs),[0,20000,60000,100000]);
 assert(view.every(x=>x.endMs<=120000));
 assert.equal(previewChoreographyV993(plan,settings,'mystery').length,0);
});
check('10,000 randomized settings remain finite and bounded',()=>{
 let seed=95322;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
 for(let j=0;j<10000;j++){
  const s={...settings,intensity:random()*100,style:['auto','deutschrap','hardtekk','hardstyle','rock','pop'][j%6]};
  const c=sample({settings:s,positionMs:Math.floor(random()*120000),slot:j%4,count:4});
  assert(c.gain>=0&&c.gain<=1);
  for(const [k,v] of Object.entries(c.motion)){assert(Number.isFinite(v),k);
   if(v!==0&&['headNod','shoulderRoll','chestPulse','armSwing','spineSway','leftArmAccent','rightArmAccent','torsoTwist','followThrough'].includes(k)){
    assert(Math.abs(v/base[k])<=1.131,k);
   }
  }
 }
});
check('concert bridge validates saved preferences',()=>{
 const signal={...bridge.OFF_CONCERT_SIGNAL_V882,trackId:'track-A',durationMs:120000,playing:true,
  enabled:true,intensity:.7,sceneSource:'verified',section:'hook',look:'neon',sceneStartMs:60000,
  sync:{stage:true,lights:true,dance:true},choreographySettingsV993:{...settings,intensity:999,style:'other'},
  directorPlanV895:plan};
 bridge.publishConcertStageSyncV882(signal);const snap=bridge.readConcertStageSyncV882();
 assert.equal(snap.choreographySettingsV993.intensity,100);
 assert.equal(snap.choreographySettingsV993.style,'auto');
 assert(snap.directorPlanV895);
 bridge.publishConcertStageSyncV882({...signal,choreographySettingsV993:{...settings,enabled:false}});
 assert.equal(bridge.readConcertStageSyncV882().choreographySettingsV993.enabled,false);
 bridge.publishConcertStageSyncV882(null);
});
check('rig pipeline stays after V665/V666 before V759; no new renderer',()=>{
 const rig=read('components/visualizer/GltfDancerAvatarV492.tsx');
 assert(rig.indexOf('const choreographyV993=sampleChoreographyV993')>rig.indexOf('genreDanceV666.current=genreV666Result.state'));
 assert(rig.indexOf('varietyStateV759.current,choreographyV993.motion')>rig.indexOf('const choreographyV993='));
 assert(rig.includes('readConcertStageSyncV882()')&&rig.includes('readEnergyV896('));
 const ui=read('components/visualizer/LiveFxDeckV881.tsx');
 assert(ui.includes('updateChoreographyV993')&&ui.includes('choreographySettingsV993:normalizeChoreographyV993'));
 assert(read('components/visualizer/concertStageSyncV882.ts').includes('snapshot.choreographySettingsV993?.intensity'));
});
check('release scripts and CI paths include V993',()=>{
 const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
 assert.match(pkg.version,/^0\.1\.0-v(?:99[3-9]|[1-9]\d{3,})$/);assert.equal(lock.version,pkg.version);
 assert(Number(pkg.sonicRoadmapRelease.slice(1))>=993);assert(Number(pkg.sonicFeatureRelease.slice(1))>=993);
 assert(pkg.scripts.prebuild.includes('npm run test:v993 && npm run test:v993:types'));
 assert(read('scripts/vercel-production-build.cjs').includes('tests/v993-ai-choreography-director-regression.cjs'));
 assert(read('.github/workflows/v832-continuous-validation.yml').includes('test:v993'));
});
console.log(`PASS V993: ${n} groups`);
