const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');const vm=require('node:vm');
const source=fs.readFileSync('components/visualizer/lodPlaybackContinuity.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const m={exports:{}};vm.runInNewContext(js,{module:m,exports:m.exports,Map,Number});const {safeClipTime,saveLodPlayback,takeLodPlayback}=m.exports;
assert.equal(safeClipTime(13,5),3);assert.equal(safeClipTime(-1,5),4);assert.equal(safeClipTime(NaN,5),0);assert.equal(safeClipTime(1,0),0);
const snap={savedAt:12,timelineElapsed:7.5,clips:{dance:{time:2,weight:0.5,running:true,paused:false,timeScale:1.2}}};
saveLodPlayback('/avatar.glb',snap);assert.equal(takeLodPlayback('/avatar.glb',13).timelineElapsed,7.5);assert.equal(takeLodPlayback('/avatar.glb',13),null);
saveLodPlayback('/avatar.glb',snap);assert.equal(takeLodPlayback('/avatar.glb',50),null);
console.log('LOD continuity regression: 7 assertions passed');
