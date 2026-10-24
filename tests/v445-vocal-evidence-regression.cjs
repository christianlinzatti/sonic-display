require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {emptyVocalEvidenceV445,advanceVocalEvidenceV445,vocalHintPulseV445}=load('components/visualizer/vocalChangeEvidenceV445');
const lines=Array.from({length:20},(_,i)=>({startMs:i*2000,endMs:i*2000+1900,text:`Rap line ${i}`}));
const lyrics={synced:true,lines};
function run(genreChanged=true,patch={}){
 let state=emptyVocalEvidenceV445(),history=[];
 for(let ms=0;ms<36000;ms+=200){
  const line=Math.floor(ms/2000);const alternate=genreChanged&&line>=10;
  state=advanceVocalEvidenceV445(state,{trackId:'song-1',progressMs:ms,enabled:true,playing:true,
    microphoneActive:true,reducedMotion:false,manualPriority:false,lyrics,
    audio:{bass:alternate?.07:.55,mids:alternate?.62:.20,highs:alternate?.35:.12,volume:.75},...patch});
  if(state.hint&&state.hint.atMs===ms)history.push(state.hint);
 }
 return {state,history};
}
const unchanged=run(false);assert.equal(unchanged.state.changes,0,'fixed mix must not invent voices');
const changed=run(true);assert(changed.state.changes>=1,'large line-aligned spectral change gets a hint');
const hint=changed.history[0];assert.equal(hint.kind,'possible-voice-or-mix-change');
assert.equal(hint.source,'microphone-spectrum-and-lyrics');
assert(hint.confidence<=.45&&hint.confidence>=.15);assert(!('artist' in hint));assert(!('slot' in hint));
assert(vocalHintPulseV445(hint,hint.atMs)>.1);assert.equal(vocalHintPulseV445(hint,hint.atMs+1500),0);
for(const patch of [{enabled:false},{microphoneActive:false},{playing:false},{reducedMotion:true},
 {manualPriority:true},{lyrics:{synced:false,lines}}]){
 const v=run(true,patch);assert.equal(v.state.changes,0,JSON.stringify(patch));
}
let state=emptyVocalEvidenceV445('song-1');state=advanceVocalEvidenceV445(state,{trackId:'song-2',progressMs:200,
  enabled:true,playing:true,microphoneActive:true,reducedMotion:false,manualPriority:false,lyrics,
  audio:{bass:Infinity,mids:NaN,highs:-1,volume:1}});
assert.equal(state.trackId,'song-2');assert.equal(state.samples,0,'invalid spectrum must not count');
assert.equal(advanceVocalEvidenceV445(changed.state,{trackId:'song-1',progressMs:0,playing:false,enabled:true,
 microphoneActive:true,reducedMotion:false,manualPriority:false,lyrics,audio:{bass:0,mids:0,highs:0,volume:0}}).changes,0,'seek back resets');
// Candidate can only add a small, anonymous reaction. It must never reassign the lead.
const interaction=load('components/visualizer/multiArtistInteractionV444');
const pose={cueId:'scene',focus:1,drop:false,positions:[[-2,0,0],[-.5,0,0],[.5,0,0],[2,0,0]]};
const view={pose,count:4,enabled:true,playing:true,reducedMotion:false,manualStage:false,beat:.8,seconds:6,strength:60};
const quiet=interaction.planMultiArtistInteractionV444({...view,audioChangePulse:0});
const response=interaction.planMultiArtistInteractionV444({...view,audioChangePulse:.4});
assert.equal(quiet.lead,response.lead);assert.equal(quiet.source,response.source);
assert(response.slots[0].gesture.intensity>quiet.slots[0].gesture.intensity);
const singer={active:true,leadSlot:3,singingSlots:[3],handoffFrom:null,role:'lead'};
const authored=interaction.planMultiArtistInteractionV444({...view,singer,audioChangePulse:.4});
const original=interaction.planMultiArtistInteractionV444({...view,singer});
assert.deepEqual(authored,original,'anonymous audio cannot affect manually assigned vocal roles');
const group=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/AutoMotionIntelligencePanelV438.tsx','utf8');
assert(group.includes('advanceVocalEvidenceV445'));assert(group.includes('vocalHintPulseV445'));assert(group.includes('duoVocalEvidenceV445'));assert(group.includes('duoResponseV445')); 
assert(group.includes('!selectedSingerV444'));assert(stage.includes('vocalChangeEnabledV445={preferences.rapVocalChangeEnabledV445??true}'));
assert(ui.includes('V445 · Possible Vocal / Mix Changes'));
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=445);
console.log('PASS V445: anonymous mix-change hints, timing, mic gating, manual priority, silence, stability, track reset, UI/renderer wiring');
