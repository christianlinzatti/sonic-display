'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(791);
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
function load(rel){const filename=path.join(root,rel);
 const out=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 const mod=new Module(filename,module);mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));mod._compile(out.outputText,filename);return mod.exports;
}
const {sampleSeamlessSceneTransitionV791:sample}=load('components/visualizer/seamlessSceneTransitionsV791.ts');
const kinds=['portrait','dialogue','wide','rise','pulse','breath'];
const starts=[0,12000,24000,37000,49000,61000];
const ends=[12000,24000,37000,49000,61000,75000];
const scenes=kinds.map((intent,i)=>({index:i,actIndex:i<2?0:i<4?1:2,
 startMs:starts[i],endMs:ends[i],intent,section:i<2?'verse':i<4?'build':'drop',
 role:'foundation',moment:i===5?'breath':'focus',emphasis:.2,variation:1}));
const plan={source:'verified-storyboard',trackId:'song-v791',durationMs:75000,scenes,peakAct:4};
function input(i,ms,extra={}){return {trackId:plan.trackId,durationMs:plan.durationMs,positionMs:ms,
 playing:true,enabled:true,reducedMotion:false,tier:'high',lyricsProtected:false,
 manualCamera:false,manualLighting:false,
 show:{active:true,reason:'verified-show',sceneIndex:i,actIndex:scenes[i].actIndex,
  moment:scenes[i].moment,intent:scenes[i].intent,emphasis:0,blend:0,dynamics:{}},...extra};}
const probe=(i,ms,extra={})=>sample(plan,input(i,ms,extra));
const entry=probe(1,12000),exit=probe(0,11999);
assert(entry.active&&exit.active,'verified intra-act handoff');
assert.equal(entry.kind,'intra-act');
assert.equal(entry.edge,'entry');
assert.equal(exit.edge,'exit');
assert(Math.abs(entry.cameraRate-exit.cameraRate)<.00001,'same camera rate on both sides');
assert(Math.abs(entry.lightingRate-exit.lightingRate)<.00001,'same lighting rate on both sides');
assert(entry.cameraRate>=.60&&entry.cameraRate<1);
assert(entry.lightingRate>=.63&&entry.lightingRate<1);
assert.equal(probe(2,24000).kind,'act-change','inter-act seam distinguishes from scene-only');
assert.equal(probe(2,30000).active,false,'middle of act has no additional smoothing');
assert.equal(probe(0,400).active,false,'first song start is not a manufactured handoff');
assert.equal(probe(5,74999).active,false,'last song end is not a manufactured handoff');
assert.equal(probe(1,12000,{tier:'low'}).active,false);
assert.equal(probe(1,12000,{playing:false}).active,false);
assert.equal(probe(1,12000,{enabled:false}).active,false);
assert.equal(probe(1,12000,{reducedMotion:true}).active,false);
assert.equal(probe(1,12000,{trackId:'other'}).active,false);
assert.equal(probe(1,12000,{durationMs:76000}).active,false);
assert.equal(probe(1,12000,{positionMs:NaN}).active,false);
assert.equal(probe(1,12000,{positionMs:Infinity}).active,false);
assert.equal(probe(1,12000,{positionMs:23999+1}).active,false);
assert.equal(probe(1,12000,{show:{...input(1,12000).show,sceneIndex:0}}).active,false);
assert.equal(probe(1,12000,{show:{...input(1,12000).show,actIndex:2}}).active,false);
assert.equal(probe(1,12000,{show:{...input(1,12000).show,intent:'wide'}}).active,false);
assert.equal(probe(1,12000,{show:{...input(1,12000).show,active:false}}).active,false);
assert.equal(sample({...plan,source:'unavailable'},input(1,12000)).active,false);
assert.equal(probe(1,12000,{manualCamera:true,manualLighting:true}).active,false);
assert.equal(probe(1,12000,{manualCamera:true}).cameraRate,1);
assert(probe(1,12000,{manualCamera:true}).lightingRate<1);
assert.equal(probe(1,12000,{manualLighting:true}).lightingRate,1);
assert(probe(1,12000,{manualLighting:true}).cameraRate<1);
assert(probe(1,12000,{lyricsProtected:true}).lightingRate>entry.lightingRate,'protect lyrics from light shifts');
assert(probe(1,12000,{tier:'balanced'}).cameraRate>entry.cameraRate,'balanced tier is gentler');
const gap={...plan,scenes:scenes.map((scene,i)=>i===1?{...scene,startMs:12001}:scene)};
assert.equal(sample(gap,input(0,11999)).active,false,'gaps are not bridged');
assert.equal(sample(gap,input(1,12001)).active,false,'gaps are not bridged on entry');
const sameIntent={...plan,scenes:scenes.map((scene,i)=>i===1?{...scene,intent:scenes[0].intent}:scene)};
assert.equal(sample(sameIntent,{...input(0,11999)}).active,false,'no extra scene-only softening without a visual change');
for(const ms of [10100,10700,11200,11800]){
 const r=probe(0,ms);assert(r.cameraRate<=1&&r.cameraRate>=.60);
}
for(const [file,required] of [
 ['components/visualizer/VisualizerStage.tsx',['sampleSeamlessSceneTransitionV791','cinematicTransitionV791={seamlessSceneV791}','data-v791-kind']],
 ['components/visualizer/registry.tsx',['cinematicTransitionV791?:']],
 ['components/visualizer/ThreeAvatar.tsx',['seam:props.cinematicTransitionV791','transitionV791={coordinatedTransitionV849.seam??undefined}']],
 ['components/visualizer/DynamicStage.tsx',['Math.min(lightingBlendV609.lightingRate','transitionV791={transitionV791?.active']],
 ['components/visualizer/ConcertAtmosphereRendererV308.tsx',['Math.min(lightingBlendV609.lightingRate','transitionV791?:']],
 ['components/visualizer/StageCameraDirectorV289.tsx',['Math.min(sceneBlendV609.cameraRate','transitionV791?.active']],
]){const content=fs.readFileSync(path.join(root,file),'utf8');for(const r of required)assert(content.includes(r),`${file} missing ${r}`)}
const pkg=require('../package.json');assert(/^0\.1\.0-v\d+$/.test(pkg.version));
for(const k of ['check:fast','build:preflight','check:release'])assert(pkg.scripts[k].includes('npm run test:v791 && npm run test:v791:types && npm run test:v790'),k);
console.log('PASS V791: scene/act seams, continuous curves, authored priority, tier/lyrics safety, fail-closed evidence, camera/light wiring');
