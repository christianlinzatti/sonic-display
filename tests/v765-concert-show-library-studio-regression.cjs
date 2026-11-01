'use strict';
/** V765: library inspection, no-loss imports and multi-song persistence regression. */
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const source=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(filename,deps={}){
 const result=ts.transpileModule(source(filename),{fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 assert.equal(result.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
 const mod={exports:{}};
 new Function('module','exports','require',result.outputText)(mod,mod.exports,id=>{
  if(id in deps)return deps[id];throw Error('unexpected dependency: '+id);
 });return mod.exports;
}
const timeline=load('services/stageContent/showTimelineV354.ts');
const v764=load('services/stageContent/concertTimelineAutomationV764.ts',{'./showTimelineV354':timeline});
const v765=load('services/stageContent/concertShowLibraryStudioV765.ts',{
 './concertTimelineAutomationV764':v764,
});
let checks=0;
const eq=(a,b,msg)=>{assert.deepStrictEqual(a,b,msg);checks++;};
const ok=(v,msg)=>{assert.ok(v,msg);checks++;};
const mk=(id,name,cues=0)=>({...timeline.DEFAULT_TIMELINE_V354,trackId:id,name,durationMs:180000,
 clips:Array.from({length:cues},(_,i)=>({id:`cue-${i+1}`,lane:'camera',startMs:i*400,
 durationMs:250,value:'medium',label:`Cue ${i}`}))});
const make=(entries,autoLoad=false)=>({version:1,autoLoad,entries});
const backing=new Map();let changes=0;
global.window={localStorage:{getItem:k=>backing.has(k)?backing.get(k):null,
 setItem:(k,v)=>backing.set(k,String(v)),removeItem:k=>backing.delete(k)},
 dispatchEvent:()=>{changes++;}};
const originalSet=window.localStorage.setItem;
const a=mk('song-A','Alpha',3),b=mk('song-B','Beta',2),c=mk('song-C','Gamma',4);
const existing=make([a,b],true);
ok(v764.writeConcertLibraryV764(existing),'set up existing library');
const read=()=>v764.readConcertLibraryV764();
eq(v765.searchConcertSongsV765(read(),'alpha').map(x=>x.trackId),['song-A'],'search by title');
eq(v765.searchConcertSongsV765(read(),'song-b').map(x=>x.trackId),['song-B'],'search by id');
eq(v765.searchConcertSongsV765(read(),'missing').length,0,'no results');
eq(v765.searchConcertSongsV765(read(),'','cues').map(x=>x.trackId),['song-A','song-B'],'sort cues');
eq(v765.searchConcertSongsV765(read(),'','duration').length,2,'duration sort');
ok(v765.renameConcertSongV765('song-A','  Intro Show  ','Alpha'),'rename trimmed');
eq(read().entries[0].name,'Intro Show','saved trim');
ok(!v765.renameConcertSongV765('song-A','Wrong','Alpha'),'race protection');
ok(!v765.renameConcertSongV765('song-A',' ', 'Intro Show'),'empty name');
ok(!v765.renameConcertSongV765('song-A','Z'.repeat(61),'Intro Show'),'max name');
eq(read().entries[0].clips.length,3,'rename keeps timeline cues');
// Restore the initial name for comparison.
ok(v765.renameConcertSongV765('song-A','Alpha','Intro Show'),'restore alpha');
const one=v765.exportConcertSongV765('song-A',read());
ok(typeof one==='string'&&one.includes('song-A'),'single-show export');
eq(v765.readConcertImportV765(one).autoLoad,false,'autoLoad stripped from export');
eq(v765.readConcertImportV765(one).entries.length,1,'one imported show');
eq(v765.exportConcertSongV765('missing',read()),null,'no unknown export');
for(const invalid of ['','{', '{}','[]','null', JSON.stringify({version:5,autoLoad:false,entries:[a]}),
 JSON.stringify({version:1,autoLoad:false,entries:[]}), ' '.repeat(v765.MAX_CONCERT_IMPORT_BYTES_V765+1),
 JSON.stringify(make([a,a])),JSON.stringify(make(Array.from({length:33},(_,i)=>mk('t'+i,'T'+i))))]){
 eq(v765.readConcertImportV765(invalid),null,'reject corrupt, empty, duplicate or huge data');
}
const changedA=mk('song-A','Different imported title',1);
const incoming=make([changedA,c,b],false);
const json=JSON.stringify(incoming);
let p=v765.previewConcertImportV765(json,read(),'skip');
ok(p.valid,'valid import');eq(p.incoming,3);eq(p.newEntries,1);eq(p.conflicts,1);eq(p.unchanged,1);
eq(p.wouldReplace,0,'default protect');eq(p.wouldSkip,2,'default skip conflict and identical');
eq(p.availableSlots,30,'correct space left');
const currentV354=mk('active','Unsaved live show',1);timeline.saveTimelineV354(currentV354);
let result=v765.importConcertLibraryV765(json,'skip',p.baseline);
ok(result.ok,'safe non-destructive import');eq(result.added,1);eq(result.replaced,0);eq(result.skipped,2);
eq(read().entries.length,3,'three shows after merging');eq(read().autoLoad,true,'incoming autoLoad not accepted');
eq(read().entries.find(e=>e.trackId==='song-A').name,'Alpha','skip existing entries');
eq(timeline.readTimelineV354(),timeline.sanitizeTimelineV354(currentV354),'import never touches live playback');
// Never silently overwrite a new library value changed since preview.
p=v765.previewConcertImportV765(JSON.stringify(make([changedA])),read(),'replace');
ok(p.valid&&p.wouldReplace===1,'replace preview explicit');
ok(v765.renameConcertSongV765('song-B','Manual update','Beta'),'simulated concurrent modification');
result=v765.importConcertLibraryV765(JSON.stringify(make([changedA])),'replace',p.baseline);
eq(result.reason,'stale-preview','stale preview denied');eq(read().entries.find(e=>e.trackId==='song-A').name,'Alpha');
p=v765.previewConcertImportV765(JSON.stringify(make([changedA])),read(),'replace');
result=v765.importConcertLibraryV765(JSON.stringify(make([changedA])),'replace',p.baseline);
ok(result.ok&&result.replaced===1,'confirmed conflict replace');
eq(read().entries.find(e=>e.trackId==='song-A').name,'Different imported title','replace selected library entry');
eq(read().autoLoad,true,'autoLoad unchanged on replace');
eq(timeline.readTimelineV354(),timeline.sanitizeTimelineV354(currentV354),'replace cannot change open V354 score');
// Quota failures do not report a successful merge; no replacement in memory.
p=v765.previewConcertImportV765(JSON.stringify(make([a])),read(),'replace');
window.localStorage.setItem=()=>{throw new Error('QuotaExceededError');};
result=v765.importConcertLibraryV765(JSON.stringify(make([a])),'replace',p.baseline);
eq(result.reason,'write-failed','storage quota fails safely');
window.localStorage.setItem=originalSet;
eq(read().entries.find(e=>e.trackId==='song-A').name,'Different imported title','quota preserved previous');
// Storage engines that lie about setItem must not count as success.
p=v765.previewConcertImportV765(JSON.stringify(make([a])),read(),'replace');
window.localStorage.setItem=()=>{};
result=v765.importConcertLibraryV765(JSON.stringify(make([a])),'replace',p.baseline);
eq(result.reason,'write-failed','verify actual saved result');
window.localStorage.setItem=originalSet;
// Corrupted localStorage must be left byte-for-byte untouched.
backing.set(v764.CONCERT_LIBRARY_KEY_V764,'{corrupt');
result=v765.importConcertLibraryV765(json,'skip','');eq(result.reason,'library-unavailable');
eq(backing.get(v764.CONCERT_LIBRARY_KEY_V764),'{corrupt','no repairs without consent');
backing.set(v764.CONCERT_LIBRARY_KEY_V764,JSON.stringify(make([a],false)));
let full=make(Array.from({length:32},(_,i)=>mk('full-'+i,'Full '+i)));
ok(v764.writeConcertLibraryV764(full),'full library');
p=v765.previewConcertImportV765(JSON.stringify(make([mk('extra','Extra')])),read(),'skip');
eq(p.reason,'capacity-exceeded');
result=v765.importConcertLibraryV765(JSON.stringify(make([mk('extra','Extra')])),'skip',p.baseline);
eq(result.reason,'capacity-exceeded','atomic capacity failure');eq(read().entries.length,32,'cannot lose any entries');
p=v765.previewConcertImportV765(JSON.stringify(make([mk('full-0','Renamed')])),read(),'skip');
ok(p.valid,'full library can skip identical IDs');
result=v765.importConcertLibraryV765(JSON.stringify(make([mk('full-0','Renamed')])),'skip',p.baseline);
eq(result.reason,'no-changes','no-op import still safe');
// Verify hundreds of deterministic, independent search and import scenarios.
ok(v764.writeConcertLibraryV764(make([a,b,c],true)),'reset fixture');
for(let i=0;i<12000;i++){
 const incoming=make([mk('id-'+i,'Generated '+i),a],i%2===0);
 const content=JSON.stringify(incoming);
 const prev=v765.previewConcertImportV765(content,read(),'skip');
 ok(prev.valid,'valid preview '+i);eq(prev.newEntries,1,'new ID '+i);
 eq(prev.unchanged,1,'existing ID '+i);eq(prev.wouldReplace,0,'default no replaces '+i);
 const sorted=v765.searchConcertSongsV765(read(),'','cues');
 ok(sorted.length===3,'pure query no writes');
 eq(read().autoLoad,true,'no mutation from imported autoLoad');
}
const ui=readFile('components/visualizer/ConcertShowLibraryStudioV765.tsx');
function readFile(p){return fs.readFileSync(path.join(root,p),'utf8');}
for(const required of ['importConcertLibraryV765','previewConcertImportV765','renameConcertSongV765','exportConcertSongV765',
 'Geprüften Bibliotheksimport ausdrücklich bestätigen','onClick={commit}','readConcertLibraryV764','setImportText',
 'Konflikte behandeln','Umbenennen','Einzeln exportieren'])ok(ui.includes(required),'UI '+required);
ok(readFile('components/visualizer/SmartConcertTimelineAutomationV764.tsx').includes('<ConcertShowLibraryStudioV765/>'),'integrated in existing studio');
ok(readFile('services/settings/unifiedBackup.ts').includes('"sonic-concert-song-library-v764":"timeline"'),'backup retains v764 library key');
const pkg=JSON.parse(readFile('package.json'));const lock=JSON.parse(readFile('package-lock.json'));
ok(/^0\.1\.0-v(?:76[5-9]|7[7-9]\d|[89]\d\d)$/.test(pkg.version),'release >= V765');eq(lock.version,pkg.version);eq(lock.packages[''].version,pkg.version);
ok(pkg.scripts['check:fast'].includes('npm run test:v765 && npm run test:v765:types && npm run test:v765:ui-types'),'prebuild gating');
ok(readFile('.github/workflows/concert-validation-v571.yml').includes('test:v765:ui-types'),'CI V765 step');
console.log('PASS V765 Concert Show Library Studio:',checks.toLocaleString('en-US'),'assertions');
