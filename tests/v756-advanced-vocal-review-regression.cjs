'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {proposeVocalAssignmentsV660}=load('components/visualizer/smartVocalAssignmentV660');
const {buildVocalReviewV756:review,applyVocalReviewsV756:apply,defaultVocalReviewEditV756:defaults,auditVocalTimelineV756:audit}=load('components/visualizer/advancedVocalReviewV756');
const {resolveVocalTimeCueV496:resolve}=load('components/visualizer/vocalTimeDirectorV496');
const lyrics=lines=>({provider:'spotify',synced:true,plainText:null,lines:lines.map(([text,startMs,endMs])=>({text,startMs,endMs,words:[]}))});
const durationMs=10000;
const source=lyrics([['[vocal:lead:1] A',1000,2000],['[vocal:duet:1,2] duet',2000,3700],['[vocal:hook:1,2,3] hook',3700,5100],['[vocal:adlib:3] uh',5100,5600],['[vocal:feature:2] B',5600,7000]]);
const plan=proposeVocalAssignmentsV660({lyrics:source,durationMs,avatarCount:3,manual:[],rapDuet:[],existing:[]});
assert.equal(plan.proposals.length,5);
const build=(i,edit=defaults(plan.proposals[i]),existing=[])=>review({proposal:plan.proposals[i],edit,count:3,durationMs,existing});
for(let i=0;i<5;i++){
 const r=build(i);assert.equal(r.status,'ready');assert(r.segment);
 assert.equal(r.segment.startMs,source.lines[i].startMs);
}
assert.deepEqual(build(1).segment.singerSlotsV547,[0,1]);
assert.deepEqual(build(2).segment.singerSlotsV547,[0,1,2]);
assert.equal(build(3).segment.roleV547,'adlib');
const rotate=build(0,{...defaults(plan.proposals[0]),leadSlot:2,partnerSlot:0,singerSlots:[2]});
assert.equal(rotate.segment.leadSlot,2);assert.deepEqual(rotate.segment.singerSlotsV547,[2]);
const duetInvalid=build(1,{...defaults(plan.proposals[1]),leadSlot:1,partnerSlot:1});
assert.equal(duetInvalid.status,'invalid');
const hookInvalid=build(2,{...defaults(plan.proposals[2]),singerSlots:[1,2]});
assert.equal(hookInvalid.status,'invalid');
assert.equal(build(0,{...defaults(plan.proposals[0]),leadSlot:3}).status,'invalid');
assert.equal(build(0,{...defaults(plan.proposals[0]),leadSlot:NaN}).status,'invalid');
assert.equal(build(0,{...defaults(plan.proposals[0]),singerSlots:[1,1]}).status,'invalid');
let applied=apply({existing:[],reviews:plan.proposals.map((_,i)=>build(i)),durationMs,count:3,overrideExisting:false});
assert.equal(applied.added,5);assert.equal(applied.segments.length,5);
let after=apply({existing:applied.segments,reviews:plan.proposals.map((_,i)=>build(i,undefined,applied.segments)),durationMs,count:3,overrideExisting:true});
assert.equal(after.added,0,'idempotent review re-acceptance');
assert.equal(after.skipped,5);
assert.equal(resolve({trackId:'song',progressMs:1200,playing:true,count:3,enabled:true,segments:applied.segments}).leadSlot,0);
assert.deepEqual(resolve({trackId:'song',progressMs:2400,playing:true,count:3,enabled:true,segments:applied.segments}).singingSlots,[0,1]);
assert.deepEqual(resolve({trackId:'song',progressMs:4000,playing:true,count:3,enabled:true,segments:applied.segments}).singingSlots,[0,1,2]);
assert.equal(resolve({trackId:'song',progressMs:5400,playing:true,count:3,enabled:true,segments:applied.segments}).leadSlot,2);
assert.equal(resolve({trackId:'song',progressMs:9800,playing:true,count:3,enabled:true,segments:applied.segments}).active,false);
assert.equal(resolve({trackId:'song',progressMs:2400,playing:false,count:3,enabled:true,segments:applied.segments}).active,false);
assert.equal(resolve({trackId:'song',progressMs:2400,playing:true,count:3,enabled:false,segments:applied.segments}).active,false);
const older=[{startMs:0,endMs:3000,leadSlot:1,partnerSlot:0,style:'solo',strength:80,roleV547:'feature',singerSlotsV547:[1]}];
assert.equal(build(0,defaults(plan.proposals[0]),older).status,'conflict');
const safe=apply({existing:older,reviews:[build(0,defaults(plan.proposals[0]),older)],durationMs,count:3,overrideExisting:false});
assert.deepEqual(safe.segments,older);assert.equal(safe.added,0);assert.equal(safe.skipped,1);
const explicit=apply({existing:older,reviews:[build(0,defaults(plan.proposals[0]),older)],durationMs,count:3,overrideExisting:true});
assert.equal(explicit.added,1);assert.equal(explicit.replaced,1);assert.equal(explicit.segments.length,3);
assert.deepEqual(explicit.segments.map(s=>[s.startMs,s.endMs]),[[0,1000],[2000,3000],[1000,2000]]);
const solo=build(0),backing={...plan.proposals[0],segment:{...plan.proposals[0].segment,roleV547:'adlib'}};
const overlayReview=review({proposal:backing,edit:{...defaults(backing),role:'adlib',style:'solo',leadSlot:2,partnerSlot:0,singerSlots:[2]},count:3,durationMs,existing:older});
assert.equal(overlayReview.status,'ready','adlib overlays an existing main singer');
const backingApply=apply({existing:older,reviews:[overlayReview],durationMs,count:3,overrideExisting:false});
assert.equal(backingApply.added,1);assert.equal(backingApply.segments[0].leadSlot,1);
assert.equal(apply({existing:older,reviews:[solo,solo],durationMs,count:3,overrideExisting:true}).added,1,'no conflicting batch revisions');
assert.equal(apply({existing:older,reviews:[solo],durationMs,count:1,overrideExisting:true}).added,0);
assert.equal(audit(explicit.segments,durationMs,3).coveredMs,3000);
assert.equal(audit(explicit.segments,durationMs,3).conflicts,0);
assert.equal(audit([older[0],{...older[0],leadSlot:2,singerSlotsV547:[2]}],durationMs,3).conflicts,1);
const editor=fs.readFileSync('components/visualizer/VocalTimeEditorV496.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/AdvancedVocalReviewPanelV756.tsx','utf8');
assert(editor.includes('<AdvancedVocalReviewPanelV756'));
assert(ui.includes('proposeVocalAssignmentsV660')&&ui.includes('existing:[]'),'review includes conflicting drafts');
assert(ui.includes('applyVocalReviewsV756')&&ui.includes('overrideExisting:override'));
assert(ui.includes('vocalTimeEnabledV496:true')&&ui.includes('track?.id===trackId?lyrics:null'));
assert(ui.includes('resolveVocalTimeCueV496'));
// Fuzz: intervals, persona edits and overlay must remain valid, never mutate originals.
let checks=0;let seed=12345;
function rng(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
for(let n=0;n<30000;n++){
 const i=Math.floor(rng()*5),item=plan.proposals[i],d=defaults(item),before=JSON.stringify(item),startMs=Math.floor(rng()*9000),endMs=Math.min(10000,startMs+50+Math.floor(rng()*950));
 const prior={startMs,endMs,leadSlot:Math.floor(rng()*3),partnerSlot:0,style:'solo',strength:70,singerSlotsV547:[0]};
 const result=review({proposal:item,edit:d,count:3,durationMs,existing:[prior]});
 const merged=apply({existing:[prior],reviews:[result],durationMs,count:3,overrideExisting:rng()>.5});
 assert.equal(JSON.stringify(item),before);
 assert(merged.segments.length<=120);
 for(const s of merged.segments){assert(s.startMs>=0&&s.endMs>s.startMs&&s.endMs<=10000);assert(s.leadSlot>=0&&s.leadSlot<3);checks+=3;}
 checks++;
}
console.log(`PASS: V756 Advanced Vocal Assignment (edit, preview, conflict, explicit overwrite, hooks, adlibs, precedence, idempotence, ${checks+58} checks)`);
