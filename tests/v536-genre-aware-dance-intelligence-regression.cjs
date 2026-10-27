'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {newGenreMotionStateV536,stepGenreMotionV536,rankGenreMotionsV536,motionFamilyV536,
  motionSectionV536,genreCrossfadeSecondsV536}=load('components/visualizer/genreAwareMotionDirectorV536');
const {suggestMotionCategoryV535}=load('components/visualizer/motionLibraryIntelligenceV535');
const root=path.resolve(__dirname,'..');
const filenames=['sonic-performer-v3.glb','sonic-pulsebot-v1.glb','sonic-nova-v1.glb','sonic-rae-v1.glb','sonic-jax-v1.glb'];
const raw=[ 'Idle_Groove','Dance_Groove','Dance_RapTwoStep','Rap_Gesture','Finger_Flow','Dance_ClubGroove',
  'Hip_Bounce','Arms_Up','Head_Nod','Shoulder_Roll','Dance_SideStep','Greeting_Wave','Hardtekk_Shuffle','Hardstyle_Stomp'];
const toClip=(name,source='embedded',overrides={})=>({name,label:name,duration:2.5,trackCount:165,
  source,category:suggestMotionCategoryV535(name),...overrides});
const base={clips:raw.map(n=>toClip(n)),trackId:'rap-2026',modelKey:'sonic-performer-v3',
  progressMs:0,section:'verse',genre:'deutschrap',bpm:95,energy:.5,slot:0,
  playing:true,reducedMotion:false,manualPriority:false};
assert.equal(motionFamilyV536('Deutschrap / Trap'),'rap');
assert.equal(motionFamilyV536('Rawstyle / Hardstyle'),'hardstyle');
assert.equal(motionFamilyV536('Hardtekk Vienna'),'hardtekk');
assert.equal(motionSectionV536('Chorus'),'hook');
assert.equal(motionSectionV536('Build-up'),'drop');
assert.equal(motionSectionV536('breakdown'),'quiet');
for(const [section,genre,wanted] of [['quiet','deutschrap','Idle_Groove'],['verse','deutschrap','Dance_RapTwoStep'],
  ['drop','hardstyle','Hardstyle_Stomp'],['drop','hardtekk','Hardtekk_Shuffle']]){
  const ranked=rankGenreMotionsV536({...base,section,genre},'test-phrase:2');
  assert(ranked.length>2);
  assert(ranked.slice(0,6).some(c=>c.name===wanted),`missing ${wanted} high in ${genre} ${section}: ${ranked.slice(0,6).map(c=>c.name)}`);
}
// Same name is not sufficient to equate two sources: their action names must be unique.
const twoSources=[toClip('Idle_Groove'),toClip('Library:motion1:0','library',{label:'New Hardtekk Stomp',category:'energetic',favorite:true})];
assert.equal(rankGenreMotionsV536({...base,clips:twoSources,genre:'hardtekk',section:'drop',energy:.98},'drop:4')[0].name,'Library:motion1:0');
assert.equal(rankGenreMotionsV536({...base,clips:twoSources,genre:'deutschrap',section:'quiet',energy:.12},'quiet:4')[0].name,'Idle_Groove');
const highFav=toClip('Library:motion2:0','library',{label:'Rap_Step',category:'rap',favorite:true});
const noFav=toClip('Library:motion3:0','library',{label:'Rap_Step',category:'rap',favorite:false});
assert(rankGenreMotionsV536({...base,clips:[highFav,noFav]},'verse:0')[0].name===highFav.name,
  'favorites should break otherwise equal suitability');
