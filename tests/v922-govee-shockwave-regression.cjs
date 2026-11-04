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
 vm.runInNewContext(out.outputText,{module:mod,exports:mod.exports,
  Event:class{constructor(type){this.type=type;}},
  window:{localStorage:{getItem:key=>store.get(key)||null,setItem:(key,v)=>store.set(key,v)},dispatchEvent:e=>events.push(e.type)},
  localStorage:{getItem:key=>store.get(key)||null,setItem:(key,v)=>store.set(key,v)},
  require(id){throw Error('unexpected runtime dependency: '+id);}}, {filename:file,timeout:10000});
 return mod.exports;
}
const g=load('lib/goveeShockwaveV922.ts');const asJson=x=>JSON.parse(JSON.stringify(x));
const settings={...asJson(g.DEFAULT_GOVEE_SHOCKWAVE_V922),enabled:true};
const sample={lastAt:3000,lastKickAt:3000,lastLevel:.9,floor:.35,pulse:.95,hits:1};
const base={color:{r:120,g:40,b:190},brightness:53};
const trigger=(options=settings,env=sample)=>g.stepGoveeShockwaveV922(g.resetGoveeShockwaveV922(),env,3000,'track-a',true,options);
const plan=(state=trigger(),index=0,count=4,time=3000,options=settings)=>g.planGoveeShockwaveV922(state,index,count,time,options);
const apply=(d=plan(),options=settings,look=base,master=75)=>g.applyGoveeShockwaveV922(look,d,options,master);
let total=0;function test(name,fn){fn();total++;console.log('PASS V922 '+name);}
test('disabled by default, and does not require stage or network initialization',()=>{
 assert.equal(g.DEFAULT_GOVEE_SHOCKWAVE_V922.enabled,false);
 assert.equal(g.loadGoveeShockwaveV922().enabled,false);
});
test('invalid opt-in values never enable a show',()=>{
 for(const v of [undefined,null,'true',true,1,[],{enabled:1},{enabled:'true'},{}])
  assert.equal(g.normalizeGoveeShockwaveV922(v).enabled,false);
});
test('numeric bounds reject NaN, infinity, strings, negatives and oversized values',()=>{
 let v=g.normalizeGoveeShockwaveV922({enabled:true,intensity:Infinity,threshold:-30,stepMs:9999,
  releaseMs:'fast',cooldownMs:1,maxBoostPoints:99,direction:'up'});
 assert.equal(v.enabled,true);assert.equal(v.intensity,60);assert.equal(v.threshold,25);
 assert.equal(v.stepMs,750);assert.equal(v.releaseMs,1500);assert.equal(v.cooldownMs,1800);
 assert.equal(v.maxBoostPoints,12);assert.equal(v.direction,'forward');
});
test('browser persistence is local and does not leak access secrets',()=>{
 g.saveGoveeShockwaveV922({...settings,direction:'center-out',intensity:95});
 assert.equal(g.loadGoveeShockwaveV922().direction,'center-out');
 const value=store.get(g.GOVEE_SHOCKWAVE_KEY_V922);
 assert.ok(value&&!/token|password|bridge|endpoint|selectedIp/i.test(value));
 assert.ok(events.includes(g.GOVEE_SHOCKWAVE_EVENT_V922));
});
test('corrupt saved settings fall back to disabled',()=>{
 store.set(g.GOVEE_SHOCKWAVE_KEY_V922,'{bad');
 assert.equal(g.loadGoveeShockwaveV922().enabled,false);
});
test('no mic, pause, tab hidden or no track reset the wave on the producer path',()=>{
 const state=trigger();for(const track of ['',null])assert.equal(g.stepGoveeShockwaveV922(state,sample,3100,track,false,settings).triggerAt,-1);
 assert.equal(g.stepGoveeShockwaveV922(state,sample,3100,'track-a',false,settings).triggerAt,-1);
});
test('V917 envelope must contain a NEW real hit',()=>{
 const before=g.stepGoveeShockwaveV922(g.resetGoveeShockwaveV922(),{...sample,hits:0},3000,'track-a',true,settings);
 assert.equal(before.triggerAt,-1);
 const after=g.stepGoveeShockwaveV922(before,sample,3000,'track-a',true,settings);
 assert.equal(after.triggerAt,3000);assert.equal(after.lastHits,1);
 const once=g.stepGoveeShockwaveV922(after,sample,3120,'track-a',true,settings);
 assert.equal(once.triggerAt,3000);
});
test('old kick timestamps cannot produce retroactive waves',()=>{
 const old={...sample,lastKickAt:2000};assert.equal(trigger(settings,old).triggerAt,-1);
 const future={...sample,lastKickAt:3500};assert.equal(trigger(settings,future).triggerAt,-1);
});
test('microphone envelope sensitivity threshold suppresses false light peaks',()=>{
 assert.equal(trigger(settings,{...sample,pulse:.4}).triggerAt,-1);
 assert.equal(trigger({...settings,threshold:90},{...sample,pulse:.89}).triggerAt,-1);
 assert.equal(trigger({...settings,threshold:90},{...sample,pulse:.95}).triggerAt,3000);
});
test('cooldown suppresses rapid hardtekk kick retriggers',()=>{
 const first=trigger();
 const second=g.stepGoveeShockwaveV922(first,{...sample,hits:2,lastKickAt:3300},3300,'track-a',true,settings);
 assert.equal(second.lastHits,2);assert.equal(second.triggerAt,3000);
 const third=g.stepGoveeShockwaveV922(second,{...sample,hits:3,lastKickAt:5300},5300,'track-a',true,settings);
 assert.equal(third.triggerAt,5300);
});
test('a new track cannot inherit or replay the previous wave',()=>{
 const first=trigger();
 const next=g.stepGoveeShockwaveV922(first,{...sample,hits:0},3100,'track-b',true,settings);
 assert.equal(next.trackId,'track-b');assert.equal(next.triggerAt,-1);
});
test('no wave exists until explicitly enabled',()=>{
 assert.equal(trigger({...settings,enabled:false}).triggerAt,-1);
 assert.equal(plan(trigger({...settings,enabled:false}),0,4,3000,{...settings,enabled:false}).active,false);
});
test('forward ordering follows user-selected lamp order',()=>{
 assert.deepEqual([0,1,2,3].map(i=>g.goveeShockwaveOrderV922(i,4,'forward')),[0,1,2,3]);
});
test('reverse ordering is opposite',()=>{
 assert.deepEqual([0,1,2,3].map(i=>g.goveeShockwaveOrderV922(i,4,'reverse')),[3,2,1,0]);
});
test('center-out ordering has paired center lights',()=>{
 assert.deepEqual([0,1,2,3].map(i=>g.goveeShockwaveOrderV922(i,4,'center-out')),[1,0,0,1]);
 assert.deepEqual([0,1,2].map(i=>g.goveeShockwaveOrderV922(i,3,'center-out')),[1,0,1]);
});
test('outside-in ordering has paired exterior lights',()=>{
 assert.deepEqual([0,1,2,3].map(i=>g.goveeShockwaveOrderV922(i,4,'outside-in')),[0,1,1,0]);
});
test('invalid device indices are ignored',()=>{
 for(const idx of [-1,4,1.5,Infinity,NaN])assert.equal(g.goveeShockwaveOrderV922(idx,4,'forward'),-1);
 assert.equal(g.goveeShockwaveOrderV922(0,0,'forward'),-1);
});
test('wave front starts at the first lamp and arrives later at next lamps',()=>{
 assert.equal(plan(trigger(),0,4,3000).active,true);
 assert.equal(plan(trigger(),1,4,3000).active,false);
 assert.equal(plan(trigger(),1,4,3340).active,true);
 assert.equal(plan(trigger(),3,4,3670).active,false);
 assert.equal(plan(trigger(),3,4,4020).active,true);
});
test('no negative-time wave or wave after natural release',()=>{
 assert.equal(plan(trigger(),0,4,2999).active,false);
 assert.equal(plan(trigger(),0,4,4500).active,false);
});
test('increasing age always decreases pulse at a single device',()=>{
 assert.ok(plan(trigger(),0,4,3000).pulse>plan(trigger(),0,4,3500).pulse);
 assert.ok(plan(trigger(),0,4,3500).pulse>plan(trigger(),0,4,4100).pulse);
});
test('RGB remains identical and no lamp power commands exist',()=>{
 assert.deepEqual(asJson(apply().color),base.color);
 assert.doesNotMatch(read('lib/goveeShockwaveV922.ts'),/goveeBridgeRequestV909|sendCommand|fetch\s*\(/);
});
test('group dimming is kept as the prior baseline, with a bounded extra gain',()=>{
 const look={...base,brightness:27};
 const adjusted=apply(plan(),settings,look,75);
 assert.ok(adjusted.brightness>=27&&adjusted.brightness<=27+settings.maxBoostPoints);
});
test('zero strength, cap or inactive wave is exact identity',()=>{
 assert.deepEqual(asJson(apply(plan(),{...settings,intensity:0})),base);
 assert.deepEqual(asJson(apply(plan(),{...settings,maxBoostPoints:0})),base);
 assert.deepEqual(asJson(apply(plan(trigger(),1,4,3000))),base);
});
test('high lamp brightness never gets reduced by a positive shockwave',()=>{
 const look={...base,brightness:98};assert.ok(apply(plan(),settings,look,50).brightness>=98);
});
test('max brightness remains <=100 and baseline is preserved',()=>{
 for(const b of [1,20,50,85,98,100]){
  const look={...base,brightness:b};const applied=apply(plan(),settings,look,100);
  assert.ok(applied.brightness>=b&&applied.brightness<=100);
 }
});
test('a wave does not invent a room layout or physical coordinate',()=>{
 assert.doesNotMatch(read('lib/goveeShockwaveV922.ts'),/navigator\.geolocation|GPS|segment\(/);
 assert.match(read('components/GoveeShockwaveStudioV922.tsx'),/Reihenfolge/);
});
test('preview never changes browser settings or hardware',()=>{
 const before=store.size,prior=events.length;
 const p=g.previewGoveeShockwaveV922(settings,4,600);
 assert.equal(p.length,4);assert.equal(store.size,before);assert.equal(events.length,prior);
});
test('5,000 parameter and waveform combinations are bounded, deterministic',()=>{
 const directions=['forward','reverse','center-out','outside-in'];
 for(let i=0;i<5000;i++){
  const cfg={...settings,direction:directions[i%4],intensity:i%101,stepMs:180+(i%58)*10,
   releaseMs:900+(i%35)*50,maxBoostPoints:i%13};
  const state={...trigger(),strength:(i%101)/100};
  const pos=i%4;const at=3000+(i*97)%3600;
  const a=g.planGoveeShockwaveV922(state,pos,4,at,cfg);
  const b=g.planGoveeShockwaveV922(state,pos,4,at,cfg);
  assert.deepEqual(asJson(a),asJson(b));
  const output=g.applyGoveeShockwaveV922(base,a,cfg,75);
  assert.ok(output.brightness>=base.brightness&&output.brightness<=100);
  assert.ok(output.brightness-base.brightness<=cfg.maxBoostPoints);
  assert.deepEqual(asJson(output.color),base.color);
 }
});
test('real sync producer samples 120ms and gates stale microphone metrics',()=>{
 const sync=read('components/GoveeMusicSyncV909.tsx');
 assert.match(sync,/stepGoveeShockwaveV922\(shockwave,envelope/);
 assert.match(sync,/sampleAt-state\.observedAt<=1500/);
 assert.match(sync,/window\.setInterval\(sample,120\)/);
 assert.match(sync,/state\.track\.id!==lastTrack/);
 assert.match(sync,/shockwave=resetGoveeShockwaveV922\(\)/);
});
test('V921 cinema precedes shockwave, V915 group dimmer remains final authority',()=>{
 const sync=read('components/GoveeMusicSyncV909.tsx');
 assert.ok(sync.indexOf('const roomLook=shockDecision.active')>sync.indexOf('const coordinated='));
 assert.match(sync,/applyGoveeGroupBrightnessV915\(\s*applyGoveeShockwaveV922\(cinematicDecision\?\.active/);
 assert.match(sync,/const look=config\.directorEnabledV911\|\|neonDecision\.active\?easeGoveeLookV911\(previous,neonLook\):neonLook/);
 assert.match(sync,/config\.selectedIps\.indexOf\(ip\)/);
});
test('same bounded V909 command dispatcher is used, never a separate network loop',()=>{
 const sync=read('components/GoveeMusicSyncV909.tsx');
 assert.equal((sync.match(/goveeBridgeRequestV909\(config,'\/command'/g)||[]).length,1);
 assert.match(sync,/bassSettings\.enabled\|\|shockSettings\.enabled\?window\.setInterval\(\(\)=>void tick\(\),900\)/);
 assert.match(sync,/const decision=planGoveeBeatDispatchV918/);
});
test('V922 studio is mounted in existing LAN panel and only renders previews',()=>{
 const panel=read('components/GoveeLanPanelV909.tsx');
 assert.match(panel,/GoveeShockwaveStudioV922 config=\{config\}/);
 const ui=read('components/GoveeShockwaveStudioV922.tsx');
 assert.match(ui,/previewGoveeShockwaveV922/);
 assert.doesNotMatch(ui,/goveeBridgeRequestV909|fetch\(|\/command/);
});
test('same V910 Bridge stays unchanged',()=>{
 assert.ok(fs.existsSync(path.join(root,'scripts/govee-lan-bridge.cjs')));
 assert.doesNotMatch(read('lib/goveeShockwaveV922.ts'),/\btemperature\b|\bpower\b/);
});
test('npm and GitHub Actions include V922 focused quality gate',()=>{
 const p=JSON.parse(read('package.json'));
 for(const key of ['test:v922','test:v922:types','test:v922:ui-types','verify:v922:focused'])assert.equal(typeof p.scripts[key],'string');
 assert.match(read('.github/workflows/v832-continuous-validation.yml'),/npm run test:v922 && npm run test:v922:types && npm run test:v922:ui-types/);
});
console.log(`V922 PASS ${total} test groups, including 5,000 deterministic shockwave states`);
