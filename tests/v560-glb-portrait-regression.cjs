'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function load(file,overrides={}){
 const {outputText,diagnostics}=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 assert.equal(diagnostics?.length??0,0);
 const mod={exports:{}};
 new Function('module','exports','require',outputText)(mod,mod.exports,(x)=>overrides[x]??require(x));
 return mod.exports;
}
const {planPortraitMaterialV560:plan}=load('components/visualizer/portraitMaterialSafetyV560.ts');
const c={meshName:'Wolf3D_Head',materialName:'skin_face',kind:'MeshStandardMaterial',roughness:.12,metalness:.8,
 transparent:false,opacity:1,emissive:false,metalnessMap:false};
let count=0;
function test(name,fn){fn();count++;console.log('PASS V560',name)}
const same=x=>assert.deepEqual(plan(x),{eligible:false,roughness:x.roughness,metalness:x.metalness,reason:plan(x).reason});
test('named skin conservatively softens extreme PBR glare',()=>{
 const p=plan(c);assert.equal(p.eligible,true);assert.equal(p.reason,'skin');
 assert.ok(p.roughness>.12&&p.roughness<=.47&&p.metalness<.8&&p.metalness>=.16);
});
test('skin floor preserved when already matte and nonmetallic',()=>{
 const p=plan({...c,roughness:.89,metalness:0});assert.equal(p.roughness,.89);assert.equal(p.metalness,0);
});
test('strength zero retains original numbers',()=>{
 const p=plan(c,0);assert.equal(p.roughness,c.roughness);assert.equal(p.metalness,c.metalness);
});
test('strength is clamped to prevent over-adjustment',()=>{
 assert.equal(plan(c,200).roughness,plan(c,100).roughness);
 assert.equal(plan(c,-90).metalness,c.metalness);
});
test('unrecognized mesh leaves materials untouched',()=>same({...c,meshName:'Armature',materialName:'PBR_01'}));
test('eye, teeth, hair, cloth, metal and glass are preserved',()=>{
 for(const name of ['Head_Eyelashes','Wolf3D_Eye','Hair_Face','Tooth','FaceGlass','FaceMetal','LipHair','face_cloth'])same({...c,meshName:name,materialName:'skin'});
});
test('unlabeled highly metallic head parts are not mistaken for skin',()=>same({...c,materialName:'material_01'}));
test('transparent meshes are never patched',()=>same({...c,transparent:true}));
test('alpha-blended and semi-transparent materials are never patched',()=>same({...c,opacity:.98}));
test('emissive makeup or glow stays intact',()=>same({...c,emissive:true}));
test('metalness maps remain authoritative',()=>same({...c,metalnessMap:true}));
test('custom shader and basic materials bypassed',()=>{
 for(const kind of ['ShaderMaterial','MeshBasicMaterial','MeshLambertMaterial'])same({...c,kind});
});
test('physical PBR skin permitted but bounded',()=>{
 const p=plan({...c,kind:'MeshPhysicalMaterial'});assert.ok(p.eligible);assert.ok(p.roughness<.5);
});
test('invalid source ranges are never overwritten',()=>{
 for(const v of [NaN,Infinity,-.5,1.5]){const r=plan({...c,roughness:v});assert.equal(r.eligible,false);assert.equal(r.reason,'invalid');}
});
test('non-finite strength is safe',()=>{
 for(const v of [Infinity,-Infinity,NaN]){const r=plan(c,v);assert.equal(r.metalness,c.metalness);assert.equal(r.roughness,c.roughness);}
});
test('GLB material adapter is instance-local and cleaned up',()=>{
 const adapter=read('components/visualizer/applyGlbPortraitMaterialsV560.ts');
 for(const k of ['candidate.clone()','material.dispose()','material.roughness=result.roughness','material.metalness=result.metalness','baselines.clear()'])assert.ok(adapter.includes(k),k);
 assert.doesNotMatch(adapter,/\.geometry\s*=|\.map\s*=|\.color\s*=|\.morphTargetInfluences\s*=/);
});
test('live GLB path is cached per avatar without per-frame mutation',()=>{
 const code=read('components/visualizer/GltfDancerAvatarV492.tsx');
 assert.match(code,/const materialSessionV560=useMemo\(\(\)=>preparePortraitMaterialsV560\(model\),\[model\]\)/);
 assert.match(code,/materialSessionV560\.dispose\(\)/);
 assert.match(code,/concertGlbMaterialQualityV560/);
});
test('preview can compare same opted-in real GLB and face close-up',()=>{
 const src=read('components/visualizer/StagePreviewModal.tsx');
 for(const s of ['previewRealGlbV560','previewMaterialV560','faceCloseUpV560','PreviewGlbPortraitV560','Echten GLB zeigen','GLB-Hautmaterial','Gesichts-Nahaufnahme'])assert.ok(src.includes(s),s);
 assert.match(src,/concertMode!=='duet'/);
 assert.match(read('components/visualizer/PreviewGlbPortraitV560.tsx'),/cloneSkinnedScene\(scene\)/);
});
test('V560 respects user opt out and per-avatar persisted preferences',()=>{
 const settings=read('components/SettingsPanel.tsx');
 assert.match(settings,/concertGlbMaterialQualityV560/);
 assert.match(settings,/concertGlbMaterialStrengthV560/);
 assert.match(read('types/music.ts'),/concertGlbMaterialQualityV560\?: boolean/);
 assert.match(read('components/SettingsPanel.tsx'),/avatarModelUrl=\{currentAvatar\?\.url\?\?null\}/);
});
test('no expensive shadow or lighting changes added to dynamic stage',()=>{
 const stage=read('components/visualizer/DynamicStage.tsx');
 assert.equal((stage.match(/<pointLight\b/g)||[]).length,3);
 assert.equal((stage.match(/<spotLight\b/g)||[]).length,1);
 const preview=read('components/visualizer/PreviewGlbPortraitV560.tsx');
 assert.match(preview,/castShadow=false/);assert.match(preview,/receiveShadow=false/);
});

