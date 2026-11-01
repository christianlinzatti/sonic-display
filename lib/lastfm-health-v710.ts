/** V710: opt-in, resumable, bounded Last.fm recovery and local history health metrics. No network calls. */
import {canonicalLastFmUsernameV706,lastFmEventKeyV706,readLastFmArchiveV706,validLastFmUsernameV706,V706_USERNAME_KEY,type LastFmArchiveV706,type LastFmEventV706,type LastFmStorageV706} from './lastfm-history-v706';
import {readLastFmAutoConsentV708} from './automatic-lastfm-history-v708';
import {applyLastFmRecoveryPageV709,clearLastFmGapV709,readLastFmGapV709,startLastFmRecoveryV709,V709_FORMAT,V709_MAX_SESSION_PAGES,type V709Gap,type V709Session} from './lastfm-recovery-v709';
export const V710_FORMAT='sonic-display-lastfm-health-v710';
export const V710_PREF_PREFIX='sonic-display:lastfm:recovery-consent:v710:';
export const V710_RUN_PREFIX='sonic-display:lastfm:recovery-progress:v710:';
export const V710_CHANGE_EVENT='sonic-display:lastfm:recovery-changed:v710';
export const V710_STATUS_EVENT='sonic-display:lastfm:recovery-updated:v710';
export const V710_STEP_INTERVAL_MS=300_000;
export type V710Consent={format:typeof V710_FORMAT;version:1;username:string;enabled:boolean;updatedAt:string};
export type V710Run={format:typeof V710_FORMAT;version:1;username:string;gapDetectedAt:string;session:V709Session;updatedAt:string;added:number;pages:number};
export type V710Plan={status:'ready'|'off'|'no-gap'|'no-archive'|'invalid-archive'|'invalid-state'|'completed'|'limit'|'wrong-user'|'not-ready';gap:V709Gap|null;session:V709Session|null};
export type V710Commit={status:'saved'|'completed'|'limit'|'disabled'|'invalid-page'|'invalid-state'|'failed'|'wrong-user';added:number;run:V710Run|null};
const obj=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const iso=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString()===x;
const key=(prefix:string,user:string)=>prefix+encodeURIComponent(canonicalLastFmUsernameV706(user));
export const recoveryConsentKeyV710=(user:string)=>key(V710_PREF_PREFIX,user);
export const recoveryProgressKeyV710=(user:string)=>key(V710_RUN_PREFIX,user);
const sameUser=(a:string,b:string)=>canonicalLastFmUsernameV706(a)===canonicalLastFmUsernameV706(b);
/** Fail closed on unreadable preferences; never infer consent from V708 opt-in alone. */
export function readRecoveryConsentV710(storage:LastFmStorageV706,user:string):{enabled:boolean;error:string|null}{
 if(!validLastFmUsernameV706(user))return {enabled:false,error:'Ungültiger Last.fm-Benutzername.'};
 try{
  const raw=storage.getItem(recoveryConsentKeyV710(user));if(raw===null)return {enabled:false,error:null};
  if(raw.length>1000)return {enabled:false,error:'Nachhol-Einstellung beschädigt.'};
  const x:unknown=JSON.parse(raw);
  return obj(x)&&x.format===V710_FORMAT&&x.version===1&&validLastFmUsernameV706(x.username)&&sameUser(x.username,user)&&typeof x.enabled==='boolean'&&iso(x.updatedAt)?{enabled:x.enabled,error:null}:{enabled:false,error:'Nachhol-Einstellung beschädigt.'};
 }catch{return {enabled:false,error:'Nachhol-Einstellung nicht lesbar.'};}
}
export function setRecoveryConsentV710(storage:LastFmStorageV706,user:string,enabled:boolean,now=new Date()):boolean{
 if(!validLastFmUsernameV706(user)||typeof enabled!=='boolean'||!Number.isFinite(now.getTime()))return false;
 try{
  if(enabled){
   if(storage.getItem(V706_USERNAME_KEY)!==user||!readLastFmAutoConsentV708(storage,user).enabled)return false;
   const a=readLastFmArchiveV706(storage,user,now);if(a.error||!a.archive)return false;
  }
  const v:V710Consent={format:V710_FORMAT,version:1,username:user,enabled,updatedAt:now.toISOString()};
  storage.setItem(recoveryConsentKeyV710(user),JSON.stringify(v));return true;
 }catch{return false;}
}
/** Return undefined if there is no progress, null if invalid: never silently restart corrupted progress. */
export function readRecoveryRunV710(storage:LastFmStorageV706,user:string,now=new Date()):V710Run|null|undefined{
 if(!validLastFmUsernameV706(user))return null;
 try{
  const raw=storage.getItem(recoveryProgressKeyV710(user));if(raw===null)return undefined;if(raw.length>2200)return null;
  const x:unknown=JSON.parse(raw);if(!obj(x)||x.format!==V710_FORMAT||x.version!==1||!validLastFmUsernameV706(x.username)||!sameUser(x.username,user)||!iso(x.updatedAt)||!iso(x.gapDetectedAt)||Date.parse(x.updatedAt)>now.getTime()+60000||!Number.isSafeInteger(x.added)||Number(x.added)<0||Number(x.added)>V709_MAX_SESSION_PAGES*200||!Number.isSafeInteger(x.pages)||Number(x.pages)<0||Number(x.pages)>V709_MAX_SESSION_PAGES||!obj(x.session))return null;
  const s=x.session;
  if(!validLastFmUsernameV706(s.username)||!sameUser(s.username,user)||!Number.isSafeInteger(s.to)||Number(s.to)<946684800||Number(s.to)>Math.floor(now.getTime()/1000)+60||!Number.isSafeInteger(s.nextPage)||!Number.isSafeInteger(s.pagesLoaded)||Number(s.pagesLoaded)<0||Number(s.pagesLoaded)>V709_MAX_SESSION_PAGES||s.nextPage!==Number(s.pagesLoaded)+1||s.pagesLoaded!==x.pages||typeof s.done!=='boolean'||!['continuing','overlap','last-page','limit'].includes(String(s.reason))||(s.done!==(s.reason!=='continuing'))||typeof s.anchorKey!=='string'||s.anchorKey.length<1||s.anchorKey.length>1000)return null;
  return x as V710Run;
 }catch{return null;}
}
export function writeRecoveryRunV710(storage:LastFmStorageV706,run:V710Run,now=new Date()):boolean{
 if(!validLastFmUsernameV706(run.username))return false;
 try{
  const json=JSON.stringify(run);if(json.length>2200)return false;
  const scratch:LastFmStorageV706={getItem:()=>json,setItem:()=>{},removeItem:()=>{}};
  const verified=readRecoveryRunV710(scratch,run.username,now);if(!verified)return false;
  storage.setItem(recoveryProgressKeyV710(run.username),json);return true;
 }catch{return false;}
}
/** Only a real V709 gap with a still present pre-gap anchor may trigger automatic recovery. */
export function planRecoveryV710(storage:LastFmStorageV706,user:string,now=new Date()):V710Plan{
 const no=(status:V710Plan['status'],gap:V709Gap|null=null):V710Plan=>({status,gap,session:null});
 if(!validLastFmUsernameV706(user)||!Number.isFinite(now.getTime()))return no('wrong-user');
 try{
  if(storage.getItem(V706_USERNAME_KEY)!==user)return no('wrong-user');
  if(!readRecoveryConsentV710(storage,user).enabled||!readLastFmAutoConsentV708(storage,user).enabled)return no('off');
  const a=readLastFmArchiveV706(storage,user,now);if(a.error)return no('invalid-archive');if(!a.archive)return no('no-archive');
  const gap=readLastFmGapV709(storage,user);if(!gap)return no('no-gap');
  const saved=readRecoveryRunV710(storage,user,now);if(saved===null)return no('invalid-state',gap);
  const session=saved&&saved.gapDetectedAt===gap.detectedAt?saved.session:startLastFmRecoveryV709(a.archive,now,gap);
  if(!session.anchorKey||!a.archive.events.some(e=>lastFmEventKeyV706(e)===session.anchorKey))return no('not-ready',gap);
  if(session.done)return no(session.reason==='limit'?'limit':'completed',gap);
  if(session.pagesLoaded>=V709_MAX_SESSION_PAGES)return no('limit',gap);
  if(saved&&saved.gapDetectedAt===gap.detectedAt&&now.getTime()-Date.parse(saved.updatedAt)<V710_STEP_INTERVAL_MS)return no('not-ready',gap);
  return {status:'ready',gap,session};
 }catch{return no('invalid-state');}
}
/** One validated page per step, rechecking account/consent and gap before commit. */
export function commitRecoveryV710(storage:LastFmStorageV706,user:string,expected:V710Plan,page:unknown,now=new Date()):V710Commit{
 const no=(status:V710Commit['status']):V710Commit=>({status,added:0,run:null});
 if(expected.status!=='ready'||!expected.session||!expected.gap)return no('invalid-state');
 try{
  if(storage.getItem(V706_USERNAME_KEY)!==user)return no('wrong-user');
  if(!readRecoveryConsentV710(storage,user).enabled||!readLastFmAutoConsentV708(storage,user).enabled)return no('disabled');
  const gap=readLastFmGapV709(storage,user);
  if(!gap||gap.detectedAt!==expected.gap.detectedAt||gap.lastArchivedAt!==expected.gap.lastArchivedAt)return no('invalid-state');
  const current=readRecoveryRunV710(storage,user,now);
  if(current===null||current&&current.gapDetectedAt===gap.detectedAt&&(current.session.nextPage!==expected.session.nextPage||current.session.to!==expected.session.to))return no('invalid-state');
  const updated=applyLastFmRecoveryPageV709(storage,expected.session,page,now);
  if(updated.status!=='ok')return no(updated.status==='wrong-user'?'wrong-user':updated.status==='invalid-page'?'invalid-page':'failed');
  const run:V710Run={format:V710_FORMAT,version:1,username:user,gapDetectedAt:gap.detectedAt,session:updated.session,updatedAt:now.toISOString(),pages:updated.session.pagesLoaded,added:(current&&current.gapDetectedAt===gap.detectedAt?current.added:0)+updated.added};
  if(!writeRecoveryRunV710(storage,run,now))return {status:'failed',added:updated.added,run:null};
  if(updated.session.done&&updated.session.reason!=='limit')clearLastFmGapV709(storage,user);
  return {status:updated.session.reason==='limit'?'limit':updated.session.done?'completed':'saved',added:updated.added,run};
 }catch{return no('failed');}
}
export type V710Health={monthCounts:readonly {month:string;count:number}[];last30:number;previous30:number;activeDays365:number;hourBuckets:readonly number[];total:number;newest:string|null;oldest:string|null};
/** Calendar months in UTC; never infer listening duration or coverage outside locally saved scrobbles. */
export function lastFmHealthV710(events:readonly LastFmEventV706[],now=new Date()):V710Health{
 const today=now.getTime(),monthCounts:{month:string;count:number}[]=[];
 const first=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-11,1));
 for(let i=0;i<12;i++){const m=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+i,1));monthCounts.push({month:m.toISOString().slice(0,7),count:0});}
 const map=new Map(monthCounts.map(x=>[x.month,x]));const days=new Set<string>(),hours=[0,0,0,0];let last30=0,previous30=0,newest:number|null=null,oldest:number|null=null;
 for(const e of events){const t=Date.parse(e.playedAt);if(!Number.isFinite(t)||t>today+60000||t<946684800000)continue;
  const delta=today-t;if(delta>=0&&delta<30*86400000)last30++;else if(delta>=30*86400000&&delta<60*86400000)previous30++;
  if(delta>=0&&delta<365*86400000)days.add(e.playedAt.slice(0,10));
  const entry=map.get(e.playedAt.slice(0,7));if(entry)entry.count++;
  hours[Math.floor(Number(e.playedAt.slice(11,13))/6)]++;
  newest=newest===null? t:Math.max(newest,t);oldest=oldest===null?t:Math.min(oldest,t);
 }
 return {monthCounts,last30,previous30,activeDays365:days.size,hourBuckets:hours,total:events.length,newest:newest===null?null:new Date(newest).toISOString(),oldest:oldest===null?null:new Date(oldest).toISOString()};
}
