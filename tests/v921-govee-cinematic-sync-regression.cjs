'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const store=new Map(),events=[];
function load(file){
 const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(result.diagnostics?.length||0,0);
 const module={exports:{}};
 const ctx={module,exports:module.exports,Event:class{constructor(type){this.type=type;}},
  window:{localStorage:{getItem:key=>store.get(key)||null,setItem:(key,v)=>store.set(key,v)},dispatchEvent:e=>events.push(e.type)},
  require(id){throw Error('unexpected runtime dependency '+id);}};
 vm.runInNewContext(result.outputText,ctx,{filename:file,timeout:10000});return module.exports;
}
const g=load('lib/goveeConcertSyncV921.ts');const json=x=>JSON.parse(JSON.stringify(x));
const settings={...json(g.DEFAULT_GOVEE_CINEMATIC_V921),enabled:true};
const base={color:{r:30,g:73,b:120},brightness:56};
const now=3000, trackId='track-921', progress=10500;
const stage=(extra={})=>g.makeGoveeStageCueV921({trackId,progressMs:10000,capturedAt:2500,playing:true,source:'authored',
 lyricsVisible:false,reducedMotion:false,danceFormation:'sync',
 cue:{active:true,activeLanes:['camera','dance','lighting'],cameraShot:'wide',danceFormation:'sync',lightGain:1.3,
  fxGain:1,photoOpacity:1,lyricsFocus:false,timeMs:10000},...extra});
const plan=(role='wall',cue=stage(),opts=settings,at=progress,time=now,id=trackId)=>
 g.planGoveeCinematicV921(cue,id,at,time,role,opts);