class FakePbrMaterial {
 constructor(name,type='MeshStandardMaterial',roughness=.1,metalness=.9){
   this.name=name;this.type=type;this.roughness=roughness;this.metalness=metalness;
   this.transparent=false;this.opacity=1;this.emissive={getHex:()=>0};this.metalnessMap=null;this.disposed=false;
 }
 clone(){return new FakePbrMaterial(this.name,this.type,this.roughness,this.metalness)}
 dispose(){this.disposed=true}
}
const {preparePortraitMaterialsV560:prepare}=load('components/visualizer/applyGlbPortraitMaterialsV560.ts',{
 './portraitMaterialSafetyV560':{planPortraitMaterialV560:plan},
});
const instance=(node)=>({traverse(fn){fn(node)}});
test('runtime adapter clones only eligible skin and preserves source',()=>{
 const original=new FakePbrMaterial('Skin');const face={name:'Head',isMesh:true,material:original};
 const session=prepare(instance(face));
 assert.equal(session.diagnostics.skins,1);assert.equal(session.diagnostics.cloned,1);
 assert.notEqual(face.material,original);session.apply(true,100,false);
 assert.equal(original.roughness,.1);assert.equal(original.metalness,.9);
 assert.equal(face.material.roughness,.47);assert.ok(Math.abs(face.material.metalness-.16)<1e-10);
 session.dispose();assert.equal(face.material.disposed,true);assert.equal(original.disposed,false);
});
test('runtime adapter toggles adjustments off cleanly',()=>{
 const original=new FakePbrMaterial('Skin');const head={name:'Head',isMesh:true,material:original};
 const session=prepare(instance(head));session.apply(true,70,false);assert.ok(head.material.roughness>.1);
 session.apply(false,70,false);assert.equal(head.material.roughness,.1);assert.equal(head.material.metalness,.9);
 session.dispose();session.dispose();assert.equal(original.disposed,false);
});
test('runtime adapter switches to original skin behavior in low tier',()=>{
 const head={name:'Face',isMesh:true,material:new FakePbrMaterial('Face Skin')};
 const session=prepare(instance(head));session.apply(true,65,false);assert.ok(head.material.roughness>.1);
 session.apply(true,65,true);assert.equal(head.material.roughness,.1);session.dispose();
});
test('runtime adapter leaves non-face material and arrays intact',()=>{
 const hair=new FakePbrMaterial('Hair');const skin=new FakePbrMaterial('Skin');
 const head={name:'Head',isMesh:true,material:[hair,skin]};
 const session=prepare(instance(head));assert.equal(head.material[0],hair);
 assert.notEqual(head.material[1],skin);session.apply(true,100,false);
 assert.equal(hair.roughness,.1);assert.ok(head.material[1].roughness>.1);
 session.dispose();assert.equal(skin.disposed,false);assert.equal(hair.disposed,false);
});
test('runtime adapter never modifies shared PBR material of unrelated mesh',()=>{
 const source=new FakePbrMaterial('Skin');const head={name:'Head',isMesh:true,material:source};
 const other={name:'Hair',isMesh:true,material:source};
 const session=prepare({traverse(fn){fn(head);fn(other)}});
 session.apply(true,100,false);
 assert.notEqual(head.material,source);assert.equal(other.material,source);
 assert.equal(source.roughness,.1);session.dispose();
});
console.log(`PASS V560 ${count} regression cases`);
