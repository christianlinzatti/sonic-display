'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {buildControlPatchV649:patch,undoControlPatchV649:undo,STAGES_V649:stages,DANCE_STYLES_V649:dances,
 CONTROLLABLE_KEYS_V649:keys,V649_TABS:tabs,V649_TAB_LABELS:labels}=load('components/concertControlPolicyV649');
const read=(f)=>fs.readFileSync(f,'utf8');
const panel=read('components/ConcertControlCenterV649.tsx');
const kiosk=read('components/TouchKioskControls.tsx');
const css=read('app/globals.css');
const pkg=JSON.parse(read('package.json'));
const architecture=read('ARCHITECTURE.md');
const screen=read('components/SonicDisplay.tsx');
const doc=read('V649-INTERACTIVE-CONCERT-CONTROL-CENTER.md');
let groups=0,positions=0;
function test(name,fn){try{fn();groups++;}catch(e){e.message=`V649 ${name}: ${e.message}`;throw e;}}
const has=(src,part)=>assert(src.includes(part),`Missing ${part}`);
const unique=(items)=>new Set(items).size===items.length;
const state={stageTheme:'classic',stageReactive:true,stageLightStrength:60,avatarVocalCameraV369:'auto',
 avatarVocalCameraStrengthV369:55,rapCameraEnabledV429:false,lyricsFontSize:100,
 lyricsFocusMode:true,lyricsImmersiveEnabled:false,multiAvatarMode:'solo',avatarDancePreset:'auto',
 avatarLipSyncEnabled:true,concertDetailEnabledV555:true,concertDetailStrengthV555:45,reducedMotion:false,
 vocalTimeSegmentsV496:{marker:1},avatarCameraTimelineV400:{marker:2},lyricsOffsetMs:77};
