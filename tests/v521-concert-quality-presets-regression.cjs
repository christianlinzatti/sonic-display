'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {CONCERT_PRESETS_V521:presets,getConcertPresetV521:get,matchingPresetCaptureV521:matching,
 previewConcertPresetV521:preview,compareConcertPresetEvidenceV521:compare}=load('services/monitoring/concertQualityPresetsV521');
const {capturePiStudioV518:capture}=load('services/monitoring/piConcertPerformanceStudioV518');
const {proposeConcertTuneV520:propose}=load('services/monitoring/concertAutoTuningV520');
const at=1720000000000;
function make(offset,tier,avatarCount,reactiveLighting=true,overrides={}){
 const arr=Array.from({length:7},(_,i)=>({at:at+offset+i*1000,avatarCount,tier,
  dpr:tier==='high'?1.5:tier==='balanced'?1.15:.8,fps:24+(i%3),p95FrameMs:50,slowPercent:22,
  drawCalls:620,triangles:475000,piProfile:'off',piLevel:'disabled',
  features:{lyrics:true,lipSync:true,reactiveLighting},heapMb:null,...overrides}));
 const result=capture(arr,arr.at(-1).at+100);assert.equal(result.status,'ready');return result.capture;
}
assert.deepEqual(presets.map(p=>p.id),['cinematic','ensemble','reserve']);
assert.deepEqual(presets.map(p=>p.quality),['high','balanced','low']);
assert.equal(get('bogus').id,'ensemble');
assert(presets.every(p=>p.protects.includes('Lip-Sync')));
const base=make(0,'high',2),ensemble=make(15000,'balanced',4),reserve=make(28000,'low',4,false);
const captures=[base,ensemble,reserve];
assert.equal(matching(get('cinematic'),captures),base);
assert.equal(matching(get('ensemble'),captures),ensemble);
assert.equal(matching(get('reserve'),captures),reserve);
assert.equal(matching(get('ensemble'),[base]),null);
assert.equal(matching(get('reserve'),[make(31000,'low',4,true,{features:{lyrics:true,lipSync:false,reactiveLighting:true}})]),null);
assert.equal(matching(get('ensemble'),[make(42000,'balanced',4,false)]),null);
assert.equal(matching(get('cinematic'),[make(51000,'high',4,true)]),null);
assert.equal(matching(get('ensemble'),[{...ensemble,avgFps:NaN}]),null);
const ok={allowed:true,targetMode:'balanced',changedControl:'Renderqualitaet',reason:'safe'};
const high={mode:'high',tier:'high'};
assert.equal(preview('ensemble',high,ok,captures).canStartV520,true);
assert.equal(preview('cinematic',high,ok,captures).canStartV520,false);
assert.equal(preview('reserve',high,ok,captures).canStartV520,false);
assert.equal(preview('ensemble',high,{...ok,allowed:false},captures).canStartV520,false);
assert.equal(preview('reserve',{mode:'balanced',tier:'balanced'},{...ok,targetMode:'low'},captures).canStartV520,true);
assert.equal(preview('cinematic',{mode:'low',tier:'low'},ok,captures).canStartV520,false);
assert.equal(preview('ensemble',high,ok,[]).measured,false);
assert.equal(compare(get('cinematic'),get('ensemble'),captures).status,'observed');
assert(compare(get('cinematic'),get('ensemble'),captures).changes.includes('Avataranzahl'));
assert.equal(compare(get('cinematic'),get('reserve'),[base]).status,'unavailable');
assert.equal(compare(get('cinematic'),get('cinematic'),captures).status,'unavailable');
const trueProposal=propose(make(90000,'high',4),high,'off',at+96150,30,make(90000,'high',4).configuration);
assert(trueProposal.allowed&&trueProposal.targetMode==='balanced');
let n=0;
for(let i=0;i<40000;i++){
 const id=presets[i%3].id;
 const q=([{mode:'high',tier:'high'},{mode:'balanced',tier:'balanced'},{mode:'low',tier:'low'}])[i%3];
 const proposal=i%11===0?{...ok,allowed:false}:(i%7===0?{...ok,targetMode:'low'}:ok);
 const p=preview(id,q,proposal,i%5===0?[]:captures);
 assert.equal(p.canStartV520,proposal.allowed&&proposal.targetMode===p.preset.quality);
 assert(typeof p.reason==='string'&&p.reason.length>0);
 assert(!p.measured||p.captured&&p.captured.tier===p.preset.quality);
 const c=compare(get('cinematic'),p.preset,i%5===0?[]:captures);
 assert(['observed','unavailable'].includes(c.status));n++;
}
const ui=fs.readFileSync('components/visualizer/PiConcertQualityPresetsV521.tsx','utf8');
const parent=fs.readFileSync('components/visualizer/PiConcertAutoTuningStudioV520.tsx','utf8');
assert(parent.includes('<PiConcertQualityPresetsV521 selected={presetId}'));
assert(parent.includes('!previewConcertPresetV521(presetId,quality,safe,captures).canStartV520'));
assert(parent.includes('setPerformanceMode(pending.targetMode)')&&parent.includes('setPerformanceMode(trial.previousMode)'));
assert(parent.indexOf('sessionStorage.setItem(STORAGE,JSON.stringify(pending))')<parent.indexOf('setPerformanceMode(pending.targetMode)'));
assert(ui.includes('Keine passende echte Messung')&&ui.includes('compareConcertPresetEvidenceV521'));
assert(!ui.includes('setPerformanceMode(')&&!ui.includes('setPiStudioFeaturesV518('));
for(const source of [ui,parent])assert(!source.includes('requestAnimationFrame')&&!source.includes('setInterval('));
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=521);
assert(pkg.scripts['build:preflight'].includes('npm run test:v521 && npm run test:v521:types && npm run test:v520'));
console.log('PASS V521: '+n+' preset previews, real-capture matching, single-change V520 opt-in/rollback, no fake FPS or config writes');
