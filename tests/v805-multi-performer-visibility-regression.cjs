'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(805);
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {inspectMultiPerformerVisibilityV805:inspect}=load('components/visualizer/multiPerformerVisibilityV805');
let count=0,probes=0;
const test=(name,fn)=>{try{fn();count++;}catch(e){e.message=`V805 ${name}: ${e.message}`;throw e;}};
const corners=(l,t,r,b)=>{const out=[];for(const x of [l,r])for(const y of [t,b])for(const z of [0,.2])out.push({x,y,z});return out;};
const actor=(id,l,r,{head=true,feet=true,source='glb',top=.13,bottom=.70}={})=>({id,label:id,
  evidence:{source,bounds:corners(l,top,r,bottom),head:head?{x:(l+r)/2,y:.22,z:.1}:null,
    feet:feet?[{x:l+.06,y:.67,z:.1},{x:r-.06,y:.67,z:.1}]:[],headBone:head,footBones:feet,performerCount:2}});
const a=actor('lead',.12,.38),b=actor('guest',.60,.87);
const result=inspect([a,b],2);
const status=(r,k)=>r.checks.find(c=>c.id===k)?.status;
test('two real GLBs permit geometric group review',()=>assert.equal(result.verifiedCount,2));
test('fully projected group stays inside preview',()=>assert.equal(status(result,'group'),'clear'));
test('two separated GLBs have safe bounding rectangles',()=>assert.equal(status(result,'spacing'),'clear'));
test('head bones projected individually',()=>assert.equal(status(result,'heads'),'clear'));
test('foot bones projected individually',()=>assert.equal(status(result,'feet'),'clear'));
test('unknown pixel text remains unverified',()=>assert.equal(status(result,'lyrics'),'unverified'));
test('bounded union covers both performers',()=>{assert.equal(result.groupBounds.left,.12);assert.equal(result.groupBounds.right,.87);});
test('missing second model never produces good rating',()=>assert.equal(inspect([a],2).status,'unverified'));
test('single performer is not a group',()=>assert.equal(inspect([a],1).status,'unverified'));
test('no performers is unverified',()=>assert.equal(inspect([],2).status,'unverified'));
test('undefined performers is unverified',()=>assert.equal(inspect(null,2).status,'unverified'));
test('too many models is blocked',()=>assert.equal(inspect([a,b],4).status,'unverified'));
test('bad count is blocked',()=>assert.equal(inspect([a,b],NaN).status,'unverified'));
test('duplicate names fail closed',()=>assert.equal(inspect([a,{...b,id:'lead'}],2).status,'unverified'));
test('blank identity fails closed',()=>assert.equal(inspect([{...a,id:''},b],2).status,'unverified'));
test('loading GLB blocks group rating',()=>assert.equal(inspect([a,{...b,evidence:null}],2).status,'unverified'));
test('demo GLB blocks group rating',()=>assert.equal(inspect([a,actor('guest',.6,.8,{source:'demo'})],2).status,'unverified'));
test('invalid projection blocks group rating',()=>assert.equal(inspect([a,actor('guest',NaN,.9)],2).status,'unverified'));
test('degenerate geometry blocks group rating',()=>assert.equal(inspect([a,actor('guest',.6,.6)],2).status,'unverified'));
test('partial third GLB blocks all group ratings',()=>assert.equal(inspect([a,b,{id:'third',label:'third',evidence:null}],3).status,'unverified'));
test('three distinct real GLBs can be assessed',()=>assert.equal(inspect([a,b,actor('third',.4,.55)],3).verifiedCount,3));
test('offscreen GLB flags group as risk',()=>assert.equal(status(inspect([a,actor('guest',.87,1.03)],2),'group'),'risk'));
test('overlapping GLBs flag spacing risk',()=>assert.equal(status(inspect([a,actor('guest',.22,.45)],2),'spacing'),'risk'));
test('just touching boxes do not count as heavy overlap',()=>assert.equal(status(inspect([a,actor('guest',.38,.64)],2),'spacing'),'clear'));
test('missing one head is not falsely green',()=>assert.equal(status(inspect([a,actor('guest',.6,.86,{head:false})],2),'heads'),'unverified'));
test('out-of-frame head is flagged',()=>{const e={...b.evidence,head:{x:1.1,y:.22,z:0}};
 assert.equal(status(inspect([a,{...b,evidence:e}],2),'heads'),'risk');});
