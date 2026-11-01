'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {proposeVocalAssignmentsV660:plan,mergeVocalProposalsV660:merge}=load('components/visualizer/smartVocalAssignmentV660');
const lyrics=lines=>({provider:'spotify',synced:true,plainText:null,lines:lines.map(([text,startMs,endMs])=>({text,startMs,endMs,words:[]}))});
const main=lyrics([['Intro verse',0,1000],['Continuation',1000,2000],['Adlib',2000,2500],['Next verse',2500,3900],['Outro',3900,4500]]);
const manual=[{fromLine:0,toLine:1,role:'lead',slot:0},{fromLine:2,toLine:2,role:'feature',slot:1}];
const rap=[{fromLine:0,toLine:3,leadSlot:1,partnerSlot:0,style:'solo',strength:60}];
const p=plan({lyrics:main,durationMs:4600,avatarCount:3,manual,rapDuet:rap,existing:[]});
assert(p.proposals.length>=3);
assert.equal(p.proposals[0].origin,'manual-lines');
assert.equal(p.proposals[0].segment.leadSlot,0);
assert.equal(p.proposals[0].segment.endMs,2000,'adjacent authored lines can merge');
assert.equal(p.proposals[1].segment.roleV547,'feature');
assert.equal(p.proposals[1].segment.leadSlot,1);
assert.equal(p.proposals[2].origin,'rap-duet');
assert.equal(p.proposals[2].segment.leadSlot,1);
// The separate explicit vocal marker never identifies a speaker without an author-supplied slot.
const tagged=lyrics([
 ['[vocal:feature:2] Verse',0,1000],['[vocal:adlib:3] Uh',1000,2000],
 ['[vocal:duet:1,2] Hook',2000,3000],['[vocal:hook:1,2,3] Together',3000,4000],
 ['feat. Artist A',4000,5000],['[verse:Artist B] Unsourced',5000,6000],
 ['[vocal:lead:4] Unsupported avatar',6000,7000],['[vocal:lead:2,3] Invalid solo',7000,8000],
 ['[vocal:adlib:1,1] Duplicate',8000,9000]
]);
const t=plan({lyrics:tagged,durationMs:9000,avatarCount:3,manual:[],rapDuet:[],existing:[]});
assert.deepEqual(t.proposals.map(x=>x.segment.roleV547),['feature','adlib','verse','hook']);
assert.deepEqual(t.proposals[2].segment.singerSlotsV547,[0,1]);
assert.deepEqual(t.proposals[3].segment.singerSlotsV547,[0,1,2]);
// Avoid replacing existing user-edited segments; allow an independent backing adlib overlay.
const timebase=lyrics([['[vocal:lead:1] Main',0,2000],['[vocal:adlib:2] Echo',2000,3500]]);
const existing=[{startMs:0,endMs:2000,leadSlot:1,partnerSlot:0,style:'solo',roleV547:'feature',strength:60,singerSlotsV547:[1]}];
const e=plan({lyrics:timebase,durationMs:3600,avatarCount:3,manual:[],rapDuet:[],existing});
assert.equal(e.skippedExisting,1);
assert.equal(e.proposals.length,1);
const saved=merge(existing,e.proposals,3600);
assert.equal(saved.added,1);assert.equal(saved.segments[0].leadSlot,1);
assert.equal(merge(saved.segments,e.proposals,3600).added,0,'acceptance must be idempotent');
const backing=plan({lyrics:lyrics([['[vocal:adlib:2] echo',0,900]]),durationMs:1200,avatarCount:3,manual:[],rapDuet:[],existing});
assert.equal(backing.proposals.length,1,'adlib can overlay lead');
// V416 call / response split is authorized by a saved editorial rule, not audio inference.
const reply=plan({lyrics:lyrics([['Rap reply',0,2000]]),durationMs:2500,avatarCount:3,manual:[],rapDuet:[{fromLine:0,toLine:0,leadSlot:0,partnerSlot:2,style:'reply',strength:70}],existing:[]});
assert.equal(reply.proposals.length,2);
assert.deepEqual(reply.proposals.map(x=>x.segment.leadSlot),[0,2]);
assert.equal(reply.proposals[0].segment.endMs,1240);
// Wrong track data and malformed timestamps produce no fabricated or cross-song assignments.
assert.equal(plan({lyrics:null,durationMs:3000,avatarCount:3,manual,rapDuet:rap,existing:[]}).proposals.length,0);
assert.equal(plan({lyrics:{...main,synced:false},durationMs:4600,avatarCount:3,manual,rapDuet:rap,existing:[]}).proposals.length,0);
assert.equal(plan({lyrics:tagged,durationMs:9000,avatarCount:1,manual:[],rapDuet:[],existing:[]}).proposals.length,0);
// 200 lines should not create unbounded writes; selection may be applied only after review.
const many=lyrics(Array.from({length:180},(_,i)=>[`[vocal:${i%2?'lead':'feature'}:${i%2?1:2}] text`,i*1200,i*1200+800]));
const large=plan({lyrics:many,durationMs:220000,avatarCount:3,manual:[],rapDuet:[],existing:[]});
assert.equal(large.proposals.length,120);assert.equal(large.truncated,true);
const editor=fs.readFileSync('components/visualizer/VocalTimeEditorV496.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/SmartVocalAssignmentPanelV660.tsx','utf8');
assert(editor.includes('<SmartVocalAssignmentPanelV660'));
assert(ui.includes('mergeVocalProposalsV660')&&ui.includes('onClick={accept}'));
assert(ui.includes('vocalTimeEnabledV496:true')&&ui.includes('track?.id===trackId?lyrics:null'));
console.log('PASS: V660 evidence-bound casting, editorial priorities, hook/adlibs, conflict protection, 120-cap and opt-in UI');
