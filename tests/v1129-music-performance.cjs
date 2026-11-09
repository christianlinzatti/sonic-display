const assert=require('node:assert/strict');
const load=require('./helpers/load-stage-typescript.cjs');
const music=load('lib/musicPerformanceV1129.ts');
const crew=load('components/visualizer/sonicCrewDirector.ts');
const manifest=require('../public/avatars/sonic/manifest.json');
assert(crew.CREW_IDS.length>=7);
for(const avatar of music.ENCORE_AVATARS_V1129){
 const asset=manifest.find(a=>a.file===avatar.slug+'.glb');assert(asset);assert.equal(asset.clips.length,28);
 const clips=asset.clips.map(c=>({name:c.name,duration:c.seconds}));
 for(const genre of avatar.genres){
  let state=crew.newCrewState(),previous=null,names=new Set();
  for(let ms=0;ms<128000;ms+=100){
   const next=crew.stepCrew(state,{modelId:avatar.id,clips,trackId:'encore-test',progressMs:ms,bpm:120,
    section:'verse',genre,energy:.6,slot:0,count:1,playing:true,reducedMotion:false,manualPriority:false,settings:crew.CREW_DEFAULT});
   assert(next.plan.active);assert(clips.some(c=>c.name===next.plan.clip));
   if(next.plan.clip!==previous){if(previous)assert(ms-state.switched>=7900);previous=next.plan.clip;names.add(previous);}
   state=next.state;
  }
  assert(names.size>=3,`${genre}: at least three distinct moves over 16 phrases`);
 }
}
for(const [genre,family] of [['metal','rock'],['salsa','latin'],['amapiano','afro'],['swing','jazz'],['klassik','classical'],['lo-fi','ambient'],['hardtekk','hard'],['trap','urban'],['trance','electronic'],['k-pop','pop'],['unknown','global']])assert.equal(music.musicFamilyV1129(genre),family);
for(const genre of ['rock','ambient','pop','latin','classical']){
 const base={genre,elapsedMs:0,durationMs:4000,playing:true,reducedMotion:false,highQuality:true};
 const entry=music.lyricEntranceV1129(base),end=music.lyricEntranceV1129({...base,elapsedMs:700});
 assert(entry.opacity>=.68);assert(Math.abs(end.x)<1e-9);assert(Math.abs(end.y)<1e-9);assert.equal(end.scale,1);
 for(const guard of [{playing:false},{reducedMotion:true},{highQuality:false}])assert.deepEqual(music.lyricEntranceV1129({...base,...guard}),{x:0,y:0,z:0,scale:1,opacity:1,family:music.musicFamilyV1129(genre)});
}
console.log('PASS V1129: seven real avatars, 28-clip Encore assets, multi-phrase genre variety, quiet lyric guards and genre families');

// A mixed old/new ensemble must keep one shared clip and phase at every phrase.
for(const mode of ['unison','canon'])for(const genre of ['latin','rock','jazz']){
 const ids=['sonic-neon-pulse','sonic-luna-flow','sonic-velvet-jazz'];
 let states=ids.map(()=>crew.newCrewState());
 for(let ms=0;ms<40000;ms+=100){
  const plans=ids.map((id,slot)=>{const asset=manifest.find(a=>a.file===id.slice(6)+'.glb');const next=crew.stepCrew(states[slot],{
   modelId:id,clips:asset.clips.map(c=>({name:c.name,duration:c.seconds})),trackId:'mixed',progressMs:ms,
   bpm:120,section:'hook',genre,energy:.7,slot,count:3,playing:true,reducedMotion:false,manualPriority:false,
   settings:{...crew.CREW_DEFAULT,mode}});states[slot]=next.state;return next.plan;});
  assert.equal(plans[0].clip,plans[1].clip);assert.equal(plans[1].clip,plans[2].clip);
 }
}
console.log('PASS V1129 mixed original/Encore unison and canon for Latin, Rock and Jazz');
