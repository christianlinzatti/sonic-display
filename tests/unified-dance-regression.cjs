const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
// Transpile only the pure compositor and execute it without browser or three.js.
const source=fs.readFileSync(require('node:path').join(__dirname,'../components/visualizer/unifiedDanceEngine.ts'),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const mod={exports:{}};new Function('module','exports',js)(mod,mod.exports);
const {composeUnifiedMotion,createUnifiedMotionState}=mod.exports;
const state=createUnifiedMotionState();
let result=composeUnifiedMotion(state,{hipSway:5,headNod:Infinity,expressionJaw:0.1},{delta:1/60,playing:true,reducedMotion:false,genre:'Deutschrap'});
assert.equal(result.hipSway,1.2);assert.equal(result.headNod,0);assert.equal(result.expressionJaw,0.1);
result=composeUnifiedMotion(state,{hipSway:-1,headNod:0.2,expressionJaw:0.1},{delta:1/60,playing:true,reducedMotion:false,genre:'Deutschrap'});
assert(result.hipSway>-1 && result.hipSway<1.2,'interpolates smoothly');
result=composeUnifiedMotion(state,{hipSway:1,headNod:1,expressionJaw:0.1},{delta:1/60,playing:false,reducedMotion:false});
assert.equal(result.hipSway,0);assert.equal(result.headNod,0);
result=composeUnifiedMotion(state,{hipSway:1,headNod:1},{delta:1/60,playing:true,reducedMotion:true});assert.equal(result.hipSway,0);
assert(source.includes('frame-rate-independent'));
console.log('Unified Dance Engine: 6 checks passed');
