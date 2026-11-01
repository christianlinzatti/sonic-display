'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const cache=new Map();
function load(filename){
 const file=path.resolve(filename.endsWith('.ts')?filename:filename+'.ts');
 if(cache.has(file))return cache.get(file).exports;
 const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 assert.equal((compiled.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,'parse '+file);
 const mod={exports:{}};cache.set(file,mod);
 vm.runInThisContext('(function(require,module,exports){'+compiled.outputText+'\n})',{filename:file})(name=>name.startsWith('.')?load(path.join(path.dirname(file),name)):require(name),mod,mod.exports);
 return mod.exports;
}
const p=load('lib/lastfm-dashboard-presets-v724.ts');
const old=load('lib/lastfm-dashboard-layout-v723.ts');
const {defaultDashboardPresetsV724:defaults,builtInDashboardPresetV724:builtin,
 dashboardPresetsKeyV724:key,parseDashboardPresetsV724:parse,serializeDashboardPresetsV724:serialize,
 readDashboardPresetsV724:read,writeDashboardPresetsV724:write,selectDashboardPresetV724:select,
 activeDashboardPresetV724:active,updateActiveDashboardLayoutV724:update,resetActiveDashboardPresetV724:reset,
 createDashboardPresetV724:create,renameDashboardPresetV724:rename,deleteDashboardPresetV724:remove,
 validPresetNameV724:validName,isBuiltInDashboardPresetV724:isBuiltin,
 V724_BUILTIN_IDS:ids,V724_MAX_PRESETS:max,V724_PRESETS_PREFIX:prefix}=p;
let checks=0;
function test(name,fn){try{fn();checks++;}catch(e){e.message=`V724 ${name}: ${e.message}`;throw e;}}
function store(){const data=new Map();return {data,getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};}
const initial=defaults();
test('schema version',()=>assert.equal(initial.version,1));
test('five default presets',()=>assert.equal(initial.presets.length,5));
test('default active',()=>assert.equal(initial.activeId,'personal'));
test('all builtin ids',()=>assert.deepEqual(initial.presets.map(x=>x.id),Array.from(ids)));
test('all builtin names unique',()=>assert.equal(new Set(initial.presets.map(x=>x.name)).size,5));
test('all layouts have six widgets',()=>assert(initial.presets.every(x=>x.layout.length===6)));
test('all layouts have enabled widgets',()=>assert(initial.presets.every(x=>x.layout.some(w=>w.enabled))));
test('all layouts all widget IDs',()=>assert(initial.presets.every(x=>new Set(x.layout.map(w=>w.id)).size===6)));
test('builtins fresh',()=>{const a=defaults(),b=defaults();a.presets[0].layout[0].enabled=false;assert.equal(b.presets[0].layout[0].enabled,true);});
for(const id of ids){
 test(`built-in ${id} exists`,()=>assert.equal(builtin(id).id,id));
 test(`built-in ${id} layout validates`,()=>assert(parse({...initial,presets:[...initial.presets.filter(x=>x.id!==id),builtin(id)]})));
 test(`built-in ${id} has visible widgets`,()=>assert(builtin(id).layout.some(w=>w.enabled)));
}
test('concert starts with shortcuts',()=>assert.equal(builtin('concert').layout[0].id,'shortcuts'));
test('history starts with activity',()=>assert.equal(builtin('history').layout[0].id,'activity'));
test('discovery starts with discoveries',()=>assert.equal(builtin('discoveries').layout[0].id,'discoveries'));
test('statistics starts with metrics',()=>assert.equal(builtin('statistics').layout[0].id,'metrics'));
test('personal equals V723 default',()=>assert.deepEqual(builtin('personal').layout,old.defaultDashboardLayoutV723()));
test('account canonical',()=>assert.equal(key('Example'),prefix+'example'));
test('username case folded',()=>assert.equal(key('UPPER'),key('upper')));
for(const invalid of ['','!',' ä ','ä','user/name','a'.repeat(65),'has\nnewline'])test(`invalid account ${JSON.stringify(invalid)}`,()=>assert.equal(key(invalid),null));
test('64-char username supported',()=>assert(key('a'.repeat(64))));
const raw=serialize(initial);
test('roundtrip',()=>assert.deepEqual(parse(raw),initial));
test('parse object',()=>assert.deepEqual(parse(JSON.parse(raw)),initial));
test('serialized version',()=>assert.equal(JSON.parse(raw).version,1));
test('serialized schema full',()=>assert.equal(JSON.parse(raw).presets.length,5));
test('no unsaved references after parse',()=>{const a=parse(raw);a.presets[0].layout[0].enabled=false;assert.equal(initial.presets[0].layout[0].enabled,true);});
const corrupt=[null,0,[],{},'','invalid-json',JSON.stringify({version:2,presets:initial.presets,activeId:'personal'}),
 {version:1,presets:initial.presets,activeId:'lost'},
 {version:1,presets:[],activeId:'personal'},
 {version:1,presets:initial.presets.slice(1),activeId:'personal'},
 {version:1,presets:[...initial.presets,initial.presets[0]],activeId:'personal'},
 {version:1,presets:initial.presets.map((x,i)=>i===0?{...x,name:'  Wrong'}:x),activeId:'personal'},
 {version:1,presets:initial.presets.map((x,i)=>i===0?{...x,id:'INVALID!'}:x),activeId:'personal'},
 {version:1,presets:initial.presets.map((x,i)=>i===0?{...x,layout:[]} : x),activeId:'personal'},
 {version:1,presets:initial.presets.map((x,i)=>i===0?{...x,layout:x.layout.map(w=>({...w,enabled:false}))}:x),activeId:'personal'},
 {version:1,presets:initial.presets.map((x,i)=>i===0?{...x,layout:x.layout.slice(1)}:x),activeId:'personal'},
 {version:1,presets:initial.presets.map((x,i)=>i===0?{...x,layout:[...x.layout.slice(0,5),x.layout[0]]}:x),activeId:'personal'},
 {version:1,presets:initial.presets.map((x,i)=>i===1?{...x,name:'Mein Dashboard'}:x),activeId:'personal'},
 {version:1,presets:initial.presets.map((x,i)=>i===0?{...x,layout:x.layout.map((w,j)=>j===0?{...w,size:'huge'}:w)}:x),activeId:'personal'},
 {version:1,presets:initial.presets.map((x,i)=>i===0?{...x,layout:x.layout.map((w,j)=>j===0?{...w,id:'other'}:w)}:x),activeId:'personal'},
 {version:1,presets:[...initial.presets,...Array.from({length:max},(_,i)=>({id:'custom-'+(i+1),name:'Extra '+i,layout:initial.presets[0].layout}))],activeId:'personal'}
];
corrupt.forEach((c,i)=>test('reject malformed payload '+i,()=>assert.equal(parse(c),null)));
test('serialized corrupted fails',()=>assert.throws(()=>serialize({...initial,activeId:'missing'})));
for(const invalid of ['',' ','bad\nname','a'.repeat(41),' <script> ',' bad','bad ','a\u0000b'])test('bad preset name '+JSON.stringify(invalid),()=>assert(!validName(invalid)));
for(const good of ['Test','Mein Konzert 2','Rock & Rap','Änderung','a'.repeat(40),'A/B'])test('allowed preset name '+JSON.stringify(good),()=>assert(validName(good)));
test('non-string name rejected',()=>assert(!validName(null)));
test('active default',()=>assert.equal(active(initial).id,'personal'));
test('select existing',()=>assert.equal(select(initial,'history').activeId,'history'));
test('invalid select ignores',()=>assert.equal(select(initial,'notfound'),initial));
test('select does not mutate source',()=>{select(initial,'concert');assert.equal(initial.activeId,'personal');});
test('built-in known',()=>assert(isBuiltin('statistics')));
test('custom not built-in',()=>assert(!isBuiltin('custom-1')));
test('create custom',()=>assert.equal(create(initial,'Mein Mix').presets.length,6));
test('create selects new',()=>assert.equal(create(initial,'Mein Mix').activeId,'custom-1'));
test('create copies active layout',()=>{const a=create(select(initial,'history'),'Historie 2');assert.deepEqual(active(a).layout,builtin('history').layout);});
test('created layout isolated',()=>{const a=create(initial,'Test');a.presets[5].layout[0].enabled=false;assert(initial.presets[0].layout[0].enabled);});
test('duplicate name refused',()=>assert.equal(create(initial,'Konzert'),null));
test('duplicate case refused',()=>assert.equal(create(initial,'kONZERT'),null));
test('bad name refused',()=>assert.equal(create(initial,'  '),null));
test('creating does not mutate source',()=>{create(initial,'Test');assert.equal(initial.presets.length,5);});
const mine=create(initial,'Mein Mix');
test('rename custom',()=>assert.equal(active(rename(mine,mine.activeId,'Neuer Name')).name,'Neuer Name'));
test('rename builtin blocked',()=>assert.equal(rename(initial,'concert','Etwas'),null));
test('rename not found blocked',()=>assert.equal(rename(initial,'no','Etwas'),null));
test('rename duplicate blocked',()=>assert.equal(rename(mine,mine.activeId,'Statistiken'),null));
test('rename custom case duplicate blocked',()=>assert.equal(rename(mine,mine.activeId,'kOnZeRt'),null));
test('rename same allowed',()=>assert(rename(mine,mine.activeId,'Mein Mix')));
test('rename other preset untouched',()=>assert.equal(rename(mine,mine.activeId,'Mix 2').presets[1].name,'Konzert'));
test('delete custom',()=>assert.equal(remove(mine,mine.activeId).presets.length,5));
test('delete active fallback personal',()=>assert.equal(remove(mine,mine.activeId).activeId,'personal'));
test('cannot delete builtin',()=>assert.equal(remove(initial,'concert'),null));
test('cannot delete personal',()=>assert.equal(remove(initial,'personal'),null));
test('cannot delete missing',()=>assert.equal(remove(initial,'custom-99'),null));
test('delete inactive preserves active',()=>{const a=create(create(initial,'A'),'B');assert.equal(remove(a,'custom-1').activeId,'custom-2');});
test('create id reuse after delete',()=>{const a=create(remove(mine,'custom-1'),'Neue Kopie');assert.equal(a.activeId,'custom-1');});
test('update active layout',()=>{const a=update(initial,old.resizeDashboardWidgetV723(active(initial).layout,'records'));assert.equal(active(a).layout.find(w=>w.id==='records').size,'full');});
test('update only active',()=>{const a=update(select(initial,'concert'),old.toggleDashboardWidgetV723(builtin('concert').layout,'trends'));assert.deepEqual(a.presets[0].layout,builtin('personal').layout);});
test('update rejects invalid',()=>assert.equal(update(initial,[]),initial));
test('update rejects all disabled',()=>assert.equal(update(initial,initial.presets[0].layout.map(w=>({...w,enabled:false}))),initial));
test('reset builtin exact',()=>{const edited=update(select(initial,'history'),old.resizeDashboardWidgetV723(builtin('history').layout,'activity'));assert.deepEqual(active(reset(edited)).layout,builtin('history').layout);});
test('reset custom uses V723 base',()=>{const a=create(select(initial,'concert'),'Custom');assert.deepEqual(active(reset(a)).layout,old.defaultDashboardLayoutV723());});
test('reset preserves other presets',()=>{const a=create(initial,'Custom');assert.deepEqual(reset(a).presets[1],initial.presets[1]);});
test('create multiple',()=>{const a=create(create(initial,'Custom 1'),'Custom 2');assert.equal(a.presets.length,7);});
test('max presets enforced',()=>{let a=initial;for(let n=1;n<=max-5;n++)a=create(a,`Custom ${n}`);assert.equal(a.presets.length,max);assert.equal(create(a,'Over Limit'),null);});
test('parse max exact',()=>{let a=initial;for(let n=1;n<=max-5;n++)a=create(a,`Custom ${n}`);assert(parse(serialize(a)));});
const s=store();
test('fresh read',()=>{const a=read(s,'User');assert.equal(a.state.activeId,'personal');assert.equal(a.migrated,false);});
test('write presets',()=>assert.equal(write(s,'User',mine),true));
test('read presets',()=>assert.deepEqual(read(s,'User').state,mine));
test('account isolation',()=>{write(s,'Person2',initial);assert.equal(read(s,'Person2').state.presets.length,5);assert.equal(read(s,'User').state.presets.length,6);});
test('case-insensitive storage account',()=>assert.deepEqual(read(s,'USER').state,mine));
test('reject invalid account write',()=>assert.equal(write(s,'!',initial),false));
test('invalid account read warning',()=>assert(read(s,'!').warning));
test('write rejects invalid state',()=>assert.equal(write(s,'User',{...initial,activeId:'other'}),false));
test('blocked store read',()=>assert(read({getItem(){throw new Error('blocked');}},'User').warning));
test('blocked store write',()=>assert.equal(write({setItem(){throw new Error('quota');}},'User',initial),false));
test('oversize store read',()=>{const a=store();a.setItem(key('User'),'x'.repeat(64001));assert(read(a,'User').warning.includes('zu groß'));});
test('corrupted persisted state warns',()=>{const a=store();a.setItem(key('User'),'{');assert(read(a,'User').warning.includes('ungültig'));});
test('migration from V723',()=>{const a=store();const layout=old.resizeDashboardWidgetV723(old.defaultDashboardLayoutV723(),'records');old.writeDashboardLayoutV723(a,'User',layout);const result=read(a,'User');assert.equal(result.migrated,true);assert.deepEqual(active(result.state).layout,layout);});
test('migration never alters v723',()=>{const a=store();const layout=old.defaultDashboardLayoutV723();old.writeDashboardLayoutV723(a,'User',layout);const prior=a.getItem(old.dashboardLayoutKeyV723('User'));read(a,'User');assert.equal(a.getItem(old.dashboardLayoutKeyV723('User')),prior);});
test('v724 state wins over legacy',()=>{const a=store();old.writeDashboardLayoutV723(a,'User',old.resizeDashboardWidgetV723(old.defaultDashboardLayoutV723(),'records'));write(a,'User',initial);const result=read(a,'User');assert.equal(result.migrated,false);assert.deepEqual(result.state,initial);});
test('invalid legacy warns',()=>{const a=store();a.setItem(old.dashboardLayoutKeyV723('User'),'{');assert(read(a,'User').warning);});
test('create after migration persists',()=>{const a=store();old.writeDashboardLayoutV723(a,'User',old.defaultDashboardLayoutV723());const b=create(read(a,'User').state,'Neu');assert(write(a,'User',b));assert.equal(read(a,'User').state.activeId,b.activeId);});
const home=fs.readFileSync('components/LastFmPersonalInsightsDashboardV722.tsx','utf8');
const ui=fs.readFileSync('components/LastFmDashboardPresetsV724.tsx','utf8');
const editor=fs.readFileSync('components/LastFmDashboardStudioV723.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
const core=fs.readFileSync('lib/lastfm-dashboard-presets-v724.ts','utf8');
test('mounted in insights',()=>assert(home.includes('<LastFmDashboardPresetsV724 account={account} widgets={{')));
test('V723 studio retained',()=>assert(ui.includes('<LastFmDashboardStudioV723 account={account} widgets={widgets} controlledLayout={active.layout}')));
test('V723 controlled mode',()=>assert(editor.includes('controlledLayout?:V723Layout')&&editor.includes('if(controlledLayout){onLayoutChange?.(next);return;}')));
test('V723 uncontrolled persistence retained',()=>assert(editor.includes('writeDashboardLayoutV723(window.localStorage')));
test('V723 reset preset control',()=>assert(editor.includes('onRestorePreset?.()')));
test('V724 loads account',()=>assert(ui.includes('readDashboardPresetsV724(window.localStorage,account)')));
test('V724 account switch',()=>assert(ui.includes('},[account])')));
test('V724 multi tab',()=>assert(ui.includes("addEventListener('storage',onOtherTab)")));
test('V724 saved to local storage',()=>assert(ui.includes('writeDashboardPresetsV724(window.localStorage,account,next)')));
test('V724 clickable switch',()=>assert(ui.includes('aria-pressed={active.id===p.id}')));
test('V724 create',()=>assert(ui.includes('createDashboardPresetV724(state,name.trim())')));
test('V724 rename',()=>assert(ui.includes('renameDashboardPresetV724(state,active.id,rename.trim())')));
test('V724 delete',()=>assert(ui.includes('deleteDashboardPresetV724(state,active.id)')));
test('V724 mobile',()=>assert(css.includes('@media(max-width:640px){.lastfm-presets-switch-v724')));
test('V724 touch 44',()=>assert(css.includes('.lastfm-presets-top-v724 button,.lastfm-presets-switch-v724 button,.lastfm-presets-manage-v724 button{min-height:44px')));
test('V724 focus',()=>assert(css.includes('.lastfm-presets-switch-v724 button:focus-visible')));
test('V724 reduced motion',()=>assert(css.includes('@media(prefers-reduced-motion:reduce){.lastfm-presets-v724')));
test('V724 no writes to history',()=>assert(!/fetch\s*\(|appendLongtermHistory|mergeLastFmArchive|api\/lastfm/i.test(core)));
test('V724 docs',()=>assert(fs.readFileSync('README.md','utf8').includes('V724')));
test('V724 module uppercase/lowercase',()=>assert(fs.existsSync('components/LastFmDashboardPresetsV724.tsx')&&fs.existsSync('lib/lastfm-dashboard-presets-v724.ts')));
test('V724 test scripts',()=>{const pkg=require('../package.json');require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(724);assert(pkg.scripts['test:quick'].includes('npm run test:v724 && npm run test:v724:types && npm run test:v724:ui-types &&'));assert(pkg.scripts['test:v724']);});
console.log(`PASS: V724 Smart Dashboard Presets – ${checks} checks.`);
