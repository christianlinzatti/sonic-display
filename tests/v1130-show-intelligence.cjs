const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const smart=load('lib/showIntelligenceV1130.ts'),crew=load('components/visualizer/sonicCrewDirector.ts');
const {lyrics}=require('./fixtures/concertMocksV1130.cjs'),manifest=require('../public/avatars/sonic/manifest.json');
assert.equal(crew.CREW_IDS.length,11);
for(const avatar of smart.HEADLINERS_V1130){const asset=manifest.find(a=>a.file===avatar.slug+'.glb');assert.equal(asset.clips.length,32);}
assert.equal(smart.lyricSectionV1130(lyrics,8000),'verse');assert.equal(smart.lyricSectionV1130(lyrics,33000),'hook');
assert.equal(smart.lyricSectionV1130(lyrics,47000),'quiet');assert.equal(smart.lyricSectionV1130({...lyrics,synced:false},33000),null);
assert(smart.lyricDensityV1130(lyrics,33000)>0);assert.equal(smart.lyricDensityV1130(null,33000),0);
for(const [section,act,mode] of [['intro','breathe','individual'],['verse','story','spotlight'],['build','build','canon'],['drop','impact','unison']]){
 const cue=smart.showCueV1130({section,energy:.7,progressMs:0,lyricDensity:.8});assert.equal(cue.act,act);assert.equal(cue.mode,mode);
}
assert.equal(smart.showCueV1130({progressMs:95000,durationMs:100000,energy:.8,section:'hook'}).act,'finale');
const dense=smart.showCueV1130({progressMs:0,section:'verse',energy:.7,lyricDensity:.9});
assert(dense.intensity<smart.showCueV1130({progressMs:0,section:'verse',energy:.7,lyricDensity:0}).intensity);
const clips=manifest.find(a=>a.file==='quantum-bass.glb').clips.map(c=>c.name);let recent=[],chosen=new Set();
for(let phrase=0;phrase<24;phrase++){
 const cue=smart.showCueV1130({progressMs:phrase*8000,genre:'hardstyle',section:'verse',energy:.7});
 const name=smart.intelligentClipV1130({clips,genre:'hardstyle',cue,recent,trackId:'test-song',slot:0,shared:false});
 assert(clips.includes(name));assert.notEqual(name,recent[0]);chosen.add(name);recent=[name,...recent].slice(0,3);
}
assert(chosen.size>=4);
for(const mode of ['adaptive']){
 const ids=['sonic-neon-pulse','sonic-rio-carnival','sonic-quantum-bass'];let states=ids.map(()=>crew.newCrewState());
 for(let ms=0;ms<64000;ms+=100){
  const section=ms<16000?'verse':ms<32000?'hook':ms<48000?'drop':'quiet';
  const plans=ids.map((id,slot)=>{const asset=manifest.find(a=>a.file===id.slice(6)+'.glb');
   const next=crew.stepCrew(states[slot],{modelId:id,clips:asset.clips.map(c=>({name:c.name,duration:c.seconds})),trackId:'mixed-adaptive',
    progressMs:ms,bpm:120,energy:.8,section,genre:'house',slot,count:3,playing:true,reducedMotion:false,manualPriority:false,
    settings:{...crew.CREW_DEFAULT,mode},lyricDensity:.8});states[slot]=next.state;return next.plan;});
  if(ms===40000){assert.equal(plans[0].clip,plans[1].clip);assert.equal(plans[1].clip,plans[2].clip);}
 }
}
console.log('PASS V1130: 11 avatars, 32-clip headliners, lyric structure, density-aware pacing, finale, novelty memory and mixed ensemble');