test('five distinct tabs',()=>assert.deepEqual(tabs,['stage','camera','lyrics','avatars','light']));
test('all tabs labelled',()=>tabs.forEach(t=>assert(typeof labels[t]==='string'&&labels[t].length>0)));
test('nine original stage themes',()=>assert.deepEqual(stages.map(s=>s.value),['classic','neon','festival','minimal','cyberpunk','vaporwave','galaxy','white','rock']));
test('stage labels complete',()=>stages.forEach(s=>assert(s.label)));
test('no duplicate stage themes',()=>assert(unique(stages.map(s=>s.value))));
test('stage choices match official library',()=>{const actual=[...read('components/visualizer/stages/index.tsx').matchAll(/\{id:"([^"]+)", label:/g)].map(x=>x[1]);assert.deepEqual(stages.map(x=>x.value),actual);});
test('seven original dance presets',()=>assert.deepEqual(dances.map(d=>d.value),['auto','hardstyle','techno','rock-metal','robot','ambient','freestyle']));
test('no duplicate dance presets',()=>assert(unique(dances.map(d=>d.value))));
test('dance choices match available library',()=>{const actual=[...read('components/visualizer/avatarDancePresets.ts').matchAll(/\{ id: "([^"]+)", label:/g)].map(x=>x[1]);assert.deepEqual(dances.map(x=>x.value),actual);});
test('all controls have unique keys',()=>assert(unique(keys)));
for(const s of stages)test(`stage ${s.value}`,()=>assert.deepEqual(patch('stageTheme',s.value),{stageTheme:s.value}));
for(const s of dances)test(`dance ${s.value}`,()=>assert.deepEqual(patch('avatarDancePreset',s.value),{avatarDancePreset:s.value}));
for(const v of ['solo','sync','mirror','duet'])test(`ensemble ${v}`,()=>assert.deepEqual(patch('multiAvatarMode',v),{multiAvatarMode:v}));
for(const v of ['off','auto','performance'])test(`camera ${v}`,()=>assert.deepEqual(patch('avatarVocalCameraV369',v),{avatarVocalCameraV369:v}));
for(const key of ['stageReactive','rapCameraEnabledV429','lyricsFocusMode','lyricsImmersiveEnabled','avatarLipSyncEnabled','concertDetailEnabledV555','reducedMotion']) {
 test(`boolean ${key} true`,()=>assert.deepEqual(patch(key,true),{[key]:true}));
 test(`boolean ${key} false`,()=>assert.deepEqual(patch(key,false),{[key]:false}));
 test(`reject boolean impostor ${key}`,()=>{for(const v of ['true','false',1,0,null,undefined,{},[]]) assert.equal(patch(key,v),null)});
}
for(const key of ['stageTheme','avatarDancePreset','multiAvatarMode','avatarVocalCameraV369']){
 test(`invalid enumeration ${key}`,()=>{for(const v of [null,'__proto__','constructor','ALL','',true,2,[],{}])assert.equal(patch(key,v),null);});
}
for(const key of ['stageLightStrength','avatarVocalCameraStrengthV369','concertDetailStrengthV555']){
 test(`${key} integer/low/high`,()=>{for(const [v,want] of [[50,50],[50.6,51],[-20,0],[104,100],[0,0],[100,100]])
 assert.deepEqual(patch(key,v),{[key]:want});});
 test(`${key} rejects invalids`,()=>{for(const v of [NaN,Infinity,-Infinity,'35',null,undefined,{},[]])assert.equal(patch(key,v),null)});
}
test('font 40 to 240 boundaries',()=>{for(const [v,want] of [[-99,40],[10,40],[40,40],[120,120],[240,240],[900,240]])assert.deepEqual(patch('lyricsFontSize',v),{lyricsFontSize:want})});
test('font rejects nonnumbers and nonfinite',()=>{for(const v of ['100',null,NaN,Infinity])assert.equal(patch('lyricsFontSize',v),null)});
test('unknown keys fail closed',()=>{for(const k of ['__proto__','lyricsOffsetMs','vocalTimeSegmentsV496','avatarCameraTimelineV400','microphoneEnabled','spotifyToken'])assert.equal(patch(k,55),null)});
test('undo restores only touched stage',()=>assert.deepEqual(undo(state,{stageTheme:'rock'}),{stageTheme:'classic'}));
test('undo restores only touched boolean',()=>assert.deepEqual(undo(state,{avatarLipSyncEnabled:false}),{avatarLipSyncEnabled:true}));
test('undo preserves optional unconfigured camera field',()=>assert.deepEqual(undo({...state,avatarVocalCameraV369:undefined},{avatarVocalCameraV369:'performance'}),{avatarVocalCameraV369:undefined}));
test('undo never brings back unrelated singer assignments',()=>assert(!Object.hasOwn(undo(state,{lyricsFontSize:130}),'vocalTimeSegmentsV496')));
test('undo ignores unrelated malicious keys',()=>assert.deepEqual(undo(state,{spotifyToken:'secret'}),{}));
test('undo can restore multi-key action',()=>assert.deepEqual(undo(state,{stageTheme:'rock',stageLightStrength:100}),{stageTheme:'classic',stageLightStrength:60}));
test('empty patch makes empty undo',()=>assert.deepEqual(undo(state,{}),{}));
test('undo never mutates source',()=>{const x={...state};undo(x,{stageReactive:false});assert.deepEqual(x,state);});
// Every original domain remains isolated; nothing touches the Spotify stream or other authored data.
for(const [key,value] of [['stageTheme','rock'],['stageLightStrength',22],['avatarVocalCameraV369','performance'],
 ['rapCameraEnabledV429',true],['lyricsFontSize',140],['multiAvatarMode','duet'],['avatarDancePreset','hardstyle'],
 ['reducedMotion',true]]){
 test(`single source preference write ${key}`,()=>{const p=patch(key,value);assert.equal(Object.keys(p).length,1);assert(keys.includes(key))});
}
test('kiosk uses dynamic import',()=>has(kiosk,'dynamic(()=>import("./ConcertControlCenterV649")'));
test('control UI remains kiosk-only',()=>has(kiosk,'kiosk.enabled&&controlOpenV649&&'));
test('control close resets hidden state',()=>has(kiosk,'setControlOpenV649(false)'));
test('control opens from nav button',()=>has(kiosk,'aria-expanded={controlOpenV649}'));
test('auto-hide suppressed when open',()=>has(kiosk,'!controlOpenV649 ? "kiosk-toolbar-hidden"'));
test('wake button excludes open controls',()=>has(kiosk,'!controlOpenV649 && <button'));
test('all categories available',()=>tabs.forEach(t=>has(panel,`tab==="${t}"`)));
test('tabs accessible via ARIA',()=>{has(panel,'role="tablist"');has(panel,'role="tab"');has(panel,'aria-selected={tab===t}')});
test('sidecar has accessible title',()=>has(panel,'role="dialog" aria-modal="false"'));
test('close via Escape',()=>has(panel,'event.key==="Escape"'));
test('escape listener stable while changing controls',()=>{has(panel,'closeActionRef.current()');has(panel,'},[]);')});
test('close via button',()=>has(panel,'onClick={onClose}>Fertig'));
test('focus on close button on open',()=>has(panel,'closeRef.current?.focus()'));
test('uses existing preferences context',()=>has(panel,'useUiPreferences()'));
test('no separate preference localStorage',()=>assert(!panel.includes('localStorage')));
test('controls go through policy',()=>has(panel,'buildControlPatchV649(key,value)'));
test('preferences are updated using same context',()=>has(panel,'updatePreferences(patch)'));
test('none of the controls writes vocal assignments',()=>{for(const k of keys)assert(!/vocal.*assignment|vocalTimeSegment|lip.*seal/i.test(k))});
test('undo uses per-property snapshot',()=>has(panel,'undoControlPatchV649(preferences,patch)'));
test('undo button disabled if no undo',()=>has(panel,'disabled={!undo}'));
test('lyrics local kiosk view reused',()=>has(panel,'setView(value as KioskView)'));
test('touch readability state reused',()=>has(panel,'setReadability(value as TouchReadabilityV648)'));
test('camera manual override disclaimer',()=>has(panel,'Manuelle Kamerazeitleisten'));
test('singers never auto-assigned by new control',()=>has(panel,'Keine automatische Sängerzuweisung'));
test('existing audio stream untouched',()=>assert(!/(disconnect\(|pause\(|play\(|seek\(|fetch\(|AudioContext|AnalyserNode)/.test(panel)));
test('no new GLB stage',()=>assert(!/(GLTFLoader|Canvas|useFrame|new PointLight)/.test(panel)));
test('touch buttons at least 48 CSS px',()=>has(css,'min-height:48px;min-width:48px'));
test('panel fully gated under touch kiosk css',()=>has(css,'.touch-kiosk .v649-control-panel'));
test('landscape 600px usable viewport',()=>has(css,'@media(max-height:730px) and (orientation:landscape)'));
test('portrait 10 inch layout',()=>has(css,'@media(max-width:720px) and (orientation:portrait)'));
test('panel does not fill all stage width',()=>has(css,'width:min(520px,55vw)'));
test('scrollable panel at short screens',()=>has(css,'overflow-y:auto;overscroll-behavior:contain'));
test('large keyboard focus ring',()=>has(css,'outline:3px solid #baff74'));
test('original root touch gate untouched',()=>has(screen,'const touchClassV648=kiosk.enabled?'));
test('no animated background work on hidden panel',()=>assert(!panel.includes('setInterval')));
test('new versioned package',()=>assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=649));
test('new smoke script',()=>has(pkg.scripts['test:smoke:v649'],'test:smoke:v648'));
test('new prebuild smoke',()=>assert(pkg.scripts.prebuild.includes('test:smoke:v649')||pkg.scripts.prebuild.includes('test:smoke:v650')||pkg.scripts.prebuild.includes('test:smoke:v651')));
test('new expanded verification',()=>has(pkg.scripts['verify:v649'],'check:architecture'));
test('older preflight checks preserved',()=>has(pkg.scripts['build:preflight'],'npm run test:v568'));
test('current architecture reference',()=>assert(/\*\*Dokumentationsstand:\*\* V6(?:49|[5-9]\d)/.test(architecture)));
test('release documentation exists',()=>has(doc,'# V649 – Interactive Concert Control Center'));
// Deterministic randomized numeric validation with no browser or GPU required.
let seed=649;function rnd(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
const numerical=['stageLightStrength','avatarVocalCameraStrengthV369','concertDetailStrengthV555','lyricsFontSize'];
test('twelve thousand bounded control states',()=>{
 for(let i=0;i<12000;i++){
  const key=numerical[i%4];const raw=Math.floor(rnd()*1000)-400+(rnd()*0.9);
  const p=patch(key,raw);assert(p);const actual=p[key];assert(Number.isInteger(actual));
  const [min,max]=key==='lyricsFontSize'?[40,240]:[0,100];assert(actual>=min&&actual<=max);
  const snapshot=undo(state,p);const changed={...state,...p};assert.deepEqual({...changed,...snapshot},state);
  positions++;
 }
});
console.log(`PASS V649 interactive concert control center: ${groups} regression groups, ${positions} simulated control states`);
