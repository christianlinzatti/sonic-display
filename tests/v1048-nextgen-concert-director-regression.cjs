'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {generateArenaShowPlanV1040,editArenaShowSegmentV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {concertSongSeedV1048,concertSongMotifV1048,directArenaShowV1048:direct}=load('lib/arena360ConcertDirectorV1048');
const plan=generateArenaShowPlanV1040({genre:'Hardtekk',durationMs:240000,prompt:'Dramatisch, 360 Grad'});
function at(index,trackId='artist:track:001',changes={}){
 const seg=plan.segments[index],progressMs=Math.round((seg.start+(seg.end-seg.start)*.5)*240000);
 const show=sampleArenaShowPlanV1040(plan,{enabled:true,playing:true,reducedMotion:false,progressMs,durationMs:240000,observedSection:'verse'});
 assert.equal(show.segmentIndex,index);
 return {enabled:true,stageIsArena:true,playing:true,reducedMotion:false,reactive:true,
  show,plan,trackId,progressMs,durationMs:240000,strength:65,performanceTier:'high',...changes};
}
const scenes=plan.segments.map((s,i)=>direct(at(i)));
for(let i=0;i<scenes.length;i++){
 const cue=scenes[i];assert.equal(cue.active,true);assert.equal(cue.segmentIndex,i);assert(cue.motif);
 assert.equal(cue.show.scene,plan.segments[i].scene);
 assert(cue.show.intensity<=at(i).show.intensity,'never boost authored intensity');
 assert.deepEqual(direct(at(i)),direct(at(i)),'same song and clock must be repeatable');
 if(i)assert.notEqual(cue.motif,scenes[i-1].motif,'no consecutive repeated motifs');
}
const tracks=['artist:track:001','artist:track:002','artist:track:003','artist:track:004'];
assert(new Set(tracks.map(t=>concertSongSeedV1048(t,plan))).size>=3);
assert(new Set(tracks.map(t=>concertSongMotifV1048(t,plan,0))).size>=2,'distinct song motifs');
assert.notDeepEqual(direct(at(0,tracks[0])).show,direct(at(0,tracks[1])).show,'different tracks produce variant looks');
// Treat explicit editing as authority; a changed camera, laser, deck, floating and dance never gets replaced.
const edited=editArenaShowSegmentV1040(plan,'act-2',{
 camera:'wide',deck:'spiral',lasers:'tunnel',floating:'rise',dance:'calm',intensity:19,
});
const changedInput=at(1,'artist:track:001');
const modified={...changedInput,plan:edited,show:sampleArenaShowPlanV1040(edited,{
 enabled:true,playing:true,reducedMotion:false,progressMs:changedInput.progressMs,durationMs:240000,observedSection:'verse',
})};
const result=direct(modified).show;
assert.deepEqual([result.camera,result.deck,result.lasers,result.floating,result.dance],
 ['wide','spiral','tunnel','rise','calm']);
assert(result.intensity<=modified.show.intensity);
// No change when disabled, paused, lacking a trustworthy clock, on a non-arena stage, or reduced-motion.
for(const x of [{enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},
 {reactive:false},{performanceTier:'low'},{show:{...at(1).show,active:false}},
 {trackId:''},{trackId:null},{progressMs:-1},{progressMs:NaN},{progressMs:241000},
 {durationMs:NaN},{durationMs:1000},{plan:null},{strength:0}]){
 const input=at(1,'artist:track:001',x),out=direct(input);
 assert.equal(out.active,false,JSON.stringify(x));
 assert.deepEqual(out.show,input.show,'invalid state must leave V1040 cue unchanged');
}
for(const value of [NaN,-50,1000,Infinity]){
 const input=at(2,'song',{strength:value});
 const out=direct(input);
 assert(Number.isFinite(out.show.intensity)&&out.show.intensity>=0&&out.show.intensity<=input.show.intensity);
}
const balanced=direct(at(2,'song',{performanceTier:'balanced'}));
const high=direct(at(2,'song',{performanceTier:'high'}));
assert(balanced.show.intensity>=high.show.intensity,'balanced must reduce the adaptive intensity modulation');
// Interoperability: no new GPU assets/camera/mixer, no new LAN dispatch and no confirmed fake beat.
for(const f of ['components/visualizer/stages/Arena360StageV1031.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/registry.tsx','types/music.ts','context/UiPreferencesContext.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx','components/GoveeMusicSyncV909.tsx']){
 assert(read(f).includes('V1048'),`Missing V1048 integration in ${f}`);
}
assert(read('components/visualizer/stages/Arena360StageV1031.tsx').includes('show:authoredShowCueV1040'));
assert(read('components/visualizer/ThreeAvatar.tsx').includes('show:authoredShowCueV1040'));
assert(read('components/GoveeMusicSyncV909.tsx').includes('show:baseGoveeShowV1040'));
assert(read('components/GoveeMusicSyncV909.tsx').includes('applyGoveeShowV1042'));
assert(read('context/UiPreferencesContext.tsx').includes('arenaConcertDirectorEnabledV1048:false'));
for(const keyword of ['fetch(', 'setTimeout(', 'setInterval(', 'Math.random(', 'WebSocket(', 'localStorage', 'navigator.', 'document.'])
 assert(!read('lib/arena360ConcertDirectorV1048.ts').includes(keyword),`Unexpected side effect ${keyword}`);
console.log('PASS V1048 · song-specific deterministic variation, no repetition, manual overrides, bounded intensity, safety, stage/avatars/Govee integration');
