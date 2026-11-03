'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeNaturalContinuityV872:normalize,createNaturalContinuityStateV872:create,
 resetNaturalContinuityV872:reset,refineNaturalContinuityV872:refine}=load('components/visualizer/naturalDanceContinuityV872');
const root=require('node:path').resolve(__dirname,'..');
let passed=0;
const check=(name,fn)=>{try{fn();passed++;}catch(e){e.message=`V872 ${name}: ${e.message}`;throw e;}};
const pose=(a=1)=>({hipPitch:.064*a,hipRoll:.085*a,hipLateral:.012*a,hipVertical:-.016*a,
 spineCounter:-.065*a,kneeCounter:.03*a,ankleCounter:.016*a});
const input=(patch={})=>({pose:pose(),mode:'Hip_Circle',trackId:'song-A',seconds:5,delta:1/60,
 playing:true,reducedMotion:false,manualPriority:false,autoMode:true,
 footIKEnabled:true,contactKnown:true,plantedLeft:false,plantedRight:false,
 slot:0,count:1,section:'verse',settings:normalize(),...patch});
const call=(patch={},state=create())=>refine(state,input(patch));
check('enabled by default',()=>assert.equal(normalize().enabled,true));
for(const key of ['smoothness','contactSafety','ensembleBalance'])for(const [v,expected] of [
 [-20,0],[201,100],[45.9,46],[NaN,normalize()[key]],[Infinity,normalize()[key]],[-Infinity,normalize()[key]]]){
 check(`normalizer ${key}=${v}`,()=>assert.equal(normalize({[key]:v})[key],expected));
}
for(const [name,patch] of [
 ['disabled',{settings:{enabled:false}}],['pause',{playing:false}],['reduced motion',{reducedMotion:true}],
 ['manual clip',{manualPriority:true}],['explicit Hip_Circle',{autoMode:false}],['mode off',{mode:'off'}],
]) check(`${name} preserves input`,()=>{const x=input(patch),state=create();let r=refine(state,x);
 assert.equal(r.active,false);assert.strictEqual(r.pose,x.pose);assert.equal(state.ready,false);
});
for(const [name,patch] of [
 ['nan time',{seconds:NaN}],['negative time',{seconds:-2}],['nan delta',{delta:NaN}],
 ['negative delta',{delta:-1}],['nonfinite axis',{pose:{...pose(),hipRoll:Infinity}}],
])check(`${name} fail-safe zero`,()=>{const r=call(patch);assert.equal(r.active,false);assert.equal(r.reason,'invalid');
 assert(Object.values(r.pose).every(v=>Number.isFinite(v)&&v===0));});
check('first frame preserves supported pose',()=>assert.deepEqual(call().pose,pose()));
check('pure input object not modified',()=>{const x=input();const copy=JSON.stringify(x);call(x);assert.equal(JSON.stringify(x),copy);});
check('no alias to input pose',()=>{const x=input();const r=call(x);assert.notStrictEqual(r.pose,x.pose);});
check('no alias to state',()=>{const st=create();const r=call({},st);r.pose.hipRoll=999;assert.notEqual(st.pose.hipRoll,999);});
check('first sample no stale pose from previous song',()=>{const st=create();call({},st);const r=call({trackId:'song-B',seconds:1,pose:pose(-1)},st);
 assert.equal(r.reason,'seek-reset');assert.deepEqual(r.pose,pose(-1));});
check('seek backward resets smoothing',()=>{const st=create();call({},st);const r=call({seconds:2,pose:pose(-1)},st);
 assert.equal(r.reason,'seek-reset');assert.deepEqual(r.pose,pose(-1));});
check('seek forward resets smoothing',()=>{const st=create();call({},st);const r=call({seconds:12,pose:pose(-1)},st);
 assert.equal(r.reason,'seek-reset');assert.deepEqual(r.pose,pose(-1));});
check('short normal frames are smoothed',()=>{const st=create();call({},st);const r=call({seconds:5.02,pose:pose(-1)},st);
 assert(r.pose.hipRoll>-.085&&r.pose.hipRoll<.085);});
check('smoothness zero passes through target',()=>{const st=create();call({settings:{smoothness:0}},st);
 const r=call({seconds:5.02,settings:{smoothness:0},pose:pose(-1)},st);
 assert.deepEqual(r.pose,pose(-1));});
check('high smoothing changes no faster than low',()=>{const slower=create(),faster=create();
 call({settings:{smoothness:100}},slower);call({settings:{smoothness:10}},faster);
 const a=call({seconds:5.02,pose:pose(-1),settings:{smoothness:100}},slower);
 const b=call({seconds:5.02,pose:pose(-1),settings:{smoothness:10}},faster);
 assert(a.pose.hipRoll>b.pose.hipRoll);});
check('pause resets last pose',()=>{const st=create();call({},st);call({seconds:5.02,pose:pose(-1)},st);
 call({playing:false},st);assert(!st.ready);assert.deepEqual(call({seconds:5.05,pose:pose(-1)},st).pose,pose(-1));});
check('reset clears clock and cached pose',()=>{const st=create();call({},st);reset(st);
 assert.equal(st.ready,false);assert.equal(st.trackId,null);assert.equal(st.seconds,null);assert(Object.values(st.pose).every(v=>v===0));});
