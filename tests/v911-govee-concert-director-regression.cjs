'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS V911 — '+name);}
function moduleFrom(file){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 const code=ts.transpileModule(source,{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const mod={exports:{}};vm.runInNewContext(code,{module:mod,exports:mod.exports,URL,console,setTimeout,clearTimeout});
 return mod.exports;
}
const director=moduleFrom('lib/goveeConcertDirectorV911.ts');
const configLib=moduleFrom('lib/goveeLanV909.ts');
const cfg={...configLib.DEFAULT_GOVEE_CONFIG_V909,masterBrightness:72,directorStrengthV911:70};
const audio={bass:.8,beatStrength:.6,energyEnvelope:.45,volume:.3};
const analysis=(sections)=>({schema:'sonic-track-analysis-v318',trackId:'track-a',durationMs:180000,sections,beats:[],bars:[],tempo:null,timeSignature:4,source:'import',importedAt:0});
const section=(label,startMs,durationMs=15000,confidence=.95)=>({label,startMs,durationMs,confidence});
const phase=(name)=>({phase:name,previous:name,transition:1,verified:true});
const plan=(genre,role,section,progressMs=35000,microphoneActive=false)=>director.planGoveeConcertLookV911({genre,role,phase:section,
 progressMs,microphoneActive,metrics:audio,config:cfg});

test('legacy config defaults to opt-in off and retains old settings',()=>{
 const normalized=configLib.normalizeGoveeConfigV909({selectedIps:['192.168.1.10'],autoSync:true,masterBrightness:70});
 assert.equal(normalized.directorEnabledV911,false);
 assert.equal(normalized.directorStrengthV911,65);
 assert.equal(normalized.autoSync,true);assert.deepEqual(Array.from(normalized.selectedIps),['192.168.1.10']);
});
test('profile values filtered and role overrides sanitized',()=>{
 const normalized=configLib.normalizeGoveeConfigV909({directorEnabledV911:true,directorStrengthV911:300,
  deviceRolesV911:{'192.168.1.2':'rhythm','8.8.8.8':'wall','192.168.1.3':'unsafe','192.168.1.4':'auto'}});
 assert.equal(normalized.directorEnabledV911,true);assert.equal(normalized.directorStrengthV911,100);
 assert.deepEqual(Object.keys(normalized.deviceRolesV911).sort(),['192.168.1.2','192.168.1.4']);
});
test('specific H6063 H610B H61A2 H6051 models assigned distinct roles',()=>{
 assert.deepEqual(['H6063','H610B','H61A2','H6051'].map(s=>director.resolveGoveeRoleV911('auto',s)),
  ['wall','rhythm','neon','ambient']);
 assert.equal(director.resolveGoveeRoleV911('rhythm','H6051'),'rhythm');
 assert.equal(director.resolveGoveeRoleV911('auto','UNKNOWN'),'ambient');
});
test('section changes require valid track ID, label, confidence, duration',()=>{
 const a=analysis([section('verse',0,20000),section('drop',20000,10000,.95)]);
 assert.equal(director.resolveGoveePhaseV911(a,'track-a',5000).phase,'verse');
 assert.equal(director.resolveGoveePhaseV911(a,'track-a',24000).phase,'drop');
 assert.equal(director.resolveGoveePhaseV911(a,'other-track',24000).phase,'ambient');
 assert.equal(director.resolveGoveePhaseV911(a,'track-a',31000).phase,'ambient');
 assert.equal(director.resolveGoveePhaseV911(a,'track-a',-1).phase,'ambient');
 assert.equal(director.resolveGoveePhaseV911(a,'track-a',NaN).phase,'ambient');
 assert.equal(director.resolveGoveePhaseV911(analysis([section(undefined,0)]),'track-a',5000).phase,'ambient');
 assert.equal(director.resolveGoveePhaseV911(analysis([section('drop',0,15000,.49)]),'track-a',5000).phase,'ambient');
});
test('verified phase boundary fades instead of instant drop flash',()=>{
 const a=analysis([section('verse',0,20000),section('drop',20000,10000)]);
 const first=director.resolveGoveePhaseV911(a,'track-a',20000);
 assert.equal(first.phase,'drop');assert.equal(first.previous,'verse');assert.equal(first.transition,0);
 assert.equal(director.resolveGoveePhaseV911(a,'track-a',21600).transition,.5);
 const end=director.resolveGoveePhaseV911(a,'track-a',24000);
 assert.equal(end.previous,'drop');assert.equal(end.transition,1);
 const startLook=plan('Deutschrap','rhythm',first,20000),verse=plan('Deutschrap','rhythm',phase('verse'),20000);
 assert.deepEqual(startLook,verse);
});
test('unlabeled/low-confidence section has no fake verse/drop',()=>{
 const a=analysis([section('build',0,15000,.2),section('hook',15000,13000,.6)]);
 assert.equal(director.resolveGoveePhaseV911(a,'track-a',5000).verified,false);
 const next=director.resolveGoveePhaseV911(a,'track-a',15000);
 assert.equal(next.previous,'ambient');assert.equal(next.phase,'hook');
});
test('overlapping valid markers use latest active section',()=>{
 const a=analysis([section('verse',0,25000),section('hook',18000,10000)]);
 assert.equal(director.resolveGoveePhaseV911(a,'track-a',20000).phase,'hook');
});
test('genres, sections and distinct device roles produce distinct safe looks',()=>{
 for(const genre of ['Deutschrap','Hardtekk','Hardstyle','Deutschrock','Pop']){
  const looks=['wall','rhythm','neon','ambient'].map(role=>plan(genre,role,phase('drop')));
  assert.ok(new Set(looks.map(l=>`${l.color.r},${l.color.g},${l.color.b}`)).size>=3,genre);
  for(const look of looks)assert.ok(look.brightness>=20&&look.brightness<=84,`${genre} brightness`);
 }
 assert.notDeepEqual(plan('Deutschrap','wall',phase('verse')),plan('Hardtekk','wall',phase('verse')));
 assert.notDeepEqual(plan('Deutschrap','wall',phase('verse')),plan('Deutschrap','wall',phase('hook')));
});
test('without microphone no fake beat-based brightness pumping',()=>{
 const quiet={bass:0,beatStrength:0,energyEnvelope:.4,volume:.4};
 const heavy={bass:1,beatStrength:1,energyEnvelope:.4,volume:.4};
 const input={genre:'Hardtekk',phase:phase('drop'),role:'rhythm',progressMs:30000,config:cfg,microphoneActive:false};
 assert.deepEqual(director.planGoveeConcertLookV911({...input,metrics:quiet}),
  director.planGoveeConcertLookV911({...input,metrics:heavy}));
 const liveQuiet=director.planGoveeConcertLookV911({...input,microphoneActive:true,metrics:quiet});
 const liveKick=director.planGoveeConcertLookV911({...input,microphoneActive:true,metrics:heavy});
 assert.ok(liveKick.brightness>=liveQuiet.brightness);
});
test('director strength zero falls back to ambient look regardless of named section',()=>{
 const weak={...cfg,directorStrengthV911:0};
 const input={genre:'Hardstyle',progressMs:32000,role:'wall',metrics:audio,microphoneActive:false,config:weak};
 assert.deepEqual(director.planGoveeConcertLookV911({...input,phase:phase('drop')}),
  director.planGoveeConcertLookV911({...input,phase:phase('ambient')}));
});
test('soft-step limits brightness and RGB jumps; no strobe commands',()=>{
 const before={color:{r:0,g:0,b:0},brightness:20},after={color:{r:255,g:255,b:255},brightness:100};
 let out=before;
 for(let i=0;i<20;i++){
  const next=director.easeGoveeLookV911(out,after);
  assert.ok(Math.abs(next.brightness-out.brightness)<=7);
  for(const k of ['r','g','b'])assert.ok(Math.abs(next.color[k]-out.color[k])<=24);
  out=next;
 }
 assert.equal(director.changedGoveeLookV911(after,after),false);
 assert.equal(director.changedGoveeLookV911(undefined,after),true);
});
test('1500 phase/role/genre combinations are finite and stay within safe bounds',()=>{
 const phases=['ambient','verse','hook','build','drop','break'];const roles=['wall','rhythm','neon','ambient'];
 for(let i=0;i<1500;i++){
  const c={...cfg,masterBrightness:1+i%100,directorStrengthV911:i%101};
  const x=director.planGoveeConcertLookV911({config:c,genre:['Deutschrap','Hardtekk','Deutschrock'][i%3],
   progressMs:i*1700,phase:phase(phases[i%6]),role:roles[(i>>1)%4],microphoneActive:i%2===0,
   metrics:{bass:(i%11)/10,beatStrength:(i%7)/7,energyEnvelope:(i%17)/17,volume:(i%13)/13}});
  assert.ok(x.brightness>=20&&x.brightness<=100);
  for(const n of Object.values(x.color))assert.ok(Number.isInteger(n)&&n>=0&&n<=255);
 }
});
test('integration is opt-in, keeps V909 and does not issue automatic power commands',()=>{
 const sync=fs.readFileSync(path.join(root,'components/GoveeMusicSyncV909.tsx'),'utf8');
 const panel=fs.readFileSync(path.join(root,'components/GoveeLanPanelV909.tsx'),'utf8');
 assert.match(sync,/if\(!config\?\.enabled\|\|!config\.autoSync/);
 assert.match(sync,/config\.directorEnabledV911/);
 assert.match(sync,/resolveGoveePhaseV911\(analysis\.current/);
 assert.match(sync,/live\.current\.track\?\.id!==state\.track\.id/);
 assert.match(sync,/window\.setInterval\(\(\)=>void tick\(\),1700\)/);
 assert.doesNotMatch(sync,/action:'power'/);
 assert.match(panel,/V911 · Concert Light Director/);
 assert.match(panel,/Vorschau sendet keine Befehle/);
 assert.match(panel,/if\(config\.autoSync\)update\(\{autoSync:false\}\)/);
 for(const file of ['lib/goveeConcertDirectorV911.ts','lib/goveeLanV909.ts','components/GoveeMusicSyncV909.tsx','components/GoveeLanPanelV909.tsx']){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  const parsed=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(parsed.parseDiagnostics.length,0,file);
 }
});
console.log(`V911 PASS ${checks} groups`);
