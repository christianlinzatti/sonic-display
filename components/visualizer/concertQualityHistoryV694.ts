/** V694: strictly bounded, versioned, portable quality-history records.
 * Evidence remains V692/V693 advisory. This module has no browser or network access.
 */
import {compareV693Snapshots,type V693Progress,type V693Snapshot} from './concertQualityImprovementV693';
import type {V692Check,V692Domain} from './concertQualityInspectorV692';

export const V694_STORAGE_KEY='sonic-display:concert-qa-history:v694';
export const V694_MAX_ENTRIES=30;
export const V694_MAX_JSON_LENGTH=600_000;
export type V694Release=`V${number}`;
export interface V694Run{snapshot:V693Snapshot;release:V694Release;capturedAt:number}
export interface V694Entry{
 id:string;trackId:string;archivedAt:number;before:V694Run;after:V694Run;
 progress:Record<string,V693Progress>;humanReviewed:false;automaticallyApproved:false;
}
export interface V694Archive{
 format:'sonic-v694-quality-history';schema:1;progress:Record<string,V693Progress>;
 before:V694Run|null;after:V694Run|null;entries:V694Entry[];
}
const domains:readonly V692Domain[]=['dance','camera','lyrics','lighting','performance'];
const statuses=['review','observed','manual','insufficient'];
const evidences=['browser-measurement','geometric-projection','director-metadata','none'];
const stages:readonly V693Progress[]=['offen','in-arbeit','manuell-geprueft'];
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const onlyKeys=(v:Record<string,unknown>,keys:readonly string[])=>Object.keys(v).every(k=>keys.includes(k));
const integer=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=min&&v<=max;
const scalar=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const txt=(v:unknown,max:number)=>typeof v==='string'&&v.length<=max;
const track=(v:unknown)=>txt(v,160)&&typeof v==='string'&&v.length>0&&/^[\w.:/-]+$/.test(v);
const metric=(v:unknown,max:number)=>v===null||scalar(v,0,max);
const counts=(v:unknown)=>Array.isArray(v)&&v.length<=24&&v.every(x=>integer(x,0,32));
const isCheck=(v:unknown):v is V692Check=>record(v)&&onlyKeys(v,['id','title','status','evidence','detail','action','atMs'])&&domains.includes(v.id as V692Domain)&&
 txt(v.title,120)&&txt(v.detail,1000)&&txt(v.action,1000)&&statuses.includes(v.status as string)&&
 evidences.includes(v.evidence as string)&&(v.atMs===null||integer(v.atMs,0,21_600_000));
export function isV694Snapshot(v:unknown):v is V693Snapshot{
 if(!record(v)||!onlyKeys(v,['format','trackId','durationMs','captureId','samples','coveragePercent','avatarCounts','verifiedGlbCounts','medianFps','medianP95Ms','checks','automaticallyApproved'])||v.format!=='sonic-v693-qa-snapshot'||v.automaticallyApproved!==false||!track(v.trackId)||
  !integer(v.captureId,1,Number.MAX_SAFE_INTEGER)||!integer(v.durationMs,1000,21_600_000)||
  !integer(v.samples,1,50000)||!scalar(v.coveragePercent,0,100)||
  !counts(v.avatarCounts)||!counts(v.verifiedGlbCounts)||!metric(v.medianFps,240)||!metric(v.medianP95Ms,2000)||
  !Array.isArray(v.checks)||v.checks.length!==5||!v.checks.every(isCheck))return false;
 return domains.every(id=>(v.checks as V692Check[]).filter(c=>c.id===id).length===1);
}
const isRelease=(v:unknown):v is V694Release=>typeof v==='string'&&/^V\d{3,4}$/.test(v);
export const isV694Run=(v:unknown):v is V694Run=>record(v)&&onlyKeys(v,['snapshot','release','capturedAt'])&&isV694Snapshot(v.snapshot)&&
 isRelease(v.release)&&integer(v.capturedAt,1,Number.MAX_SAFE_INTEGER);
const taskKey=(k:string)=>k.length<=175&&/^[\w.:/-]+:(dance|camera|lyrics|lighting|performance)$/.test(k);
const isProgress=(v:unknown):v is Record<string,V693Progress>=>record(v)&&Object.keys(v).length<=300&&
 Object.entries(v).every(([k,s])=>taskKey(k)&&stages.includes(s as V693Progress));
