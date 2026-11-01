'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');const root=path.resolve(__dirname,'..');
const source=(p)=>fs.readFileSync(path.join(root,p),'utf8');
function load(file,dependencies={}){
 const result=ts.transpileModule(source(file),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 assert.equal(result.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
 const mod={exports:{}};new Function('module','exports','require',result.outputText)(mod,mod.exports,p=>{
  if(p in dependencies)return dependencies[p];throw Error('Unexpected runtime dependency '+p);
 });return mod.exports;
}
const base=load('services/stageContent/showTimelineV354.ts');
const rules=load('services/stageContent/concertTimelineAutomationV764.ts',{'./showTimelineV354':base});
let checks=0;const ok=(x,msg)=>{assert.ok(x,msg);checks++};const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++};
const scenes=[{index:0,actIndex:0,section:'verse',intent:'portrait',startMs:0,endMs:60000},
 {index:1,actIndex:1,section:'hook',intent:'ensemble',startMs:60000,endMs:120000},
 {index:2,actIndex:2,section:'drop',intent:'pulse',startMs:120000,endMs:180000}];
const verified={trackId:'real-song-123',durationMs:180000,source:'verified-v604',playing:true,progressMs:66000,scenes};
const draft=rules.proposeConcertCuesV764(verified);
eq(draft.length,9,'2+4+3 section cues');
ok(draft.every(s=>s.clip.id.startsWith('v764-')&&s.clip.durationMs<=8000&&s.clip.startMs>=0),'bounded cues');
eq(draft.filter(s=>s.clip.lane==='lyrics').length,1,'lyrics suggestions only on hook');
for(const patch of [{source:'unavailable'},{scenes:[]},{scenes:[{...scenes[0],section:'fake'}]},
 {scenes:[{...scenes[0],intent:'fake'}]},{scenes:[{...scenes[0],startMs:-1}]},
 {scenes:[{...scenes[0],endMs:190000}]},{scenes:[scenes[0],{...scenes[1],startMs:20000}]},
 {scenes:[{...scenes[0],index:4}]},{trackId:''},{durationMs:Infinity},
 {scenes:Array.from({length:481},(_,i)=>({...scenes[0],index:i,startMs:i*10,endMs:i*10+10}))}])
 eq(rules.proposeConcertCuesV764({...verified,...patch}).length,0,'reject unverified/invalid scene');
const empty={...base.DEFAULT_TIMELINE_V354,trackId:verified.trackId,durationMs:verified.durationMs};
let merge=rules.applyConcertSuggestionsV764(empty,verified,draft.map(s=>s.clip.id));
eq(merge.applied,draft.length,'all suggestions accepted only after explicit review');
eq(merge.score.clips.length,draft.length);
const values=base.evaluateTimelineV354({...merge.score,enabled:true},{progressMs:60100,trackId:verified.trackId,playing:true,reducedMotion:false,lyricsActive:true});
ok(values.active&&values.activeLanes.includes('camera')&&values.activeLanes.includes('lighting'),'V354 active playback for approved cues');
eq(base.evaluateTimelineV354({...merge.score,enabled:true},{progressMs:60100,trackId:'wrong-song',playing:true,reducedMotion:false,lyricsActive:true}).active,false,'cross-song isolation');
eq(base.evaluateTimelineV354({...merge.score,enabled:true},{progressMs:60100,trackId:verified.trackId,playing:false,reducedMotion:false,lyricsActive:true}).active,false,'pause');
merge=rules.applyConcertSuggestionsV764(empty,verified,[draft[0].clip.id,draft[0].clip.id,'bad-id'],{[draft[0].clip.id]:'orbit'});
eq(merge.applied,1,'selected duplicates counted once');eq(merge.invalid,1,'unknown suggestion ignored');eq(merge.score.clips[0].value,'orbit','reviewed manual value');
let guarded=base.addTimelineClipV354(empty,'lighting',60000);
merge=rules.applyConcertSuggestionsV764(guarded,verified,draft.map(s=>s.clip.id));
eq(merge.applied,8,'one overlapping manually-authored light cue protected');eq(merge.conflicts,1);
ok(merge.score.clips.some(x=>x.id===guarded.clips[0].id),'manual cue preserved');
eq(rules.applyConcertSuggestionsV764(empty,{...verified,trackId:'wrong'},draft.map(s=>s.clip.id)).applied,0,'snapshot/score scope');
eq(rules.applyConcertSuggestionsV764(empty,verified,Array(121).fill('x')).applied,0,'bounded selection');
// Browser localStorage with independent subscription-free mock. No token/API traffic.
const storage=new Map();let events=0;
global.window={localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>{storage.set(k,String(v));},removeItem:k=>storage.delete(k)},dispatchEvent:()=>{events++;}};
eq(rules.readConcertLibraryV764().entries.length,0,'fresh library empty');
eq(rules.readConcertLibraryV764().autoLoad,false,'opt-in off by default');
ok(rules.putConcertSongV764(merge.score),'save reviewed song');
eq(rules.readConcertLibraryV764().entries.length,1,'saved real song');
ok(rules.setConcertAutoLoadV764(true),'enable explicit auto-load');
eq(rules.readConcertLibraryV764().autoLoad,true,'persisted option');
const second={...empty,trackId:'another-song',name:'Another show',clips:[]};
ok(rules.putConcertSongV764(second),'store different song');
eq(rules.readConcertLibraryV764().entries.length,2,'library stores multiple songs');
base.saveTimelineV354(merge.score);
eq(rules.autoLoadConcertSongV764('another-song'),'loaded','switch to saved track');
eq(base.readTimelineV354().trackId,'another-song','one real V354 playback updated');
eq(rules.autoLoadConcertSongV764('another-song'),'already','same song not overwritten');
// Edit the outgoing song outside V764, then switch: edit must be saved, not lost.
const changed=base.addTimelineClipV354(base.readTimelineV354(),'camera',90000);
base.saveTimelineV354(changed);
eq(rules.autoLoadConcertSongV764('real-song-123'),'loaded','switch back');
eq(rules.readConcertLibraryV764().entries.find(x=>x.trackId==='another-song').clips.length,1,'outgoing unsaved changes protected');
eq(rules.autoLoadConcertSongV764('no-saved-song'),'missing','missing song does not overwrite current V354');
eq(base.readTimelineV354().trackId,'real-song-123','unregistered song leaves live state untouched');
// Explicit restore / legacy backup safety.
base.saveTimelineV354({...empty,trackId:'old-legacy',clips:[base.addTimelineClipV354(empty,'camera',1000).clips[0]]});
eq(rules.loadConcertSongV764('another-song'),'loaded','explicit load');
ok(rules.readConcertLibraryV764().entries.some(x=>x.trackId==='old-legacy'),'legacy V354 score backed up');
const lib=rules.readConcertLibraryV764();
for(let i=lib.entries.length;i<rules.MAX_CONCERT_SONGS_V764;i++)ok(rules.putConcertSongV764({...empty,trackId:'song-'+i}),'bounded capacity fill');
eq(rules.readConcertLibraryV764().entries.length,32,'bounded 32 songs');
ok(!rules.putConcertSongV764({...empty,trackId:'33rd-song'}),'reject extra song safely');
const before=base.readTimelineV354();
eq(rules.autoLoadConcertSongV764('real-song-123'),'loaded','switch at full library works for stored tracks');
const unsaved=base.addTimelineClipV354({...empty,trackId:'no-space'},'camera',1000);
base.saveTimelineV354(unsaved);
eq(rules.autoLoadConcertSongV764('another-song'),'storage-error','full library cannot discard unsaved song');
eq(base.readTimelineV354(),base.sanitizeTimelineV354(unsaved),'no data loss when full');
for(const corrupt of ['not json','{}',JSON.stringify({...lib,version:2}),JSON.stringify({...lib,entries:[lib.entries[0],lib.entries[0]]})]){
 storage.set(rules.CONCERT_LIBRARY_KEY_V764,corrupt);
 eq(rules.readConcertLibraryV764(),null,'corrupt data never treated as empty');
 ok(!rules.putConcertSongV764(empty),'corrupt data blocks overwrite');
 eq(storage.get(rules.CONCERT_LIBRARY_KEY_V764),corrupt,'invalid blob left intact');
}
storage.set(rules.CONCERT_LIBRARY_KEY_V764,JSON.stringify(lib));
eq(rules.deleteConcertSongV764('another-song'),true,'explicit delete');
ok(!rules.readConcertLibraryV764().entries.some(x=>x.trackId==='another-song'),'deleted only target');
let quota=false;const original=window.localStorage.setItem;
window.localStorage.setItem=()=>{throw new Error('QuotaExceededError')};
ok(!rules.putConcertSongV764({...empty,trackId:'test-song'}),'quota failure visible');
window.localStorage.setItem=original;
// V354 swallows setItem exceptions internally: V764 must not lie about activation.
const beforeFailure=base.readTimelineV354();
window.localStorage.setItem=(key,val)=>{if(key===base.SHOW_TIMELINE_KEY_V354)throw Error('V354 quota');original(key,val);};
eq(rules.loadConcertSongV764('real-song-123'),'storage-error','V354 save failure observable');
eq(base.readTimelineV354(),beforeFailure,'failed V354 writes retain current song');
window.localStorage.setItem=original;
for(let i=0;i<12000;i++){
 const s={...verified,progressMs:(i*31)%180000,playing:i%2===0};
 const choices=rules.proposeConcertCuesV764(s);
 ok(choices.length===draft.length,'reproducible regardless of playback clock');
 const checked=rules.applyConcertSuggestionsV764(empty,s,choices.map(c=>c.clip.id));
 eq(checked.applied,draft.length,'no algorithmic drift');
 ok(checked.score.clips.every(c=>c.startMs+c.durationMs<=s.durationMs),'bounded durations');
}
const ui=source('components/visualizer/SmartConcertTimelineAutomationV764.tsx');
for(const token of ['proposeConcertCuesV764','applyConcertSuggestionsV764','putConcertSongV764','readConcertLibraryV764',
 'autoLoad','Geprüfte Cues ausdrücklich übernehmen','Bestehende','Bibliothek','onClick={apply}','onClick={save}'])
 ok(ui.includes(token),'review/library UI '+token);
const three=source('components/visualizer/ThreeAvatar.tsx');
ok(three.includes('autoLoadConcertSongV764(props.track?.id)')&&three.includes('setShowTimelineV354(readTimelineV354());},[props.track?.id]'), 'real song-change activation refreshes React state');
ok(source('components/SettingsPanel.tsx').includes('<SmartConcertTimelineAutomationV764/>'),'settings UI wired');
ok(source('services/settings/unifiedBackup.ts').includes('"sonic-concert-song-library-v764":"timeline"'),'portable backup includes library');
const pkg=JSON.parse(source('package.json')),lock=JSON.parse(source('package-lock.json'));
ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1]??0)>=764,'V764 or later compatible release');eq(lock.version,pkg.version);eq(lock.packages[''].version,pkg.version);
ok(pkg.scripts['check:fast'].includes('npm run test:v764 &&'),'prebuild preserves V764 regression');
ok(source('.github/workflows/concert-validation-v571.yml').includes('test:v764:ui-types'),'CI includes V764 UI');
console.log('PASS V764 Smart Concert Timeline Automation:',checks.toLocaleString('en-US'),'assertions');
