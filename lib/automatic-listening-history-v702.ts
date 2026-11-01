import type {RecentTrackV672} from './recently-played-v672';
import {archiveKeyV701,mergeArchiveV701,readArchiveV701,validArchiveOwnerV701,writeArchiveV701,type V701Storage} from './persistent-listening-history-v701';

/** Consent is OFF by default; never infer permission from the existence of a V701 archive. */
export const V702_PREFERENCE_FORMAT='sonic-display-auto-history-consent-v702';
export const V702_PREFERENCE_PREFIX='sonic-display:auto-history:v702:';
export const V702_STATUS_PREFIX='sonic-display:auto-history-status:v702:';
export const V702_CHANGE_EVENT='sonic-display:auto-history-preference-v702';
export const V702_STATUS_EVENT='sonic-display:auto-history-status-v702';
export const V702_POLL_INTERVAL_MS=180_000;
export const V702_MAX_PAGE_EVENTS=30;
export type V702Preference={format:typeof V702_PREFERENCE_FORMAT;version:1;owner:string;enabled:boolean;updatedAt:string};
export type V702ConsentRead={enabled:boolean;error:string|null};
export type V702SyncResult={status:'saved'|'no-new-events'|'disabled'|'no-archive'|'invalid-archive'|'failed';added:number;trimmed:number};
export type V702SyncStatus={at:string;added:number;trimmed:number};
export const autoHistoryKeyV702=(owner:string)=>`${V702_PREFERENCE_PREFIX}${encodeURIComponent(owner)}`;
export const autoHistoryStatusKeyV702=(owner:string)=>`${V702_STATUS_PREFIX}${encodeURIComponent(owner)}`;
const record=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const iso=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString()===x;
export function readAutoHistoryConsentV702(storage:V701Storage,owner:string):V702ConsentRead{
 if(!validArchiveOwnerV701(owner))return {enabled:false,error:'Spotify-Konto unbekannt.'};
 try{
  const raw=storage.getItem(autoHistoryKeyV702(owner));
  if(raw===null)return {enabled:false,error:null};
  if(raw.length>1000)return {enabled:false,error:'Automatik-Einstellung beschädigt; automatische Speicherung deaktiviert.'};
  const x:unknown=JSON.parse(raw);
  if(!record(x)||x.format!==V702_PREFERENCE_FORMAT||x.version!==1||x.owner!==owner||typeof x.enabled!=='boolean'||!iso(x.updatedAt))return {enabled:false,error:'Automatik-Einstellung beschädigt; automatische Speicherung deaktiviert.'};
  return {enabled:x.enabled,error:null};
 }catch{return {enabled:false,error:'Automatik-Einstellung nicht lesbar; automatische Speicherung deaktiviert.'};}
}
export function setAutoHistoryConsentV702(storage:V701Storage,owner:string,enabled:boolean,now=new Date()):boolean{
 if(!validArchiveOwnerV701(owner)||typeof enabled!=='boolean'||!Number.isFinite(now.getTime()))return false;
 try{
  const pref:V702Preference={format:V702_PREFERENCE_FORMAT,version:1,owner,enabled,updatedAt:now.toISOString()};
  storage.setItem(autoHistoryKeyV702(owner),JSON.stringify(pref));
  return true;
 }catch{return false;}
}
/** This function never creates an archive, polls Spotify, enables consent or attempts to repair corrupt data. */
export function appendAutoHistoryV702(storage:V701Storage,owner:string,events:ReadonlyArray<RecentTrackV672>,now=new Date()):V702SyncResult{
 const empty=(status:V702SyncResult['status']):V702SyncResult=>({status,added:0,trimmed:0});
 const consent=readAutoHistoryConsentV702(storage,owner);
 if(consent.error||!consent.enabled)return empty('disabled');
 if(!Array.isArray(events)||events.length>V702_MAX_PAGE_EVENTS)return empty('failed');
 const found=readArchiveV701(storage,owner,now);
 if(found.error)return empty('invalid-archive');
 if(!found.archive)return empty('no-archive');
 const result=mergeArchiveV701(found.archive,events,now);
 if(!result.added)return empty('no-new-events');
 // Re-check opt-in before committing; another tab may have disabled collection.
 if(!readAutoHistoryConsentV702(storage,owner).enabled)return empty('disabled');
 const saved=writeArchiveV701(storage,result.archive,now);
 if(!saved.archive)return empty('failed');
 return {status:'saved',added:result.added,trimmed:result.trimmed};
}
export function readAutoHistoryStatusV702(storage:V701Storage,owner:string):V702SyncStatus|null{
 if(!validArchiveOwnerV701(owner))return null;
 try{
  const raw=storage.getItem(autoHistoryStatusKeyV702(owner));if(!raw||raw.length>250)return null;
  const s:unknown=JSON.parse(raw);if(!record(s)||!iso(s.at)||typeof s.added!=='number'||!Number.isSafeInteger(s.added)||s.added<0||s.added>V702_MAX_PAGE_EVENTS||typeof s.trimmed!=='number'||!Number.isSafeInteger(s.trimmed)||s.trimmed<0||s.trimmed>5000)return null;
  return {at:s.at,added:s.added,trimmed:s.trimmed};
 }catch{return null;}
}
export function writeAutoHistoryStatusV702(storage:V701Storage,owner:string,status:V702SyncStatus):boolean{
 if(!validArchiveOwnerV701(owner)||!iso(status.at)||!Number.isSafeInteger(status.added)||status.added<0||status.added>V702_MAX_PAGE_EVENTS||!Number.isSafeInteger(status.trimmed)||status.trimmed<0||status.trimmed>5000)return false;
 try{storage.setItem(autoHistoryStatusKeyV702(owner),JSON.stringify(status));return true;}catch{return false;}
}
export function removeAutoHistoryStatusV702(storage:V701Storage,owner:string):void{
 if(!validArchiveOwnerV701(owner))return;
 try{storage.removeItem(autoHistoryStatusKeyV702(owner));}catch{ /* cannot remove browser storage */ }
}
/** Private browser-only event keys are scoped to a Spotify account, never to its display name. */
export const isAutoHistoryStorageKeyV702=(key:string|null,owner:string)=>validArchiveOwnerV701(owner)&&(key===autoHistoryKeyV702(owner)||key===archiveKeyV701(owner)||key===null);