test('missing two feet cannot pass',()=>assert.equal(status(inspect([a,actor('guest',.6,.86,{feet:false})],2),'feet'),'unverified'));
test('lyrics lower reserve triggers risk only',()=>assert.equal(status(inspect([a,actor('guest',.6,.86,{bottom:.98})],2),'lyrics'),'risk'));
test('pure and deterministic inputs are untouched',()=>{const input=[a,b],s=JSON.stringify(input);
 assert.deepEqual(inspect(input,2),inspect(input,2));assert.equal(JSON.stringify(input),s);});
test('2400 randomized deterministic geometry probes',()=>{for(let i=0;i<2400;i++){
 const t=i/2399,left=.08+.15*t;
 const items=[actor('lead',left,left+.23),actor('guest',.59-.13*t,.83-.13*t)];
 const out=inspect(items,2);assert.equal(out.verifiedCount,2);assert.deepEqual(out,inspect(items,2));
 assert(['clear','risk','unverified'].includes(out.status));probes++;
}});
const read=p=>fs.readFileSync(p,'utf8');
test('Settings passes real library avatars and selected primary',()=>{
 const s=read('components/SettingsPanel.tsx');assert(s.includes('avatarChoicesV805={[...avatarModels.map'));
 assert(s.includes('avatarModelUrl={currentAvatar?.url??null}'));
});
test('Dashboard and assistant pass through model choices',()=>{
 for(const file of ['components/visualizer/ConcertQualityDashboardV751.tsx','components/visualizer/ConcertImprovementAssistantPanelV802.tsx'])
 assert(read(file).includes('avatarChoicesV805={avatarChoicesV805}'),file);
});
test('UI requires explicit 2nd and 3rd GLB selection',()=>{
 const s=read('components/visualizer/VisualConcertComparisonPanelV803.tsx');
 for(const k of ['secondId','thirdId','setSecondId','setThirdId','Dritter Performer','Zweiter Performer','keine automatische Sängerzuordnung'])assert(s.includes(k),k);
});
test('only one canvas and two cameras using scissor view',()=>{
 const s=read('components/visualizer/CameraComparisonCanvasV803.tsx');assert.equal((s.match(/<Canvas\s/g)||[]).length,1);
 for(const k of ['setScissorTest(true)','gl.render(scene,cam)','setScissorTest(false)','<DynamicStage','<FrozenGlb','performerModelsV805'])assert(s.includes(k),k);
});
test('real GLB skeleton clones and caches cleaned up',()=>{
 const s=read('components/visualizer/CameraComparisonCanvasV803.tsx');
 for(const k of ['disposeClonedAvatarSkeletonsV654','cloneSkinnedScene','uncacheRoot','usePreviewGltfCacheV654'])assert(s.includes(k),k);
});
test('group review comes from actual scene object, not model metadata',()=>{
 const s=read('components/visualizer/CameraComparisonCanvasV803.tsx');
 for(const k of ['scene.getObjectByName','work.box.setFromObject(performer)','project(cam)','inspectMultiPerformerVisibilityV805','multiBefore','multiAfter'])assert(s.includes(k),k);
});
test('no persistence, camera mutations or additional render loops',()=>{
 const s=read('components/visualizer/CameraComparisonCanvasV803.tsx')+read('components/visualizer/multiPerformerVisibilityV805.ts');
 assert(!/saveTimelineV354|captureStream|localStorage|requestAnimationFrame|setInterval/.test(s));
});
test('missing data is explicitly disclosed',()=>{
 const s=read('components/visualizer/CameraComparisonCanvasV803.tsx');
 for(const k of ['Keine verifizierte Sängerzuordnung','keine Mehrpersonen-Garantie','keine echte Live-Kamera','nicht verifiziert'])assert(s.includes(k),k);
});
test('only selected models are rendered, max three',()=>{
 const s=read('components/visualizer/CameraComparisonCanvasV803.tsx');
 assert(s.includes('.slice(0,3)')&&s.includes('reviewModels.map')&&s.includes('modelSignature'));
});
test('new release first in gates',()=>{
 const j=require('../package.json');assert(/^0\.1\.0-v\d+$/.test(j.version));
 for(const k of ['build:preflight','check:fast','check:release'])assert(j.scripts[k].includes('npm run test:v805 && npm run test:v805:types && npm run test:v804'),k);
});
console.log(`PASS V805: ${count} groups, ${probes} deterministische Gruppenproben`);