const apply=(decision,opts=settings,look=base,master=75)=>g.applyGoveeCinematicV921(look,decision,opts,master);
let tests=0;function test(name,run){run();tests++;console.log('PASS V921 '+name);}
test('opt-in disabled by default',()=>{assert.equal(g.DEFAULT_GOVEE_CINEMATIC_V921.enabled,false);assert.equal(g.loadGoveeCinematicV921().enabled,false);});
test('invalid storage objects cannot enable automation',()=>{
 for(const raw of [null,undefined,0,1,'true',true,[],{enabled:'true'},{enabled:1},{}])assert.equal(g.normalizeGoveeCinematicV921(raw).enabled,false);
});
test('ranges sanitize infinities, NaN and strings',()=>{
 const s=g.normalizeGoveeCinematicV921({enabled:true,strength:Infinity,maxChangePoints:-4});
 assert.equal(s.enabled,true);assert.equal(s.strength,65);assert.equal(s.maxChangePoints,0);
 assert.equal(g.normalizeGoveeCinematicV921({strength:-10,maxChangePoints:200}).maxChangePoints,12);
});
test('strict opt-in persistence contains no network credentials',()=>{
 g.saveGoveeCinematicV921({...settings,strength:71});
 assert.equal(g.loadGoveeCinematicV921().strength,71);
 const raw=store.get(g.GOVEE_CINEMATIC_KEY_V921);assert.ok(raw);assert.ok(!/token|endpoint|password|selectedIp|authorization/i.test(raw));
 assert.ok(events.includes(g.GOVEE_CINEMATIC_EVENT_V921));
});
test('broken storage resets disabled',()=>{
 store.set(g.GOVEE_CINEMATIC_KEY_V921,'{bad');assert.equal(g.loadGoveeCinematicV921().enabled,false);
});
test('source cue preserves current track clock and real lanes',()=>{
 const s=stage();assert.equal(s.trackId,trackId);assert.deepEqual(json(s.activeLanes),['dance','camera','lighting']);
 assert.equal(s.danceFormation,'sync');assert.equal(s.cameraShot,'wide');assert.equal(s.lyricsVisible,false);
});
test('stage emission filters unrecognized camera/dance/lanes',()=>{
 const s=stage({danceFormation:'teleport',cue:{active:true,activeLanes:['camera','bad'],cameraShot:'freecam',lightGain:Infinity,lyricsFocus:false}});
 assert.equal(s.danceFormation,undefined);assert.equal(s.cameraShot,undefined);assert.deepEqual(json(s.activeLanes),['camera']);
 assert.equal(s.lightGain,.25);
});
test('no signal and wrong track do not alter light',()=>{
 assert.equal(plan('wall',null).active,false);
 assert.equal(plan('wall',stage(),settings,progress,now,'track-else').active,false);
 assert.deepEqual(json(apply(plan('wall',stage(),settings,progress,now,'track-else'))),base);
});
test('pause and missing track ID block cues',()=>{
 assert.equal(plan('wall',stage({playing:false})).active,false);
 assert.equal(plan('wall',stage(),settings,progress,now,'').active,false);
});
test('old and future event timestamps ignored',()=>{
 assert.equal(plan('wall',stage(),settings,progress,10000).active,false);
 assert.equal(plan('wall',stage(),settings,progress,2200).active,false);
});
test('large seek, NaN progress and negative time blocked',()=>{
 for(const at of [0,35000,-1,NaN,Infinity])assert.equal(plan('wall',stage(),settings,at).active,false);
});
test('zero strength, zero ceiling, or disabled is exact identity',()=>{
 for(const opts of [{...settings,enabled:false},{...settings,strength:0},{...settings,maxChangePoints:0}]){
  const decision=plan('wall',stage(),opts);assert.equal(decision.active,false);
  assert.deepEqual(json(apply(decision,opts)),base);
 }
});
test('camera-wide cue supports wall and neon roles',()=>{
 const cue=stage({cue:{active:true,activeLanes:['camera'],cameraShot:'wide',lightGain:1,lyricsFocus:false}});
 assert.ok(plan('wall',cue).weight>plan('rhythm',cue).weight);
 assert.ok(plan('neon',cue).weight>0);
});
test('close camera does not increase brightness',()=>{
 const cue=stage({cue:{active:true,activeLanes:['camera'],cameraShot:'close',lightGain:1,lyricsFocus:false}});
 assert.ok(apply(plan('rhythm',cue)).brightness<base.brightness);
});
test('dance synchrony adds bounded beat-room light, solo reduces rhythm',()=>{
 const sync=stage({cue:{active:true,activeLanes:['dance'],danceFormation:'sync',lightGain:1,lyricsFocus:false}});
 const solo=stage({danceFormation:'solo',cue:{active:true,activeLanes:['dance'],lightGain:1,lyricsFocus:false}});
 assert.ok(plan('rhythm',sync).weight>0);assert.ok(plan('rhythm',solo).weight<0);
});
test('lighting V354 gain reused, not inferred from audio',()=>{
 const up=stage({cue:{active:true,activeLanes:['lighting'],lightGain:1.6,lyricsFocus:false}});
 const down=stage({cue:{active:true,activeLanes:['lighting'],lightGain:.65,lyricsFocus:false}});
 assert.ok(plan('wall',up).weight>0);assert.ok(plan('wall',down).weight<0);
});
test('actual lyrics can protect stage even without camera/dance timeline',()=>{
 const cue=stage({source:'none',lyricsVisible:true,cue:{active:false,activeLanes:[],lightGain:1,lyricsFocus:false}});
 const d=plan('rhythm',cue);assert.equal(d.active,true);assert.equal(d.camera,false);assert.equal(d.lyrics,true);
 assert.ok(apply(d).brightness<base.brightness);
});
test('lyrics focus is not consumed from a disabled or unrelated show',()=>{
 const cue=stage({source:'none',lyricsVisible:false,cue:{active:true,activeLanes:['lyrics'],lightGain:1,lyricsFocus:true}});
 assert.equal(plan('rhythm',cue).active,false);
});
test('manual mode respects auto cue opt-out and still protects visible lyrics',()=>{
 const cue=stage({source:'automatic'});
 assert.equal(plan('wall',cue,{...settings,includeAutomatic:false}).active,false);
 const lyrics=stage({source:'automatic',lyricsVisible:true});
 const d=plan('rhythm',lyrics,{...settings,includeAutomatic:false});
 assert.equal(d.active,true);assert.equal(d.camera,false);assert.equal(d.dance,false);assert.equal(d.lyrics,true);
});
test('reduced-motion blocks camera and dance cues',()=>{
 const cue=stage({reducedMotion:true});assert.equal(plan('wall',cue).active,false);
 const lyrics=stage({reducedMotion:true,lyricsVisible:true});assert.equal(plan('rhythm',lyrics).active,true);
});
test('each disabled lane is ignored and no cues means identity',()=>{
 const none={...settings,followCamera:false,followDance:false,followLighting:false,protectLyrics:false};
 assert.equal(plan('wall',stage(),none).active,false);assert.deepEqual(json(apply(plan('wall',stage(),none),none)),base);
});
test('unselected show lanes never introduce camera/dance decisions',()=>{
 const cue=stage({cue:{active:true,activeLanes:['effects'],cameraShot:'wide',danceFormation:'sync',lightGain:1.8,lyricsFocus:false}});
 assert.equal(plan('wall',cue).active,false);
});
test('max brightness remains capped, original RGB unchanged',()=>{
 const next=apply(plan('wall'));
 assert.deepEqual(json(next.color),base.color);
 assert.ok(next.brightness>=20&&next.brightness<=100);
});
test('no positive boost can lower an already brighter cue',()=>{
 const brighter={...base,brightness:97};assert.equal(apply(plan('wall'),settings,brighter).brightness,97);
});
test('preview is synthetic only and never touches storage or bridge',()=>{
 const before=events.length;
 const result=g.previewGoveeCinematicV921('rhythm',settings,{camera:'close',dance:'sync',lyrics:true,lightingGain:.7});
 assert.ok(result.decision.active);assert.equal(result.base,55);assert.ok(result.result>=20&&result.result<=100);
 assert.equal(events.length,before);
});
test('5,000 camera, ensemble, lyric and lighting combinations stay bounded',()=>{
 const roles=['wall','rhythm','neon','ambient'],cams=['wide','medium','close','orbit'],dances=['solo','sync','mirror','duet'];
 for(let i=0;i<5000;i++){
  const c=stage({lyricsVisible:i%3===0,danceFormation:dances[i%4],cue:{active:true,activeLanes:['camera','dance','lighting','lyrics'],
   cameraShot:cams[Math.floor(i/4)%4],lightGain:.5+(i%12)/12,lyricsFocus:i%5===0}});
  const d=plan(roles[i%4],c);const result=apply(d);
  assert.ok(Number.isFinite(d.weight)&&d.weight>=-1&&d.weight<=1);
  assert.ok(result.brightness>=20&&result.brightness<=100);
  assert.ok(Math.abs(result.brightness-base.brightness)<=settings.maxChangePoints);
  assert.deepEqual(json(result.color),base.color);
 }
});
test('3D stage publishes the very same show timeline cue, not independent guesses',()=>{
 const s=read('components/visualizer/ThreeAvatar.tsx');
 assert.match(s,/GOVEE_STAGE_CUE_EVENT_V921/);assert.match(s,/cue:timelineCueV354/);
 assert.match(s,/lyricsVisible:lyricsActiveV356/);assert.match(s,/makeGoveeStageCueV921/);
 assert.match(s,/window\.clearInterval\(id\)/);
});
test('V921 shares V909 hardware loop and keeps V915 group power/brightness authority',()=>{
 const s=read('components/GoveeMusicSyncV909.tsx');
 const ids=['applyGoveePredictedLookV918','planGoveeCinematicV921','applyGoveeCinematicV921','applyGoveeGroupBrightnessV915'];
 for(const name of ids)assert.ok(s.includes(name));
 assert.ok(s.indexOf('const cinematicDecision=')>s.indexOf('const base=applyGoveePredictedLookV918'));
 assert.ok(s.indexOf('const target=applyGoveeGroupBrightnessV915(base')>s.indexOf('const cinematicDecision='));
 assert.match(s,/applyGoveeGroupBrightnessV915\(\s*applyGoveeCinematicV921/);
 assert.match(s,/GOVEE_STAGE_CUE_EVENT_V921/);
});
test('V921 editor only previews and is mounted in existing Govee panel',()=>{
 assert.match(read('components/GoveeLanPanelV909.tsx'),/GoveeConcertSyncStudioV921/);
 const s=read('components/GoveeConcertSyncStudioV921.tsx');
 assert.match(s,/previewGoveeCinematicV921/);assert.doesNotMatch(s,/goveeBridgeRequestV909|\/command/);
});
test('V921 is in CI and full project package scripts',()=>{
 assert.match(read('.github/workflows/v832-continuous-validation.yml'),/npm run test:v921 && npm run test:v921:types && npm run test:v921:ui-types/);
 const p=JSON.parse(read('package.json'));assert.equal(typeof p.scripts['verify:v921:focused'],'string');
});
console.log('V921 PASS '+tests+' test groups, including 5,000 sampled live-stage states');
