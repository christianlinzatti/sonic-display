'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(790);
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
function load(rel){const filename=path.join(root,rel);
 const out=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(path.dirname(filename));m._compile(out.outputText,filename);return m.exports;
}
const {planCinematicShowV790,sampleCinematicShowV790}=load('components/visualizer/cinematicShowDirectorV790.ts');
const sections=['verse','hook','verse','break','build','drop','hook','break'];
const bounds=[0,18000,38000,56000,66000,77000,96000,118000,131000];
const chapters=['setup','payoff','develop','respite','rise','payoff','payoff','respite'];
const roles=['foundation','support-peak','foundation','rest','build','main-peak','release','rest'];
const intents=['portrait','wide','dialogue','breath','rise','pulse','ensemble','breath'];
const trackId='verified-track';
const acts=sections.map((section,i)=>({index:i,section,startMs:bounds[i],endMs:bounds[i+1],
 chapter:chapters[i],motif:intents[i]==='breath'?'breath':'wide',repetition:i===6?1:0,danceGain:0,cameraGain:0,lightGain:0}));
const n={source:'verified-v600',trackId,durationMs:bounds.at(-1),acts,genre:'deutschrap',endingSupported:true};
const c={source:'verified-v604',trackId,durationMs:n.durationMs,actCount:acts.length,
 scenes:acts.map((a,i)=>({index:i,actIndex:i,section:a.section,startMs:a.startMs,endMs:a.endMs,
 intent:intents[i],repetition:a.repetition}))};
const a={source:'verified-timeline',trackId,durationMs:n.durationMs,peakIndex:5,supportIndices:[1],
 moments:acts.map((act,i)=>({index:i,section:act.section,startMs:act.startMs,endMs:act.endMs,
 chapter:act.chapter,motif:act.motif,role:roles[i],intensity:0}))};
const plan=planCinematicShowV790(n,c,a);
assert.equal(plan.source,'verified-storyboard');assert.equal(plan.peakAct,5);
assert.equal(plan.scenes.length,8);
assert.equal(plan.scenes[0].moment,'establish');
assert.equal(plan.scenes[1].moment,'payoff');
assert.equal(plan.scenes[3].moment,'breath');
assert.equal(plan.scenes[4].moment,'anticipate');
assert.equal(plan.scenes[5].moment,'payoff');
assert(plan.scenes[5].emphasis>plan.scenes[1].emphasis,'one main highlight, supporting hooks quieter');
assert.deepEqual(plan,planCinematicShowV790(n,c,a),'seek/reload deterministic');
for(const modified of [
 [n,{...c,trackId:'other'},a],
 [n,c,{...a,peakIndex:-1}],
 [{...n,source:'unavailable'},c,a],
 [n,{...c,source:'unavailable'},a],
 [n,c,{...a,moments:a.moments.map((m,i)=>i===2?{...m,endMs:m.endMs+1}:m)}],
 [n,{...c,scenes:c.scenes.map((s,i)=>i===3?{...s,startMs:s.startMs-10000}:s)},a],
 [n,{...c,scenes:c.scenes.slice(1)},a],
 ])assert.equal(planCinematicShowV790(...modified).source,'unavailable','fail closed on unverified/missing/mismatched plan');
const base={active:true,genre:'deutschrap',section:'drop',source:'imported',evidence:'labeled',
 dance:1,camera:1,lighting:1,lyrics:.12};
