'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const file='lib/goveeBeatPredictionV918.ts';const mod={exports:{}};
const output=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
assert.equal(output.diagnostics?.length||0,0);
const events=[],storage=new Map();
vm.runInNewContext(output.outputText,{module:mod,exports:mod.exports,
 Event:class {constructor(type){this.type=type;}},
 window:{dispatchEvent:e=>events.push(e.type)},
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
 require(){throw Error('No runtime dependencies allowed');}});
const beat=mod.exports;const json=x=>JSON.parse(JSON.stringify(x));
const options={...json(beat.DEFAULT_GOVEE_BEAT_V918),enabled:true};
const metrics={bpm:150,bpmConfidence:.92,phaseConfidence:.9,phaseLocked:true,beatPhase:.7,timeToNextKickMs:120};
const noBeat={bpm:null,bpmConfidence:0,phaseConfidence:0,phaseLocked:false,beatPhase:null,timeToNextKickMs:null};
const base={color:{r:44,g:74,b:110},brightness:53};
let tests=0;function test(label,fn){fn();tests++;console.log('PASS V918 '+label);}
function predicted(m=metrics,now=11000,observed=11000,opts=options,active=true){return beat.predictGoveeBeatV918(m,now,observed,opts,active);}
const next=(prev=beat.resetGoveeBeatDispatchV918(),m=metrics,now=11000,observed=now,opts=options,active=true,interval=1700)=>
 beat.planGoveeBeatDispatchV918(prev,m,now,observed,opts,active,interval);
