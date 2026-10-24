require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const m=load('components/visualizer/smartRapPerformanceDirectorV417');
const duet=load('components/visualizer/rapDuetStudioV416');
const read=(p)=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const lines=[
 'Jetzt gehen wir nach vorne', 'Gemeinsam sind wir lauter',
 'In dieser Stadt bin ich zu Haus', 'Du fragst mich? Dann hör mir zu',
 'Ich zieh durch die langen Straßen', 'Bis ich meine Heimat wiederseh',
 'Jetzt gehen wir nach vorne', 'Gemeinsam sind wir lauter',
 'Noch eine Zeile für die Nacht', 'Und dann beginnt die neue Show'
].map((text,i)=>({text,startMs:i*2300+1000,endMs:i*2300+2900}));
const lyrics={provider:'spotify',synced:true,plainText:null,lines};
const call=(args={})=>m.suggestRapScenesV417({lyrics,count:2,existing:[],...args});
const suggestions=call();
assert.deepEqual(suggestions,call(),'same input must yield deterministic suggestions');
assert(suggestions.some(s=>s.signal==='repeated-lines'&&s.assignment.style==='hook'&&s.assignment.fromLine===0));
assert(suggestions.some(s=>s.signal==='repeated-lines'&&s.assignment.style==='hook'&&s.assignment.fromLine===6));
assert(suggestions.some(s=>s.signal==='question-response'&&s.assignment.style==='reply'&&s.assignment.fromLine===3));
assert(suggestions.some(s=>s.signal==='verse-phrase'&&s.assignment.style==='solo'));
assert(suggestions.every(s=>s.assignment.fromLine<=s.assignment.toLine));
assert(suggestions.every(s=>s.confidence>=0&&s.confidence<=1));
assert(suggestions.every(s=>s.assignment.leadSlot>=0&&s.assignment.partnerSlot<2));
const used=[];for(const s of suggestions){for(let i=s.assignment.fromLine;i<=s.assignment.toLine;i++)used.push(i)}
assert.equal(new Set(used).size,used.length,'candidate ranges must never overlap');
assert.deepEqual(call({count:1}),[]);
assert.deepEqual(call({lyrics:null}),[]);
assert.deepEqual(call({lyrics:{...lyrics,synced:false}}),[]);
assert.deepEqual(call({lyrics:{...lyrics,lines:[...lines].reverse()}}),[]);
assert.deepEqual(call({lyrics:{...lyrics,lines:[]}}),[]);
const onlyRepeat={...lyrics,lines:[
 {text:'In dieser Stadt bin ich',startMs:1000,endMs:2000},
 {text:'Eine einzelne Zeile',startMs:2500,endMs:3500},
 {text:'In dieser Stadt bin ich',startMs:4000,endMs:5000},
]};
assert(!call({lyrics:onlyRepeat}).some(s=>s.signal==='repeated-lines'),
 'one repeated line is not enough to infer hook');
const manual={fromLine:0,toLine:2,style:'duet',leadSlot:1,partnerSlot:0,strength:80};
const safe=call({existing:[manual]});
assert(safe.every(s=>s.assignment.fromLine>2), 'do not propose over saved lyrics');
const accepted=m.acceptRapScenesV417([manual],suggestions,lines.length,2);
assert.deepEqual(accepted[0],manual,'saved user choreography remains first and untouched');
assert(accepted.every((s,i)=>i===0||s.fromLine>2),'overlaps with stored user cue must be dropped');
assert.deepEqual(m.acceptRapScenesV417([manual],[],lines.length,2),[manual]);
assert.deepEqual(m.acceptRapScenesV417([manual],suggestions,lines.length,1),[manual]);
assert.equal(m.acceptRapScenesV417([],suggestions,lines.length,2).length,suggestions.length);
assert.equal(m.acceptRapScenesV417(accepted,suggestions,lines.length,2).length,accepted.length,
 'repeated acceptance must be idempotent');
const s=suggestions.find(s=>s.signal==='verse-phrase');
const changed=m.editRapSuggestionV417(s,{style:'duet',leadSlot:1,partnerSlot:0,strength:97},2);
assert.equal(changed.assignment.style,'duet');
assert.equal(changed.assignment.strength,97);
assert.equal(s.assignment.style,'solo','editing a suggestion must not mutate original');
assert.equal(m.editRapSuggestionV417(s,{style:'reply',leadSlot:0,partnerSlot:0},2),s,
 'invalid lead/partner must be rejected');
assert.equal(m.editRapSuggestionV417(s,{leadSlot:17},2),s);
const active=duet.resolveRapDuetCueV416({lyrics,playing:true,progressMs:1200,enabled:true,
 count:2,assignments:m.acceptRapScenesV417([],suggestions,lines.length,2)});
assert.equal(active.style,'hook','approved V417 cue must work with V416 live runtime unchanged');
assert.equal(active.singingSlots.length,2);
const panel=read('components/visualizer/RapSceneSuggestionsPanelV417.tsx');
const parent=read('components/visualizer/RapDuetStudioPanelV416.tsx');
assert(parent.includes('<RapSceneSuggestionsPanelV417 key={id}')&&parent.includes('onAccept={save}'),
 'the suggestions must route through V416 per-track persistence');
for(const symbol of ['onAccept(merged)','onPreview(l.startMs+200)','Vorschläge','Übernehmen','Verwerfen'])
 assert(panel.includes(symbol),'missing explicit editor action '+symbol);
assert(panel.includes('setExpanded(false)')===false,'default closed via useState');
assert(panel.includes('useState(false)'));
assert(read('context/UiPreferencesContext.tsx').includes('rapDuetEnabledV416:false'),
 'stage must remain opt-in');
assert(read('components/visualizer/ThreeAvatar.tsx').includes('!manualCueV385.active'));
console.log('PASS V417: repeat-pair hook suggestions, question/response candidates, phrase grouping, manual no-overwrite, editable/opt-in acceptance, deterministic V416 live integration');