for(const entry of [{name:'',duration:2,trackCount:1},{name:'broken',duration:NaN,trackCount:12},
  {name:'broken',duration:.1,trackCount:12},{name:'broken',duration:2,trackCount:0}]) {
  assert.equal(rankGenreMotionsV536({...base,clips:[{...toClip('broken'),...entry}]},'verse:1').length,0);
}
assert.equal(rankGenreMotionsV536({...base,clips:[]},'verse:1').length,0);
assert.deepEqual(rankGenreMotionsV536(base,'verse:3'),rankGenreMotionsV536(base,'verse:3'),'must be deterministic');
let frames=0,transitions=0,fixtures=0;
function run(input){
  let state=newGenreMotionStateV536(),previousName=null;const used=new Set();
  for(let ms=0;ms<180000;ms+=500){
    const section=ms<30000?'quiet':ms<75000?'verse':ms<120000?'hook':'drop';
    const next=stepGenreMotionV536(state,{...input,progressMs:ms,section,energy:section==='drop'?.93:section==='quiet'?.13:.65});
    assert(next.selectedName && input.clips.some(c=>c.name===next.selectedName));
    if(previousName&&previousName!==next.selectedName){
      assert(ms-state.lastSwitchMs>=8000,`rapid switch at ${ms}`);
      transitions++;
    }
    used.add(next.selectedName);previousName=next.selectedName;state=next;frames++;
  }
  assert(used.size>=2,`missing genre variation for ${input.modelKey}/${input.genre}`);
  const manual=stepGenreMotionV536(state,{...input,progressMs:180500,manualPriority:true});
  assert.equal(manual.selectedName,null);
  const resumed=stepGenreMotionV536(manual,{...input,progressMs:181000});
  assert(resumed.selectedName);
  assert.equal(stepGenreMotionV536(resumed,{...input,progressMs:181500,reducedMotion:true}).selectedName,null);
  assert.equal(stepGenreMotionV536(resumed,{...input,progressMs:181500,playing:false}).selectedName,null);
  assert.equal(stepGenreMotionV536(resumed,{...input,trackId:'other-track',progressMs:0}).trackId,'other-track');
  assert.equal(stepGenreMotionV536(resumed,{...input,modelKey:'another-model',progressMs:0}).modelKey,'another-model');
  assert.equal(stepGenreMotionV536(resumed,{...input,progressMs:1000}).lastSwitchMs,1000,'seek must reset');
}
for(const fileName of filenames){
  const file=path.join(process.env.SONIC_V529_SAMPLES||'/mnt/data',fileName);
  if(!fs.existsSync(file))continue;
  const b=fs.readFileSync(file);
  assert.equal(b.toString('ascii',0,4),'glTF');
  const json=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString('utf8'));
  assert.equal(json.animations.length,20);
  const clips=json.animations.map(a=>toClip(a.name,'embedded',{trackCount:a.channels.length}));
  for(const genre of ['deutschrap','hardstyle','hardtekk','pop'])run({...base,clips,genre,modelKey:fileName});
  fixtures++;
}
if(fixtures)assert.equal(fixtures,5,'partial fixture set is not an integration test');
run({...base,clips:[...base.clips,...Array.from({length:24},(_,i)=>toClip(`Library:motion${i}:0`,'library',{
  label:`Rap_Step_${i}`,category:'rap',favorite:i%5===0}))],modelKey:'mixed-library',genre:'deutschrap'});
assert(genreCrossfadeSecondsV536({section:'verse',energy:.55})>=.55);
assert(genreCrossfadeSecondsV536({section:'quiet',energy:.1})>=.7);
const dancer=fs.readFileSync(path.join(root,'components/visualizer/GltfDancerAvatarV492.tsx'),'utf8');
const hook=fs.readFileSync(path.join(root,'components/visualizer/useGenreAwareMotionDirectorV536.ts'),'utf8');
for(const marker of ['useGenreAwareMotionDirectorV536','libraryClips.flatMap','motion.category??suggestMotionCategoryV535',
  'library.automatic','!!activeSequence','!!activeLoop','timelineEnabled','avatarBlendEnabled','!!evolutionMotion',
  '!!adaptiveMotion','!!preferredMotionUrlV440','genreMotionV536 && actions[genreMotionV536]',
  'genreCrossfadeSecondsV536','useGltfClipTransitionsV492','useEmbeddedMotionDirectorV530'])
  assert(dancer.includes(marker),`V536 missing runtime integration: ${marker}`);
assert(!hook.includes('useFrame('),'no extra render/frame loop');
assert(hook.includes('manualPriority'),'manual override must have priority');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1])>=536,'genre director regression must remain valid in later versions');
assert(pkg.scripts['build:preflight'].includes('npm run test:v536 && npm run test:v536:types &&'));
console.log(`V536 PASS: ${fixtures} real avatars, ${frames} controlled genre frames, ${transitions} bounded transitions, 24 added motion clips, manual ownership, seek, overrides, crossfades`);
