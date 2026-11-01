'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(796);
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
function load(filename){
 const file=path.join(root,filename);
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{
   fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},
 }).outputText;
 const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));
 m._compile(js,file);return m.exports;
}
const {sampleDeutschrapPerformanceV796:sample,applyDeutschrapPerformanceV796:apply,
 RAP_PERFORMANCE_OFF_V796:OFF}=load('components/visualizer/deutschrapPerformanceDirectorV796.ts');
const lines=[
 {lineIndex:0,startMs:1000,endMs:4000,scene:'verse'},
 {lineIndex:1,startMs:4000,endMs:8000,scene:'hook'},
 {lineIndex:2,startMs:8000,endMs:12000,scene:'reply'},
 {lineIndex:3,startMs:12000,endMs:16000,scene:'duet'},
 {lineIndex:4,startMs:17000,endMs:21000,scene:'verse'},
];
const plan={trackId:'rap-song',available:true,authored:true,lines,hookLines:1};
const base={trackId:'rap-song',positionMs:5000,genre:'Deutschrap',playing:true,enabled:true,
 reducedMotion:false,tier:'high',lyricsProtected:false,manualDance:false,manualVocal:false,
 linePlan:plan,lineCue:{active:true,scene:'hook',lineIndex:1,energy:.75,gesturePulse:.2},
 show:{active:true,reason:'verified-show',moment:'payoff',emphasis:.8,blend:1}};
const cue=(patch={})=>sample({...base,...patch});
const hook=cue();
assert.equal(hook.phrase,'hook-lift');assert.equal(hook.source,'timed-lyrics');
assert(hook.active&&hook.danceGain>1&&hook.aggressionDelta>0&&hook.faceDelta>0);
assert.deepEqual(cue(),hook,'playback deterministic');
assert.equal(cue({lineCue:{...base.lineCue,scene:'verse',lineIndex:0},positionMs:2000}).phrase,'verse-flow');
const reply=cue({lineCue:{...base.lineCue,scene:'reply',lineIndex:2},positionMs:9000});
const duet=cue({lineCue:{...base.lineCue,scene:'duet',lineIndex:3},positionMs:13000});
assert.equal(reply.phrase,'response');assert.equal(duet.phrase,'duet');
assert.equal(reply.source,'authored-assignment');assert.equal(duet.source,'authored-assignment');
assert.equal(cue({linePlan:{...plan,authored:false},lineCue:{...base.lineCue,scene:'reply',lineIndex:2},positionMs:9000}).phrase,
 'verse-flow','no guessed singer/response without authored roles');
assert(cue({show:{...base.show,reason:'off'}}).danceGain<hook.danceGain,
 'verified climax earns the additional emphasis');
assert(cue({lyricsProtected:true}).danceGain<hook.danceGain,'lyrics reduce automatic movement');
assert(cue({tier:'balanced'}).aggressionDelta<hook.aggressionDelta,'balanced tier attenuates movement');
assert.equal(cue({manualDance:true}).danceGain,1,'manual dance stays at exact identity');
assert.equal(cue({manualDance:true}).aggressionDelta,0);
assert.equal(cue({manualDance:true}).variationDelta,0);
assert.equal(cue({manualVocal:true}).gestureDelta,0,'manual vocal/body remains untouched');
assert.equal(cue({manualVocal:true}).faceDelta,0);
assert.equal(cue({manualVocal:true,manualDance:true}).active,false);
for(const patch of [
 {trackId:'wrong'},{positionMs:0},{positionMs:16000},{positionMs:16500},
 {positionMs:NaN},{positionMs:Infinity},{positionMs:-1},{playing:false},
 {enabled:false},{reducedMotion:true},{genre:'rock'},{tier:'low'},
 {linePlan:{...plan,trackId:'stale'}},{linePlan:{...plan,available:false}},
 {linePlan:{...plan,lines:[]}},{lineCue:{...base.lineCue,active:false}},
 {lineCue:{...base.lineCue,lineIndex:3}},
 {lineCue:{...base.lineCue,energy:NaN}},
 {lineCue:{...base.lineCue,energy:1.5}},
 {lineCue:{...base.lineCue,gesturePulse:-1}},
 ])assert.deepEqual(cue(patch),OFF,`fail closed: ${Object.keys(patch)[0]}`);
const values={intensity:1,aggression:.4,variation:.3,face:55,gesture:60,
 style:'balanced',rapLip:true};
const result=apply(values,hook);
assert(result.intensity>values.intensity&&result.gesture>values.gesture);
assert.equal(result.rapLip,values.rapLip,'lip-sync remains unchanged');
assert.equal(result.style,values.style,'no motion style override');
assert.deepEqual(apply(values,OFF),values,'off leaves original object untouched');
const high=apply({...values,intensity:2,aggression:1,variation:1,face:100,gesture:100},hook);
assert(high.intensity<=2&&high.aggression<=1&&high.variation<=1&&high.face<=100&&high.gesture<=100);
assert.deepEqual(apply({...values,gesture:NaN},hook),{...values,gesture:NaN},'invalid base is not modified');
for(let lineIndex=0;lineIndex<5;lineIndex++){
 const current=lines[lineIndex];
 const output=cue({positionMs:current.startMs+800,lineCue:{...base.lineCue,
  lineIndex,scene:current.scene}});
 assert(output.active&&output.lineIndex===lineIndex);
 for(const k of ['danceGain','aggressionDelta','variationDelta','gestureDelta','faceDelta'])assert(Number.isFinite(output[k]),k);
}
// Production integration: do not add render loops, independent camera or lip-sync controls.
const stage=fs.readFileSync(path.join(root,'components/visualizer/VisualizerStage.tsx'),'utf8');
for(const text of ['sampleDeutschrapPerformanceV796','applyDeutschrapPerformanceV796',
 'linePlan:rapPerformancePlanV437','lineCue:rapPerformanceCueV437',
 'show:cinematicShowV790','data-v796-phrase','rapPerformanceValuesV796.intensity',
 'rapPerformanceValuesV796.aggression','rapPerformanceValuesV796.face',
 'rapPerformanceValuesV796.gesture','rapPerformanceValuesV437.rapLip'])
 assert(stage.includes(text),`missing stage integration: ${text}`);
const pkg=require('../package.json');
assert(/^0\.1\.0-v\d+$/.test(pkg.version));
assert(pkg.scripts['test:v796']?.includes('v796-deutschrap-performance-regression.cjs'));
for(const name of ['build:preflight','check:fast','check:release'])
 assert(pkg.scripts[name].includes('npm run test:v796 && npm run test:v796:types && npm run test:v795'),name);
console.log('PASS V796: deterministic lyric phrasing, authored replies/duets, protected camera/voice/motion, tier/lyrics guards, stale seeks, bounded gains, real stage integration');
