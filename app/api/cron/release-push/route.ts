/** V365 daily cron: encrypted server-side Spotify reauthorization and real Web Push. */
import {NextRequest,NextResponse} from 'next/server';
import webpush from 'web-push';
import {pushConfigured,pushSecrets,pushKeys,redis,readPushAccount,savePushAccount,listPushSubscriptions,deletePushSubscription,revokePushAccount} from '@/lib/push-storage-v365';
import {isSafeCronSecret,pushDecrypt,pushEncrypt,normalizeStoredAccount,selectFreshPushReleases,mergePushSeen,artistMatchesPushGenres,PUSH_FRESH_DAYS_V365} from '@/lib/push-v365';
import {normalizeRadarFollowed,normalizeRadarReleases,radarArtistAlbumsPath,radarFollowedPath,mergeRadarReleases} from '@/lib/release-radar-v362';
import {getEnv} from '@/lib/env';
import type {RadarReleaseV362} from '@/lib/release-radar-v362';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
const json=(body:object,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
const API='https://api.spotify.com/v1';
async function accessToken(refreshToken:string):Promise<{token:string;refreshToken:string}|null>{
 const e=getEnv();const result=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{Authorization:`Basic ${Buffer.from(`${e.clientId}:${e.clientSecret}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refreshToken}),cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(!result.ok)return null;
 const t=await result.json() as {access_token?:unknown;refresh_token?:unknown};
 if(typeof t.access_token!=='string'||!t.access_token)return null;
 return {token:t.access_token,refreshToken:typeof t.refresh_token==='string'&&t.refresh_token?t.refresh_token:refreshToken};
}
async function getSpotify(path:string,token:string):Promise<unknown>{
 const result=await fetch(`${API}${path}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(!result.ok)throw new Error(`Spotify status ${result.status}`);
 return result.json();
}
async function scanOne(userId:string):Promise<'baseline'|'sent'|'empty'|'failed'|'inactive'>{
 const account=normalizeStoredAccount(await readPushAccount(userId));
 if(!account)return 'inactive';
 const subscriptions=await listPushSubscriptions(userId);
 if(subscriptions.length===0){await revokePushAccount(userId);return 'inactive';}
 const secrets=pushSecrets();const stored=pushDecrypt(account.refreshTokenEncrypted,secrets.key);
 const auth=await accessToken(stored);if(!auth)return 'failed';
 // Persist rotated refresh token BEFORE any further calls so token rotation cannot strand the subscription.
 if(auth.refreshToken!==stored){account.refreshTokenEncrypted=pushEncrypt(auth.refreshToken,secrets.key);await savePushAccount(userId,account);}
 const path=radarFollowedPath(account.after);
 if(!path)return 'failed';
 const followed=normalizeRadarFollowed(await getSpotify(path,auth.token));if(!followed)return 'failed';
 const releases:RadarReleaseV362[]=[];
 // Bounded: four artists per scan and at most four album requests in parallel.
 const selected=followed.artists.filter(a=>artistMatchesPushGenres(a,account.genres));
 const albums=await Promise.all(selected.map(async artist=>{
  const path=radarArtistAlbumsPath(artist.id);if(!path)return null;
  const raw=await getSpotify(path,auth.token) as {items?:unknown[]};
  if(!Array.isArray(raw?.items))throw new Error('Spotify album response invalid');
  return normalizeRadarReleases(raw.items,artist,30,Date.now());
 }));
 for(const group of albums)if(group)releases.push(...group);
 const merged=mergeRadarReleases(releases);
 const newItems=selectFreshPushReleases(merged,account.seenIds,Date.now());
 // The first complete successful scan establishes a baseline, avoiding a flood of historical notifications.
 if(!account.initialized){account.initialized=true;account.seenIds=mergePushSeen(account.seenIds,merged.map(r=>r.id));account.after=followed.hasMore?followed.cursor:null;await savePushAccount(userId,account);return 'baseline';}
 const oldOnly=merged.filter(r=>r.daysOld>PUSH_FRESH_DAYS_V365).map(r=>r.id);
 let delivered=false;const sent:string[]=[];
 for(const release of newItems){
  let good=false;
  const text=`${release.artistName}: ${release.title}`.slice(0,170);
  const notification={title:'Neue Musik auf Sonic Display',body:text,albumId:release.id,icon:release.coverUrl??undefined,tag:`sonic-release-${release.id}`};
  const delivery=await Promise.all(subscriptions.map(async sub=>{
   try{
    await webpush.sendNotification(sub.subscription,JSON.stringify(notification),{TTL:86400,timeout:4000,urgency:'normal'});
    return true;
   }catch(error){
    const status=typeof error==='object'&&error!==null&&'statusCode' in error?(error as {statusCode?:number}).statusCode:undefined;
    if(status===404||status===410)await deletePushSubscription(userId,sub.key);
    return false;
   }
  }));
  good=delivery.some(Boolean);
  if(good){delivered=true;sent.push(release.id);}
 }
 account.seenIds=mergePushSeen(account.seenIds,[...oldOnly,...sent]);
 account.after=followed.hasMore?followed.cursor:null;
 await savePushAccount(userId,account);
 return delivered?'sent':'empty';
}
export async function GET(req:NextRequest){
 if(!isSafeCronSecret(process.env.CRON_SECRET,req.headers.get('authorization')))return json({code:'unauthorized'},401);
 if(!pushConfigured())return json({code:'not_configured'},503);
 const lock=await redis('SET',pushKeys.cronLock,'1','EX',55,'NX');
 if(lock!=='OK')return json({code:'already_running'},409);
 try{
  const usersRaw=await redis('SMEMBERS',pushKeys.users);
  const users=Array.isArray(usersRaw)?usersRaw.filter((v):v is string=>typeof v==='string'&&/^[0-9a-f]{64}$/.test(v)).slice(0,100):[];
  if(users.length===0)return json({checked:0,baseline:0,sent:0,failed:0});
  // Round-robin across daily cron runs; do not issue an unbounded number of Spotify API requests.
  const rotation=Number(await redis('INCR',pushKeys.rotation));
  const count=Math.min(2,users.length);const start=(Math.max(1,rotation)-1)*2%users.length;
  const ids=Array.from({length:count},(_,i)=>users[(start+i)%users.length]);
  const secrets=pushSecrets();webpush.setVapidDetails(secrets.subject,secrets.publicKey,secrets.privateKey);
  const stats={checked:0,baseline:0,sent:0,failed:0};
  const statuses=await Promise.all(ids.map(async id=>{
   try{return await scanOne(id);}catch{return 'failed' as const;}
  }));
  for(const status of statuses){
   stats.checked++;if(status==='baseline')stats.baseline++;else if(status==='sent')stats.sent++;else if(status==='failed')stats.failed++;
  }
  return json(stats);
 }catch{return json({code:'cron_unavailable'},503);}finally{await redis('DEL',pushKeys.cronLock).catch(()=>{});}
}
