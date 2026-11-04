'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const source=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file);
 const code=ts.transpileModule(source(file),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const module={exports:{}};
 vm.runInNewContext(code,{module,exports:module.exports,console,require:(id)=>{
  const refs={'@/lib/goveeLanV909':'lib/goveeLanV909.ts','@/lib/goveeConcertDirectorV911':'lib/goveeConcertDirectorV911.ts',
   '@/lib/goveeLightShowV912':'lib/goveeLightShowV912.ts'};
  if(!refs[id])throw Error('Unexpected dependency: '+id);
  return load(refs[id]);
 }});
 cache.set(file,module.exports);return module.exports;
}
const g=load('lib/goveeColorHarmonyV913.ts');
const s=load('lib/goveeLightShowV912.ts');
const v909=load('lib/goveeLanV909.ts');
const roles=['wall','rhythm','neon','ambient'];const phases=Array.from(s.GOVEE_PHASES_V912);
const ip='192.168.1.21',ip2='192.168.1.22';
const options={base:{r:42,g:70,b:210},scheme:'triadic',strength:90,masterBrightness:80};
const show=s.normalizeGoveeShowV912({schema:'govee-light-show-v912',id:'show_v913_test',name:'Sonic Test',createdAt:1,updatedAt:2,
 cues:{[ip]:{verse:{color:{r:12,g:20,b:32},brightness:44,fadeMs:7800}},[ip2]:{break:{color:{r:30,g:24,b:11},brightness:30,fadeMs:2400}}}});
