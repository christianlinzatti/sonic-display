const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('./typescript-loader.cjs');require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,f);
const {nextDanceCombination,emptyDanceSequence,danceSlot,danceSectionAt}=require('../components/visualizer/intelligentDanceCombinationV242.ts');
const m=(id,section='any')=>({id,avatarId:'test',name:id,url:'/motions/'+id+'.glb',genre:'',bpmMin:90,bpmMax:200,section,addedAt:0});const store={automatic:true,version:1,motions:[m('a','verse'),m('b','drop'),m('c','any')]};const params={trackId:'track',avatarId:'test',genre:'Hardtekk',bpm:120,progressMs:0,durationMs:180000,energy:.7,fallback:'/fallback.glb'};
let n=0;function test(name,fn){fn();++n;console.log('PASS',name);}
test('section mapping',()=>{assert.equal(danceSectionAt(20000,180000,1),'drop');assert.equal(danceSectionAt(110000,180000,.4),'hook');});
test('four-bar rhythm',()=>{assert.equal(danceSlot(3900,120),0);assert.equal(danceSlot(8000,120),1);});
test('select compatible motion',()=>{let r=nextDanceCombination(emptyDanceSequence(),store,params);assert.equal(r.url,'/motions/c.glb');});
test('no mid-phrase flicker',()=>{let r=nextDanceCombination(emptyDanceSequence(),store,params);let z=nextDanceCombination(r.state,store,{...params,progressMs:3200});assert.equal(z.url,r.url);});
test('genre and bpm filter',()=>{let r=nextDanceCombination(emptyDanceSequence(),store,{...params,bpm:250});assert.equal(r.url,'/fallback.glb');});
test('manual fallback',()=>{let r=nextDanceCombination(emptyDanceSequence(),{...store,automatic:false},params);assert.equal(r.url,'/fallback.glb');});
test('avoid repeated motion across phrases',()=>{let r=nextDanceCombination(emptyDanceSequence(),store,params);let z=nextDanceCombination(r.state,store,{...params,progressMs:8200});assert.notEqual(z.state.motionId,r.state.motionId);});
test('track reset',()=>{let r=nextDanceCombination(emptyDanceSequence(),store,params);let z=nextDanceCombination(r.state,store,{...params,trackId:'new',progressMs:8200});assert.equal(z.state.recent.length,1);});
test('stable deterministic choice',()=>assert.deepEqual(nextDanceCombination(emptyDanceSequence(),store,params),nextDanceCombination(emptyDanceSequence(),store,params)));
test('live stage connected',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert.ok(s.includes('nextDanceCombination(sequenceRef.current'));assert.ok(s.includes('motionStore.automatic && isPlaying'));});
console.log(n+' V242 checks passed');
