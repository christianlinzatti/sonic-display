'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const load=(file,requireHook)=>{const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;const exports={};vm.runInNewContext(code,{exports,require:requireHook,URL,Date,Math,Number,String,JSON,Map,Set,Array,Object,Promise,Error,encodeURIComponent,Intl,IDBKeyRange:{only:x=>x}},{filename:file});return exports;};
const base=load('lib/lastfm-history-v706.ts');const core=load('lib/lastfm-indexed-history-v713.ts',name=>{assert.equal(name,'./lastfm-history-v706');return base;});
const now=new Date('2026-10-29T13:00:00.000Z');
const e=(i,artist='Artist',title='Track')=>({artist,title,album:'Album',playedAt:new Date(now.getTime()-(100000+i)*60000).toISOString(),url:null,cover:null});
const archive=(user='Alice',events=[])=>({...base.emptyLastFmArchiveV706(user,now),events});
const memory=(a)=>{const data=new Map();if(a)data.set(base.lastFmArchiveKeyV706(a.username),JSON.stringify(a));return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>{data.set(k,v);},removeItem:k=>data.delete(k)};};
let tests=0;
const t=(name,fn)=>{try{fn();tests++;}catch(err){err.message=`V713 ${name}: ${err.message}`;throw err;}};
const backup=(user='Alice',events=[])=>({format:core.V713_FORMAT,version:2,username:user,exportedAt:now.toISOString(),events});
t('format new',()=>assert.equal(core.V713_FORMAT,'sonic-display-lastfm-longterm-v713'));
t('own DB new',()=>assert.equal(core.V713_DB_NAME,'sonic-display-lastfm-longterm-v713'));
t('no 8k cap on backup',()=>assert.equal(core.validateLongtermBackupV713(backup('Alice',Array.from({length:8500},(_,i)=>e(i))), 'Alice',now).events.length,8500));
t('valid object',()=>assert.equal(core.validateLongtermBackupV713(backup('Alice',[e(1)]),'Alice',now).events.length,1));
t('same user case insensitive',()=>assert.equal(core.validateLongtermBackupV713(backup('alice',[e(1)]),'ALICE',now).username,'ALICE'));
t('foreign username refused',()=>assert.throws(()=>core.validateLongtermBackupV713(backup('Bob'),'Alice',now)));
t('invalid user refused',()=>assert.throws(()=>core.validateLongtermBackupV713(backup('Alice'),'../Alice',now)));
t('invalid backup format refused',()=>assert.throws(()=>core.validateLongtermBackupV713({...backup(),format:'v8'},'Alice',now)));
t('invalid backup version refused',()=>assert.throws(()=>core.validateLongtermBackupV713({...backup(),version:3},'Alice',now)));
t('missing username refused',()=>assert.throws(()=>core.validateLongtermBackupV713({...backup(),username:null},'Alice',now)));
t('invalid exportedAt refused',()=>assert.throws(()=>core.validateLongtermBackupV713({...backup(),exportedAt:'no'},'Alice',now)));
t('missing events refused',()=>assert.throws(()=>core.validateLongtermBackupV713({...backup(),events:null},'Alice',now)));
t('nested events refused',()=>assert.throws(()=>core.validateLongtermBackupV713({...backup(),events:[[]]},'Alice',now)));
t('future scrobble refused',()=>assert.throws(()=>core.validateLongtermBackupV713(backup('Alice',[{...e(1),playedAt:'2027-01-01T00:00:00.000Z'}]),'Alice',now)));
t('duplicate identical timestamps refused',()=>assert.throws(()=>core.validateLongtermBackupV713(backup('Alice',[e(1),e(1)]),'Alice',now)));
t('duplicate across 1000 block refused',()=>assert.throws(()=>core.validateLongtermBackupV713(backup('Alice',[...Array.from({length:1000},(_,i)=>e(i)),e(0)]),'Alice',now)));
t('different timestamps retained',()=>assert.equal(core.validateLongtermBackupV713(backup('Alice',[e(1),e(2)]),'Alice',now).events.length,2));
t('different artist retained',()=>assert.equal(core.validateLongtermBackupV713(backup('Alice',[e(1),e(1,'B')]),'Alice',now).events.length,2));
t('empty backup allowed',()=>assert.equal(core.validateLongtermBackupV713(backup(),'Alice',now).events.length,0));
t('malformed JSON refused',()=>assert.throws(()=>core.parseLongtermBackupV713('{','Alice',now)));
t('too large JSON refused',()=>assert.throws(()=>core.parseLongtermBackupV713('x'.repeat(core.V713_MAX_BACKUP_BYTES+1),'Alice',now)));
t('parse backup',()=>assert.equal(core.parseLongtermBackupV713(JSON.stringify(backup('Alice',[e(1)])),'Alice',now).events.length,1));
t('accept legacy backup',()=>assert.equal(core.parseLongtermBackupV713(JSON.stringify(archive('Alice',[e(1)])),'Alice',now).events.length,1));
t('reject foreign legacy backup',()=>assert.throws(()=>core.parseLongtermBackupV713(JSON.stringify(archive('Bob',[e(1)])),'Alice',now)));
t('make backup includes all',()=>assert.equal(core.makeLongtermBackupV713(archive('Alice',Array.from({length:8500},(_,i)=>e(i))),now).events.length,8500));
t('mirror is 8k only',()=>{const mem=memory();const full=archive('Alice',Array.from({length:8500},(_,i)=>e(i)));assert.equal(core.mirrorRecentHistoryV713(mem,full),8000);assert.equal(base.readLastFmArchiveV706(mem,'Alice',now).archive.events.length,8000);assert.equal(full.events.length,8500);});
t('mirror on storage error is explicit',()=>assert.throws(()=>core.mirrorRecentHistoryV713({getItem:()=>null,setItem:()=>{throw Error('quota');},removeItem:()=>{}},archive('Alice',[e(1)]))));
t('mirror leaves original full array untouched',()=>{const full=archive('Alice',[e(1)]),copy=JSON.stringify(full);core.mirrorRecentHistoryV713(memory(),full);assert.equal(JSON.stringify(full),copy);});
t('strict field validation prohibits executable URL',()=>assert.throws(()=>core.validateLongtermBackupV713(backup('Alice',[{...e(1),url:'javascript:alert(1)'}]),'Alice',now)));
t('strict field validation prohibits HTML control text',()=>assert.throws(()=>core.validateLongtermBackupV713(backup('Alice',[{...e(1),artist:'Bad\n'}]),'Alice',now)));
t('no localStorage clearing operations in new core',()=>{const code=fs.readFileSync('lib/lastfm-indexed-history-v713.ts','utf8');assert(!/\.clear\s*\(/.test(code));assert(!/\.deleteDatabase\s*\(/.test(code));});
t('migration is atomic transaction',()=>assert(fs.readFileSync('lib/lastfm-indexed-history-v713.ts','utf8').includes("db.transaction([SCROBBLES,META],'readwrite')")));
t('event identity keys not timestamps alone',()=>assert(fs.readFileSync('lib/lastfm-indexed-history-v713.ts','utf8').includes('lastFmEventKeyV706(event)')));
t('full local archive used in Wrapped',()=>assert(!fs.readFileSync('lib/lastfm-wrapped-v712.ts','utf8').includes('events.slice(0,8000)')));
t('full local archive used in Intelligence',()=>assert(!fs.readFileSync('lib/lastfm-intelligence-v711.ts','utf8').includes('events.slice(0,8000)')));
t('full local archive used in cross-provider source',()=>assert(!fs.readFileSync('lib/listening-sources-v707.ts','utf8').includes('slice(0,8000)')));
t('not scrobbling back to Last.fm',()=>assert(!/track\.scrobble|method\s*:\s*['"]POST['"]/.test(fs.readFileSync('lib/lastfm-indexed-history-v713.ts','utf8'))));
t('new UI imports data layer',()=>assert(fs.readFileSync('components/LastFmHistoryPanelV706.tsx','utf8').includes('loadAndMigrateHistoryV713')));
t('new UI exports longterm backup',()=>assert(fs.readFileSync('components/LastFmHistoryPanelV706.tsx','utf8').includes('makeLongtermBackupV713')));
t('legacy 8k import-button block removed',()=>assert(!fs.readFileSync('components/LastFmHistoryPanelV706.tsx','utf8').includes('archive.events.length>=V706_MAX_EVENTS')));
t('comparison loads IndexedDB',()=>assert(fs.readFileSync('components/ListeningSourceDashboardV707.tsx','utf8').includes('loadAndMigrateHistoryV713')));
t('new release version',()=>require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(713));
t('quick release runs new checks first',()=>assert(require('../package.json').scripts['test:quick'].includes('npm run test:v713 &&')));
let invalid=0;for(let i=0;i<10000;i++){const v={...e(i)};switch(i%5){case 0:v.artist='';break;case 1:v.title='';break;case 2:v.playedAt='bad';break;case 3:v.url='https://evil.com/music';break;default:v.album='';}assert.throws(()=>core.validateLongtermBackupV713(backup('Alice',[v]),'Alice',now));invalid++;}
// A transactional IDB simulation tests queued requests, per-account isolation, replay retention and repeat imports.
function fakeDb(){
 const tracks=new Map(),migrations=new Map();
 return {
  tracks,migrations,
  transaction(names,mode){
   let pending=0,completed=false;
   const tx={error:null,oncomplete:null,onabort:null,onerror:null,
    objectStore(name){
     const map=name==='scrobbles'?tracks:migrations;
     function issue(action){
      pending++;
      const req={result:undefined,error:null,onsuccess:null,onerror:null};
      queueMicrotask(()=>{
       try{req.result=action();req.onsuccess?.();}
       catch(ex){req.error=ex;req.onerror?.();tx.error=ex;tx.onabort?.();}
       pending--;
       if(!pending&&!completed&&!tx.error){completed=true;queueMicrotask(()=>tx.oncomplete?.());}
      });
      return req;
     }
     return {
      put(value){return issue(()=>{map.set(value.pk??value.user,value);return value.pk??value.user;});},
      add(value){return issue(()=>{if(map.has(value.pk))throw Error('duplicate');map.set(value.pk,value);return value.pk;});},
      get(key){return issue(()=>map.get(key));},
      index(){return {
       getAll(key){return issue(()=>[...map.values()].filter(v=>v.user===key));},
       count(key){return issue(()=>[...map.values()].filter(v=>v.user===key).length);}
      };}
     };
    }
   };
   return tx;
  }
 };
}
async function run(){const db=fakeDb(),legacy=memory(archive('Alice',[e(0),e(1)]));const a='Alice';
 const asyncT=async(name,fn)=>{try{await fn();tests++;}catch(err){err.message=`V713 async ${name}: ${err.message}`;throw err;}};
 await asyncT('migration counts events',async()=>assert.equal(await core.migrateLegacyHistoryV713(db,legacy,a),2));
 await asyncT('migration saved all legacy items',async()=>assert.equal((await core.readLongtermHistoryV713(db,a)).events.length,2));
 await asyncT('migration is idempotent',async()=>{await core.migrateLegacyHistoryV713(db,legacy,a);assert.equal(await core.countLongtermHistoryV713(db,a),2);});
 await asyncT('migration refuses corrupt local backup',async()=>{legacy.setItem(base.lastFmArchiveKeyV706(a),'{');await assert.rejects(()=>core.migrateLegacyHistoryV713(db,legacy,a));});
 await asyncT('previous IDB data remains after corrupt migration',async()=>assert.equal(await core.countLongtermHistoryV713(db,a),2));
 legacy.setItem(base.lastFmArchiveKeyV706(a),JSON.stringify(archive(a,[e(0)])));
 await asyncT('merge 9000 entries retains older scrobbles',async()=>{const r=await core.appendLongtermHistoryV713(db,a,Array.from({length:9000},(_,i)=>e(i)));assert.equal(r.total,9000);assert.equal(r.added,8998);});
 await asyncT('read all 9000',async()=>assert.equal((await core.readLongtermHistoryV713(db,a)).events.length,9000));
 await asyncT('second same import adds zero',async()=>{const r=await core.appendLongtermHistoryV713(db,a,Array.from({length:9000},(_,i)=>e(i)));assert.equal(r.added,0);assert.equal(r.total,9000);});
 await asyncT('new scrobble adds one',async()=>assert.equal((await core.appendLongtermHistoryV713(db,a,[e(9001)])).added,1));
 await asyncT('different artist same time adds replay separately',async()=>assert.equal((await core.appendLongtermHistoryV713(db,a,[e(9001,'Other')])).added,1));
 await asyncT('different timestamp same artist stays replay',async()=>assert.equal((await core.appendLongtermHistoryV713(db,a,[e(9002)])).added,1));
 await asyncT('distinct account separate',async()=>{await core.appendLongtermHistoryV713(db,'Bob',[e(4)]);assert.equal(await core.countLongtermHistoryV713(db,'Bob'),1);});
 await asyncT('other account cannot read Alice',async()=>assert.equal((await core.readLongtermHistoryV713(db,'Bob')).events.length,1));
 await asyncT('legacy mirror cannot destroy IDB history',async()=>{core.mirrorRecentHistoryV713(legacy,await core.readLongtermHistoryV713(db,a));assert.equal((await core.readLongtermHistoryV713(db,a)).events.length,9003);});
 await asyncT('migration of the new 8k mirror remains lossless',async()=>{await core.migrateLegacyHistoryV713(db,legacy,a);assert.equal(await core.countLongtermHistoryV713(db,a),9003);});
 await asyncT('export reimport roundtrip has full history',async()=>{const full=await core.readLongtermHistoryV713(db,a),text=JSON.stringify(core.makeLongtermBackupV713(full,now)),restored=core.parseLongtermBackupV713(text,a,now);assert.equal(restored.events.length,9003);});
 console.log(`PASS V713 IndexedDB long-term Last.fm history: ${tests} groups, ${invalid} rejected invalid events, 9003 preserved across legacy mirroring.`);
}
run().catch(e=>{console.error(e);process.exitCode=1;});
