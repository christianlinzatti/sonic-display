'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {
 DEFAULT_LIVE_FX_V881:defaults,normalizeLiveFxSettingsV881:normalize,
 resolveLiveFxStyleV881:genre,selectLiveFxLookV881:look,
 verifiedLiveFxScenesV881:verified,planLiveFxCueV881:plan,exportLiveFxSheetV881:exportSheet,
 resetManualLiveFxOnSeekV881:resetSeek,
}=load('components/visualizer/liveFxDeckPlannerV881');
let count=0;
const check=(name,fn)=>{try{fn();count++}catch(error){error.message=`V881 ${name}: ${error.message}`;throw error}};
const scenes=[{index:0,startMs:0,endMs:30000,section:'verse',intent:'portrait'},
 {index:1,startMs:30000,endMs:60000,section:'build',intent:'rise'},
 {index:2,startMs:60000,endMs:90000,section:'drop',intent:'pulse'},
 {index:3,startMs:90000,endMs:120000,section:'hook',intent:'wide'}];
const timeline={trackId:'track-a',durationMs:120000,source:'verified-v604',scenes};
const settings={...defaults};
const input={settings,trackId:'track-a',genre:'Deutschrap',durationMs:120000,
 progressMs:61000,playing:true,reducedMotion:false,timeline,trigger:null};
const at=(patch={})=>plan({...input,...patch});
check('normalizes null, string and hostile values',()=>{
 for(const x of [null,NaN,42,'invalid',[],{}])assert.deepEqual(normalize(x),defaults);
});
check('normalizes intensity including decimals and infinities',()=>{
 assert.equal(normalize({intensity:124.7}).intensity,100);
 assert.equal(normalize({intensity:-10}).intensity,0);
 assert.equal(normalize({intensity:50.8}).intensity,51);
 assert.equal(normalize({intensity:Infinity}).intensity,55);
});
check('invalid styles do not persist',()=>assert.equal(normalize({style:'<script>'}).style,'auto'));
check('boolean options persist',()=>assert.deepEqual(normalize({enabled:false,auto:false,showHud:false}),
 {...defaults,enabled:false,auto:false,showHud:false}));
