'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const source=f=>fs.readFileSync(path.join(root,f),'utf8');
const refMap={
 '@/lib/goveeLanV909':'lib/goveeLanV909.ts',
 '@/lib/goveeConcertDirectorV911':'lib/goveeConcertDirectorV911.ts',
 '@/lib/goveeLightShowV912':'lib/goveeLightShowV912.ts',
 '@/lib/goveeTransitionsV914':'lib/goveeTransitionsV914.ts',
 '@/lib/goveePresetLibraryV916':'lib/goveePresetLibraryV916.ts'
};
const cache=new Map(),local=new Map(),events=[];
function load(file){
 if(cache.has(file))return cache.get(file);
 const output=ts.transpileModule(source(file),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(output.diagnostics?.length??0,0,`TypeScript transpile ${file}`);
 const mod={exports:{}};
 vm.runInNewContext(output.outputText,{module:mod,exports:mod.exports,console,
  window:{dispatchEvent:e=>events.push(e.type)},Event:class {constructor(type){this.type=type;}},
  localStorage:{getItem:key=>local.get(key)??null,setItem:(key,v)=>local.set(key,v)},
  require:id=>{if(!refMap[id])throw Error('Unexpected runtime import '+id);return load(refMap[id]);}});
 cache.set(file,mod.exports);return mod.exports;
}
const lib=load('lib/goveePresetLibraryV916.ts');
const v912=load('lib/goveeLightShowV912.ts');
const json=x=>JSON.parse(JSON.stringify(x));
const ips=['192.168.1.30','192.168.1.31','192.168.1.32','192.168.1.33'];
const roles=['wall','rhythm','neon','ambient'];
const targets=ips.map((ip,i)=>({ip,role:roles[i]}));
const phases=['ambient','verse','hook','build','drop','break'];
const genres=['deutschrap','hardtekk','hardstyle','deutschrock'];
const presetId='tekk_neon_rave';
const blank=()=>({schema:'govee-light-show-v912',id:'show_001',name:'My old show',createdAt:100,updatedAt:100,cues:{}});
let groups=0;const test=(name,fn)=>{fn();console.log('PASS V916 — '+name);groups++;};

test('eight offline curated presets, two for each supported genre',()=>{
 assert.equal(lib.GOVEE_PRESETS_V916.length,8);
 assert.equal(new Set(lib.GOVEE_PRESETS_V916.map(p=>p.id)).size,8);
 for(const genre of genres)assert.equal(lib.GOVEE_PRESETS_V916.filter(p=>p.genre===genre).length,2);
 assert.match(source('lib/goveePresetLibraryV916.ts'),/No bridge credentials/);
 assert.doesNotMatch(source('lib/goveePresetLibraryV916.ts'),/\bfetch\(|https?:\/\/|\.token\b|goveeBridgeRequestV909/);
});
test('each preset describes a distinct editable light style with six valid RGB palette entries',()=>{
 const colors=new Set();
 for(const p of lib.GOVEE_PRESETS_V916){
  assert.match(p.id,/^[a-z0-9_]+$/);assert.ok(p.name.length>8&&p.name.length<=48);assert.ok(p.description.length>24);
  assert.ok(p.brightnessScale>=.6&&p.brightnessScale<=1);assert.ok(p.fadeMs>=1200&&p.fadeMs<=12000);
  for(const k of [...roles,'hook','drop']){assert.match(p.palette[k],/^#[a-fA-F0-9]{6}$/);colors.add(p.palette[k]);}
 }
 assert.ok(colors.size>=35,'varied concert palettes rather than a shared color');
});
test('recommended preset follows music genre, without guessing song sections',()=>{
 assert.equal(lib.recommendGoveePresetIdV916('German Deutschrap'),'rap_nachtstadt');
 assert.equal(lib.recommendGoveePresetIdV916('Hardtekk 165 BPM'),'tekk_neon_rave');
 assert.equal(lib.recommendGoveePresetIdV916('Hardstyle'),'hardstyle_euphoric');
 assert.equal(lib.recommendGoveePresetIdV916('NDH / Industrial Metal'),'rock_rote_arena');
 assert.equal(lib.recommendGoveePresetIdV916(''), 'rap_nachtstadt');
});
test('all four model roles have unique colors for a concrete preset and phase',()=>{
 const colors=roles.map(role=>json(lib.getGoveePresetCueV916(presetId,role,'verse').color));
 assert.equal(new Set(colors.map(JSON.stringify)).size,4);
});
test('all presets support all six phases for all four roles',()=>{
 let evaluated=0;
 for(const preset of lib.GOVEE_PRESETS_V916)for(const role of roles)for(const phase of phases){
  const cue=json(lib.getGoveePresetCueV916(preset.id,role,phase));evaluated++;
  assert.ok(cue.brightness>=20&&cue.brightness<=100);
  assert.ok(cue.fadeMs>=1200&&cue.fadeMs<=12000);
  assert.ok(['smooth','linear','sine','ease-in','ease-out','cinematic'].includes(cue.curveV914));
  assert.ok(['steady','breath','lift'].includes(cue.motionV914));
  for(const value of Object.values(cue.color))assert.ok(Number.isInteger(value)&&value>=0&&value<=255);
 }
 assert.equal(evaluated,8*4*6);
});
test('hook and drop are brighter than verse for every preset, role',()=>{
 for(const p of lib.GOVEE_PRESETS_V916)for(const role of roles){
  const verse=lib.getGoveePresetCueV916(p.id,role,'verse').brightness;
  const hook=lib.getGoveePresetCueV916(p.id,role,'hook').brightness;
  const drop=lib.getGoveePresetCueV916(p.id,role,'drop').brightness;
  assert.ok(hook>verse,`${p.id} ${role} hook`);
  assert.ok(drop>hook,`${p.id} ${role} drop`);
 }
});
test('break stays subdued and no preset uses flashing transitions',()=>{
 for(const p of lib.GOVEE_PRESETS_V916)for(const role of roles){
  const pause=lib.getGoveePresetCueV916(p.id,role,'break');
  assert.ok(pause.brightness<=40);assert.equal(pause.motionV914,'breath');
  assert.ok(pause.fadeMs>=1200);
 }
});
test('unknown preset, role, phase are rejected without creating cues',()=>{
 assert.equal(lib.getGoveePresetCueV916('missing','wall','drop'),null);
 assert.equal(lib.getGoveePresetCueV916(presetId,'fake','drop'),null);
 assert.equal(lib.getGoveePresetCueV916(presetId,'wall','fake'),null);
 assert.equal(lib.getGoveePresetV916('missing'),undefined);
});
test('preset creation is compatible with unchanged V912 schema and all selected lamps',()=>{
 const created=json(lib.createGoveePresetShowV916(presetId,targets,'new_preset_001',1234));
 assert.equal(created.schema,'govee-light-show-v912');assert.equal(created.id,'new_preset_001');
 assert.equal(created.createdAt,1234);assert.equal(created.updatedAt,1234);
 assert.deepEqual(Object.keys(created.cues),ips);
 for(const ip of ips)assert.deepEqual(Object.keys(created.cues[ip]),phases);
 assert.deepEqual(json(v912.normalizeGoveeShowV912(created)),created);
});
test('different preset show ids produce distinct shows with original preset colors',()=>{
 const one=lib.createGoveePresetShowV916('rap_nachtstadt',targets,'preset_first',1234);
 const two=lib.createGoveePresetShowV916('rock_stahlblau',targets,'preset_second',1234);
 assert.notDeepEqual(json(one.cues),json(two.cues));
 assert.notEqual(one.id,two.id);assert.ok(one.name.includes('Deutschrap'));
});
test('creation refuses invalid show IDs, timestamps, zero or invalid selected targets',()=>{
 assert.equal(lib.createGoveePresetShowV916(presetId,targets,'bad!',1234),null);
 assert.equal(lib.createGoveePresetShowV916(presetId,targets,'valid_id',-1),null);
 assert.equal(lib.createGoveePresetShowV916(presetId,targets,'valid_id',NaN),null);
 assert.equal(lib.createGoveePresetShowV916('missing',targets,'valid_id',1234),null);
 assert.equal(lib.createGoveePresetShowV916(presetId,[], 'valid_id',1234),null);
 assert.equal(lib.createGoveePresetShowV916(presetId,[{ip:'8.8.8.8',role:'wall'}], 'valid_id',1234),null);
});
test('duplicate and untrusted device IPs are skipped, with no network side effects',()=>{
 const created=lib.createGoveePresetShowV916(presetId,[targets[0],targets[0],{ip:'127.0.0.1',role:'wall'},
  {ip:'8.8.8.8',role:'neon'},{ip:'192.168.2.55',role:'invalid-role'}],'safe_one',1234);
 assert.deepEqual(Object.keys(created.cues),[ips[0]]);
});
test('full-show apply modifies only selected lamps and keeps other cues untouched',()=>{
 const old={...blank(),cues:{[ips[1]]:{verse:{color:{r:1,g:2,b:3},brightness:22,fadeMs:3200}},[ips[3]]:{drop:{color:{r:5,g:6,b:7},brightness:31,fadeMs:8000}}}};
 const original=json(old);
 const next=lib.applyGoveePresetToShowV916(old,presetId,[targets[0]],'all','hook');
 assert.deepEqual(json(next.cues[ips[1]]),original.cues[ips[1]]);
 assert.deepEqual(json(next.cues[ips[3]]),original.cues[ips[3]]);
 assert.equal(next.id,old.id);assert.equal(next.updatedAt,old.updatedAt);
 assert.deepEqual(json(old),original);
});
test('phase-only apply leaves five phases unchanged',()=>{
 const old=lib.createGoveePresetShowV916('rap_nachtstadt',targets,'old_first',5678);
 const snapshot=json(old);
 const next=lib.applyGoveePresetToShowV916(old,presetId,[targets[0]],'phase','hook');
 for(const phase of phases.filter(p=>p!=='hook'))assert.deepEqual(json(next.cues[ips[0]][phase]),snapshot.cues[ips[0]][phase]);
 assert.notDeepEqual(json(next.cues[ips[0]].hook),snapshot.cues[ips[0]].hook);
 for(const ip of ips.slice(1))assert.deepEqual(json(next.cues[ip]),snapshot.cues[ip]);
});
test('invalid preset or phase leaves the original V912 show untouched',()=>{
 const old=blank();
 assert.equal(lib.applyGoveePresetToShowV916(old,'nonexistent',targets,'all','hook'),old);
 assert.equal(lib.applyGoveePresetToShowV916(old,presetId,targets,'invalid','hook'),old);
 assert.equal(lib.applyGoveePresetToShowV916(old,presetId,targets,'phase','unknown'),old);
});
test('favorites normalize unknown IDs, duplicates and nonarray inputs',()=>{
 assert.deepEqual(json(lib.normalizeGoveePresetFavoritesV916([presetId,presetId,'unknown',null,'rap_nachtstadt'])),[presetId,'rap_nachtstadt']);
 assert.deepEqual(json(lib.normalizeGoveePresetFavoritesV916({ids:[presetId]})),[]);
});
test('favorite storage is local and dispatches same-tab event',()=>{
 lib.saveGoveePresetFavoritesV916([presetId,'rap_nachtstadt','bad',presetId]);
 assert.deepEqual(JSON.parse(local.get(lib.GOVEE_PRESET_FAVORITES_KEY_V916)),[presetId,'rap_nachtstadt']);
 assert.deepEqual(json(lib.loadGoveePresetFavoritesV916()),[presetId,'rap_nachtstadt']);
 assert.ok(events.includes(lib.GOVEE_PRESET_FAVORITES_EVENT_V916));
});
test('favorite loader safely handles malformed JSON',()=>{
 local.set(lib.GOVEE_PRESET_FAVORITES_KEY_V916,'{invalid');
 assert.deepEqual(json(lib.loadGoveePresetFavoritesV916()),[]);
});
test('existing light-show save/load accepts V916-created shows without migration',()=>{
 const newShow=lib.createGoveePresetShowV916(presetId,targets,'saved_preset_001',1000);
 v912.saveGoveeShowsV912([newShow]);
 const restored=json(v912.loadGoveeShowsV912());
 assert.deepEqual(restored,[json(newShow)]);
});
test('4000 deterministic preset cue calculations across music genres and phases',()=>{
 let checks=0;for(let i=0;i<4000;i++){
  const preset=lib.GOVEE_PRESETS_V916[i%8];const role=roles[Math.floor(i/8)%4];const phase=phases[Math.floor(i/32)%6];
  const a=lib.getGoveePresetCueV916(preset.id,role,phase);
  const b=lib.getGoveePresetCueV916(preset.id,role,phase);
  assert.deepEqual(json(a),json(b));checks++;
 }assert.equal(checks,4000);
});
test('editor integration provides explicit create/apply and never direct LAN commands',()=>{
 const studio=source('components/GoveePresetStudioV916.tsx');
 const editor=source('components/GoveeLightShowEditorV912.tsx');
 assert.match(studio,/GoveePresetStudioV916/);assert.match(studio,/onCreate\(next\)/);assert.match(studio,/onApply\(next,/);
 assert.match(studio,/Nur Favoriten/);assert.match(studio,/Alle sechs Songphasen/);
 assert.match(studio,/Vorschau.*keine/);assert.doesNotMatch(studio,/goveeBridgeRequestV909|\bfetch\(/);
 assert.match(editor,/import \{GoveePresetStudioV916\}/);
 assert.match(editor,/<GoveePresetStudioV916/);
 assert.match(editor,/setDraft\(next\)/);assert.match(editor,/showEnabledV912:false/);
});
test('React TSX and TypeScript sources parse without syntactic diagnostics',()=>{
 for(const file of ['components/GoveePresetStudioV916.tsx','components/GoveeLightShowEditorV912.tsx',
  'lib/goveePresetLibraryV916.ts']){
  const node=ts.createSourceFile(file,source(file),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(node.parseDiagnostics.length,0,`Syntax diagnostics ${file}`);
 }
});
test('V916 documented in prebuild and cross-platform CI before production gate',()=>{
 const pkg=JSON.parse(source('package.json'));
 assert.ok(pkg.scripts.prebuild.includes('npm run test:v916 && npm run test:v916:types && npm run test:v916:ui-types &&'));
 assert.equal(pkg.scripts['test:v916'],'node tests/v916-govee-preset-library-regression.cjs');
 assert.ok(pkg.scripts['verify:v916:focused'].includes('verify:v915:focused'));
 const ci=source('.github/workflows/v832-continuous-validation.yml');
 assert.match(ci,/V916 Govee Smart Light Preset Library/);
 assert.match(ci,/npm run test:v916 && npm run test:v916:types && npm run test:v916:ui-types/);
});
console.log(`PASS V916 — ${groups} test groups, 4,000 deterministic cue calculations`);
