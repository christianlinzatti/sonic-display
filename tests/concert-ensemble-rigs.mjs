import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {AnimationMixer,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {prepareAvatarWardrobeV468,isClothingMaterialV468}=load('components/visualizer/avatarWardrobeV468.ts');
const {songWardrobe}=load('lib/songWardrobe.ts'),{stepCrew,newCrewState}=load('components/visualizer/sonicCrewDirector.ts');
const {prepareCrewReaction,applyCrewReaction}=load('components/visualizer/sonicCrewReaction.ts');
for(const asset of JSON.parse(readFileSync('public/avatars/sonic/manifest.json'))){
 const bytes=readFileSync('public/avatars/sonic/'+asset.file),g=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const model=clone(g.scene),baseline=clone(g.scene),original=[];
 model.traverse(mesh=>{if(mesh.isMesh)for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material])original.push({mesh,m,color:m.color?.clone(),roughness:m.roughness});});
 const wardrobe=prepareAvatarWardrobeV468(model);assert(wardrobe.count>0,asset.file+' must have clothing');
 const costume=songWardrobe('garment-test','rock',1);
 for(let i=0;i<120;i++)wardrobe.apply('album',costume.color,1/60,true,'original',35,costume);
 for(const {mesh,m,color,roughness} of original){assert(m.color.equals(color)&&m.roughness===roughness,'Cached GLTF materials remain untouched');const ms=Array.isArray(mesh.material)?mesh.material:[mesh.material];const updated=ms.find(x=>x.name===m.name);if(isClothingMaterialV468(mesh.name,m.name)){assert.notEqual(updated,m);assert(Math.abs(updated.roughness-costume.roughness)<.002);}else assert.equal(updated,m,'Skin, hair and face keep their materials');}
 for(let i=0;i<180;i++)wardrobe.apply('off','#ffffff',1/60,false,'original',35);
 for(const {mesh,m,color,roughness} of original){const updated=(Array.isArray(mesh.material)?mesh.material:[mesh.material]).find(x=>x.name===m.name);assert(['r','g','b'].every(k=>Math.abs(updated.color[k]-color[k])<.001));assert(Math.abs(updated.roughness-roughness)<.001);}
 const plan=stepCrew(newCrewState(),{trackId:'ensemble-test',modelId:'sonic-'+asset.file.replace('.glb',''),clips:g.animations,progressMs:33000,durationMs:180000,genre:'house',count:3,slot:1,playing:true,reducedMotion:false,manualPriority:false,settings:{enabled:true,reactions:true,mode:'adaptive',scenery:true,showPlans:true}}).plan;
 const a=new AnimationMixer(model),b=new AnimationMixer(baseline),clip=g.animations.find(c=>c.name===plan.clip);a.clipAction(clip).play();b.clipAction(clip).play();const nodes=prepareCrewReaction(model);
 for(let i=0;i<100;i++){a.setTime(i/60);b.setTime(i/60);applyCrewReaction(nodes,plan,i/30,.7);model.updateMatrixWorld(true);baseline.updateMatrixWorld(true);for(const name of ['LeftFoot','RightFoot','Hips'])assert(model.getObjectByName(name).getWorldPosition(new Vector3()).distanceTo(baseline.getObjectByName(name).getWorldPosition(new Vector3()))<1e-6,'Ensemble keeps authored lower-body positions');assert(nodes.every(n=>Object.values(n.channels).every(Number.isFinite)));}
 applyCrewReaction(nodes,{...plan,active:false},0,0);assert(nodes.every(n=>!n.owned));wardrobe.dispose();a.stopAllAction();b.stopAllAction();a.uncacheRoot(model);b.uncacheRoot(baseline);
 console.log('PASS real ensemble and garment materials: '+asset.file);
}