for(const [label,p,c] of [
 ['no IK',{footIKEnabled:false},0],['missing foot contact',{contactKnown:false},0],
 ['left planted',{plantedLeft:true},.52],['right planted',{plantedRight:true},.52],
 ['both planted',{plantedLeft:true,plantedRight:true},.2],
])check(`${label}: bounded pelvis support`,()=>{const r=call(p);assert(Math.abs(r.contactGain-c)<1e-9);
 if(c===0){assert(Math.abs(r.pose.hipLateral)===0);assert(Math.abs(r.pose.hipVertical)===0);}
 if(p.plantedLeft||p.plantedRight)assert(Math.abs(r.pose.ankleCounter)===0);
});
check('both feet with full safety zero displacement',()=>{const r=call({plantedLeft:true,plantedRight:true,settings:{contactSafety:100}});
 assert(Math.abs(r.pose.hipLateral)===0);assert(Math.abs(r.pose.hipVertical)===0);});
check('contact clamps stale hip displacement immediately',()=>{const st=create();call({},st);
 const r=call({seconds:5.02,plantedLeft:true,plantedRight:true,settings:{contactSafety:100}},st);
 assert(Math.abs(r.pose.hipLateral)===0);assert(Math.abs(r.pose.hipVertical)===0);assert(Math.abs(r.pose.ankleCounter)===0);});
check('lacking IK clamps stale displacement immediately',()=>{const st=create();call({},st);
 const r=call({seconds:5.02,footIKEnabled:false},st);
 assert(Math.abs(r.pose.hipLateral)===0);assert(Math.abs(r.pose.hipVertical)===0);});
check('no safety preserves raw pelvis with smoothing off',()=>{const r=call({plantedLeft:true,settings:{contactSafety:0,smoothness:0}});
 assert.equal(r.pose.hipLateral,pose().hipLateral);});
for(const count of [1,2,3,4])for(let slot=0;slot<count;slot++){
 check(`ensemble ${count}/${slot} bounded & repeatable`,()=>{const p={count,slot},a=call(p),b=call(p);
 assert.deepEqual(a,b);assert(a.pose.hipRoll<=pose().hipRoll);
 if(count===1||slot===0)assert.equal(a.pose.hipRoll,pose().hipRoll);
 else assert(a.pose.hipRoll<pose().hipRoll);
 });
}
for(const strength of [0,25,50,75,100]){
 check(`ensemble balance ${strength} lead invariant`,()=>assert.equal(call({count:4,slot:0,settings:{ensembleBalance:strength}}).pose.hipRoll,pose().hipRoll));
 check(`ensemble balance ${strength} follower bounded`,()=>assert(call({count:4,slot:3,settings:{ensembleBalance:strength}}).pose.hipRoll<=pose().hipRoll));
}
for(const section of ['intro','verse','hook','build','drop','break','outro','unknown'])for(const count of [1,2,3,4]){
 check(`${section}/${count} finite and bounded`,()=>{const p=call({section,count,slot:count-1}).pose;
 for(const [key,cap] of Object.entries({hipPitch:.1,hipRoll:.12,hipLateral:.018,hipVertical:.022,spineCounter:.085,kneeCounter:.042,ankleCounter:.024}))
 assert(Number.isFinite(p[key])&&Math.abs(p[key])<=cap+1e-9,`${key} exceeds ${cap}`);
 });
}
for(const v of [-1,0,1,2,10,100,1000])for(const contact of [false,true]){
 check(`extreme pose gain ${v}/${contact}`,()=>{const p=call({pose:pose(v),plantedLeft:contact}).pose;
 assert(Object.values(p).every(Number.isFinite));assert(Math.abs(p.hipRoll)<=.12);});
}
check('stage and preview both invoke the same V872 function',()=>{
 const stage=fs.readFileSync(root+'/components/visualizer/GltfDancerAvatarV492.tsx','utf8');
 const preview=fs.readFileSync(root+'/components/visualizer/AvatarEditor.tsx','utf8');
 assert(stage.includes('refineNaturalContinuityV872(continuityV872.current'));
 assert(preview.includes('refineNaturalContinuityV872(continuityStateV872.current'));
});
check('V872 preview settings are destructured from props, not just typed',()=>{
 const editor=fs.readFileSync(root+'/components/visualizer/AvatarEditor.tsx','utf8');
 const signature=editor.match(/function GltfPreview\(\{([^}]*)\}\s*:\s*\{/);
 assert(signature,'GltfPreview props signature missing');
 assert(signature[1].split(',').map(s=>s.trim()).includes('danceContinuityV872'),
   'danceContinuityV872 must be in the actual function destructuring');
 assert(editor.includes('settings:danceContinuityV872'),
   'V872 continuity settings must reach the refine function');
 assert(editor.includes('danceContinuityV872={preferences.avatarDanceContinuityV872}'),
   'V872 continuity preferences must reach the preview');
});
check('existing V492 final grounding stays after the V872 pass',()=>{
 const stage=fs.readFileSync(root+'/components/visualizer/GltfDancerAvatarV492.tsx','utf8');
 assert(stage.indexOf('refineNaturalContinuityV872(continuityV872.current')<stage.indexOf('updateFootGrounding({'));
});
check('default settings and UI are wired',()=>{
 const context=fs.readFileSync(root+'/context/UiPreferencesContext.tsx','utf8');
 const editor=fs.readFileSync(root+'/components/visualizer/AvatarEditor.tsx','utf8');
 assert(context.includes('avatarDanceContinuityV872:{enabled:true'));
 assert(editor.includes('V872 · Natural Dance Continuity'));
});
console.log(`V872 Natural Dance Continuity: ${passed} regression checks passed.`);
