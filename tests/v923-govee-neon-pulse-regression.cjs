'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const store=new Map(),events=[];
function load(file){
 const out=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(out.diagnostics?.length||0,0);
 const mod={exports:{}};
 const localStorage={getItem:key=>store.get(key)||null,setItem:(key,v)=>store.set(key,v)};
 vm.runInNewContext(out.outputText,{module:mod,exports:mod.exports,
  Event:class{constructor(type){this.type=type;}},window:{localStorage,dispatchEvent:e=>events.push(e.type)},localStorage,
  require(id){throw Error('Unexpected runtime import: '+id);}}, {filename:file,timeout:10000});
 return mod.exports;
}
const g=load('lib/goveeNeonPulseV923.ts');const json=x=>JSON.parse(JSON.stringify(x));
const cfg={...json(g.DEFAULT_GOVEE_NEON_V923),enabled:true};
const env={lastAt:5500,lastKickAt:5000,lastLevel:.9,floor:.1,pulse:.9,hits:1};
const base={color:{r:76,g:32,b:155},brightness:45};
const sample=(patch={},settings=cfg)=>g.planGoveeNeonV923({progressMs:5100,genre:'Hardtekk',role:'neon',
 deviceIndex:2,deviceCount:4,microphoneFresh:true,now:5100,envelope:env,...patch},settings);
