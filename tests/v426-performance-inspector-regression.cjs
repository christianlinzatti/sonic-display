'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {inspectRapPerformanceV426:inspect,normalizeInspectorDraftV426:edit}=load('components/visualizer/rapPerformanceInspectorV426');
const lyrics={synced:true,lines:[
 {startMs:1000,endMs:1800,text:'Bam kurz Hallo',words:[{startMs:1000,endMs:1140,text:'Bam'},{startMs:1140,endMs:1320,text:'kurz'},{startMs:1330,endMs:1780,text:'Hallo'}]},
 {startMs:2000,endMs:2700,text:'Hook das ist fein',words:[{startMs:2000,endMs:2140,text:'Hook'},{startMs:2150,endMs:2300,text:'das'},{startMs:2300,endMs:2700,text:'fein'}]},
 {startMs:3000,endMs:3900,text:'Zeile ohne Wörter',words:[]},
]};
const scenes=[{fromLine:0,toLine:1,leadSlot:0,partnerSlot:1,style:'duet',strength:80},{fromLine:1,toLine:1,leadSlot:1,partnerSlot:0,style:'hook',strength:80}];
const doc={version:1,trackId:'t1',avatarId:'glb1',cues:[{lineIndex:0,wordIndex:0,startMs:900,kind:'arms',strength:80,durationMs:300,motionId:''},
 {lineIndex:0,wordIndex:1,startMs:1140,kind:'head',strength:80,durationMs:300,motionId:''}]};
const opts={lyrics,trackId:'t1',avatarId:'glb1',gestureDocument:doc,assignments:scenes,mouthDocument:{trackId:'t1',edits:[]},count:2,
 startMs:0,endMs:4000,syllablesEnabled:true,syllableSmoothness:50,expressionEnabled:true,expressionStrength:90,reducedMotion:false};
const review=inspect(opts);
for(const lane of ['lyrics','mouth','articulation','gesture','expression','rapper'])assert(review.events.some(e=>e.lane===lane),`missing ${lane}`);
for(const kind of ['smoothness','expression','remove-role','remove-gesture'])assert(review.proposals.some(p=>p.kind===kind),`missing ${kind}`);
assert(review.notes.some(n=>n.id==='line-only:2'));
assert(review.events.filter(e=>e.lane==='gesture').length===1,'stale gestures excluded from live lane');
assert(review.events.some(e=>e.lane==='lyrics'&&e.source==='provider'));
assert(review.events.some(e=>e.lane==='expression'&&e.source==='estimate'));
assert(review.proposals.every(p=>p.atMs>=0&&p.atMs<4000));
assert.deepEqual(inspect({...opts,trackId:'',}),{events:[],proposals:[],notes:[]});
assert.equal(inspect({...opts,gestureDocument:{...doc,trackId:'other'}}).proposals.some(p=>p.kind==='remove-gesture'),false);
assert.equal(inspect({...opts,expressionEnabled:false}).events.some(e=>e.lane==='expression'),false);
assert.equal(inspect({...opts,expressionEnabled:false}).proposals.some(p=>p.kind==='expression'),false);
assert.equal(inspect({...opts,syllablesEnabled:false}).proposals.some(p=>p.kind==='smoothness'),false);
assert.equal(inspect({...opts,reducedMotion:true}).events.some(e=>e.lane==='expression'),false);
assert.equal(inspect({...opts,count:1}).proposals.some(p=>p.kind==='expression'),false,'no inactive solo hook proposal');
assert.deepEqual(inspect({...opts,lyrics:{...lyrics,synced:false}}),{events:[],proposals:[],notes:[]});
assert.deepEqual(inspect({...opts,startMs:3500,endMs:3500}),{events:[],proposals:[],notes:[]});
assert.equal(inspect({...opts,mouthDocument:{trackId:'t1',edits:[{startMs:1000,text:'bam',frames:[],strength:80}]}}).proposals.some(p=>p.id==='smooth:0:0'),false,'manual edit never overwritten');
const sample=review.proposals.find(p=>p.kind==='smoothness');
assert.equal(edit(sample,Number.POSITIVE_INFINITY),0,'nonfinite input cannot be persisted');
assert.equal(edit(sample,250),100);assert.equal(edit(sample,-60),0);
assert.equal(edit(review.proposals.find(p=>p.kind==='remove-role'),25),null);
const panel=fs.readFileSync('components/visualizer/RapPerformanceInspectorPanelV426.tsx','utf8');
for(const token of ['A · Aktuelle Einstellungen','B · Vorschlag','Diesen Vorschlag ausdrücklich übernehmen','setFollow(false)','onPreviewMouth(','onPreviewGesture(','saveRapGestureDocumentV414','normalizeRapDuetAssignmentsV416','resolveVocalPerformanceQualityV374'])
 assert(panel.includes(token),`expected V426 panel integration: ${token}`);
const editor=fs.readFileSync('components/visualizer/RapPerformanceEditorPanelV408.tsx','utf8');
assert(editor.includes('<RapPerformanceInspectorPanelV426 avatarId={current?.id??""}'));
assert(editor.includes('<RapPerformanceQualityInspectorV418'));
const pkg=require('../package.json');assert.ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 426);assert(pkg.scripts['build:preflight'].includes('test:v426'));
console.log('PASS V426 unified timing lanes, authored/estimated sources, diagnostics, track isolation, manual precedence, A/B preview and wiring');
