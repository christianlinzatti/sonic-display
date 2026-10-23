const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
const read=p=>fs.readFileSync(p,'utf8');
const js=ts.transpileModule(read('services/stageContent/smartStageCompositionV351.ts'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const moduleForTest={exports:{}};
new Function('module','exports',js)(moduleForTest,moduleForTest.exports);
const s=moduleForTest.exports;
assert.equal(s.DEFAULT_SMART_STAGE_V351.enabled,true);
assert.equal(s.readSmartStageV351().enabled,true,'SSR should never need localStorage');
const defaults=s.DEFAULT_SMART_STAGE_V351;
const intro={section:'verse',lyricsActive:true,lyricsSide:'right',screenCount:3,avatarCount:2,playing:true,reducedMotion:false,beatAccent:.6};
const verse=s.decideSmartStageV351(intro,defaults);
assert.equal(verse.active,true);assert.equal(verse.focus,'lyrics');assert(verse.protectLyrics);
assert(verse.maxPhotos<=2);assert(verse.photoOpacity<1);assert(verse.beamGain<1);
assert(verse.fxGain<1);assert(verse.minCameraZ>5);assert(verse.minFov>=38);assert(verse.lyricsOffsetX>0);
const drop=s.decideSmartStageV351({...intro,section:'drop',beatAccent:1},defaults);
assert.equal(drop.focus,'avatars');assert(drop.maxPhotos>=verse.maxPhotos);
assert(drop.photoOpacity>=verse.photoOpacity);
const noLyrics=s.decideSmartStageV351({...intro,lyricsActive:false,section:'verse'},defaults);
assert.equal(noLyrics.focus,'photos');assert.equal(noLyrics.photoOpacity,1);
assert.equal(noLyrics.lyricsOffsetX,0);
const empty=s.decideSmartStageV351({...intro,lyricsActive:false,screenCount:0},defaults);
assert.equal(empty.minCameraZ,0,'composition must not reframe an empty stage');
assert.equal(empty.minFov,0);
assert.equal(s.guardAutomaticCameraV351(cameraEmpty(),empty).x,2,'empty stage does not clip camera sway');
function cameraEmpty(){return {x:2,z:3,fov:32};}
const manual=s.decideSmartStageV351({...intro,section:'drop'}, {...defaults,focus:'photos'});
assert.equal(manual.focus,'photos');assert.equal(manual.protectLyrics,true,'manual focus cannot remove lyrics protection');
const stopped=s.decideSmartStageV351({...intro,playing:false,reducedMotion:true},defaults);
assert.equal(stopped.photoMotionCap,0);assert.equal(stopped.maxPhotos,2);
const disabled=s.decideSmartStageV351(intro,{...defaults,enabled:false});
assert.equal(disabled.active,false);assert.equal(disabled.photoOpacity,1);
assert.equal(disabled.beamGain,1);
const clamped=s.sanitizeSmartStageV351({enabled:false,focus:'INVALID',lyricsProtection:-200,clearance:42,maxPanelScale:0,cameraProtection:NaN});
assert.equal(clamped.enabled,false);assert.equal(clamped.focus,'auto');assert.equal(clamped.lyricsProtection,0);
assert.equal(clamped.clearance,1);assert.equal(clamped.maxPanelScale,.4);assert.equal(clamped.cameraProtection,.7);
const camera={x:3,z:2.5,fov:28,targetX:1};
const guarded=s.guardAutomaticCameraV351(camera,verse);
assert(guarded.z>=verse.minCameraZ);assert(guarded.fov>=verse.minFov);
assert(Math.abs(guarded.x)<=verse.maxCameraSway);assert.equal(guarded.targetX,1);
assert.equal(camera.z,2.5,'never mutate authored camera poses');
assert.equal(s.guardAutomaticCameraV351(camera,disabled),camera,'disabled must be strictly noninterfering');
const photo={active:false,visiblePhotos:8,photoOpacity:1,photoMotion:1};
const coordinated=s.coordinatePhotosV351(photo,verse);
assert(coordinated.active);assert.equal(coordinated.visiblePhotos,2);
assert(coordinated.photoOpacity<1);assert(coordinated.photoMotion<1);
assert.equal(photo.active,false,'do not mutate V350 decision');
assert.equal(s.coordinatePhotosV351(photo,disabled),photo);
const inputs=[
 {id:'main',enabled:true,x:0,y:1.1,z:-3.9,scale:1,yaw:0},
 {id:'right',enabled:true,x:3.5,y:1.1,z:-2.5,scale:1,yaw:0},
 {id:'left',enabled:true,x:-3.5,y:1.1,z:-2.5,scale:1,yaw:0},
 {id:'duplicate',enabled:true,x:3.5,y:1.1,z:-2.5,scale:1,yaw:0},
 {id:'hidden',enabled:false,x:0,y:1,z:-2,scale:1,yaw:0},
];
const placed=s.composeStagePanelsV351(inputs,verse);
assert.equal(placed.length,inputs.length);assert.deepEqual(placed.map(x=>x.id),inputs.map(x=>x.id));
assert(placed[0].z<=-3.8,'rear screens should stay behind dancers');
assert(placed[0].scale<=verse.screenScale,'rear display size bounded');
assert(placed[1].x>inputs[1].x,'same-side panel must avoid right-side lyrics');
assert(placed[1].scale<inputs[1].scale);assert(placed[2].scale<=.72);
assert(placed[3].y!==placed[1].y || placed[3].scale<placed[1].scale,'duplicate side screen must be softened/repositioned');
assert.strictEqual(placed[4],inputs[4],'hidden screen must not move');
assert.deepEqual(inputs[1],{id:'right',enabled:true,x:3.5,y:1.1,z:-2.5,scale:1,yaw:0});
assert.deepEqual(s.composeStagePanelsV351(inputs,disabled),inputs);
const back=s.composeLegacyPlacementV351({x:0,y:1,z:-3.9,scale:1.4,yaw:0},verse);
assert(back.scale<=verse.screenScale);
const front=s.composeLegacyPlacementV351({x:0,y:1,z:-2,scale:1.4,yaw:0},verse);
assert(Math.abs(front.x)>=3.1,'front panel should leave center stage clear');
const saved=new Map(),events=[];
global.window={localStorage:{getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)},dispatchEvent:e=>events.push(e.type)};
global.Event=class{constructor(type){this.type=type}};
const changed=s.saveSmartStageV351({...defaults,focus:'photos',clearance:.45});
assert.equal(changed.focus,'photos');assert.equal(s.readSmartStageV351().clearance,.45);
assert(events.includes(s.SMART_STAGE_EVENT_V351));assert(!saved.get(s.SMART_STAGE_KEY_V351).includes('http'));
delete global.window;delete global.Event;
for(const p of ['components/visualizer/ThreeAvatar.tsx','components/visualizer/StageContentScreenV330.tsx','components/visualizer/StageContentScreensV333.tsx',
'components/visualizer/DynamicStage.tsx','components/visualizer/StageCameraDirectorV289.tsx','components/visualizer/SmartStageCameraV236.tsx',
'components/visualizer/Lyrics3DScene.tsx'])assert.match(read(p),/compositionV351|SmartStageCueV351|coordinatePhotosV351|guardAutomaticCameraV351/,'stage wiring in '+p);
assert.match(read('components/visualizer/GalleryPreviewEditorV343.tsx'),/SmartStageCompositionSettingsV351/);
assert.match(read('components/visualizer/SmartStageCompositionSettingsV351.tsx'),/decideSmartStageV351/);
assert.match(read('components/visualizer/SmartStageCameraV236.tsx'),/Restore original FOV/);
assert.match(read('app/globals.css'),/sonic-smart-stage-schematic-v351/);
assert.ok(Number(require('../package.json').version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=351);
assert(require('../package.json').scripts['verify:offline'].includes('test:v351'));
console.log('PASS V351 focus prioritization, manual safety, lyrics zones, panel placement, camera, light/FX budgets, SSR/storage, stage/UI integration');