test('opt-in defaults fail closed',()=>{
 assert.equal(beat.DEFAULT_GOVEE_BEAT_V918.enabled,false);
 assert.equal(beat.loadGoveeBeatV918().enabled,false);
 assert.equal(predicted(metrics,11000,11000,{...options,enabled:false}).ready,false);
});
test('malformed inputs never enable prediction',()=>{
 for(const x of [null,{},[],false,'true',{enabled:'true'}])assert.equal(beat.normalizeGoveeBeatV918(x).enabled,false);
});
test('settings sanitize and clamp finite values',()=>{
 assert.deepEqual(json(beat.normalizeGoveeBeatV918({enabled:true,leadMs:999,minConfidence:-20,intensity:Infinity})),
  {enabled:true,leadMs:350,minConfidence:60,intensity:45});
});
test('storage roundtrip and same-tab notifications',()=>{
 beat.saveGoveeBeatV918({...options,leadMs:230});
 assert.equal(beat.loadGoveeBeatV918().leadMs,230);
 assert.ok(events.includes(beat.GOVEE_BEAT_EVENT_V918));
 assert.equal(Object.keys(JSON.parse(storage.get(beat.GOVEE_BEAT_KEY_V918))).length,4);
});
test('malformed storage falls back to safe disabled',()=>{
 storage.set(beat.GOVEE_BEAT_KEY_V918,'{');
 assert.equal(beat.loadGoveeBeatV918().enabled,false);
});
test('predictor gates on microphone state',()=>assert.equal(predicted(metrics,11000,11000,options,false).ready,false));
test('predictor refuses missing BPM',()=>assert.equal(predicted(noBeat).ready,false));
test('predictor refuses unconfident BPM',()=>assert.equal(predicted({...metrics,bpmConfidence:.2}).ready,false));
test('predictor refuses unconfident phase',()=>assert.equal(predicted({...metrics,phaseConfidence:.3}).ready,false));
test('predictor refuses unlocked phase',()=>assert.equal(predicted({...metrics,phaseLocked:false}).ready,false));
test('predictor refuses missing phase',()=>assert.equal(predicted({...metrics,beatPhase:null}).ready,false));
test('predictor refuses invalid BPM and phase',()=>{
 for(const bpm of [-1,0,30,260,NaN,Infinity])assert.equal(predicted({...metrics,bpm}).ready,false);
 for(const phase of [-.1,1,Infinity,NaN])assert.equal(predicted({...metrics,beatPhase:phase}).ready,false);
});
test('predictor rejects stale metrics and reversed time',()=>{
 for(const age of [751,1000,5000])assert.equal(predicted(metrics,11000,11000-age).ready,false);
 assert.equal(predicted(metrics,11000,11500).ready,false);
});
test('calculate next beat and early dispatch using latency estimate',()=>{
 const p=predicted();assert.equal(p.ready,true);assert.equal(p.bpm,150);
 assert.equal(p.remainingMs,120);assert.equal(p.beatAtMs,11120);
 assert.equal(p.sendAtMs,10940);
});
test('subtract measured elapsed time from next beat',()=>{
 const p=predicted(metrics,11060,11000);assert.equal(p.remainingMs,60);
 assert.equal(p.beatAtMs,11120);
});
test('advance fresh phase by exactly one period, not indefinitely',()=>{
 const p=predicted(metrics,11300,11000);assert.equal(p.ready,true);
 assert.equal(p.beatAtMs,11520);
});
test('invalid predicted kick time falls back to verified phase',()=>{
 const p=predicted({...metrics,timeToNextKickMs:NaN});assert.equal(p.ready,true);
 assert.ok(Math.abs(p.remainingMs-120)<.001);
});
test('predictive kick produces one paced LAN batch',()=>{
 const d=next();assert.equal(d.send,true);assert.equal(d.accent,true);
 assert.equal(d.dispatch.lastAccentAt,11120);
});
test('same beat cannot trigger again across repeat frames',()=>{
 const first=next();
 const repeat=next(first.dispatch,{...metrics,timeToNextKickMs:75,beatPhase:.8},11040,11040);
 assert.equal(repeat.send,false);
 const after=next(first.dispatch,{...metrics,timeToNextKickMs:80,beatPhase:.8},12120,12120);
 assert.equal(after.send,true);
});
test('hardware command spacing is at least 900ms even with fast tempo',()=>{
 const first=next();const second=next(first.dispatch,metrics,first.dispatch.lastSentAt+850,first.dispatch.lastSentAt+850);
 assert.equal(second.send,false);
});
test('normal lighting cadence survives unconfident or inactive prediction',()=>{
 const prev={lastSentAt:10000,lastAccentAt:0};
 assert.equal(next(prev,noBeat,10800,10800).send,false);
 const due=next(prev,noBeat,11700,11700);
 assert.equal(due.send,true);assert.equal(due.accent,false);
 assert.equal(next(prev,metrics,11700,11700,options,false).accent,false);
});
test('V917 cadence is retained when requested',()=>{
 const prev={lastSentAt:10000,lastAccentAt:0};
 assert.equal(next(prev,noBeat,10900,10900,options,true,900).send,true);
});
test('invalid wall-clock values never create LAN commands',()=>{
 for(const now of [NaN,-1,Infinity])assert.equal(next(undefined,metrics,now,now).send,false);
});
test('disabled, silent and zero-strength predicted modulation never changes look',()=>{
 const disabled={...options,enabled:false};
 assert.deepEqual(json(beat.applyGoveePredictedLookV918(base,'rhythm',disabled,true,80)),base);
 assert.deepEqual(json(beat.applyGoveePredictedLookV918(base,'rhythm',options,false,80)),base);
 assert.deepEqual(json(beat.applyGoveePredictedLookV918(base,'rhythm',{...options,intensity:0},true,80)),base);
});
test('role weighting is safe and color unchanged',()=>{
 const levels=['wall','rhythm','neon','ambient'].map(r=>beat.applyGoveePredictedLookV918(base,r,options,true,80).brightness);
 assert.equal(levels[1],Math.max(...levels));assert.ok(levels[3]<levels[1]);
 assert.deepEqual(json(beat.applyGoveePredictedLookV918(base,'rhythm',options,true,80).color),base.color);
});
test('cannot exceed master brightness cap',()=>{
 const look=beat.applyGoveePredictedLookV918({...base,brightness:90},'rhythm',{...options,intensity:100},true,30);
 assert.equal(look.brightness,42);
});
test('preview is offline pure calculation',()=>{
 const a=beat.previewGoveeBeatV918(options,80);
 assert.equal(a.length,4);assert.ok(a.every(x=>x.look.brightness>=x.base));
 assert.ok(a.every(x=>Number.isFinite(x.look.brightness)));
});
test('4000 deterministic tempo, confidence and dispatch scenarios',()=>{
 let previous=beat.resetGoveeBeatDispatchV918();let sent=0;
 for(let i=0;i<4000;i++){
  const now=10000+i*120;
  const bpm=70+i%161;
  const period=60000/bpm;
  const rem=period-(now%period);
  const phase=1-rem/period;
  const sample={bpm,bpmConfidence:i%13===0?.3:.92,phaseConfidence:i%17===0?.4:.92,
   phaseLocked:i%19!==0,beatPhase:phase,timeToNextKickMs:rem};
  const observedAt=now-(i%11===0?900:0);
  const a=next(previous,sample,now,observedAt);
  const b=next(previous,sample,now,observedAt);
  assert.deepEqual(json(a),json(b));
  if(a.send){sent++;assert.ok(now-previous.lastSentAt>=900);}
  const look=beat.applyGoveePredictedLookV918(base,['wall','rhythm','neon','ambient'][i%4],options,a.accent,72);
  assert.ok(look.brightness>=20&&look.brightness<=84);
  previous=a.dispatch;
 }
 assert.ok(sent>30);assert.ok(sent<700);
 console.log('V918 verified 4000 deterministic prediction and LAN scheduling scenarios; batches='+sent);
});
test('live sync wiring connects gated scheduler and existing V917/V915 layers',()=>{
 const sync=read('components/GoveeMusicSyncV909.tsx');const panel=read('components/GoveeLanPanelV909.tsx');
 assert.match(sync,/planGoveeBeatDispatchV918\(/);
 assert.match(sync,/applyGoveePredictedLookV918\(bassLook/);
 assert.match(sync,/state\.observedAt/);
 assert.match(sync,/decision\.send/);
 assert.match(sync,/decision\.accent/);
 assert.match(sync,/window\.setInterval\(\(\)=>void tick\(\),120\)/);
 assert.match(sync,/applyGoveeGroupBrightnessV915\(base/);
 assert.match(panel,/<GoveeBeatStudioV918 config=\{config\}\/>/);
});
test('user-facing settings do not issue hardware commands',()=>{
 const ui=read('components/GoveeBeatStudioV918.tsx');
 assert.doesNotMatch(ui,/\/command|goveeBridgeRequestV909|fetch\(/);
 assert.match(ui,/Die tatsächliche Leuchten-Latenz ist nicht gemessen/);
});
console.log(`PASS V918 ${tests} test groups`);
