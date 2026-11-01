'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
function load(rel){const filename=path.join(root,rel);
 const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(path.dirname(filename));
 m._compile(output,filename);return m.exports;
}
const {sampleEpicPeakMomentsV794:sample}=load('components/visualizer/epicPeakMomentsV794.ts');
const scenes=[
 {index:0,actIndex:0,startMs:0,endMs:20000,section:'verse',intent:'portrait',moment:'focus',role:'foundation',variation:1},
 {index:1,actIndex:1,startMs:20000,endMs:40000,section:'hook',intent:'wide',moment:'payoff',role:'support-peak',variation:.82},
 {index:2,actIndex:2,startMs:40000,endMs:54000,section:'verse',intent:'portrait',moment:'focus',role:'foundation',variation:1},
 {index:3,actIndex:3,startMs:54000,endMs:66000,section:'build',intent:'rise',moment:'anticipate',role:'build',variation:1},
 {index:4,actIndex:4,startMs:66000,endMs:86000,section:'drop',intent:'pulse',moment:'payoff',role:'main-peak',variation:1},
 {index:5,actIndex:5,startMs:86000,endMs:104000,section:'break',intent:'breath',moment:'breath',role:'rest',variation:1},
];
const plan={source:'verified-storyboard',trackId:'track-v794',durationMs:104000,scenes,peakAct:4};
const base={active:true,genre:'hardtekk',section:'drop',source:'imported',evidence:'labeled',
 dance:1,camera:1,lighting:1,lyrics:.4};
