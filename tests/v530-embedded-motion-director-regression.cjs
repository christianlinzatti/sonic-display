'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {newEmbeddedMotionStateV530,rankEmbeddedClipsV530,stepEmbeddedMotionV530}=load('components/visualizer/embeddedMotionDirectorV530');
const root=path.resolve(__dirname,'..');
const fixtureNames=['sonic-performer-v3.glb','sonic-pulsebot-v1.glb','sonic-nova-v1.glb','sonic-rae-v1.glb','sonic-jax-v1.glb'];
const builtIn=['Idle_Groove','Dance_Groove','Dance_RapTwoStep','Rap_Gesture','Finger_Flow','Dance_ClubGroove','Hip_Bounce','Arms_Up','Head_Nod','Shoulder_Roll','Dance_SideStep','Greeting_Wave'];
const candidates=builtIn.map(name=>({name,duration:2.5,trackCount:165}));
const normal={clips:candidates,trackId:'track-rap-2026',modelKey:'avatars/sonic-performer-v3.glb',
 progressMs:0,section:'verse',genre:'deutschrap',energy:.5,bpm:98,slot:0,playing:true,reducedMotion:false,manualPriority:false};
function testFixture(file){
 const b=fs.readFileSync(file); assert.equal(b.toString('ascii',0,4),'glTF');
 const json=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString('utf8'));
 const clips=json.animations.map(a=>({name:a.name,duration:2.5,trackCount:a.channels?.length||0}));
 assert.equal(clips.length,20);
 assert(clips.some(c=>c.name==='Dance_RapTwoStep'));
 for(const genre of ['deutschrap','hardstyle','hardtekk','pop']){
  let state=newEmbeddedMotionStateV530();const used=new Set();
  for(let t=0;t<180000;t+=500){
   const section=t<45000?'verse':t<90000?'hook':t<135000?'drop':'quiet';
   state=stepEmbeddedMotionV530(state,{...normal,modelKey:file,genre,clips,progressMs:t,section,
     energy:section==='drop'?.9:section==='quiet'?.15:.55});
   assert(state.selectedName && clips.some(c=>c.name===state.selectedName),`${file}: invalid clip`);
   used.add(state.selectedName);
  }
  assert(used.size>1,`${file}: missing variation for ${genre}`);
 }
}
let matched=0;
for(const filename of fixtureNames){const file=path.join(process.env.SONIC_V529_SAMPLES||'/mnt/data',filename);
 if(fs.existsSync(file)){testFixture(file);matched++;}}
if(matched)assert.equal(matched,5,'A partial GLB sample set is not a complete integration test');
// no input/unsupported candidates leave the existing animation selection alone
for(const key of ['trackId','playing','reducedMotion','manualPriority','modelKey']){
 const overrides={trackId:'',playing:false,reducedMotion:true,manualPriority:true,modelKey:''};
 const stopped=stepEmbeddedMotionV530(newEmbeddedMotionStateV530(),{...normal,[key]:overrides[key]});
 assert.equal(stopped.selectedName,null,key);
}
for(const value of [NaN,Infinity,-1,0]){
 const clips=[{name:'Broken',duration:value,trackCount:2}];
 assert.equal(stepEmbeddedMotionV530(newEmbeddedMotionStateV530(),{...normal,clips}).selectedName,null);
}
assert.equal(rankEmbeddedClipsV530({...normal,clips:[{name:'Imported: Dance',duration:2,trackCount:10}]},'verse:1').length,0);
assert.equal(rankEmbeddedClipsV530({...normal,clips:[]},'verse:1').length,0);
assert.deepEqual(rankEmbeddedClipsV530(normal,'verse:1'),rankEmbeddedClipsV530(normal,'verse:1'),'must be deterministic');
for(const section of ['verse','hook','drop','break']){
 const result=stepEmbeddedMotionV530(newEmbeddedMotionStateV530(),{...normal,section});
 assert(result.selectedName && result.selectedName!=='Greeting_Wave',section);
}
let state=newEmbeddedMotionStateV530();let switches=0;let previous=null;
for(let t=0;t<180000;t+=250){
 const phase=t<45000?'verse':t<90000?'hook':t<135000?'drop':'break';
 const next=stepEmbeddedMotionV530(state,{...normal,progressMs:t,section:phase,energy:t<90000?.5:.9});
 if(previous && next.selectedName!==previous){
  assert(t-state.lastSwitchMs>=8000,'the minimum clip dwell must be respected');switches++;
 }
 previous=next.selectedName;state=next;
}
assert(switches>1,'music-driven change is required');
assert(switches<25,'avoid thrashing during three-minute songs');
const manuallyStopped=stepEmbeddedMotionV530(state,{...normal,progressMs:180250,manualPriority:true});
assert.equal(manuallyStopped.selectedName,null,'manual intervention wins immediately');
const resumed=stepEmbeddedMotionV530(manuallyStopped,{...normal,progressMs:180500});
assert(resumed.selectedName,'automatics resume after manual release');
assert.equal(stepEmbeddedMotionV530(resumed,{...normal,modelKey:'another-avatar',progressMs:500}).modelKey,'another-avatar');
assert.equal(stepEmbeddedMotionV530(resumed,{...normal,trackId:'new-track',progressMs:500}).trackId,'new-track');
assert.equal(stepEmbeddedMotionV530({...resumed,lastPositionMs:90000},{...normal,progressMs:1500}).lastSwitchMs,1500,'seek resets state');
const dancer=fs.readFileSync(path.join(root,'components/visualizer/GltfDancerAvatarV492.tsx'),'utf8');
const hook=fs.readFileSync(path.join(root,'components/visualizer/useEmbeddedMotionDirectorV530.ts'),'utf8');
for(const marker of ['useEmbeddedMotionDirectorV530','animations.filter(c=>names.includes(c.name))',
  "avatarMotionMode!=='hybrid'",'!!animationUrl','!!activeSequence','!!activeLoop','timelineEnabled',
  'avatarBlendEnabled','!!stableLibraryClip','!!smartDanceOverride','!!lowClipV481','!!clipChoiceV328',
  '!!phraseChoiceV329','!!autoMotionV356','rapLiveEnabledV412','embeddedMotionV530 && actions[embeddedMotionV530]',
  'Math.max(.55,avatarCrossfadeSeconds)','useGltfClipTransitionsV492'])assert(dancer.includes(marker),`V530 missing integration: ${marker}`);
assert(!hook.includes('useFrame('),'not allowed to add another per-frame loop');
assert(hook.includes('manualPriority') && hook.includes('selection.trackId'));
console.log(`V530 Embedded Motion Director PASS: ${matched} real GLBs, 20 clips each, rap/hardstyle/hardtekk, deterministic phrases, cooldown, seek and manual priority`);