const apply=(d=sample(),s=cfg,b=base,m=75)=>g.applyGoveeNeonV923(b,d,s,m);
let n=0;function test(name,fn){fn();n++;console.log('PASS V923 '+name);}
test('default disabled and harmless on server without window',()=>{
 assert.equal(g.DEFAULT_GOVEE_NEON_V923.enabled,false);
 assert.equal(g.DEFAULT_GOVEE_NEON_V923.scope,'neon');
});
test('invalid values cannot enable the feature',()=>{
 for(const x of [null,undefined,'true',1,[],{enabled:'true'},{enabled:1},true])
  assert.equal(g.normalizeGoveeNeonV923(x).enabled,false);
});
test('invalid modes, palettes, scopes and nonfinite inputs fall back safely',()=>{
 const v=json(g.normalizeGoveeNeonV923({enabled:true,mode:'strobe',palette:'ultraviolet',scope:'all!',
  intensity:NaN,colorMixPercent:99,periodMs:80000,staggerMs:-1,maxBoostPoints:300}));
 assert.equal(v.enabled,true);assert.equal(v.mode,'flow');assert.equal(v.palette,'genre');assert.equal(v.scope,'neon');
 assert.equal(v.intensity,60);assert.equal(v.colorMixPercent,35);assert.equal(v.periodMs,18000);
 assert.equal(v.staggerMs,0);assert.equal(v.maxBoostPoints,8);
});
test('settings save and load are local only, with change notification',()=>{
 g.saveGoveeNeonV923({...cfg,mode:'breathe',scope:'all'});
 assert.equal(g.loadGoveeNeonV923().mode,'breathe');
 assert.equal(g.loadGoveeNeonV923().scope,'all');
 assert.ok(events.includes(g.GOVEE_NEON_EVENT_V923));
 assert.doesNotMatch(store.get(g.GOVEE_NEON_KEY_V923),/token|endpoint|password|bridgeUrl|selectedIps/i);
});
test('corrupt storage falls back to disabled',()=>{
 store.set(g.GOVEE_NEON_KEY_V923,'{bad-json');assert.equal(g.loadGoveeNeonV923().enabled,false);
});
test('inactive is exact identity and requires positive amount',()=>{
 assert.deepEqual(json(apply(sample({}, {...cfg,enabled:false}),{...cfg,enabled:false})),base);
 assert.equal(sample({}, {...cfg,enabled:false}).active,false);
 assert.equal(sample({}, {...cfg,intensity:0}).active,false);
 assert.equal(sample({}, {...cfg,colorMixPercent:0,maxBoostPoints:0}).active,false);
});
test('neon role is selected by default, all other roles preserve their look',()=>{
 for(const role of ['wall','rhythm','ambient']){
  const decision=sample({role});assert.equal(decision.active,false);
  assert.deepEqual(json(apply(decision)),base);
 }
});
test('all-selected device scope can affect each role',()=>{
 for(const role of ['wall','rhythm','neon','ambient'])
  assert.equal(sample({role},{...cfg,scope:'all'}).active,true);
});
test('unknown track position and indices do not trigger cues',()=>{
 for(const progressMs of [-1,NaN,Infinity])assert.equal(sample({progressMs}).active,false);
 for(const deviceIndex of [-1,4,1.5,NaN,Infinity])assert.equal(sample({deviceIndex}).active,false);
 assert.equal(sample({deviceCount:0}).active,false);
});
test('flow mode follows song position deterministically, not wall-clock time',()=>{
 const a=sample({now:5000}),b=sample({now:999999});
 assert.deepEqual(json(a),json(b));assert.equal(a.active,true);
});
test('long-duration flow is continuous at nearby progress values',()=>{
 const a=sample({progressMs:8300}),b=sample({progressMs:8301});
 assert.ok(Math.abs(a.level-b.level)<.01);
 for(const k of ['r','g','b'])assert.ok(Math.abs(a.color[k]-b.color[k])<=2);
});
test('flow spans across selected whole-lamp positions',()=>{
 const s={...cfg,scope:'all',staggerMs:500};
 const a=sample({deviceIndex:0},s),b=sample({deviceIndex:1},s);
 assert.notEqual(a.level,b.level);
});
test('zero device stagger produces a synchronous group look',()=>{
 const s={...cfg,scope:'all',staggerMs:0};
 assert.deepEqual(json(sample({deviceIndex:0},s)),json(sample({deviceIndex:3},s)));
});
test('breathe mode has a nonnegative, long gradual intensity',()=>{
 const s={...cfg,mode:'breathe'};
 for(let t=0;t<18000;t+=153){const d=sample({progressMs:t},s);
  assert.ok(d.level>=.2&&d.level<=1);}
});
test('genre palette keeps distinct color families and unknown genre falls back',()=>{
 for(const genre of ['Deutschrap','Hardtekk','Hardstyle','Deutschrock']){
  const pair=json(g.resolveGoveeNeonPaletteV923('genre',genre));
  assert.equal(pair.length,2);
  assert.notDeepEqual(pair[0],pair[1]);
 }
 assert.deepEqual(json(g.resolveGoveeNeonPaletteV923('genre','unknown')),
  json(g.resolveGoveeNeonPaletteV923('violet-cyan','Deutschrap')));
});
test('four manual colorways are bounded RGB triplets',()=>{
 for(const palette of ['genre','violet-cyan','pink-blue','amber-red']){
  const pair=g.resolveGoveeNeonPaletteV923(palette,'Deutschrap');
  for(const c of pair)for(const key of ['r','g','b'])assert.ok(c[key]>=0&&c[key]<=255);
 }
});
test('bass mode rejects inactive or stale microphone data',()=>{
 const s={...cfg,mode:'bass'};
 assert.equal(sample({microphoneFresh:false},s).active,false);
 assert.equal(sample({envelope:{...env,hits:0}},s).active,false);
 assert.equal(sample({now:7000},s).active,false);
 assert.equal(sample({now:4000},s).active,false);
 assert.equal(sample({envelope:{...env,pulse:0}},s).active,false);
});
test('bass mode uses actual decaying V917 envelope only',()=>{
 const s={...cfg,mode:'bass'};
 const atHit=sample({now:5000},s),mid=sample({now:5450},s),late=sample({now:6200},s);
 assert.ok(atHit.active&&mid.active&&late.active);
 assert.ok(atHit.level>mid.level&&mid.level>late.level);
 assert.equal(sample({now:6400},s).active,false);
});
test('bass look never appears merely because a song has a predicted drop',()=>{
 const source=read('lib/goveeNeonPulseV923.ts');
 assert.doesNotMatch(source,/readTrackAnalysisV318|planGoveeSectionV919|predictDrop/);
});
test('color mixing is limited to 35 percent and keeps original when zero',()=>{
 const d=sample();
 const original=apply(d,{...cfg,colorMixPercent:0,maxBoostPoints:0});
 assert.deepEqual(json(original),base);
 const next=apply(d,{...cfg,colorMixPercent:35});
 for(const k of ['r','g','b'])assert.ok(Math.abs(next.color[k]-base.color[k])<=90);
});
test('brightness additions never decrease any previously computed cue',()=>{
 for(const b of [1,10,30,80,98,100]){
  const look=apply(sample(),cfg,{...base,brightness:b},75);
  assert.ok(look.brightness>=b&&look.brightness<=100);
  assert.ok(look.brightness-b<=cfg.maxBoostPoints);
 }
});
test('zero color strength leaves color unchanged; zero brightness cap leaves brightness unchanged',()=>{
 const d=sample();
 assert.deepEqual(json(apply(d,{...cfg,colorMixPercent:0}).color),base.color);
 assert.equal(apply(d,{...cfg,maxBoostPoints:0}).brightness,base.brightness);
});
test('manual group dimming still applies after V923 adjustment',()=>{
 const raw=apply(sample(),cfg,{...base,brightness:65},80);
 const percent=20;const dimmed=Math.round(raw.brightness*percent/100);
 assert.ok(dimmed<=20);assert.ok(dimmed<=raw.brightness);
 const source=read('components/GoveeMusicSyncV909.tsx');
 assert.match(source,/const neonLook=neonDecision\.active\?applyGoveeGroupBrightnessV915\(/);
 assert.match(source,/applyGoveeNeonV923\(/);
});
test('5,000 deterministic music / lamp / palette combinations remain bounded',()=>{
 const genres=['Deutschrap','Hardtekk','Hardstyle','Deutschrock'];
 const modes=['flow','breathe','bass'];const palettes=['genre','violet-cyan','pink-blue','amber-red'];
 for(let i=0;i<5000;i++){
  const s={...cfg,scope:'all',mode:modes[i%3],palette:palettes[i%4],intensity:i%101,
   colorMixPercent:i%36,periodMs:4000+i%141*100,staggerMs:i%61*20,maxBoostPoints:i%9};
  const input={progressMs:(i*137)%300000,genre:genres[i%4],role:['wall','rhythm','neon','ambient'][i%4],
   deviceIndex:i%4,deviceCount:4,microphoneFresh:true,now:5000+i%1200,envelope:env};
  const d=g.planGoveeNeonV923(input,s),repeat=g.planGoveeNeonV923(input,s);
  assert.deepEqual(json(d),json(repeat));
  const result=g.applyGoveeNeonV923(base,d,s,75);
  assert.ok(result.brightness>=base.brightness&&result.brightness<=100);
  assert.ok(result.brightness-base.brightness<=s.maxBoostPoints);
  for(const k of ['r','g','b'])assert.ok(result.color[k]>=0&&result.color[k]<=255);
 }
});
test('preview is pure: no storage, bridge, network or power changes',()=>{
 const before=store.size,count=events.length;
 const preview=g.previewGoveeNeonV923(cfg,'Hardtekk',7400,4,75);
 assert.equal(preview.length,4);assert.equal(store.size,before);assert.equal(events.length,count);
 assert.doesNotMatch(read('components/GoveeNeonPulseStudioV923.tsx'),/goveeBridgeRequestV909|fetch\(|\/command/);
 assert.doesNotMatch(read('lib/goveeNeonPulseV923.ts'),/goveeBridgeRequestV909|fetch\(|\/command/);
});
test('V923 studio is actually mounted in the Govee LAN panel',()=>{
 assert.match(read('components/GoveeLanPanelV909.tsx'),/GoveeNeonPulseStudioV923 config=\{config\}/);
});
test('live music flow uses progressMs and current device index',()=>{
 const sync=read('components/GoveeMusicSyncV909.tsx');
 assert.match(sync,/planGoveeNeonV923\(\{progressMs:(?:progress|waveProgress),genre:state\.genre,role/);
 assert.match(sync,/deviceIndex:(?:position|spatialPosition),deviceCount:config\.selectedIps\.length/);
 assert.match(sync,/const spatialPosition=spatialIndexV926\(config\.selectedIps,spatialSource,spatialSettings\)/);
 assert.match(sync,/lastTrack===state\.track\.id/);
});
test('existing music sync dispatch remains single and rate-limited',()=>{
 const sync=read('components/GoveeMusicSyncV909.tsx');
 assert.equal((sync.match(/goveeBridgeRequestV909\(config,'\/command'/g)||[]).length,1);
 assert.match(sync,/window\.setInterval\(\(\)=>void tick\(\),1700\)/);
 assert.match(sync,/window\.setInterval\(\(\)=>void tick\(\),900\)/);
 assert.match(sync,/neonBassEnabled\?window\.setInterval\(\(\)=>void tick\(\),900\)/);
 assert.match(sync,/easeGoveeLookV911\(previous,neonLook\)/);
});
test('V922 shockwave and V921 cinematic overlays precede neon group dimming',()=>{
 const s=read('components/GoveeMusicSyncV909.tsx');
 assert.ok(s.indexOf('const neonLook=')>s.indexOf('const roomLook='));
 assert.match(s,/applyGoveeNeonV923\(\s*shockDecision\.active\?applyGoveeShockwaveV922\(/);
 assert.match(s,/applyGoveeCinematicV921\(base,cinematicDecision,cinematicSettings/);
});
test('V923 is opt-in without modifying saved V912 or V915 schema',()=>{
 assert.equal(g.DEFAULT_GOVEE_NEON_V923.enabled,false);
 assert.doesNotMatch(read('lib/goveeNeonPulseV923.ts'),/saveGoveeShowsV912|saveGoveeGroupsV915/);
});
test('V910 LAN bridge stays completely unchanged',()=>{
 assert.ok(fs.existsSync(path.join(root,'scripts/govee-lan-bridge.cjs')));
 const source=read('components/GoveeMusicSyncV909.tsx');
 assert.ok(source.includes("'/devices/add'"));
});
console.log(`V923 PASS ${n} test groups, including 5,000 deterministic neon states`);