function fixture(ms=84000,overrides={}){
 const i=acts.findIndex(s=>ms>=s.startMs&&ms<s.endMs),act=acts[i],scene=c.scenes[i];
 return {trackId,durationMs:n.durationMs,progressMs:ms,playing:true,enabled:true,
 reducedMotion:false,tier:'high',strength:100,lyricsProtected:false,
 manualDance:false,manualCamera:false,manualLighting:false,
 base:{...base,section:act?.section??'drop'},
 narrative:{active:true,source:'verified-v600',act:i,chapter:act?.chapter,motif:act?.motif,
 repetition:act?.repetition,transition:1,dynamics:base},
 cinematic:{active:true,reason:'verified-act',sceneIndex:i,actIndex:i,
 intent:scene?.intent,blend:1,dynamics:base},
 pacing:{active:true,evidence:'verified-arc',beatIndex:i,strength:1,intent:'climax',
 dance:1,camera:1,lighting:1},
 arc:{active:true,evidence:'verified-arc',index:i,role:roles[i],emphasis:1,dance:1,camera:1,lighting:1},
 ...overrides};
}
const peak=sampleCinematicShowV790(plan,fixture());
assert(peak.active&&peak.reason==='verified-show'&&peak.moment==='payoff');
assert(peak.dynamics.dance>1&&peak.dynamics.camera>1&&peak.dynamics.lighting>1);
assert.equal(peak.dynamics.lyrics,.12,'lyrics and timing never change');
const support=sampleCinematicShowV790(plan,fixture(26000));
assert(support.active&&support.emphasis<peak.emphasis,'main peak has stronger envelope');
const breath=sampleCinematicShowV790(plan,fixture(60000));
assert(breath.active&&breath.emphasis<0&&breath.dynamics.lighting<1,'break is restrained');
const anticipation=sampleCinematicShowV790(plan,fixture(71500));
assert(anticipation.active&&anticipation.moment==='anticipate');
for(const ms of [77000,76999,96000,65999]){
 const s=sampleCinematicShowV790(plan,fixture(ms));
 assert(s.active&&Math.abs(s.emphasis)<.01,`continuous zero at boundary ${ms}`);
}
for(const changes of [
 {playing:false},{enabled:false},{reducedMotion:true},{tier:'low'},
 {strength:0},{trackId:'different'},{durationMs:130000},{progressMs:-1},
 {progressMs:NaN},{progressMs:131000},
 {narrative:{...fixture().narrative,act:4}},
 {cinematic:{...fixture().cinematic,intent:'breath'}},
 {pacing:{...fixture().pacing,beatIndex:4}},
 {arc:{...fixture().arc,index:4}},
 {base:{...base,section:'verse'}},
 ]){
 const actual=sampleCinematicShowV790(plan,fixture(84000,changes));
 assert.equal(actual.active,false,`fail-closed for ${JSON.stringify(changes)}`);
 assert.deepEqual(actual.dynamics,fixture(84000,changes).base,'no changes on invalid evidence');
}
const manual=sampleCinematicShowV790(plan,fixture(84000,{manualDance:true,manualCamera:true,manualLighting:true}));
assert.deepEqual(manual.dynamics,base,'all manual lanes preserved');
const protectedScene=sampleCinematicShowV790(plan,fixture(84000,{lyricsProtected:true}));
assert(protectedScene.active&&protectedScene.dynamics.lighting<=peak.dynamics.lighting);
assert(protectedScene.emphasis<peak.emphasis);
const balanced=sampleCinematicShowV790(plan,fixture(84000,{tier:'balanced'}));
assert(balanced.emphasis<peak.emphasis);
for(const ms of [1000,24000,48000,60000,72000,87000,103000,125000]){
 const cue=sampleCinematicShowV790(plan,fixture(ms));
 assert(cue.active); for(const k of ['dance','camera','lighting'])assert(cue.dynamics[k]>=.88&&cue.dynamics[k]<=1.12);
}
const stage=fs.readFileSync(path.join(root,'components/visualizer/VisualizerStage.tsx'),'utf8');
for(const needle of ['planCinematicShowV790','sampleCinematicShowV790','base:directedDynamicsV790',
 'directedDynamicsV800,showQualityV670','data-v790-moment','data-v790-peak'])assert(stage.includes(needle),needle);
const pkg=require('../package.json');assert(/^0\.1\.0-v\d+$/.test(pkg.version));
for(const k of ['build:preflight','check:fast','check:release'])assert(pkg.scripts[k].includes('npm run test:v790 && npm run test:v790:types && npm run test:v789'),k);
console.log('PASS V790: verified storyboard + single peak, anticipation/breath, manual protection, seek-safe fades, quality gate');
