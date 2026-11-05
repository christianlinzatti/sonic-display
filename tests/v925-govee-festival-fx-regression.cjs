'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const storage=new Map(),events=[];
const fakeWindow={localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},dispatchEvent:e=>events.push(e.type)};
function load(file){
 const converted=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(converted.diagnostics?.length||0,0);
 const module={exports:{}};
 vm.runInNewContext(converted.outputText,{module,exports:module.exports,localStorage:fakeWindow.localStorage,
  window:fakeWindow,Event:class{constructor(type){this.type=type;}},
  require(id){throw Error('Unexpected runtime dependency '+id);}}, {filename:file,timeout:10000});
 return module.exports;
}
const f=load('lib/goveeFestivalFxV925.ts');
const json=x=>JSON.parse(JSON.stringify(x));
const defaults=json(f.DEFAULT_GOVEE_FESTIVAL_V925),settings={...defaults,enabled:true};
const base={color:{r:90,g:55,b:125},brightness:54};
const labels=['verse','hook','build','drop','break'];
const make=(confidence=.98)=>({schema:'sonic-track-analysis-v318',trackId:'current-v925',durationMs:60000,
 source:'imported',tempo:null,timeSignature:4,beats:[],bars:[],importedAt:0,
 sections:labels.map((label,i)=>({label,startMs:i*12000,durationMs:12000,confidence}))});
const confirmed=(phase,conf=.98)=>({active:true,phase,confidence:conf,intensity:0,verifiedDropAhead:phase==='build',reason:'V919 confirmed'});
const plan=(time=16000,setting=settings,device=0,genre='hardstyle',analysis=make(),cue)=>{
 const phase=analysis.sections.find(x=>x.startMs<=time&&time<x.startMs+x.durationMs)?.label??'ambient';
 return f.planGoveeFestivalV925(analysis,analysis.trackId,time,cue===undefined?confirmed(phase):cue,
  genre,device,4,setting);
};
const apply=(decision=plan(),setting=settings,role='wall',look=base,master=75)=>
 f.applyGoveeFestivalV925(look,decision,role,setting,master);
