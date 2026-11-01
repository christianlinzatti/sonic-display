/** V708 opt-in Last.fm history polling. All records stay in the existing V706 local archive. */
import {canonicalLastFmUsernameV706,emptyLastFmArchiveV706,mergeLastFmArchiveV706,readLastFmArchiveV706,validLastFmUsernameV706,writeLastFmArchiveV706,V706_PAGE_SIZE,V706_USERNAME_KEY,type LastFmPageV706,type LastFmStorageV706} from './lastfm-history-v706';
export const V708_CONSENT_FORMAT='sonic-display-lastfm-auto-sync-v708';
export const V708_CONSENT_PREFIX='sonic-display:lastfm:auto-consent:v708:';
export const V708_STATUS_PREFIX='sonic-display:lastfm:auto-status:v708:';
export const V708_CHANGE_EVENT='sonic-display:lastfm:auto-changed:v708';
export const V708_STATUS_EVENT='sonic-display:lastfm:auto-updated:v708';
export const V708_POLL_INTERVAL_MS=300_000;
export type V708Consent={format:typeof V708_CONSENT_FORMAT;version:1;username:string;enabled:boolean;updatedAt:string};
export type V708ConsentRead={enabled:boolean;error:string|null};
export type V708Result={status:'saved'|'no-new-events'|'disabled'|'no-archive'|'invalid-archive'|'wrong-user'|'invalid-page'|'failed';added:number;trimmed:number};
export type V708Status={at:string;added:number;trimmed:number};
const record=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const iso=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString()===x;
export const lastFmAutoConsentKeyV708=(user:string)=>`${V708_CONSENT_PREFIX}${encodeURIComponent(canonicalLastFmUsernameV706(user))}`;
export const lastFmAutoStatusKeyV708=(user:string)=>`${V708_STATUS_PREFIX}${encodeURIComponent(canonicalLastFmUsernameV706(user))}`;
export const lastFmAutoStorageKeyV708=(key:string|null)=>key===null||key===V706_USERNAME_KEY||key.startsWith(V708_CONSENT_PREFIX);
/** Missing, corrupted and inaccessible consent always mean OFF. */
export function readLastFmAutoConsentV708(storage:LastFmStorageV706,user:string):V708ConsentRead{
 if(!validLastFmUsernameV706(user))return {enabled:false,error:'Last.fm-Benutzername ungültig.'};
 try{
  const raw=storage.getItem(lastFmAutoConsentKeyV708(user));if(raw===null)return {enabled:false,error:null};
  if(raw.length>1024)return {enabled:false,error:'Automatik-Einstellung beschädigt; Synchronisierung deaktiviert.'};
  const item:unknown=JSON.parse(raw);
  if(!record(item)||item.format!==V708_CONSENT_FORMAT||item.version!==1||!validLastFmUsernameV706(item.username)||canonicalLastFmUsernameV706(item.username)!==canonicalLastFmUsernameV706(user)||typeof item.enabled!=='boolean'||!iso(item.updatedAt))return {enabled:false,error:'Automatik-Einstellung beschädigt; Synchronisierung deaktiviert.'};
  return {enabled:item.enabled,error:null};
 }catch{return {enabled:false,error:'Automatik-Einstellung nicht lesbar; Synchronisierung deaktiviert.'};}
}
/** Enabling requires an already existing, valid archive for the selected account. */
export function setLastFmAutoConsentV708(storage:LastFmStorageV706,user:string,enabled:boolean,now=new Date()):boolean{
 if(!validLastFmUsernameV706(user)||typeof enabled!=='boolean'||!Number.isFinite(now.getTime()))return false;
 try{
  if(enabled){
   if(storage.getItem(V706_USERNAME_KEY)!==user)return false;
   const read=readLastFmArchiveV706(storage,user,now);if(read.error||!read.archive)return false;
  }
  const preference:V708Consent={format:V708_CONSENT_FORMAT,version:1,username:user,enabled,updatedAt:now.toISOString()};
  storage.setItem(lastFmAutoConsentKeyV708(user),JSON.stringify(preference));return true;
 }catch{return false;}
}
const no=(status:V708Result['status']):V708Result=>({status,added:0,trimmed:0});
/** No archive creation, no consent inference, no write across accounts. A valid empty page is a successful check. */
export function appendAutoLastFmV708(storage:LastFmStorageV706,user:string,page:unknown,now=new Date()):V708Result{
 if(!validLastFmUsernameV706(user)||!Number.isFinite(now.getTime()))return no('wrong-user');
 try{
  if(storage.getItem(V706_USERNAME_KEY)!==user)return no('wrong-user');
  const consent=readLastFmAutoConsentV708(storage,user);
  if(consent.error||!consent.enabled)return no('disabled');
  if(!record(page)||!validLastFmUsernameV706(page.username)||canonicalLastFmUsernameV706(page.username)!==canonicalLastFmUsernameV706(user)||page.page!==1||!Number.isSafeInteger(page.totalPages)||!Number.isSafeInteger(page.total)||!Array.isArray(page.events)||page.events.length>V706_PAGE_SIZE||!page.events.every(record))return no('invalid-page');
  const response=page as LastFmPageV706;
  // The V706 merge validates timestamps, safe Last.fm URLs and cover hosts.
  // A malformed response must not be reported as a successful empty check.
  if(mergeLastFmArchiveV706(emptyLastFmArchiveV706(user,now),response.events,now).added!==response.events.length)return no('invalid-page');
  const found=readLastFmArchiveV706(storage,user,now);
  if(found.error)return no('invalid-archive');
  if(!found.archive)return no('no-archive');
  const merged=mergeLastFmArchiveV706(found.archive,response.events,now);
  if(!merged.added)return no('no-new-events');
  // Check again just before commit, including changes made by other browser tabs.
  if(storage.getItem(V706_USERNAME_KEY)!==user)return no('wrong-user');
  if(!readLastFmAutoConsentV708(storage,user).enabled)return no('disabled');
  const current=readLastFmArchiveV706(storage,user,now);
  if(current.error)return no('invalid-archive');
  if(!current.archive)return no('no-archive');
  const latest=mergeLastFmArchiveV706(current.archive,response.events,now);
  if(!latest.added)return no('no-new-events');
  const written=writeLastFmArchiveV706(storage,latest.archive,now);
  if(written.error||!written.archive)return no('failed');
  return {status:'saved',added:latest.added,trimmed:latest.trimmed};
 }catch{return no('failed');}
}
export function readLastFmAutoStatusV708(storage:LastFmStorageV706,user:string):V708Status|null{
 if(!validLastFmUsernameV706(user))return null;
 try{
  const raw=storage.getItem(lastFmAutoStatusKeyV708(user));if(!raw||raw.length>300)return null;
  const s:unknown=JSON.parse(raw);if(!record(s)||!iso(s.at)||!Number.isSafeInteger(s.added)||Number(s.added)<0||Number(s.added)>V706_PAGE_SIZE||!Number.isSafeInteger(s.trimmed)||Number(s.trimmed)<0||Number(s.trimmed)>V706_PAGE_SIZE)return null;
  return {at:s.at,added:s.added as number,trimmed:s.trimmed as number};
 }catch{return null;}
}
export function writeLastFmAutoStatusV708(storage:LastFmStorageV706,user:string,status:V708Status):boolean{
 if(!validLastFmUsernameV706(user)||!iso(status.at)||!Number.isSafeInteger(status.added)||status.added<0||status.added>V706_PAGE_SIZE||!Number.isSafeInteger(status.trimmed)||status.trimmed<0||status.trimmed>V706_PAGE_SIZE)return false;
 try{storage.setItem(lastFmAutoStatusKeyV708(user),JSON.stringify(status));return true;}catch{return false;}
}
/** Used by the background recorder before each request. */
export function mayPollLastFmV708(storage:LastFmStorageV706,user:string,now=new Date()):boolean{
 if(!validLastFmUsernameV706(user))return false;
 try{
  return storage.getItem(V706_USERNAME_KEY)===user&&readLastFmAutoConsentV708(storage,user).enabled&&readLastFmArchiveV706(storage,user,now).archive!==null;
 }catch{return false;}
}