let n=0;const test=(name,fn)=>{fn();n++;console.log('PASS V913 — '+name);};
const asJson=(v)=>JSON.parse(JSON.stringify(v));
test('five deterministic, user-selectable harmony schemes',()=>{
 assert.deepEqual(Array.from(g.GOVEE_HARMONY_SCHEMES_V913),['analogous','complementary','triadic','split','monochrome']);
 const results=g.GOVEE_HARMONY_SCHEMES_V913.map(scheme=>s.colorToHexV912(g.generateGoveeHarmonyLookV913({...options,scheme},'rhythm','hook').color));
 assert.equal(new Set(results).size,5);
});
test('same inputs yield exactly the same RGB and brightness',()=>{
 const a=g.generateGoveeHarmonyLookV913(options,'neon','verse');
 assert.deepEqual(asJson(a),asJson(g.generateGoveeHarmonyLookV913(options,'neon','verse')));
});
test('role colors are differentiated under triadic palette',()=>{
 const colors=roles.map(role=>s.colorToHexV912(g.generateGoveeHarmonyLookV913(options,role,'hook').color));
 assert.equal(new Set(colors).size,4);
});
test('monochrome retains common hue but distinct luminance/saturation',()=>{
 const all=roles.map(role=>g.generateGoveeHarmonyLookV913({...options,scheme:'monochrome'},role,'verse'));
 assert.equal(new Set(all.map(v=>s.colorToHexV912(v.color))).size,4);
 assert.ok(all[3].brightness<all[0].brightness);
});
test('strength 0 disables hue offsets but strength 100 shifts hues',()=>{
 const a=g.generateGoveeHarmonyLookV913({...options,strength:0},'wall','verse').color;
 const b=g.generateGoveeHarmonyLookV913({...options,strength:0},'rhythm','verse').color;
 const c=g.generateGoveeHarmonyLookV913({...options,strength:100},'rhythm','verse').color;
 assert.ok(b.b>b.r&&a.b>a.r,'base hue retained without offsets');
 assert.notDeepEqual(asJson(b),asJson(c));
});
test('genre recommendations are deterministic and genre-specific',()=>{
 const rap=g.suggestGoveeHarmonyBaseV913('Deutschrap');
 assert.notDeepEqual(asJson(rap),asJson(g.suggestGoveeHarmonyBaseV913('Hardtekk')));
 assert.notDeepEqual(asJson(rap),asJson(g.suggestGoveeHarmonyBaseV913('Deutschrock')));
 assert.deepEqual(asJson(rap),asJson(g.suggestGoveeHarmonyBaseV913('Deutschrap')));
});
test('all phases have visibly different levels without forced strobes',()=>{
 const values=phases.map(phase=>g.generateGoveeHarmonyLookV913(options,'wall',phase).brightness);
 assert.ok(values[4]>values[1]);assert.ok(values[5]<values[1]);
});
test('respects existing master brightness cap and minimum safety level',()=>{
 for(const masterBrightness of [0,10,20,45,65,99,100,999]){
  const look=g.generateGoveeHarmonyLookV913({...options,masterBrightness},'rhythm','drop');
  assert.ok(look.brightness>=20&&look.brightness<=Math.max(20,Math.min(100,masterBrightness)));
 }
});
test('invalid strengths and out-of-range RGB are bounded',()=>{
 for(const strength of [-100,0,50,100,200,NaN,Infinity]){
  const look=g.generateGoveeHarmonyLookV913({...options,base:{r:-200,g:300,b:NaN},strength},'neon','drop');
  for(const value of Object.values(look.color))assert.ok(Number.isInteger(value)&&value>=0&&value<=255);
 }
});
test('apply current phase changes only the selected phase and all selected devices',()=>{
 const next=g.applyGoveeHarmonyToShowV913(show,[{ip,role:'wall'},{ip:ip2,role:'neon'}],options,['verse']);
 assert.ok(next!==show);
 assert.equal(next.cues[ip].verse.fadeMs,7800);
 assert.equal(next.cues[ip2].break.fadeMs,2400);
 assert.equal(next.cues[ip].drop,undefined);
 assert.equal(next.cues[ip2].verse.brightness,g.generateGoveeHarmonyLookV913(options,'neon','verse').brightness);
 assert.equal(show.cues[ip].verse.color.r,12,'original show not mutated');
});
test('six-phase apply is complete, retains custom fade and valid V912 schema',()=>{
 const next=g.applyGoveeHarmonyToShowV913(show,[{ip,role:'wall'},{ip:ip2,role:'rhythm'}],options,phases);
 assert.equal(Object.keys(next.cues[ip]).length,6);
 assert.equal(Object.keys(next.cues[ip2]).length,6);
 assert.equal(next.cues[ip].verse.fadeMs,7800);
 assert.equal(next.cues[ip2].break.fadeMs,2400);
 assert.ok(s.normalizeGoveeShowV912(next));
});
test('public addresses and duplicate IPs are not added to an editor draft',()=>{
 const next=g.applyGoveeHarmonyToShowV913(show,[{ip:'8.8.8.8',role:'wall'},{ip,role:'wall'},{ip,role:'ambient'}],options,phases);
 assert.equal(next.cues['8.8.8.8'],undefined);
 assert.equal(next.cues[ip].drop.brightness,g.generateGoveeHarmonyLookV913(options,'wall','drop').brightness);
});
test('3000 combinations remain valid deterministic color values',()=>{
 for(let i=0;i<3000;i++){
  const look=g.generateGoveeHarmonyLookV913({...options,scheme:g.GOVEE_HARMONY_SCHEMES_V913[i%5],strength:i%101,
   base:{r:i%256,g:(i*37)%256,b:(i*71)%256},masterBrightness:20+i%81},roles[i%4],phases[i%6]);
  assert.ok(Number.isInteger(look.brightness)&&look.brightness>=20&&look.brightness<=100);
  for(const c of Object.values(look.color))assert.ok(Number.isInteger(c)&&c>=0&&c<=255);
 }
});
test('editor preview is read-only, opt-in drafts and no LAN requests',()=>{
 const editor=source('components/GoveeColorHarmonyStudioV913.tsx');
 const parent=source('components/GoveeLightShowEditorV912.tsx');
 assert.match(parent,/GoveeColorHarmonyStudioV913/);
 assert.match(parent,/onApply=\{\(next,text\)=>\{setDraft\(next\);setMessage\(text\);\}\}/);
 assert.match(editor,/applyGoveeHarmonyToShowV913/);
 assert.match(editor,/Änderungen speichern/);
 assert.doesNotMatch(editor,/fetch\(|goveeBridgeRequestV909|localStorage|action:'power'|action:"power"/);
 assert.doesNotMatch(source('lib/goveeColorHarmonyV913.ts'),/fetch\(|goveeBridgeRequestV909|localStorage/);
});
test('TypeScript syntax parser accepts modified TS/TSX',()=>{
 for(const file of ['lib/goveeColorHarmonyV913.ts','components/GoveeColorHarmonyStudioV913.tsx','components/GoveeLightShowEditorV912.tsx']){
  const parsed=ts.createSourceFile(file,source(file),ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(parsed.parseDiagnostics.length,0,file);
 }
});
test('existing V909 configuration remains opt-in without new bridge changes',()=>{
 const config=v909.normalizeGoveeConfigV909({selectedIps:[ip]});
 assert.equal(config.enabled,false);assert.equal(config.autoSync,false);assert.equal(config.showEnabledV912,false);
 assert.ok(!source('components/GoveeColorHarmonyStudioV913.tsx').includes('goveeBridgeRequestV909'));
});
console.log(`V913 PASS ${n} groups (incl. 3000 harmony computations)`);
