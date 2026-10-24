require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(file){const output=ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};new Function('module','exports','require',output)(module,module.exports,()=>{throw Error('pure engine should have type-only dependencies')});return module.exports;}
const v=load('components/visualizer/intelligentFootLockV322.ts');
const settings={...v.DEFAULT_FOOT_LOCK_V322,enabled:true};
assert.equal(v.DEFAULT_FOOT_LOCK_V322.enabled,false,'opt in only');
assert.deepEqual(v.normalizeFootLockV322({enabled:'true',anchorStrength:NaN,releaseSpeed:250,floorTracking:-4,maxCorrectionCm:Infinity}),
 {...v.DEFAULT_FOOT_LOCK_V322,releaseSpeed:100,floorTracking:0});
let state=v.createGroundLockStateV322();
const pos=(x,y=0,z=0)=>({x,y,z});
const probe=(position,phase='planted',confidence=1,verticalSpeed=0)=>({position,phase,confidence,verticalSpeed,legLength:1.6,delta:1/60,floorY:0});
let first=v.updateFootLockTargetV322(state.left,probe(pos(0)),settings);
assert.equal(first.locked,true);assert.equal(first.x,0);const saved=JSON.stringify(state.left.point);
for(let i=0;i<15;i++)first=v.updateFootLockTargetV322(state.left,probe(pos(.032)),settings);
assert.ok(first.x<.032,'plant resists horizontal drift');assert.equal(JSON.stringify(state.left.point),saved,'world anchor never follows drift');
assert.ok(first.weight<=1&&first.weight>=0);assert.ok(first.slip>.03);
// Extremely distant targets cannot force teleport corrections.
const huge=v.updateFootLockTargetV322(state.left,probe(pos(.24)),settings);
assert.ok(huge.x>.16,'max correction is bounded');
let released=v.updateFootLockTargetV322(state.left,probe(pos(.25,.2),'airborne',0,1),settings);
assert.equal(released.locked,false);
for(let i=0;i<30;i++)released=v.updateFootLockTargetV322(state.left,probe(pos(.4,.25),'airborne',0,1),settings);
assert.ok(released.weight<.02,'released foot fades out');
// New plant captures a new anchor rather than pulling toward the old footprint.
const reacquired=v.updateFootLockTargetV322(state.left,probe(pos(1)),settings);
assert.equal(reacquired.locked,true);assert.ok(Math.abs(state.left.point.x-1)<1e-10);assert.equal(reacquired.x,1);
// Clamping must work at extremely low fps and malformed inputs.
const bad=v.updateFootLockTargetV322(state.right,probe({x:Infinity,y:NaN,z:-Infinity},'planted',NaN,NaN),settings);
for(const key of ['x','y','z','weight','slip'])assert.ok(Number.isFinite(bad[key]),key);
// No false anchoring with only candidate contact or foot above floor.
const candidate=v.createFootAnchorV322();
assert.equal(v.updateFootLockTargetV322(candidate,probe(pos(0),'candidate',.8),settings).locked,false);
assert.equal(v.updateFootLockTargetV322(candidate,probe(pos(0,.5),'planted',1),settings).locked,false);
state=v.createGroundLockStateV322();
assert.equal(v.updateGroundEstimateV322(state,[{position:pos(0,0),phase:'airborne',confidence:0},{position:pos(0,.1),phase:'airborne',confidence:0}],.016,settings,1.6),0);
const before=state.floorY;
for(let i=0;i<60;i++)v.updateGroundEstimateV322(state,[{position:pos(0,.007),phase:'planted',confidence:.96}],.016,settings,1.6);
assert.ok(state.floorY>before&&state.floorY<.007,'ground estimates may adjust only gradually');
assert.equal(v.updateGroundEstimateV322(state,[{position:pos(0,4),phase:'planted',confidence:1}],.016,settings,1.6),state.floorY,'flying avatar cannot drag floor estimate');
state=v.createGroundLockStateV322();
assert.equal(v.isFootLockDiscontinuityV322(state,'track-a',1000),false);
assert.equal(v.isFootLockDiscontinuityV322(state,'track-a',1020),false);
assert.equal(v.isFootLockDiscontinuityV322(state,'track-a',110),true,'seek backwards resets');
v.resetGroundLockV322(state);assert.equal(state.floorY,null);assert.equal(state.left.active,false);
assert.equal(v.isFootLockDiscontinuityV322(state,'track-a',3000),false);
assert.equal(v.isFootLockDiscontinuityV322(state,'track-b',3016),true,'track changes reset');
const reported=v.groundLockReportV322(state);assert.deepEqual(Object.keys(reported),['leftLocked','rightLocked','leftSlipCm','rightSlipCm','floorY']);
let events=[];let store=new Map();global.Event=class{constructor(type){this.type=type}};
global.window={localStorage:{getItem:k=>store.get(k)??null,setItem:(k,x)=>store.set(k,x)},dispatchEvent:event=>events.push(event.type)};
v.writeFootLockV322({...settings,anchorStrength:90});assert.equal(v.readFootLockV322().anchorStrength,90);assert.deepEqual(events,[v.FOOT_LOCK_EVENT_V322]);
store.set(v.FOOT_LOCK_KEY_V322,'invalid');assert.equal(v.refreshFootLockV322().enabled,false);
delete global.window;delete global.Event;
const ik=read('components/visualizer/avatarFootIK.ts');for(const marker of ['updateGroundEstimateV322','updateFootLockTargetV322','resetGroundLockV322','optionsV322?.enabled','solveLeg(leg,new Vector3'])assert.ok(ik.includes(marker),marker);
const scene=read('components/visualizer/ThreeAvatar.tsx');for(const marker of ['readFootLockV322()','FOOT_LOCK_DIAGNOSTIC_EVENT_V322','groundLockReportV322'])assert.ok(scene.includes(marker),marker);
const preview=read('components/visualizer/AvatarPreview3D.tsx');assert.ok(preview.includes('readFootLockV322()'));
const ui=read('components/visualizer/IntelligentFootLockControlsV322.tsx');for(const marker of ['Maximale Korrektur','Fußverankerung','Standphase','Reduced Motion'])assert.ok(ui.includes(marker),marker);
assert.ok(read('components/visualizer/StageDirectorControlsV287.tsx').includes('<IntelligentFootLockControlsV322 />'));
const pkg=require('../package.json');assert.ok(['0.1.0-v322','0.1.0-v324','0.1.0-v325','0.1.0-v326','0.1.0-v329','0.1.0-v330','0.1.0-v331','0.1.0-v332','0.1.0-v333','0.1.0-v334','0.1.0-v335','0.1.0-v336','0.1.0-v337','0.1.0-v338','0.1.0-v339','0.1.0-v340','0.1.0-v341','0.1.0-v342','0.1.0-v343','0.1.0-v346','0.1.0-v347','0.1.0-v349','0.1.0-v350','0.1.0-v351','0.1.0-v352','0.1.0-v353','0.1.0-v354','0.1.0-v355','0.1.0-v356','0.1.0-v357','0.1.0-v358','0.1.0-v359','0.1.0-v360','0.1.0-v361','0.1.0-v362','0.1.0-v363','0.1.0-v364','0.1.0-v365','0.1.0-v366','0.1.0-v367','0.1.0-v368','0.1.0-v369','0.1.0-v370','0.1.0-v371','0.1.0-v372','0.1.0-v373','0.1.0-v374','0.1.0-v375','0.1.0-v376','0.1.0-v377','0.1.0-v378','0.1.0-v379','0.1.0-v380','0.1.0-v381','0.1.0-v382','0.1.0-v383','0.1.0-v384','0.1.0-v385','0.1.0-v386','0.1.0-v387','0.1.0-v390','0.1.0-v391','0.1.0-v392','0.1.0-v393','0.1.0-v394','0.1.0-v395','0.1.0-v396','0.1.0-v397','0.1.0-v390','0.1.0-v391','0.1.0-v398','0.1.0-v399','0.1.0-v400','0.1.0-v401', '0.1.0-v402','0.1.0-v403','0.1.0-v404','0.1.0-v405','0.1.0-v406','0.1.0-v407','0.1.0-v408','0.1.0-v409','0.1.0-v411','0.1.0-v412','0.1.0-v413','0.1.0-v414','0.1.0-v415','0.1.0-v416','0.1.0-v417','0.1.0-v418','0.1.0-v419','0.1.0-v420','0.1.0-v422','0.1.0-v424','0.1.0-v425','0.1.0-v426'].includes(pkg.version) || Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=481);assert.ok(pkg.scripts['verify:offline'].includes('test:v322'));
console.log('PASS V322: contact acquisition, release, bounded world anchors, jumps, floor estimate, storage, integration, diagnostics');
