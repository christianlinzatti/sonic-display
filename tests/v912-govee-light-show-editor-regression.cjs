'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const root=path.resolve(__dirname,'..');
const source=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const storage=new Map();let changed=0;
const registry=new Map();
const context={console,URL,setTimeout,clearTimeout,Event:class Event{constructor(type){this.type=type;}},
 window:{dispatchEvent:()=>{changed++;}},localStorage:{getItem:(k)=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))}};
function run(file){
 const compiled=ts.transpileModule(source(file),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const mod={exports:{}};
 const requireLocal=(request)=>{
  if(request==='@/lib/goveeLanV909')return registry.get('lib/goveeLanV909.ts');
  if(request==='@/lib/goveeConcertDirectorV911')return registry.get('lib/goveeConcertDirectorV911.ts');
  throw Error('Unexpected import: '+request);
 };
 vm.runInNewContext(compiled,{...context,module:mod,exports:mod.exports,require:requireLocal});
 registry.set(file,mod.exports);return mod.exports;
}
const base=run('lib/goveeLanV909.ts');const director=run('lib/goveeConcertDirectorV911.ts');const showLib=run('lib/goveeLightShowV912.ts');
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS V912 — '+name);};
const ip='192.168.1.11',other='192.168.1.12';
const config={...base.DEFAULT_GOVEE_CONFIG_V909,masterBrightness:78,directorStrengthV911:70,directorEnabledV911:true};
const input=(phase,previous=phase,transition=1,show)=>({show:show||preset,ip,genre:'Hardtekk',progressMs:25000,
 phase:{phase,previous,transition,verified:phase!=='ambient'},role:'wall',metrics:{bass:.2,beatStrength:0,energyEnvelope:.3,volume:.3},microphoneActive:false,config});
const raw={schema:'govee-light-show-v912',id:'show_123456',name:'Meine Show',createdAt:1,updatedAt:2,cues:{
 [ip]:{verse:{color:{r:0,g:0,b:0},brightness:30,fadeMs:1200},drop:{color:{r:255,g:120,b:200},brightness:99,fadeMs:7000}}}};
const preset=showLib.normalizeGoveeShowV912(raw);
test('V912 remains off in all legacy V909/V911 settings',()=>{
 const old=base.normalizeGoveeConfigV909({directorEnabledV911:true,selectedIps:[ip]});
 assert.equal(old.showEnabledV912,false);assert.equal(old.selectedShowIdV912,'');
 assert.equal(base.normalizeGoveeConfigV909({showEnabledV912:true,selectedShowIdV912:'<script>'}).selectedShowIdV912,'');
});
test('valid phase palette, strict single-lamp keys, and cue normalization',()=>{
 assert.equal(preset.name,'Meine Show');assert.deepEqual(Array.from(showLib.GOVEE_PHASES_V912),['ambient','verse','hook','build','drop','break']);
 assert.equal(preset.cues[ip].verse.brightness,30);
 assert.equal(showLib.normalizeGoveeCueV912({brightness:300,fadeMs:1,color:{r:-9,g:500,b:17.7}}).fadeMs,1200);
 assert.equal(showLib.normalizeGoveeCueV912({brightness:300,fadeMs:1,color:{r:-9,g:500,b:17.7}}).brightness,100);
 assert.equal(showLib.normalizeGoveeShowV912({...raw,cues:{'8.8.8.8':raw.cues[ip], [ip]:raw.cues[ip]}}).cues['8.8.8.8'],undefined);
});
test('malformed or unknown show schema and ID are rejected',()=>{
 for(const x of [null,{},[],{...raw,id:'../secret'},{...raw,schema:'x'},{...raw,name:''}])assert.equal(showLib.normalizeGoveeShowV912(x),null);
});
test('library sanitization bounds and duplicate ID elimination',()=>{
 const many=Array.from({length:17},(_,i)=>({...raw,id:'show_'+String(i).padStart(5,'0')}));
 assert.equal(showLib.normalizeGoveeShowLibraryV912(many).length,12);
 assert.equal(showLib.normalizeGoveeShowLibraryV912([raw,raw]).length,1);
});
test('save and reload only sanitized shows in localStorage (no bridge secret)',()=>{
 assert.doesNotThrow(()=>showLib.saveGoveeShowsV912([preset]));
 assert.equal(changed,1);assert.equal(showLib.loadGoveeShowsV912().length,1);
 assert.equal(storage.get(showLib.GOVEE_SHOWS_KEY_V912).includes('token'),false);
 assert.throws(()=>showLib.saveGoveeShowsV912([preset,preset]),/Maximal 12/);
});
test('immutable editor writes affect only chosen device and phase',()=>{
 const next=showLib.replaceGoveeShowCueV912(preset,other,'hook',{brightness:40,color:{r:10,g:20,b:30},fadeMs:4800});
 assert.equal(next.cues[other].hook.brightness,40);assert.equal(preset.cues[other],undefined);
 assert.equal(next.cues[ip].drop.brightness,99);
 assert.equal(showLib.replaceGoveeShowCueV912(preset,'8.8.8.8','hook',{}),preset);
});
test('hex conversion roundtrip',()=>{
 assert.equal(showLib.colorToHexV912({r:0,g:12,b:255}),'#000cff');
 assert.equal(showLib.hexToGoveeColorV912('#000cFF').b,255);
 assert.throws(()=>showLib.hexToGoveeColorV912('red'),/Ungültiger/);
});
test('saved RGB and brightness used only for configured lamp',()=>{
 const custom=showLib.planGoveeShowLookV912(input('verse'));
 assert.equal(custom.brightness,30);
 assert.equal(showLib.colorToHexV912(custom.color),'#000000');
 const fallback=showLib.planGoveeShowLookV912({...input('verse'),ip:other});
 assert.deepEqual(JSON.parse(JSON.stringify(fallback)),JSON.parse(JSON.stringify(director.planGoveeConcertLookV911({...input('verse'),ip:other}))));
});
test('sensible global cap and brightness floor, even at high drop',()=>{
 const bright=showLib.planGoveeShowLookV912({...input('drop'),config:{...config,masterBrightness:48}});
 assert.equal(bright.brightness,48);
 assert.ok(showLib.planGoveeShowLookV912(input('verse')).brightness>=20);
});
test('per-device transition duration and smooth phase boundaries',()=>{
 assert.equal(showLib.getGoveeFadeMsV912(preset,ip,'drop'),7000);
 assert.equal(showLib.getGoveeFadeMsV912(preset,other,'drop'),3200);
 const sections=[{label:'verse',startMs:0,durationMs:20000,confidence:1},{label:'drop',startMs:20000,durationMs:10000,confidence:1}];
 const analysis={trackId:'t',durationMs:60000,sections};
 const start=director.resolveGoveePhaseV911(analysis,'t',20000,7000);
 const half=director.resolveGoveePhaseV911(analysis,'t',23500,7000);
 assert.equal(start.transition,0);assert.equal(half.transition,.5);
 assert.deepEqual(JSON.parse(JSON.stringify(showLib.planGoveeShowLookV912(input('drop','verse',0)))),
  JSON.parse(JSON.stringify(showLib.planGoveeShowLookV912(input('verse')))));
 const mid=showLib.planGoveeShowLookV912(input('drop','verse',.5));
 assert.ok(mid.color.r>0&&mid.color.r<255);
});
test('unverified song analysis always remains in ambient phase',()=>{
 const noData=director.resolveGoveePhaseV911(null,'t',30000,1200);
 assert.equal(noData.verified,false);assert.equal(noData.phase,'ambient');
 const mismatch=director.resolveGoveePhaseV911({trackId:'other',durationMs:100000,sections:[]},'t',5000,1200);
 assert.equal(mismatch.phase,'ambient');
});
test('no network calls from editor or the core planner and no auto power commands',()=>{
 const editor=source('components/GoveeLightShowEditorV912.tsx'),sync=source('components/GoveeMusicSyncV909.tsx');
 assert.match(editor,/Vorschau und Bearbeitung senden keine Befehle/);
 assert.doesNotMatch(editor,/goveeBridgeRequestV909|fetch\(|action:'power'/);
 assert.match(sync,/config\.showEnabledV912&&config\.directorEnabledV911/);
 assert.match(sync,/planGoveeShowLookV912/);
 assert.match(sync,/getGoveeFadeMsV912/);
 assert.match(sync,/live\.current\.track\?\.id!==state\.track\.id/);
 assert.doesNotMatch(sync,/action:'power'/);
});
test('2500 deterministic show outputs use valid RGB and bounded brightness',()=>{
 for(let i=0;i<2500;i++){
  const b=showLib.planGoveeShowLookV912({...input(i%2?'verse':'drop',i%3?'verse':'ambient',i/2500),
   config:{...config,masterBrightness:20+i%81},progressMs:i*1500});
  assert.ok(Number.isInteger(b.brightness)&&b.brightness>=20&&b.brightness<=100);
  for(const x of Object.values(b.color))assert.ok(Number.isInteger(x)&&x>=0&&x<=255);
 }
});
test('source parser accepts all changed TS/TSX and uses no unsafe helpers',()=>{
 for(const file of ['lib/goveeLanV909.ts','lib/goveeConcertDirectorV911.ts','lib/goveeLightShowV912.ts','components/GoveeLanPanelV909.tsx','components/GoveeMusicSyncV909.tsx','components/GoveeLightShowEditorV912.tsx']){
  const parsed=ts.createSourceFile(file,source(file),ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(parsed.parseDiagnostics.length,0,file);
 }
});
console.log(`V912 PASS ${count} groups (incl. 2500 planners)`);