let groups=0;
function test(name,run){run();groups++;console.log('PASS V925 '+name);}
test('disabled by default; no strobe/power controls',()=>{assert.equal(defaults.enabled,false);assert.equal(defaults.pattern,'auto');assert.equal(defaults.periodMs,6500);});
test('unique, whitelisted festival patterns',()=>{assert.deepEqual(json(f.GOVEE_FESTIVAL_PATTERNS_V925),['auto','arena','mirror','colorfront','finale']);});
test('malformed local data stays disabled',()=>{for(const o of [null,undefined,[],true,4,'enabled',{enabled:'yes'},{enabled:1}])assert.equal(f.normalizeGoveeFestivalV925(o).enabled,false);});
test('numeric ranges and fallback are sanitized',()=>{const x=f.normalizeGoveeFestivalV925({enabled:true,pattern:'strobe',strength:NaN,colorMixPercent:500,maxBoostPoints:-5,periodMs:Infinity,spreadMs:1,minConfidence:-30});assert.equal(x.pattern,'auto');assert.equal(x.strength,60);assert.equal(x.colorMixPercent,35);assert.equal(x.maxBoostPoints,0);assert.equal(x.periodMs,6500);assert.equal(x.spreadMs,150);assert.equal(x.minConfidence,50);});
test('corrupted localStorage fails closed',()=>{storage.set(f.GOVEE_FESTIVAL_KEY_V925,'{broken');assert.equal(f.loadGoveeFestivalV925().enabled,false);});
test('save/load update local state and emit event',()=>{f.saveGoveeFestivalV925({...settings,pattern:'colorfront'});assert.equal(f.loadGoveeFestivalV925().pattern,'colorfront');assert.ok(events.includes(f.GOVEE_FESTIVAL_EVENT_V925));});
test('storage never contains bridge credentials',()=>{assert.doesNotMatch(storage.get(f.GOVEE_FESTIVAL_KEY_V925),/token|endpoint|password|selectedIps|secret/);});
test('disabled settings are identity',()=>{const dec=plan(15000,{...settings,enabled:false});assert.equal(dec.active,false);assert.deepEqual(json(apply(dec)),base);});
test('zero strength gives inactive result',()=>{assert.equal(plan(15000,{...settings,strength:0}).active,false);});
test('both color and brightness disabled give inactive result',()=>{assert.equal(plan(15000,{...settings,colorMixPercent:0,maxBoostPoints:0}).active,false);});
test('no analysis is safe',()=>{assert.equal(f.planGoveeFestivalV925(null,'current-v925',15000,confirmed('hook'),'rap',0,4,settings).active,false);});
test('wrong track rejects old cues',()=>{const d=make();assert.equal(f.planGoveeFestivalV925(d,'another-track',15000,confirmed('hook'),'rap',0,4,settings).active,false);});
test('unverified V919 section rejected',()=>{assert.equal(plan(15000,settings,0,'rap',make(),null).active,false);});
test('V919 phase mismatch rejected',()=>{assert.equal(plan(15000,settings,0,'rap',make(),confirmed('drop')).active,false);});
test('V919 confidence mismatch rejected',()=>{assert.equal(plan(15000,settings,0,'rap',make(),confirmed('hook',.8)).active,false);});
test('invalid or expired progress rejected',()=>{for(const at of [-1,NaN,Infinity,60000,70000])assert.equal(plan(at).active,false);});
test('invalid device positions rejected',()=>{for(const [i,n] of [[-1,4],[4,4],[0,0],[0,33],[1.5,4],[0,3.5]])assert.equal(f.planGoveeFestivalV925(make(),'current-v925',15000,confirmed('hook'),'rap',i,n,settings).active,false);});
test('low-confidence cues rejected even with V919 confirmation',()=>{assert.equal(plan(15000,settings,0,'rap',make(.6),confirmed('hook',.6)).active,false);});
test('confidence threshold accepts exactly equal marker',()=>{assert.equal(plan(15000,{...settings,minConfidence:70},0,'rap',make(.7),confirmed('hook',.7)).active,true);});
test('invalid source timestamps rejected',()=>{const a=make();a.sections[0].durationMs=Infinity;assert.equal(plan(15000,settings,0,'rap',a).active,false);});
test('unknown section label rejected',()=>{const a=make();a.sections[1].label='fake-drop';assert.equal(plan(15000,settings,0,'rap',a).active,false);});
test('verse and break remain quiet',()=>{assert.equal(plan(6500).active,false);assert.equal(plan(51500).active,false);});
test('automatic hook uses arena or colorfront',()=>{assert.equal(plan(15500).pattern,'arena');});
test('alternating hooks select different choreography even with intervening verses',()=>{const a=make();a.sections[3].label='hook';const first=plan(15000,settings,0,'rap',a,confirmed('hook'));const second=plan(39000,settings,0,'rap',a,confirmed('hook'));assert.equal(first.pattern,'arena');assert.equal(second.pattern,'colorfront');});
test('very wide finale stagger still reaches last lamp within the finale window',()=>{const d=plan(39200,{...settings,spreadMs:1600},0);assert.equal(d.pattern,'finale');assert.equal(d.active,true);});
test('automatic build chooses mirrored wave',()=>{assert.equal(plan(25000).pattern,'mirror');});
test('automatic confirmed drop starts the finale',()=>{assert.equal(plan(36500,settings,3).pattern,'finale');});
test('later confirmed drop uses colorfront, not repeat finale',()=>{assert.equal(plan(41500).pattern,'colorfront');});
test('forced finale requires actual drop marker',()=>{assert.equal(plan(15000,{...settings,pattern:'finale'}).active,false);assert.equal(plan(37000,{...settings,pattern:'finale'},3).pattern,'finale');});
test('forced patterns work on confirmed build or hook',()=>{for(const pattern of ['arena','mirror','colorfront'])assert.equal(plan(26000,{...settings,pattern}).pattern,pattern);});
test('finale smoothly fades once elapsed',()=>{const early=plan(37800,settings,3),late=plan(39900,settings,3);assert.ok(early.level>0);assert.ok(late.level>=0&&late.level<early.level);});
test('four device positions do not all show identical arena crest',()=>{const levels=[0,1,2,3].map(i=>plan(15500,settings,i).level.toFixed(3));assert.ok(new Set(levels).size>1);});
test('mirror pattern is symmetrical',()=>{const s={...settings,pattern:'mirror'};assert.ok(Math.abs(plan(26000,s,0).level-plan(26000,s,3).level)<1e-12);assert.ok(Math.abs(plan(26000,s,1).level-plan(26000,s,2).level)<1e-12);});
test('genre palettes are distinct',()=>{const values=['Deutschrap','Hardtekk','Hardstyle','Deutschrock'].map(g=>json(f.festivalPaletteV925(g)));assert.equal(new Set(values.map(JSON.stringify)).size,4);});
test('unknown genre returns fallback with bounded colors',()=>{assert.ok(f.festivalPaletteV925('new-wave').every(c=>Object.values(c).every(v=>v>=0&&v<=255)));});
test('RGB changes are mixed with existing show, never wholesale overwritten',()=>{const out=apply(plan(15000));assert.notDeepEqual(json(out.color),base.color);for(const c of ['r','g','b'])assert.ok(Math.abs(out.color[c]-base.color[c])<=90);});
test('saved existing lamp look is unchanged when decision is inactive',()=>{assert.deepEqual(json(apply({...plan(),active:false})),base);});
test('colors unchanged if color mixing zero',()=>{const s={...settings,colorMixPercent:0};assert.deepEqual(json(apply(plan(15000,s),s).color),base.color);});
test('brightness unchanged if boost zero',()=>{const s={...settings,maxBoostPoints:0};assert.equal(apply(plan(15000,s),s).brightness,base.brightness);});
test('lamp brightness boost never exceeds configured maximum',()=>{const s={...settings,maxBoostPoints:4,strength:100};for(let i=0;i<4;i++)assert.ok(apply(plan(17000,s,i),s).brightness<=base.brightness+4);});
test('ambient role adds less than wall when active',()=>{const d=plan(15000);assert.ok(apply(d,settings,'wall').brightness>=apply(d,settings,'ambient').brightness);});
test('master ceiling is respected without dimming a brighter show',()=>{const look={...base,brightness:90};assert.ok(apply(plan(17000),settings,'wall',look,25).brightness>=90);});
test('no power, blackout, or strobe keys in output',()=>{for(const t of [15000,27000,38000]){const a=apply(plan(t));assert.deepEqual(Object.keys(json(a)).sort(),['brightness','color']);assert.ok(a.brightness>=1);}});
test('deterministic decisions for identical source inputs',()=>{assert.deepEqual(json(plan(26000)),json(plan(26000)));});
test('small position differences yield small light movement',()=>{assert.ok(Math.abs(plan(15500).level-plan(15501).level)<.01);});
test('synthetic four-lamp preview is safe and covers all devices',()=>{const x=json(f.previewGoveeFestivalV925(settings,'Hardtekk','hook',3900));assert.deepEqual(x.map(v=>v.name),['H6063','H610B','H61A2','H6051']);assert.ok(x.every(v=>Number.isFinite(v.look.brightness)&&v.look.brightness<=100));});
test('preview drop finale only in verified synthetic drop',()=>{const a=f.previewGoveeFestivalV925({...settings,pattern:'finale'},'hardstyle','hook',1200);const b=f.previewGoveeFestivalV925({...settings,pattern:'finale'},'hardstyle','drop',1200);assert.ok(a.every(v=>!v.decision.active));assert.ok(b.some(v=>v.decision.active));});
test('preview verse and break are neutral',()=>{for(const phase of ['verse','break'])assert.ok(f.previewGoveeFestivalV925(settings,'rap',phase,2000).every(v=>!v.decision.active));});
test('5,000 deterministic pattern, role, intensity and phase combinations stay bounded',()=>{
 const pattern=['auto','arena','mirror','colorfront','finale'];const roles=['wall','rhythm','neon','ambient'];
 const genres=['Deutschrap','Hardtekk','Hardstyle','Deutschrock'];const a=make();
 for(let i=0;i<5000;i++){
  const s={...settings,pattern:pattern[i%5],strength:i%101,colorMixPercent:i%36,maxBoostPoints:i%11,
   periodMs:2500+(i%20)*500,spreadMs:150+(i%30)*50,minConfidence:50+(i%10)*5};
  const at=(i*479)%a.durationMs;
  const current=a.sections.find(item=>item.startMs<=at&&at<item.startMs+item.durationMs);
  const d=f.planGoveeFestivalV925(a,a.trackId,at,confirmed(current.label),genres[i%4],i%4,4,s);
  const color={r:i%256,g:(i*7)%256,b:(i*19)%256};const input={color,brightness:20+i%81};
  const out=f.applyGoveeFestivalV925(input,d,roles[i%4],s,65);
  assert.ok(Number.isInteger(out.brightness)&&out.brightness>=1&&out.brightness<=100,i);
  assert.ok(out.brightness-input.brightness<=s.maxBoostPoints,i);
  for(const x of ['r','g','b'])assert.ok(Number.isInteger(out.color[x])&&out.color[x]>=0&&out.color[x]<=255,i);
 }
});
test('single existing LAN sender and source-group index, group limiter after festival',()=>{
 const sync=read('components/GoveeMusicSyncV909.tsx');
 assert.match(sync,/const festivalPosition=(?:config\.selectedIps\.indexOf\(sourceIp\)|spatialIndexV926\(config\.selectedIps,sourceIp,spatialSettings\))/);
 assert.match(sync,/const festivalDecision=planGoveeFestivalV925/);
 assert.match(sync,/const festivalGrouped=applyGoveeGroupBrightnessV915\(festivalUngrouped,group,config\.masterBrightness\)/);
 assert.match(sync,/festivalDeliveredLook=easeGoveeLookV911\(previous,festivalGrouped\)/);
 assert.equal((sync.match(/'\/command','POST'/g)||[]).length,1);
 assert.doesNotMatch(read('lib/goveeFestivalFxV925.ts'),/fetch\(|setInterval\(|new WebSocket\(/);
});
test('UI mounted and reads live settings without extra sending',()=>{
 const panel=read('components/GoveeLanPanelV909.tsx');const ui=read('components/GoveeFestivalFxStudioV925.tsx');
 assert.match(panel,/<GoveeFestivalFxStudioV925 config=\{config\}\/>/);
 assert.match(ui,/previewGoveeFestivalV925/);assert.match(ui,/planGoveeFestivalV925/);
 assert.doesNotMatch(ui,/goveeBridgeRequestV909|fetch\(/);
});
test('CI, prebuild, and four scripts are preserved',()=>{
 const pkg=JSON.parse(read('package.json'));const ci=read('.github/workflows/v832-continuous-validation.yml');
 for(const name of ['test:v925','test:v925:types','test:v925:ui-types','verify:v925:focused'])assert.ok(pkg.scripts[name]);
 assert.ok(pkg.scripts.prebuild.includes('npm run test:v908 && '));
 assert.ok(pkg.scripts.prebuild.endsWith('npm run check:fast'));
 assert.ok(pkg.scripts.prebuild.indexOf('test:v925')<pkg.scripts.prebuild.indexOf('test:v924'));
 assert.match(ci,/V925 Govee Festival Lighting FX Studio/);assert.match(ci,/V924 Govee Intelligent Light Energy Director/);
});
console.log(`V925 PASS: ${groups} Testgruppen, 5000 deterministische Effekt-/Lichtzustände.`);