const isEntry=(v:unknown):v is V694Entry=>record(v)&&onlyKeys(v,['id','trackId','archivedAt','before','after','progress','humanReviewed','automaticallyApproved'])&&txt(v.id,125)&&typeof v.id==='string'&&v.id.length>0&&
 /^\d+-\d+-\d+$/.test(v.id)&&track(v.trackId)&&integer(v.archivedAt,1,Number.MAX_SAFE_INTEGER)&&
 isV694Run(v.before)&&isV694Run(v.after)&&isProgress(v.progress)&&v.humanReviewed===false&&
 v.automaticallyApproved===false&&v.before.snapshot.trackId===v.trackId&&v.after.snapshot.trackId===v.trackId&&
 compareV693Snapshots(v.before.snapshot,v.after.snapshot).comparable;
export function emptyV694Archive():V694Archive{
 return {format:'sonic-v694-quality-history',schema:1,progress:{},before:null,after:null,entries:[]};
}
export function isV694Archive(v:unknown):v is V694Archive{
 if(!record(v)||!onlyKeys(v,['format','schema','progress','before','after','entries'])||v.format!=='sonic-v694-quality-history'||v.schema!==1||!isProgress(v.progress)||
  !(v.before===null||isV694Run(v.before))||!(v.after===null||isV694Run(v.after))||
  !Array.isArray(v.entries)||v.entries.length>V694_MAX_ENTRIES||!v.entries.every(isEntry))return false;
 return new Set(v.entries.map((entry:V694Entry)=>entry.id)).size===v.entries.length;
}
/** Data from localStorage, backup files and earlier releases is untrusted. Reject rather than silently recasting. */
export function decodeV694Archive(raw:string):V694Archive|null{
 if(typeof raw!=='string'||raw.length>V694_MAX_JSON_LENGTH)return null;
 try{const parsed:unknown=JSON.parse(raw);return isV694Archive(parsed)?parsed:null;}catch{return null;}
}
export function encodeV694Archive(value:V694Archive):string|null{
 if(!isV694Archive(value))return null;
 const raw=JSON.stringify(value);
 return raw.length<=V694_MAX_JSON_LENGTH?raw:null;
}
export function markV694Task(value:V694Archive,key:string,stage:V693Progress):V694Archive{
 if(!taskKey(key)||!stages.includes(stage))return value;
 const next={...value.progress,[key]:stage};
 // Bound user-controlled status keys; retain most recently updated tasks.
 const entries=Object.entries(next);
 return {...value,progress:Object.fromEntries(entries.slice(-300))};
}
export function rememberV694Run(value:V694Archive,kind:'before'|'after',run:V694Run):V694Archive{
 if(!isV694Run(run))return value;
 if(kind==='before')return {...value,before:run,after:null};
 if(!value.before||value.before.snapshot.trackId!==run.snapshot.trackId||
  !compareV693Snapshots(value.before.snapshot,run.snapshot).comparable)return value;
 return {...value,after:run};
}
export function clearV694Draft(value:V694Archive):V694Archive{return {...value,before:null,after:null};}
/** Explicit opt-in archive operation, no claiming a warning is solved. */
export function archiveV694Comparison(value:V694Archive,now:number):V694Archive|null{
 if(!value.before||!value.after||!integer(now,1,Number.MAX_SAFE_INTEGER))return null;
 const before=value.before,after=value.after;
 if(!compareV693Snapshots(before.snapshot,after.snapshot).comparable)return null;
 const id=`${now}-${before.snapshot.captureId}-${after.snapshot.captureId}`;
 const progress=Object.fromEntries(Object.entries(value.progress).filter(([key])=>key.startsWith(`${before.snapshot.trackId}:`)));
 const entry:V694Entry={id,trackId:before.snapshot.trackId,archivedAt:now,before,after,
  progress,humanReviewed:false,automaticallyApproved:false};
 const entries=[entry,...value.entries.filter(e=>e.id!==id)].slice(0,V694_MAX_ENTRIES);
 const next={...value,entries};return encodeV694Archive(next)!==null?next:null;
}
export function deleteV694Entry(value:V694Archive,id:string):V694Archive{
 return {...value,entries:value.entries.filter(e=>e.id!==id)};
}
/** Import is a user-selected replacement, never a background sync. */
export function replaceV694Archive(raw:string):V694Archive|null{return decodeV694Archive(raw);}
