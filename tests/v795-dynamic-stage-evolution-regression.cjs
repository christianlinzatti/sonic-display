'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
function load(rel){const file=path.join(root,rel);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));
 m._compile(out,file);return m.exports;
}
const {sampleDynamicStageEvolutionV795:sample,positionStageEvolutionBarV795:place,
 STAGE_EVOLUTION_OFF_V795:OFF}=load('components/visualizer/dynamicStageEvolutionV795.ts');
const scenes=[
 {index:0,actIndex:0,startMs:0,endMs:18000,section:'verse',moment:'establish',role:'foundation',intent:'portrait'},
 {index:1,actIndex:1,startMs:18000,endMs:36000,section:'hook',moment:'payoff',role:'support-peak',intent:'wide'},
 {index:2,actIndex:2,startMs:36000,endMs:54000,section:'verse',moment:'focus',role:'foundation',intent:'portrait'},
 {index:3,actIndex:3,startMs:54000,endMs:68000,section:'build',moment:'anticipate',role:'build',intent:'rise'},
 {index:4,actIndex:4,startMs:68000,endMs:90000,section:'drop',moment:'payoff',role:'main-peak',intent:'pulse'},
 {index:5,actIndex:5,startMs:90000,endMs:108000,section:'break',moment:'breath',role:'rest',intent:'breath'},
 {index:6,actIndex:6,startMs:108000,endMs:120000,section:'verse',moment:'resolve',role:'foundation',intent:'wide'},
];
const plan={source:'verified-storyboard',trackId:'song-v795',durationMs:120000,scenes,peakAct:4};
const make=(ms,overrides={})=>{const scene=scenes.find(s=>s.startMs<=ms&&ms<s.endMs);
 return {trackId:'song-v795',durationMs:120000,positionMs:ms,playing:true,enabled:true,
  reducedMotion:false,tier:'high',strength:100,lyricsProtected:false,vocalFocus:false,
  groupCount:1,show:{active:true,reason:'verified-show',sceneIndex:scene?.index??-1,
  actIndex:scene?.actIndex??-1,moment:scene?.moment??null,intent:scene?.intent??null,blend:1},
  ...overrides};};
const at=(ms,changes={})=>sample(plan,make(ms,changes));
for(const [ms,mode] of [[9000,'intimate'],[27000,'arena'],[45000,'opening'],
 [61000,'rising'],[79000,'climax'],[99000,'breath'],[114000,'finale']]){
 const cue=at(ms);assert(cue.active,`${mode} should be active`);assert.equal(cue.mode,mode);
 assert.equal(cue.trackId,plan.trackId);assert.equal(cue.durationMs,plan.durationMs);
 assert(cue.spread>=0&&cue.spread<=.23);assert(cue.lift>=0&&cue.lift<=.30);
 assert(cue.depth>=0&&cue.depth<=.16);assert(cue.ledMorph>=0&&cue.ledMorph<=.17);
 assert(cue.ambientMix>=0&&cue.ambientMix<=.024);
 assert(cue.floorMix>=0&&cue.floorMix<=.028);
 assert.deepEqual(cue,at(ms),'seek and replay must be deterministic');
}
assert(at(79000).spread>at(27000).spread,'main drop bigger than supporting hook');
assert(at(27000).spread>at(99000).spread,'break is intentionally intimate');
assert(at(61000).spread>at(45000).spread,'build evolves beyond verse');
assert(at(79000,{tier:'balanced'}).spread<at(79000).spread);
assert(at(79000,{lyricsProtected:true}).spread<at(79000).spread);
assert(at(79000,{vocalFocus:true}).spread<at(79000).spread);
assert(at(79000,{groupCount:4}).spread<at(79000).spread);
for(const ms of [0,18000,36000,54000,68000,90000,108000])assert(!at(ms).active,'no hard scene-boundary jump');
for(const patch of [
 {trackId:'other'},{durationMs:119999},{positionMs:-1},{positionMs:NaN},
 {positionMs:Infinity},{positionMs:120000},{playing:false},{enabled:false},
 {reducedMotion:true},{tier:'low'},{strength:0},{strength:NaN},
 {groupCount:5},{groupCount:0},{groupCount:2.5},
 {show:{...make(79000).show,reason:'guessed'}},
 {show:{...make(79000).show,sceneIndex:3}},
 {show:{...make(79000).show,intent:'wide'}},
 {show:{...make(79000).show,blend:0}},
 {show:{...make(79000).show,blend:NaN}},
 ]) assert.deepEqual(sample(plan,make(79000,patch)),{...OFF},`reject ${Object.keys(patch)[0]}`);
assert.deepEqual(sample({...plan,source:'unavailable'},make(79000)),{...OFF});
assert.deepEqual(sample({...plan,trackId:'other'},make(79000)),{...OFF});
let placed;const target={set(x,y,z){placed={x,y,z};}};
place(target,3.2,2.8,-3.5,.23,.3,.16);
assert(placed.x>3.2&&placed.y>2.8&&placed.z< -3.5,'roof opens behind cast');
place(target,-3.3,-1.4,-3.5,.23,.3,.16);
assert(placed.x< -3.3&&placed.y> -1.5&&placed.z<=-3.5,'left wing moves outward');
place(target,3.2,2.8,-3.5,999,999,999);
assert(placed.x<4&&placed.y<3.2&&placed.z>=-3.66,'geometry never exceeds safe bounds');
place(target,3.2,2.8,-3.5,NaN,Infinity,-Infinity);
assert.deepEqual(placed,{x:3.2,y:2.8,z:-3.5},'invalid input fails to neutral');
// Wiring: existing instanced mesh + LED wall; no added scene, renderer, GL or loops.
for(const [file,phrases] of [
 ['components/visualizer/VisualizerStage.tsx',['sampleDynamicStageEvolutionV795','data-v795-mode','stageEvolutionV795={stageEvolutionV795}']],
 ['components/visualizer/registry.tsx',['stageEvolutionV795?:']],
 ['components/visualizer/ThreeAvatar.tsx',['stageEvolutionV795={props.stageEvolutionV795}']],
 ['components/visualizer/DynamicStage.tsx',['evolutionAllowedV795','!manualLightingV763','!authoredLightsV386','playback.positionMs<evolveV795.sceneEndMs','evolutionRefV795={evolutionRefV795}']],
 ['components/visualizer/ConcertArchitectureV789.tsx',['positionStageEvolutionBarV795','mesh.current.setMatrixAt(i,transform.matrix)','matrixElapsedV795.current>=.05','computeBoundingSphere()']],
 ]){const source=fs.readFileSync(path.join(root,file),'utf8');for(const x of phrases)assert(source.includes(x),`${file} missing ${x}`);}
const pkg=require('../package.json');assert(['0.1.0-v795','0.1.0-v796','0.1.0-v797','0.1.0-v798','0.1.0-v799','0.1.0-v800','0.1.0-v801','0.1.0-v802','0.1.0-v803','0.1.0-v804','0.1.0-v805','0.1.0-v806','0.1.0-v808','0.1.0-v809','0.1.0-v807'].includes(pkg.version));
for(const key of ['build:preflight','check:fast','check:release'])
 assert(pkg.scripts[key].includes('npm run test:v795 && npm run test:v795:types && npm run test:v794'),key);
console.log('PASS V795: stage geometry evolution, verified timing, no invented scenes, bounded transforms, 4-avatar/lyrics/low-tier controls, renderer integration');
