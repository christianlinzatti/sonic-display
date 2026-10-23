const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const text = fs.readFileSync(path.join(root,'components/visualizer/beatFlowDetector.ts'),'utf8');
const avatar = fs.readFileSync(path.join(root,'components/visualizer/ThreeAvatar.tsx'),'utf8');
assert.match(text,/createBeatFlowState/);
assert.match(text,/advanceBeatFlow/);
assert.match(avatar,/advanceBeatFlow\(beatFlow.current/);
let ts; try {ts = require('typescript')} catch (_) {try {ts = require('/usr/local/lib/node_modules/typescript')} catch (_) {}}
if (ts) {
 const js = ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}}; new Function('module','exports','require',js)(mod,mod.exports,require);
 const {createBeatFlowState,advanceBeatFlow,classifyFlow}=mod.exports;
 const audio={bass:0,mids:0,highs:0,volume:0,beat:false,beatStrength:0,bpm:90,kick:0,snare:0,hiHat:0,energyEnvelope:0,attack:0,decay:0};
 assert.equal(classifyFlow('Deutschrap'),'rap-halftime');
 assert.equal(classifyFlow('Hardtekk'),'hard-kick');
 let state=createBeatFlowState();
 advanceBeatFlow(state,audio,.02,'Deutschrap');
 const onset=advanceBeatFlow(state,{...audio,kick:1},.1,'Deutschrap');
 assert(onset.kickOnset>0); assert(Number.isFinite(onset.groove));
 for(let i=0;i<70;i++)advanceBeatFlow(state,audio,.016,'Deutschrap');
 assert(advanceBeatFlow(state,audio,.016,'Deutschrap').accent<onset.accent);
 const cleared=advanceBeatFlow(state,{...audio,kick:1},.016,'Deutschrap',false);
 assert.equal(cleared.accent,0);assert.equal(state.kickEnvelope,0);
 const invalid=advanceBeatFlow(state,{...audio,kick:NaN,snare:Infinity},NaN,'Hardstyle');
 assert(Number.isFinite(invalid.transitionBoost));
 console.log('Beat flow behavior: 6 assertions passed');
} else console.log('Beat flow integration checked; install TypeScript for behavior tests');
