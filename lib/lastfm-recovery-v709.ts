/** V709: bounded, explicitly initiated recovery of possible Last.fm scrobble gaps. */
import {canonicalLastFmUsernameV706,emptyLastFmArchiveV706,lastFmEventKeyV706,mergeLastFmArchiveV706,readLastFmArchiveV706,writeLastFmArchiveV706,validLastFmUsernameV706,V706_PAGE_SIZE,V706_USERNAME_KEY,type LastFmArchiveV706,type LastFmPageV706,type LastFmStorageV706} from './lastfm-history-v706';
export const V709_GAP_PREFIX='sonic-display:lastfm:recovery-gap:v709:';
export const V709_GAP_EVENT='sonic-display:lastfm:recovery-gap:v709';
export const V709_MAX_BATCH_PAGES=5;
export const V709_MAX_SESSION_PAGES=100;
export const V709_FORMAT='sonic-display-lastfm-recovery-gap-v709';
export type V709Gap={format:typeof V709_FORMAT;version:1;username:string;detectedAt:string;lastArchivedAt:string;oldestFetchedAt:string};
export type V709Session={username:string;to:number;nextPage:number;anchorKey:string|null;pagesLoaded:number;done:boolean;reason:'continuing'|'overlap'|'last-page'|'limit'};
export type V709Recovered={status:'ok'|'invalid-page'|'wrong-user'|'no-archive'|'invalid-archive'|'failed'|'limit';session:V709Session;added:number;trimmed:number;archive:LastFmArchiveV706|null};
const record=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const validIso=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString()===x;
export const lastFmGapKeyV709=(u:string)=>`${V709_GAP_PREFIX}${encodeURIComponent(canonicalLastFmUsernameV706(u))}`;
export function inspectLastFmGapV709(archive:LastFmArchiveV706|null,page:LastFmPageV706,now=new Date()):V709Gap|null{
 if(!archive||!validLastFmUsernameV706(archive.username)||canonicalLastFmUsernameV706(archive.username)!==canonicalLastFmUsernameV706(page.username)||page.page!==1||page.events.length!==V706_PAGE_SIZE||archive.events.length===0)return null;
 const newestSaved=archive.events[0]?.playedAt,oldestFetched=page.events[page.events.length-1]?.playedAt;
 if(!validIso(newestSaved)||!validIso(oldestFetched)||!Number.isFinite(now.getTime())||Date.parse(oldestFetched)<=Date.parse(newestSaved))return null;
 return {format:V709_FORMAT,version:1,username:archive.username,detectedAt:now.toISOString(),lastArchivedAt:newestSaved,oldestFetchedAt:oldestFetched};
}
export function readLastFmGapV709(storage:LastFmStorageV706,user:string):V709Gap|null{
 if(!validLastFmUsernameV706(user))return null;
 try{
  const s=storage.getItem(lastFmGapKeyV709(user));if(!s||s.length>600)return null;
  const x:unknown=JSON.parse(s);if(!record(x)||x.format!==V709_FORMAT||x.version!==1||!validLastFmUsernameV706(x.username)||canonicalLastFmUsernameV706(x.username)!==canonicalLastFmUsernameV706(user)||!validIso(x.detectedAt)||!validIso(x.lastArchivedAt)||!validIso(x.oldestFetchedAt)||Date.parse(x.oldestFetchedAt)<=Date.parse(x.lastArchivedAt))return null;
  return {format:V709_FORMAT,version:1,username:user,detectedAt:x.detectedAt,lastArchivedAt:x.lastArchivedAt,oldestFetchedAt:x.oldestFetchedAt};
 }catch{return null;}
}
export function writeLastFmGapV709(storage:LastFmStorageV706,gap:V709Gap):boolean{
 if(!validLastFmUsernameV706(gap.username)||!validIso(gap.detectedAt)||!validIso(gap.lastArchivedAt)||!validIso(gap.oldestFetchedAt)||Date.parse(gap.oldestFetchedAt)<=Date.parse(gap.lastArchivedAt))return false;
 try{storage.setItem(lastFmGapKeyV709(gap.username),JSON.stringify(gap));return true;}catch{return false;}
}
export function clearLastFmGapV709(storage:LastFmStorageV706,user:string):boolean{
 if(!validLastFmUsernameV706(user))return false;
 try{storage.removeItem(lastFmGapKeyV709(user));return true;}catch{return false;}
}
/** Snapshot query `to` fixes the upper time limit for every page of a recovery run. */
export function startLastFmRecoveryV709(archive:LastFmArchiveV706,now=new Date(),gap:V709Gap|null=null):V709Session{
 if(!validLastFmUsernameV706(archive.username)||!Number.isFinite(now.getTime()))throw new Error('Last.fm-Archiv oder Uhrzeit ungültig.');
 // IMPORTANT: V708 may have already appended the *new* 200 events after the gap was reported.
 // Stop at the saved pre-gap timestamp, NEVER at the newest event after that append.
 const anchor=gap&&gap.format===V709_FORMAT&&validLastFmUsernameV706(gap.username)&&canonicalLastFmUsernameV706(gap.username)===canonicalLastFmUsernameV706(archive.username)&&validIso(gap.lastArchivedAt)?archive.events.find(e=>e.playedAt===gap.lastArchivedAt):null;
 return {username:archive.username,to:Math.floor(now.getTime()/1000),nextPage:1,anchorKey:anchor?lastFmEventKeyV706(anchor):null,pagesLoaded:0,done:false,reason:'continuing'};
}
/** Each fetched page is checked in full before the caller writes anything to localStorage. */
export function applyLastFmRecoveryPageV709(storage:LastFmStorageV706,session:V709Session,page:unknown,now=new Date()):V709Recovered{
 const result=(status:V709Recovered['status'],s=session,archive:LastFmArchiveV706|null=null,added=0,trimmed=0):V709Recovered=>({status,session:s,archive,added,trimmed});
 if(!validLastFmUsernameV706(session.username)||!Number.isSafeInteger(session.to)||session.to<946684800||session.to>Math.floor(now.getTime()/1000)+60||!Number.isSafeInteger(session.nextPage)||session.nextPage<1||!Number.isSafeInteger(session.pagesLoaded)||session.pagesLoaded<0||session.pagesLoaded>=V709_MAX_SESSION_PAGES||session.done)return result('limit');
 try{
  if(storage.getItem(V706_USERNAME_KEY)!==session.username)return result('wrong-user');
  const source=readLastFmArchiveV706(storage,session.username,now);
  if(source.error)return result('invalid-archive');if(!source.archive)return result('no-archive');
  if(!record(page)||!validLastFmUsernameV706(page.username)||canonicalLastFmUsernameV706(page.username)!==canonicalLastFmUsernameV706(session.username)||page.page!==session.nextPage||!Number.isSafeInteger(page.totalPages)||Number(page.totalPages)<0||Number(page.totalPages)>1000000||!Number.isSafeInteger(page.total)||Number(page.total)<0||Number(page.total)>100000000||!Array.isArray(page.events)||page.events.length>V706_PAGE_SIZE||!page.events.every(record))return result('invalid-page');
  const incoming=(page as LastFmPageV706).events;
  if(mergeLastFmArchiveV706(emptyLastFmArchiveV706(session.username,now),incoming,now).added!==incoming.length||incoming.some(e=>Date.parse(e.playedAt)>session.to*1000))return result('invalid-page');
  const overlap=session.anchorKey!==null&&incoming.some(e=>lastFmEventKeyV706(e)===session.anchorKey);
  const remoteEnd=page.totalPages===0||session.nextPage>=Number(page.totalPages)||incoming.length===0;
  const pagesLoaded=session.pagesLoaded+1;
  const reason:V709Session['reason']=overlap?'overlap':remoteEnd?'last-page':pagesLoaded>=V709_MAX_SESSION_PAGES?'limit':'continuing';
  const next:V709Session={...session,nextPage:session.nextPage+1,pagesLoaded,done:reason!=='continuing',reason};
  // Re-read before writing so normal auto-sync additions are not lost during a network request.
  if(storage.getItem(V706_USERNAME_KEY)!==session.username)return result('wrong-user');
  const current=readLastFmArchiveV706(storage,session.username,now);
  if(current.error)return result('invalid-archive');if(!current.archive)return result('no-archive');
  const merged=mergeLastFmArchiveV706(current.archive,incoming,now);
  if(!merged.added)return result('ok',next,current.archive,0,0);
  // Never overwrite if writing fails. The caller must not advance its session on failure.
  const written=writeLastFmArchiveV706(storage,merged.archive,now);
  if(written.error||!written.archive)return result('failed');
  return result('ok',next,written.archive,merged.added,merged.trimmed);
 }catch{return result('failed');}
}
