/** Pure V365 boundaries; no Spotify secrets are ever sent to browser clients. */
import {createCipheriv,createDecipheriv,createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {mergeRadarReleases, type RadarReleaseV362} from '@/lib/release-radar-v362';
import {validDiscoveryId, type DiscoveryArtist} from '@/lib/artist-discovery-v360';
export type PushGenreV365='deutschrap'|'hardstyle'|'hardtekk';
export const PUSH_GENRES_V365:PushGenreV365[]=['deutschrap','hardstyle','hardtekk'];
export const PUSH_FRESH_DAYS_V365=14;
export const PUSH_SEEN_LIMIT_V365=500;
export const PUSH_MAX_DEVICES_V365=3;
export interface PushSubscriptionV365{endpoint:string;keys:{p256dh:string;auth:string}}
export interface PushAccountV365{version:1;refreshTokenEncrypted:string;initialized:boolean;after:string|null;seenIds:string[];genres:PushGenreV365[];}
export function parsePushGenres(value:unknown):PushGenreV365[]|null{
 if(!Array.isArray(value)||value.length>3||value.some(v=>typeof v!=='string'||!PUSH_GENRES_V365.includes(v as PushGenreV365)))return null;
 return [...new Set(value as PushGenreV365[])];
}
/** Empty genre list means ALL followed artists; otherwise require known Spotify artist genre tags. */
export function artistMatchesPushGenres(artist:DiscoveryArtist,genres:PushGenreV365[]):boolean{
 if(genres.length===0)return true;
 const tags=artist.genres.map(g=>g.toLowerCase().replace(/[\s_-]/g,''));
 return genres.some(g=>tags.some(t=>g==='deutschrap'?/(germanhiphop|deutschrap|germanrap)/.test(t):g==='hardtekk'?/(hardtekk|hardtek|hardtekno)/.test(t):/(hardstyle|rawstyle|euphorichardstyle)/.test(t)));
}
export function validatePushSubscription(value:unknown):PushSubscriptionV365|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const v=value as Record<string,unknown>,k=v.keys as Record<string,unknown>|undefined;
 if(typeof v.endpoint!=='string'||v.endpoint.length>2048||!k||typeof k!=='object')return null;
 try{
  const u=new URL(v.endpoint);
  // Push services only; never relay requests to arbitrary domains/IPs supplied by clients.
  if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)return null;
  const h=u.hostname.toLowerCase();
  if(!(['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com','push.services.mozilla.com'].includes(h)||
   h.endsWith('.push.apple.com')||/^wns[\w-]*\.notify\.windows\.com$/.test(h)))return null;
  if(!u.pathname||u.pathname==='/')return null;
  if(typeof k.p256dh!=='string'||typeof k.auth!=='string'||!/^[A-Za-z0-9_-]{80,150}={0,2}$/.test(k.p256dh)||!/^[A-Za-z0-9_-]{12,40}={0,2}$/.test(k.auth))return null;
  return {endpoint:v.endpoint,keys:{p256dh:k.p256dh,auth:k.auth}};
 }catch{return null;}
}
export function pushEndpointId(endpoint:string):string{return createHash('sha256').update(endpoint).digest('hex');}
export function pushUserId(spotifyId:string,secret:string):string{return createHmac('sha256',secret).update(spotifyId).digest('hex');}
export function pushEncrypt(token:string,secret:string):string{
 const key=Buffer.from(secret,'base64url');if(key.length!==32)throw new Error('PUSH_ENCRYPTION_KEY must be a base64url-encoded 32-byte key');
 const iv=randomBytes(12);const cipher=createCipheriv('aes-256-gcm',key,iv);
 const bytes=Buffer.concat([cipher.update(token,'utf8'),cipher.final()]);
 return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${bytes.toString('base64url')}`;
}
export function pushDecrypt(encrypted:string,secret:string):string{
 const key=Buffer.from(secret,'base64url');if(key.length!==32)throw new Error('Invalid encryption key');
 const parts=encrypted.split('.');if(parts.length!==3)throw new Error('Invalid encrypted token');
 const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(parts[0],'base64url'));
 decipher.setAuthTag(Buffer.from(parts[1],'base64url'));
 return Buffer.concat([decipher.update(Buffer.from(parts[2],'base64url')),decipher.final()]).toString('utf8');
}
export function normalizeStoredAccount(raw:unknown):PushAccountV365|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const a=raw as Partial<PushAccountV365>;const genres=parsePushGenres(a.genres);
 if(a.version!==1||typeof a.refreshTokenEncrypted!=='string'||!a.refreshTokenEncrypted||typeof a.initialized!=='boolean'||!genres)return null;
 return {version:1,refreshTokenEncrypted:a.refreshTokenEncrypted,initialized:a.initialized,after:validDiscoveryId(a.after)?a.after:null,seenIds:[...new Set(Array.isArray(a.seenIds)?a.seenIds.filter(validDiscoveryId):[])].slice(-PUSH_SEEN_LIMIT_V365),genres};
}
export function selectFreshPushReleases(releases:RadarReleaseV362[],seen:string[],now:number):RadarReleaseV362[]{
 const known=new Set(seen);
 return mergeRadarReleases(releases).filter(r=>{
  const at=r.releaseDate&&r.releasePrecision==='day'?Date.parse(`${r.releaseDate}T00:00:00Z`):NaN;
  const age=(now-at)/86400000;
  return !known.has(r.id)&&Number.isFinite(age)&&age>=0&&age<=PUSH_FRESH_DAYS_V365;
 }).slice(0,3);
}
export function mergePushSeen(before:string[],incoming:string[]):string[]{return [...new Set([...before,...incoming].filter(validDiscoveryId))].slice(-PUSH_SEEN_LIMIT_V365);}
export function isSafeCronSecret(expected:string|undefined,received:string|null):boolean{
 if(!expected||expected.length<32||!received||!received.startsWith('Bearer '))return false;
 const a=Buffer.from(expected),b=Buffer.from(received.slice(7));
 return a.length===b.length&&timingSafeEqual(a,b);
}
