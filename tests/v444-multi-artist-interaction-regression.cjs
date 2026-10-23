const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const m=load('components/visualizer/multiArtistInteractionV444');
const {planMultiArtistGroupV442}=load('components/visualizer/automaticMultiArtistStageV442');
const {evaluateGroupV326}=load('components/visualizer/multiAvatarStageDirectorV326');
const group=planMultiArtistGroupV442({trackId:'feature',count:4,
  lyrics:{synced:true,lines:Array.from({length:32},(_,i)=>({startMs:i*1200,text:'Test line '+i}))}});
const pose=evaluateGroupV326(group,6);
const base={pose,count:4,enabled:true,playing:true,reducedMotion:false,manualStage:false,
  beat:.8,seconds:6,cueAt:4.8,strength:60};
const visual=m.planMultiArtistInteractionV444(base);
assert.equal(visual.enabled,true);assert.equal(visual.source,'visual-stage');
assert.equal(visual.slots.length,4);assert.equal(visual.lead,1);
assert.equal(visual.slots[1].role,'lead');
assert(visual.slots[0].look.yaw>0);assert(visual.slots[3].look.yaw<0);
for(const slot of visual.slots){
 assert(Math.abs(slot.look.yaw)<=.38);
 assert(slot.gesture.leftLift>=0&&slot.gesture.leftLift<=.21);
 assert(slot.gesture.rightLift>=0&&slot.gesture.rightLift<=.24);
 assert(Number.isFinite(slot.gesture.intensity));
}
const manual=m.planMultiArtistInteractionV444({...base,singer:{active:true,leadSlot:3,
  singingSlots:[3],handoffFrom:0,role:'feature',phase:.5}});
assert.equal(manual.source,'manual-vocal');assert.equal(manual.lead,3);
assert.equal(manual.reply,0);assert.equal(manual.slots[3].role,'lead');
assert.equal(manual.slots[0].role,'reply');
const manualHook=m.planMultiArtistInteractionV444({...base,singer:{active:true,leadSlot:2,
  singingSlots:[0,1,2,3],handoffFrom:null,role:'hook'}});
assert.equal(manualHook.group,true);assert.equal(manualHook.lead,null);
assert(manualHook.slots.every(x=>x.role==='ensemble'&&x.look.yaw===0));
const hook=m.planMultiArtistInteractionV444({...base,pose:{...pose,focus:-1,drop:true}});
assert.equal(hook.group,true);assert(hook.slots.every(x=>x.role==='ensemble'));
for(const patch of [{enabled:false},{reducedMotion:true},{playing:false},{manualStage:true},{strength:0},{count:2},{pose:null}]){
 const off=m.planMultiArtistInteractionV444({...base,...patch});
 assert.equal(off.enabled,false);assert.deepEqual(off.slots,[]);
}
const bad=m.planMultiArtistInteractionV444({...base,singer:{active:true,leadSlot:6,singingSlots:[6],handoffFrom:1}});
assert.equal(bad.source,'visual-stage','invalid manual singer is never remapped to a false voice');
assert.deepEqual(base.pose,pose,'input pose remains unchanged');
const renderer=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const editor=fs.readFileSync('components/visualizer/AutoMotionIntelligencePanelV438.tsx','utf8');
const prefs=fs.readFileSync('context/UiPreferencesContext.tsx','utf8');
assert(renderer.includes('planMultiArtistInteractionV444'));
assert(renderer.includes('<PartnerLookContext.Provider value={looksV444.current[i]}>'));
assert(renderer.includes('<PartnerGestureContext.Provider value={gesturesV444.current[i]}>'));
assert(renderer.includes('selectedSingerV444=rapDuetCueV416.active?toVocalCueV416'));
assert(stage.includes('artistInteractionEnabledV444={preferences.rapArtistInteractionEnabledV444??true}'));
assert(editor.includes('V444 · Smart Multi-Artist Interaction'));
assert(prefs.includes('rapArtistInteractionEnabledV444:true'));
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=444);
console.log('PASS V444: 4 avatars, head/eye attention, tiny rap gestures, explicit vocal handoffs, hooks, manual guards, preference and live-rig wiring');
