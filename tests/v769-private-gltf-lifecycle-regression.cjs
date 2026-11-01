'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Module=require('node:module');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const file=path.resolve('components/visualizer/privateGltfLifecycleV769.ts');
const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod=new Module(file,module);
mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));
mod.require=(id)=>{
 if(id==='three/examples/jsm/loaders/GLTFLoader.js')return {GLTFLoader:class{}};
 if(id==='three')return {};
 return require(id);
};
mod._compile(code,file);
const {disposePrivateGltfV769,disposeOwnedRenderTargetsV769,withPrivateGltfV769}=mod.exports;
let ticks=[];
const once=(name)=>({dispose(){ticks.push(name)}});
function asset(){
 const geo=once('geometry'),skeleton=once('skeleton'),map={isTexture:true,...once('texture')};
 const uniformTex={isTexture:true,...once('uniform')};
 const material={map,normalMap:map,uniforms:{uDepth:{value:uniformTex}},dispose(){ticks.push('material')}};
 const mesh={geometry:geo,material:[material,material],skeleton};
 const scene={traverse(fn){fn(mesh);fn(mesh)}};
 return {scene,scenes:[scene,scene],animations:[{name:'Clip'}]};
}
(async()=>{
 const report=disposePrivateGltfV769(asset());
 assert.deepEqual(report,{geometries:1,materials:1,textures:2,skeletons:1});
 assert.deepEqual(ticks,['texture','uniform','skeleton','geometry','material']);
 ticks=[];
 const answer=await withPrivateGltfV769('/private.glb',async value=>{
  assert.equal(value.animations[0].name,'Clip');
  await Promise.resolve();
  assert.equal(ticks.length,0,'source remains alive throughout async inspection');
  return value.animations.map(x=>x.name);
 },async()=>asset());
 assert.deepEqual(answer,['Clip']);assert.equal(ticks.length,5);
 ticks=[];
 await assert.rejects(withPrivateGltfV769('/broken.glb',()=>{throw Error('scan failed')},async()=>asset()),/scan failed/);
 assert.equal(ticks.length,5,'cleanup on exception');
 ticks=[];
 let release;
 const pending=new Promise(resolve=>{release=resolve;});
 const late=withPrivateGltfV769('/late.glb',value=>value.animations.length,()=>pending);
 assert.equal(ticks.length,0);release(asset());
 assert.equal(await late,1);assert.equal(ticks.length,5,'late resolution after unmount still releases GPU resources');
 ticks=[];
 let calls=0;const target={dispose(){calls++}};
 assert.equal(disposeOwnedRenderTargetsV769([target,target]),1);assert.equal(calls,1);
 assert.equal(disposePrivateGltfV769({scene:{traverse(){}},scenes:[]}).geometries,0);
 const integration=[
  'MotionTransitionStudio.tsx','AvatarPreview3D.tsx','MotionTimelinePreview3DV319.tsx',
  'RealConcertPreviewCanvasV513.tsx','AnimationBlendingStudio.tsx','MotionTimelineStudio.tsx',
  'RetargetingStudio.tsx','AvatarAnatomyStudio.tsx','DanceDebugger.tsx',
  'MotionQualityOptimizerDashboard.tsx','motionClipInspector.ts','hipGlbMotionV739.ts',
  'motionQualitySamplerV534.ts'
 ];
 for(const filename of integration) {
  const source=fs.readFileSync(path.join('components/visualizer',filename),'utf8');
  assert.match(source,/withPrivateGltfV769\(/,filename+' missing private lifecycle');
 }
 const scan=fs.readFileSync('components/visualizer/glbMotionScanV439.ts','utf8');
 assert.match(scan,/finally\s*\{\s*disposePrivateGltfV769\(gltf\)/);
 const cache=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
 assert.match(cache,/usePreviewGltfCacheV654\(/);
 assert.doesNotMatch(cache,/disposePrivateGltfV769/,'shared useGLTF cache must never be disposed by private utility');
 const pp=fs.readFileSync('components/visualizer/DancePostProcessingV468.tsx','utf8');
 assert.match(pp,/disposeDancePostProcessingV654/,'existing pass/composer lifecycle still in place');
 console.log('PASS V769: private GPU lifecycle, resource dedup, shader textures, async/failure/late cleanup, owned render targets, 18 integration sites, shared cache guard');
})().catch(e=>{console.error(e);process.exitCode=1});
