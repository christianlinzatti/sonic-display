/** V713 – IndexedDB is the long-term source of truth; legacy V706 localStorage is a bounded compatibility mirror. */
import {canonicalLastFmUsernameV706,emptyLastFmArchiveV706,lastFmEventKeyV706,mergeLastFmArchiveV706,parseLastFmArchiveV706,readLastFmArchiveV706,validLastFmUsernameV706,writeLastFmArchiveV706,V706_FORMAT,V706_MAX_EVENTS,type LastFmArchiveV706,type LastFmEventV706,type LastFmStorageV706} from './lastfm-history-v706';

export const V713_DB_NAME='sonic-display-lastfm-longterm-v713';
export const V713_FORMAT='sonic-display-lastfm-longterm-v713';
export const V713_CHANGE_EVENT='sonic-display:lastfm:longterm-updated:v713';
export const V713_MAX_BACKUP_BYTES=100_000_000;
export const V713_MAX_IMPORT_EVENTS=250_000; // Per-file safety bound, NOT an archive retention limit.
const SCROBBLES='scrobbles',META='migration';
type Row={pk:string;user:string;event:LastFmEventV706};
type Migration={user:string;version:1;updatedAt:string;legacyUpdatedAt:string|null;legacyCount:number};
export type LastFmLongtermBackupV713={format:typeof V713_FORMAT;version:2;username:string;exportedAt:string;events:LastFmEventV706[]};
const isObj=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const iso=(s:unknown):s is string=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString()===s;
const userKey=(user:string)=>canonicalLastFmUsernameV706(user);
const eventPk=(user:string,event:LastFmEventV706)=>`${userKey(user)}\u001f${lastFmEventKeyV706(event)}`;
function eventChunks(events:readonly LastFmEventV706[],user:string,now=new Date()):LastFmEventV706[]{
 if(!validLastFmUsernameV706(user)||!Array.isArray(events)||events.length>V713_MAX_IMPORT_EVENTS)throw new Error('Ungültige Last.fm-Ereignisse oder Import zu groß.');
 const seen=new Set<string>(),valid:LastFmEventV706[]=[];
 for(let i=0;i<events.length;i+=1000){
  const chunk=events.slice(i,i+1000);const result=mergeLastFmArchiveV706(emptyLastFmArchiveV706(user,now),chunk,now);
  if(result.added!==chunk.length)throw new Error('Import enthält beschädigte oder doppelte Scrobbles.');
  for(const e of result.archive.events){const key=lastFmEventKeyV706(e);if(seen.has(key))throw new Error('Import enthält doppelte Scrobbles.');seen.add(key);valid.push(e);}
 }
 return valid;
}
export function validateLongtermBackupV713(value:unknown,user:string,now=new Date()):LastFmLongtermBackupV713{
 if(!isObj(value)||value.format!==V713_FORMAT||value.version!==2||!validLastFmUsernameV706(user)||!validLastFmUsernameV706(value.username)||userKey(value.username)!==userKey(user)||!iso(value.exportedAt)||!Array.isArray(value.events))throw new Error('Backupformat ungültig oder Last.fm-Konto stimmt nicht überein.');
 return {format:V713_FORMAT,version:2,username:user,exportedAt:value.exportedAt,events:eventChunks(value.events,user,now)};
}
export function parseLongtermBackupV713(raw:string,user:string,now=new Date()):LastFmLongtermBackupV713{
 if(typeof raw!=='string'||raw.length>V713_MAX_BACKUP_BYTES)throw new Error('Backup zu groß (maximal 100 MB).');
 let data:unknown;try{data=JSON.parse(raw);}catch{throw new Error('Backup enthält ungültiges JSON.');}
 if(isObj(data)&&data.format===V706_FORMAT){const legacy=parseLastFmArchiveV706(raw,user,now);return {format:V713_FORMAT,version:2,username:user,exportedAt:now.toISOString(),events:legacy.events};}
 return validateLongtermBackupV713(data,user,now);
}
function request<T>(req:IDBRequest<T>):Promise<T>{return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error??new Error('IndexedDB-Abfrage fehlgeschlagen.'));});}
function finished(tx:IDBTransaction):Promise<void>{return new Promise((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error??new Error('IndexedDB-Transaktion abgebrochen.'));tx.onerror=()=>reject(tx.error??new Error('IndexedDB-Transaktion fehlgeschlagen.'));});}
export function openLongtermDbV713():Promise<IDBDatabase>{
 if(typeof indexedDB==='undefined')return Promise.reject(new Error('IndexedDB ist in diesem Browser nicht verfügbar.'));
 return new Promise((resolve,reject)=>{
  const r=indexedDB.open(V713_DB_NAME,1);
  r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(SCROBBLES)){const store=db.createObjectStore(SCROBBLES,{keyPath:'pk'});store.createIndex('byUser','user',{unique:false});}if(!db.objectStoreNames.contains(META))db.createObjectStore(META,{keyPath:'user'});};
  r.onerror=()=>reject(r.error??new Error('IndexedDB konnte nicht geöffnet werden.'));
  r.onblocked=()=>reject(new Error('IndexedDB-Aktualisierung blockiert. Bitte weitere Sonic-Display-Tabs schließen.'));
  r.onsuccess=()=>{const db=r.result;db.onversionchange=()=>db.close();resolve(db);};
 });
}
/** Migration merges, never clears or truncates. A failed transaction is rolled back atomically. */
export async function migrateLegacyHistoryV713(db:IDBDatabase,storage:LastFmStorageV706,user:string):Promise<number>{
 if(!validLastFmUsernameV706(user))throw new Error('Ungültiger Last.fm-Benutzername.');
 const legacy=readLastFmArchiveV706(storage,user);if(legacy.error)throw new Error(legacy.error);
 const key=userKey(user);const tx=db.transaction([SCROBBLES,META],'readwrite');const done=finished(tx);
 const store=tx.objectStore(SCROBBLES),meta=tx.objectStore(META);
 let migrated=0;
 const stamp=legacy.archive?.updatedAt??null,count=legacy.archive?.events.length??0;
 const check=meta.get(key);
 check.onsuccess=()=>{
  const prior=check.result as Migration|undefined;
  if(prior?.version===1&&prior.legacyUpdatedAt===stamp&&prior.legacyCount===count)return;
  for(const event of legacy.archive?.events??[]){store.put({pk:eventPk(user,event),user:key,event} as Row);migrated++;}
  meta.put({user:key,version:1,updatedAt:new Date().toISOString(),legacyUpdatedAt:stamp,legacyCount:count} as Migration);
 };
 await done;return migrated;
}
/** A single IDB transaction for each import, per-event unique keys; old entries never evicted. */
export async function appendLongtermHistoryV713(db:IDBDatabase,user:string,incoming:readonly LastFmEventV706[],now=new Date()):Promise<{added:number;total:number}>{
 const items=eventChunks(incoming,user,now);const key=userKey(user);
 const tx=db.transaction(SCROBBLES,'readwrite');const done=finished(tx),store=tx.objectStore(SCROBBLES);
 let added=0;
 for(const event of items){const pk=eventPk(user,event);const probe=store.get(pk);probe.onsuccess=()=>{if(probe.result===undefined){store.add({pk,user:key,event} as Row);added++;}};}
 await done;
 return {added,total:await countLongtermHistoryV713(db,user)};
}
export async function countLongtermHistoryV713(db:IDBDatabase,user:string):Promise<number>{
 if(!validLastFmUsernameV706(user))throw new Error('Ungültiger Last.fm-Benutzername.');
 const tx=db.transaction(SCROBBLES,'readonly'),done=finished(tx);
 const n=await request(tx.objectStore(SCROBBLES).index('byUser').count(IDBKeyRange.only(userKey(user))));await done;return n;
}
export async function readLongtermHistoryV713(db:IDBDatabase,user:string):Promise<LastFmArchiveV706>{
 if(!validLastFmUsernameV706(user))throw new Error('Ungültiger Last.fm-Benutzername.');
 const tx=db.transaction(SCROBBLES,'readonly'),done=finished(tx);
 const rows=await request(tx.objectStore(SCROBBLES).index('byUser').getAll(IDBKeyRange.only(userKey(user)))) as Row[];
 await done;
 const events=rows.map(row=>row.event).sort((a,b)=>Date.parse(b.playedAt)-Date.parse(a.playedAt)||lastFmEventKeyV706(a).localeCompare(lastFmEventKeyV706(b)));
 return {...emptyLastFmArchiveV706(user),events};
}
/** Mirror is only for older V706–V710 consumers. Never use its 8k ceiling as long-term storage policy. */
export function mirrorRecentHistoryV713(storage:LastFmStorageV706,full:LastFmArchiveV706){
 const recent:{archive:LastFmArchiveV706;count:number}={archive:{...full,events:full.events.slice(0,V706_MAX_EVENTS)},count:Math.min(full.events.length,V706_MAX_EVENTS)};
 const saved=writeLastFmArchiveV706(storage,recent.archive);if(saved.error)throw new Error(`Langzeitarchiv gespeichert, Kurzzeit-Spiegel fehlgeschlagen: ${saved.error}`);
 return recent.count;
}
export async function loadAndMigrateHistoryV713(db:IDBDatabase,storage:LastFmStorageV706,user:string){
 await migrateLegacyHistoryV713(db,storage,user);return readLongtermHistoryV713(db,user);
}
export function makeLongtermBackupV713(archive:LastFmArchiveV706,now=new Date()):LastFmLongtermBackupV713{
 if(!validLastFmUsernameV706(archive.username)||!iso(now.toISOString()))throw new Error('Ungültiges Last.fm-Konto.');
 return {format:V713_FORMAT,version:2,username:archive.username,exportedAt:now.toISOString(),events:archive.events};
}