function fixture(ms,more={}){
 const scene=scenes.find(s=>s.startMs<=ms&&ms<s.endMs);
 const show={active:true,reason:'verified-show',sceneIndex:scene?.index??-1,actIndex:scene?.actIndex??-1,
  moment:scene?.moment??null,intent:scene?.intent??null,blend:1,emphasis:.5,dynamics:base};
 return {trackId:plan.trackId,durationMs:plan.durationMs,positionMs:ms,playing:true,
  enabled:true,reducedMotion:false,tier:'high',strength:100,lyricsProtected:false,
  manualDance:false,manualCamera:false,manualLighting:false,show,
  base:{...base,section:scene?.section??'drop'},...more};
}
const peek=(ms,more={})=>sample(plan,fixture(ms,more));
assert.equal(peek(10000).active,false,'no artificial verse impact');
assert.equal(peek(51000).active,false,'no unmarked song event');
assert.equal(peek(60500).phase,'build');
assert(peek(62500).architectureGain>1,'continuous lift before verified climax');
assert.equal(peek(65640).phase,'suspend');
assert(peek(65640).architectureGain<1&&peek(65640).lightingGain<1,'pre-reveal dim');
assert.equal(peek(66000).active,false,'boundary exactly neutral (no flash)');
const impact=peek(67300),support=peek(21300);
assert.equal(impact.phase,'release');
assert(impact.active&&impact.architectureGain>support.architectureGain,'one main peak dominates support');
assert(impact.dynamics.dance>1&&impact.dynamics.camera>1&&impact.dynamics.lighting>1);
assert.equal(impact.dynamics.lyrics,.4,'never alter lyric gain');
assert.equal(peek(71000).active,false,'no repeated fake drops throughout the act');
assert.equal(peek(88000).active,false,'breath is never enhanced');
for(const ms of [0,20000,40000,54000,60000,65280,65640,65999,66000,66001,66300,67000,68000,70000,85500,104000]){
 const a=peek(ms),b=peek(ms);
 assert.deepEqual(a,b,'seek/replay deterministic');
 for(const key of ['intensity','architectureGain','lightingGain'])assert(Number.isFinite(a[key]));
 assert(a.architectureGain>=.72&&a.architectureGain<=1.16);
 assert(a.lightingGain>=.89&&a.lightingGain<=1.09);
 for(const k of ['dance','camera','lighting'])assert(a.dynamics[k]>=.88&&a.dynamics[k]<=1.12);
}
for(const change of [
 {playing:false},{enabled:false},{reducedMotion:true},{tier:'low'},
 {strength:0},{durationMs:100000},{trackId:'other'},
 {positionMs:NaN},{positionMs:-1},{positionMs:Infinity},{positionMs:104000},
 {show:{...fixture(67300).show,reason:'guessed'}},
 {show:{...fixture(67300).show,sceneIndex:3}},
 {show:{...fixture(67300).show,actIndex:3}},
 {show:{...fixture(67300).show,blend:0}},
 {base:{...base,section:'verse'}}
]){
 const i=fixture(67300,change),cue=sample(plan,i);
 assert.equal(cue.active,false,`fail closed ${Object.keys(change)[0]}`);
 assert.deepEqual(cue.dynamics,i.base);
}
assert.equal(sample({...plan,source:'unavailable'},fixture(67300)).active,false);
const gap={...plan,scenes:scenes.map((s,i)=>i===4?{...s,startMs:66001}:s)};
assert.equal(sample(gap,fixture(65640)).active,false,'no synthetic build across gaps');
const repeat={...plan,scenes:scenes.map((s,i)=>i===4?{...s,role:'support-peak'}:s)};
assert(peek(67300).architectureGain>sample(repeat,fixture(67300)).architectureGain);
const balanced=peek(67300,{tier:'balanced'});
assert(balanced.intensity<impact.intensity);
const lyrics=peek(67300,{lyricsProtected:true});
assert(lyrics.intensity<impact.intensity);
assert.deepEqual(peek(67300,{manualLighting:true}).dynamics.lighting,fixture(67300).base.lighting);
assert.equal(peek(67300,{manualLighting:true}).architectureGain,1);
assert.equal(peek(67300,{manualCamera:true}).dynamics.camera,1);
assert.equal(peek(67300,{manualDance:true}).dynamics.dance,1);
assert.equal(peek(67300,{manualDance:true,manualCamera:true,manualLighting:true}).active,false);
// Contract/wiring tests: no extra R3F passes or uncapped authoring bypass.
for(const [file,phrases] of [
 ['components/visualizer/VisualizerStage.tsx',['sampleEpicPeakMomentsV794','base:cinematicShowV790.dynamics','base:directedDynamicsV790','epicPeakV794={epicPeakV794}','data-v794-phase']],
 ['components/visualizer/ThreeAvatar.tsx',['epicPeakV794={props.epicPeakV794}']],
 ['components/visualizer/registry.tsx',['epicPeakV794?:']],
 ['components/visualizer/DynamicStage.tsx',['peakCueRefV794.current=peakLightingAllowedV794?epicPeakV794:null','peakBeamGainV794','peakRefV794={peakCueRefV794}']],
 ['components/visualizer/ConcertArchitectureV789.tsx',['peakRefV794','multiplyScalar(Math.min(1.16,mixed*peakGain))']],
 ]){
 const body=fs.readFileSync(path.join(root,file),'utf8');
 for(const phrase of phrases)assert(body.includes(phrase),`${file} lacks ${phrase}`);
}
const pkg=require('../package.json');assert(['0.1.0-v794','0.1.0-v795','0.1.0-v796','0.1.0-v797','0.1.0-v798','0.1.0-v799','0.1.0-v800','0.1.0-v801','0.1.0-v802','0.1.0-v803','0.1.0-v804','0.1.0-v805','0.1.0-v806','0.1.0-v808','0.1.0-v809','0.1.0-v807'].includes(pkg.version));
for(const k of ['build:preflight','check:fast','check:release'])
 assert(pkg.scripts[k].includes('npm run test:v794 && npm run test:v794:types && npm run test:v793'),k);
console.log('PASS V794: verified builds/hooks/drops, safety envelopes, scene/seek checks, manual/lyrics/quality limits, stage wiring');
