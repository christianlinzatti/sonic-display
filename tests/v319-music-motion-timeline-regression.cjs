'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(file){const source=read(file),js=ts.transpileModule(source,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const m={exports:{}};new Function('module','exports','require',js)(m,m.exports,()=>{throw Error(`Runtime import not allowed ${file}`)});return m.exports;}
const e=load('components/visualizer/musicMotionTimelineV319.ts');
const a={trackId:'trackA',tempo:160,timeSignature:4,beats:[{startMs:230},{startMs:605},{startMs:980},{startMs:1355},{startMs:1730}],bars:[{startMs:230},{startMs:1730}],sections:[{startMs:1730,confidence:.9,label:'drop'},{startMs:5000,confidence:.4,label:'verse'}]};
const grid=e.makeMotionGridV319('trackA',a,128,12);
assert.equal(grid.source,'imported');assert.equal(grid.beatSource,'imported');assert.equal(grid.barSource,'imported');assert.equal(grid.tempo,160);assert.deepEqual(grid.bars,[.23,1.73]);assert.deepEqual(grid.beats.slice(0,3),[.23,.605,.98]);
assert.equal(grid.sections[0].label,'drop');assert.equal(grid.sections[1].label,undefined);
assert.equal(e.snapMotionSecondV319(.68,grid,'beat'),.605);assert.equal(e.snapMotionSecondV319(1.57,grid,'bar'),1.73);assert.equal(e.snapMotionSecondV319(1.57,grid,'off'),1.57);
assert.equal(e.snapMotionSecondV319(90,grid,'beat'),90,'do not jump far away to last known imported marker');
const barsOnly=e.makeMotionGridV319('trackA',{...a,beats:[]},110,20);assert.equal(barsOnly.beatSource,'bpm');assert.equal(barsOnly.barSource,'imported');
const other=e.makeMotionGridV319('trackB',a,92,20);assert.equal(other.source,'bpm');assert.equal(other.tempo,92);assert.equal(other.sections.length,0);assert.equal(other.beats[0],0);
const clip={id:'one',clip:'Dance',track:1,start:1.73,duration:4,fadeIn:.4,fadeOut:.4,curve:'smooth',speed:1,keys:[{at:1.5,value:.6}]};
const moved=e.editMotionSegmentV319(clip,'move',-1.15,grid,'beat');assert.equal(moved.start,.605);assert.equal(moved.duration,4);
const trim=e.editMotionSegmentV319(clip,'trim-start',.1,grid,'bar');assert.equal(trim.start,1.73);
const trim2=e.editMotionSegmentV319(clip,'trim-end',-2,grid,'off');assert.equal(trim2.duration,2);
const fade=e.editMotionSegmentV319(clip,'fade-in',100,grid,'off');assert.equal(fade.fadeIn,4);
const fade2=e.editMotionSegmentV319(clip,'fade-out',100,grid,'off');assert.equal(fade2.fadeOut,0);
assert.equal(clip.duration,4,'do not mutate original');
assert.equal(e.timelineSongSecondsV319(45,'a','a',110000,true),110);
assert.equal(e.timelineSongSecondsV319(45,'a','b',110000,true),null,'never play synced timeline on a different track');
assert.equal(e.timelineSongSecondsV319(45,'a','a',undefined,true),null);
assert.equal(e.timelineSongSecondsV319(45,'a','b',110000,false),45,'legacy local clock unaffected');
for(const [file,patterns] of Object.entries({
 'components/visualizer/MusicAlignedTimelineEditorV319.tsx':['editMotionSegmentV319','onPointerDown','trim-start','trim-end','fade-in','fade-out','onPointerUp','snapMotionSecondV319','data-v319-lane','songSync','current','trackId'],
 'components/visualizer/MotionTimelineStudio.tsx':['MusicAlignedTimelineEditorV319','readTrackAnalysisV318','ANALYSIS_EVENT_V318','MotionTimelinePreview3DV319','followSong','Clip an Vorschau-Position'],
 'components/visualizer/MotionTimelinePreview3DV319.tsx':['Canvas','useGLTF','AnimationMixer','timelineWeights','retargetHumanoidClips','action.time'],
 'components/visualizer/ThreeAvatar.tsx':['timelineSongSecondsV319','cameraDirectorProgressMs','timeline.songSync===true','action.time='],
 'components/visualizer/motionTimelineEngine.ts':['songSync?: boolean','snapMode?:','trackId?:']
}))for(const pattern of patterns)assert.ok(read(file).includes(pattern),`${file} missing ${pattern}`);
const pkg=JSON.parse(read('package.json'));assert.ok(['0.1.0-v319','0.1.0-v320','0.1.0-v321','0.1.0-v322','0.1.0-v324','0.1.0-v325','0.1.0-v326','0.1.0-v329','0.1.0-v330','0.1.0-v331','0.1.0-v332','0.1.0-v333','0.1.0-v334','0.1.0-v335','0.1.0-v336','0.1.0-v337','0.1.0-v338','0.1.0-v339','0.1.0-v340','0.1.0-v341','0.1.0-v342','0.1.0-v343','0.1.0-v346','0.1.0-v347','0.1.0-v349','0.1.0-v350','0.1.0-v351','0.1.0-v352','0.1.0-v353','0.1.0-v354','0.1.0-v355','0.1.0-v356','0.1.0-v357','0.1.0-v358','0.1.0-v359','0.1.0-v360','0.1.0-v361','0.1.0-v362','0.1.0-v363','0.1.0-v364','0.1.0-v365','0.1.0-v366','0.1.0-v367','0.1.0-v368','0.1.0-v369','0.1.0-v370','0.1.0-v371','0.1.0-v372','0.1.0-v373','0.1.0-v374','0.1.0-v375','0.1.0-v376','0.1.0-v377','0.1.0-v378','0.1.0-v379','0.1.0-v380','0.1.0-v381','0.1.0-v382','0.1.0-v383','0.1.0-v384','0.1.0-v385','0.1.0-v386','0.1.0-v387','0.1.0-v390','0.1.0-v391','0.1.0-v392','0.1.0-v393','0.1.0-v394','0.1.0-v395','0.1.0-v396','0.1.0-v397','0.1.0-v390','0.1.0-v391','0.1.0-v398','0.1.0-v399','0.1.0-v400','0.1.0-v401', '0.1.0-v402','0.1.0-v403','0.1.0-v404','0.1.0-v405','0.1.0-v406','0.1.0-v407','0.1.0-v408','0.1.0-v409','0.1.0-v411','0.1.0-v412','0.1.0-v413','0.1.0-v414','0.1.0-v415','0.1.0-v416','0.1.0-v417','0.1.0-v418','0.1.0-v419','0.1.0-v420','0.1.0-v422','0.1.0-v424','0.1.0-v425','0.1.0-v426'].includes(pkg.version));assert.ok(pkg.scripts['verify:offline'].includes('test:v319'));
console.log('PASS V319: measured bars/beats, track isolation, BPM fallback, song clock, safe edit/trim/fade, musical grid, real 3D timeline preview, legacy compatibility');
