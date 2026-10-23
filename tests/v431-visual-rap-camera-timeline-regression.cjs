'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {buildRapCameraTimelineV431:build,timelineLineAtV431:at,
  visibleRapCameraWindowV431:window,rapCameraPreviewTimeV431:preview}=load('components/visualizer/rapCameraTimelineV431');
const {saveRapCameraLibraryV430}=load('components/visualizer/rapCameraShotStudioV430');
const lyrics={synced:true,lines:[
  {startMs:1000,endMs:3000,text:'Ich rappe heute'},
  {startMs:3000,endMs:5000,text:'Antwort im Takt'},
  {startMs:5000,endMs:6900,text:'Wir stehen zusammen'},
  {startMs:6900,endMs:8700,text:'Hook im Refrain'},
  {startMs:8700,endMs:9600,text:'Instr. Pause'}
]};
const assignments=[
  {fromLine:0,toLine:0,leadSlot:0,partnerSlot:1,style:'solo',strength:80},
  {fromLine:1,toLine:1,leadSlot:1,partnerSlot:0,style:'reply',strength:90},
  {fromLine:2,toLine:2,leadSlot:0,partnerSlot:1,style:'duet',strength:90},
  {fromLine:3,toLine:3,leadSlot:0,partnerSlot:1,style:'hook',strength:100}
];
const timeline=(opts={})=>build({trackId:'song-A',lyrics,assignments,overrides:[],avatarCount:2,...opts});
assert.deepEqual(timeline().items.map(x=>x.shot),['solo-close','reply-side','duet-wide','hook-push','none']);
assert.equal(timeline().total,5);assert.equal(timeline().assigned,4);
assert.equal(timeline().edited,0);
assert.equal(timeline().items[0].startMs,1000);
assert.equal(timeline().items[0].endMs,3000);
assert.equal(timeline().items[0].durationMs,2000);
const edits=[{lineIndex:1,shot:'hook-push',strength:55},{lineIndex:2,shot:'off',strength:100}];
const before=JSON.stringify(edits);
const altered=timeline({overrides:edits});
assert.equal(altered.items[1].shot,'hook-push');
assert.equal(altered.items[1].authoredShot,'reply-side');
assert.equal(altered.items[1].strength,55);
assert.equal(altered.items[2].shot,'none');
assert.equal(altered.items[2].override,'off');
assert.equal(altered.edited,2);
assert.equal(JSON.stringify(edits),before,'pure projection without mutation');
assert.equal(timeline({overrides:[{lineIndex:1,shot:'hook-push',strength:0}]}).items[1].shot,'none');
assert.equal(timeline({avatarCount:1}).assigned,0,'single avatar disables V416 shots');
assert.equal(timeline({avatarCount:NaN}).assigned,0);
assert.equal(timeline({trackId:''}).items.length,0);
assert.equal(timeline({lyrics:{...lyrics,synced:false}}).total,0);
assert.equal(timeline({lyrics:null}).total,0);
assert.equal(timeline({assignments:null}).assigned,0);
assert.equal(timeline({overrides:JSON.parse('{"__proto__":{"shot":"hook-push"}}')}).edited,0);
assert.equal(timeline({assignments:[...assignments,{...assignments[0],style:'hook'}]}).items[0].shot,'hook-push','last authored assignment wins');
assert.equal(timeline({assignments:[...assignments,{...assignments[0],leadSlot:3}]}).items[0].shot,'solo-close','out-of-range cast ignored');
assert.equal(at(altered.items,0),-1);
assert.equal(at(altered.items,1000),0);
assert.equal(at(altered.items,2999),0);
assert.equal(at(altered.items,3000),1);
assert.equal(at(altered.items,9600),-1);
assert.equal(at(altered.items,-1),-1);
assert.equal(at(altered.items,NaN),-1);
assert.equal(preview(altered.items[0]),1220);
assert.equal(preview({startMs:100,endMs:120,durationMs:20}),110,'short scene midpoint');
const cropped=window(altered.items,3,1);
assert.deepEqual(cropped.items.map(x=>x.lineIndex),[2,3,4]);
assert.equal(window(altered.items,0,1).items.length,3);
assert.equal(window(altered.items,500,1).items.length,3);
assert.equal(window(altered.items,0,100).items.length,5,'viewport bounded');
const corrupted=timeline({lyrics:{...lyrics,lines:[{startMs:NaN,endMs:400,text:'broken'},
  {startMs:300,endMs:null,text:'A'},{startMs:400,endMs:450,text:'B'}]}});
assert.equal(corrupted.total,2);assert.equal(corrupted.items[0].lineIndex,1);
assert.equal(corrupted.items[0].endMs,400);
const tooLong=timeline({lyrics:{...lyrics,lines:Array.from({length:8000},(_,i)=>({startMs:i*200,endMs:i*200+180,text:'line'}))},assignments:[]});
assert.equal(tooLong.total,5000,'bounded projection for long lyric files');
const library=saveRapCameraLibraryV430({},'song-A',1,'solo-close',30);
assert.equal(timeline({overrides:library['song-A']}).items[1].shot,'solo-close');
assert.equal(timeline({overrides:library['song-B']}).items[1].shot,'reply-side','no edits from another title');
// UI and integration contract: preview only, reuse V430 selected-line editor, no Spotify seek.
const panel=fs.readFileSync('components/visualizer/RapCameraTimelinePanelV431.tsx','utf8');
const parent=fs.readFileSync('components/visualizer/ExpressiveRapDirectorPanelV425.tsx','utf8');
const older=fs.readFileSync('components/visualizer/RapCameraShotStudioPanelV430.tsx','utf8');
for(const token of ['Kamera-Shots entlang der Lyrics-Zeitachse','onClick={()=>focus(item)}',
  'RapCameraCompositionPreviewV431','aria-current','rapCameraOverridesV430',
  'rapDuetAssignmentsV416','Spotify-Wiedergabe','Miniaturen sind schematische',
  'visibleRapCameraWindowV431'])assert(panel.includes(token),`missing timeline UI: ${token}`);
assert(parent.includes('RapCameraTimelinePanelV431'));
assert(parent.includes('onPreview={setPreviewMs}'));
assert(parent.indexOf('RapCameraTimelinePanelV431 trackId')<parent.indexOf('<RapCameraShotStudioPanelV430 key='));
assert(older.includes('Kameraeinstellung für diese Zeile speichern'));
assert(!panel.includes('seekTo(')&&!panel.includes('setProgressMs('),'preview must not seek');
const camera=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
assert(camera.includes('applyRapCameraShotV430')&&camera.includes('advanceRapCameraHoldV429'));
const pkg=require('../package.json');
assert(/^0\.1\.0-v(?:43[1-9]|4[4-9]\d|[5-9]\d\d)$/.test(pkg.version),'V431 persists in future releases');
assert(pkg.scripts['build:preflight'].includes('test:v431'));
assert(pkg.scripts['verify:offline:fast'].includes('test:v431'));
console.log('PASS V431 visual rap-camera timeline: authored scene projection, overrides, safe preview, bounded window, track isolation, UI integration');