check('genre-aware profiles',()=>{
 assert.equal(genre('auto','Deutschrap'),'rap');assert.equal(genre('auto','Hardtekk'),'hardtekk');
 assert.equal(genre('auto','Neue Deutsche Härte Rock'),'rock');assert.equal(genre('auto','Pop'),'pop');
 assert.equal(genre('rock','Hardtekk'),'rock');
});
check('quiet portraits and breaks stay calm',()=>{
 for(const s of [{section:'verse',intent:'portrait'},{section:'break',intent:'wide'},
  {section:'verse',intent:'dialogue'},{section:'hook',intent:'breath'}])
  for(const g of ['rap','hardtekk','rock','pop'])assert.equal(look(s,g),'cinema');
});
check('genre looks visibly differ for peaks',()=>{
 const peak={section:'drop',intent:'pulse'};
 assert.equal(look(peak,'hardtekk'),'neon');assert.equal(look(peak,'rock'),'arena');
 assert.equal(look({section:'build',intent:'rise'},'pop'),'aurora');
});
check('verified stage scenes drive live overlay',()=>{
 const q=at();assert.equal(q.active,true);assert.equal(q.sceneIndex,2);
 assert.equal(q.section,'drop');assert.equal(q.sceneSource,'verified');assert.equal(q.look,'arena');
});
check('same clock yields exactly same cue',()=>assert.deepEqual(at(),at()));
check('boundary uses next existing scene',()=>assert.equal(at({progressMs:60000}).sceneIndex,2));
check('no assumed scene between actual gaps',()=>{
 const g={...timeline,scenes:[{...scenes[0],endMs:5000},{...scenes[1]}]};
 assert.equal(at({timeline:g,progressMs:16000}).sceneIndex,-1);
});
check('missing timeline stops auto, manual remains available',()=>{
 assert.equal(at({timeline:null}).active,false);assert.equal(at({timeline:null}).look,'none');
});
check('mismatched track rejects scene',()=>assert.equal(at({timeline:{...timeline,trackId:'wrong'}}).active,false));
check('unverified scene source rejects',()=>assert.equal(at({timeline:{...timeline,source:'unavailable'}}).active,false));
check('durations must match',()=>assert.equal(verified(timeline,'track-a',120001).length,0));
check('invalid intervals rejected (overlap, reverse, negative, out of range)',()=>{
 const bad=[{...scenes[0],startMs:-1},{...scenes[0],endMs:0},
  {...scenes[0],endMs:120001},{...scenes[1],startMs:29999},
  {...scenes[1],endMs:Infinity}];
 for(const s of bad){const i=s.index;const rows=scenes.map((row,j)=>j===i?s:row);
  assert.equal(verified({...timeline,scenes:rows},'track-a',120000).length,0);
 }
});
check('invalid indexes and empty scenes rejected',()=>{
 assert.equal(verified({...timeline,scenes:[]},'track-a',120000).length,0);
 assert.equal(verified({...timeline,scenes:[{...scenes[0],index:10}]},'track-a',120000).length,0);
});
check('automatic toggle is an exact opt-out',()=>{
 const q=at({settings:{...settings,auto:false}});assert.equal(q.active,false);assert.equal(q.look,'none');
});
check('master switch and intensity zero are opt-outs',()=>{
 assert.equal(at({settings:{...settings,enabled:false}}).active,false);
 assert.equal(at({settings:{...settings,intensity:0}}).active,false);
});
check('reduced motion disables every effect',()=>{
 const q=at({reducedMotion:true});assert.equal(q.active,false);assert.equal(q.manual,null);
});
check('pause disables FX without fake playback',()=>assert.equal(at({playing:false}).active,false));
check('manual accents reset on seeks, not on tiny Spotify polling corrections',()=>{
 const prior={trackId:'track-a',progressMs:60100};
 assert.equal(resetSeek(null,prior),false);
 assert.equal(resetSeek(prior,{trackId:'track-a',progressMs:59700}),false);
 assert.equal(resetSeek(prior,{trackId:'track-a',progressMs:59449}),true);
 assert.equal(resetSeek(prior,{trackId:'track-a',progressMs:66000}),true);
 assert.equal(resetSeek(prior,{trackId:'track-b',progressMs:60200}),true);
 assert.equal(resetSeek(prior,{trackId:'track-a',progressMs:NaN}),true);
});
check('seek or track reset does not leave manual effects',()=>{
 const trigger={id:15,trackId:'track-a',startMs:60000,kind:'shockwave'};
 assert.equal(at({trigger,progressMs:62000}).manual,'shockwave');
 assert.equal(at({trigger,progressMs:59999}).manual,null);
 assert.equal(at({trigger,progressMs:66000}).manual,null);
 assert.equal(at({trigger:{...trigger,trackId:'other'}}).manual,null);
});
check('all three manual effects work independently of verified timeline',()=>{
 for(const kind of ['shockwave','sweep','confetti']){
  const q=at({timeline:null,trigger:{id:1,trackId:'track-a',startMs:60000,kind}});
  assert.equal(q.manual,kind);assert.equal(q.active,true);assert.equal(q.look,'none');
 }
});
check('manual without auto is still allowed',()=>{
 const q=at({settings:{...settings,auto:false},trigger:{id:9,trackId:'track-a',startMs:60000,kind:'sweep'}});
 assert.equal(q.manual,'sweep');assert.equal(q.look,'none');
});
check('unknown manual cue is refused',()=>{
 const q=at({timeline:null,trigger:{id:9,trackId:'track-a',startMs:60000,kind:'strobe'}});
 assert.equal(q.manual,null);assert.equal(q.active,false);
});
check('bad manual starts and identifiers rejected',()=>{
 for(const trigger of [{id:0,trackId:'track-a',startMs:60000,kind:'shockwave'},
  {id:1,trackId:'track-a',startMs:NaN,kind:'shockwave'},
  {id:1,trackId:'track-a',startMs:120001,kind:'shockwave'},
  {id:1,trackId:'track-a',startMs:-1,kind:'shockwave'}]){
  assert.equal(at({timeline:null,trigger}).manual,null);
 }
});
check('manual lifetime is bounded and deterministic',()=>{
 const trigger={id:10,trackId:'track-a',startMs:60000,kind:'shockwave'};
 assert.equal(at({trigger,progressMs:60000}).manualProgress,0);
 assert.equal(at({trigger,progressMs:63000}).manualProgress,.5);
 assert.equal(at({trigger,progressMs:66000}).manualProgress,0);
});
check('invalid clock never renders FX',()=>{
 for(const progressMs of [NaN,Infinity,-1,121600])assert.equal(at({progressMs}).active,false);
});
check('invalid direct intensities fail closed',()=>{
 for(const intensity of [NaN,Infinity,-1,101])assert.equal(at({settings:{...settings,intensity}}).active,false);
});
check('intensity bound remains zero-to-one',()=>{
 for(const n of [1,5,50,100,1000]){
  const q=at({settings:{...settings,intensity:n}});
  assert(q.intensity>=0&&q.intensity<=1);
 }
});
check('stale timeline prevents export',()=>assert.equal(exportSheet({...input,timeline:null}),null));
check('export is portable JSON with real scene times only',()=>{
 const payload=exportSheet(input);assert(payload);const obj=JSON.parse(payload);
 assert.equal(obj.schema,'sonic-live-fx-v881');assert.equal(obj.scenes.length,scenes.length);
 assert.equal(obj.scenes[2].startMs,60000);assert.equal(obj.source,'verified-v604-concert-timeline');
 assert.equal(obj.scenes[2].look,'arena');assert(!Object.hasOwn(obj,'beats'));
});
check('no secrets or track title in export',()=>{
 const obj=JSON.parse(exportSheet(input));assert.deepEqual(Object.keys(obj).sort(),
 ['durationMs','note','scenes','schema','settings','source','trackId','version']);
});
const shell=fs.readFileSync('components/SonicDisplay.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/LiveFxDeckV881.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
check('live FX is dynamically integrated in playback, not login',()=>{
 assert(shell.includes('dynamic(() => import("@/components/visualizer/LiveFxDeckV881")'));
 assert(shell.includes('<LiveFxDeckV881 trackId={track.id}'));
 assert(!shell.slice(0,shell.indexOf('if(!connected)')).includes('<LiveFxDeckV881'));
});
check('real V763 timeline is used, not fabricated timers',()=>{
 assert(ui.includes('getConcertTimelineV763()'));
 assert(ui.includes('CONCERT_TIMELINE_EVENT_V763'));
 assert(ui.includes('verifiedLiveFxScenesV881(timeline,trackId,durationMs)'));
});
check('all 3 manual effects have actionable buttons',()=>{
 for(const name of ['shockwave','sweep','confetti'])assert(ui.includes(`onClick={()=>fire('${name}')}`));
});
check('reduced motion and visibility are wired',()=>{
 assert(ui.includes('disabled={stopped}'));
 assert(ui.includes('reducedMotion:motionOff,timeline,trigger'))&&assert(ui.includes('window.matchMedia'));
 assert(css.includes('@media(prefers-reduced-motion:reduce)'));
});
check('2D visuals do not allocate WebGL resources',()=>{
 assert(!ui.includes('CanvasTexture')&&!ui.includes('useFrame(')&&!ui.includes('new WebGLRenderer'));
});
check('storage writes are caught and reported',()=>{
 assert(ui.includes('window.localStorage.setItem'));
 assert(ui.includes('catch {setStorageError(true);}') );
});
console.log(`V881 Live FX Deck: ${count}/${count} Regressionstests erfolgreich.`);
