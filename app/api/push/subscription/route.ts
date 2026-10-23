import {NextRequest,NextResponse} from 'next/server';
import {getValidSession,refreshSession,ReauthRequiredError} from '@/lib/spotify';
import {setSessionCookie,clearSessionCookie,type SpotifySession} from '@/lib/session';
import {spotifyCallbackUrl} from '@/lib/spotify-origin';
import {pushConfigured,pushSecrets,pushKeys,redis,readPushAccount,savePushAccount,listPushSubscriptions,deletePushSubscription,revokePushAccount} from '@/lib/push-storage-v365';
import {pushEncrypt,pushEndpointId,pushUserId,validatePushSubscription,parsePushGenres,normalizeStoredAccount,PUSH_MAX_DEVICES_V365,type PushAccountV365} from '@/lib/push-v365';
export const dynamic='force-dynamic';export const runtime='nodejs';
const json=(body:object,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
const unauth=()=>{const r=json({code:'reauth_required',message:'Spotify neu verbinden.'},401);clearSessionCookie(r);return r;};
type Valid=NonNullable<Awaited<ReturnType<typeof getValidSession>>>;
const responseWithCookie=(r:NextResponse,v:Valid)=>{if(v.refreshed)setSessionCookie(r,v.session);return r;};
function sameOrigin(req:NextRequest):boolean{return req.headers.get('origin')===spotifyCallbackUrl().origin;}
async function identity(valid:Valid):Promise<{id:string;valid:Valid}|null>{
 const query=(s:SpotifySession)=>fetch('https://api.spotify.com/v1/me',{headers:{Authorization:`Bearer ${s.accessToken}`},cache:'no-store',signal:AbortSignal.timeout(9000)});
 let reply=await query(valid.session);
 if(reply.status===401){valid={session:await refreshSession(valid.session),refreshed:true};reply=await query(valid.session);}
 if(!reply.ok)return null;
 const user=await reply.json() as {id?:unknown};if(typeof user.id!=='string'||user.id.length<1||user.id.length>180)return null;
 return {id:pushUserId(user.id,pushSecrets().key),valid};
}
async function authorize(){const valid=await getValidSession();if(!valid)return null;if(!valid.session.scopes?.split(/\s+/).includes('user-follow-read'))throw new Error('consent_required');return valid;}
async function parseBody(req:NextRequest):Promise<Record<string,unknown>|null>{const raw=await req.text();if(raw.length>5500)return null;try{const parsed=JSON.parse(raw) as unknown;return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed as Record<string,unknown>:null;}catch{return null;}}
function failure(e:unknown){if(e instanceof ReauthRequiredError)return unauth();if(e instanceof Error&&e.message==='consent_required')return json({code:'consent_required',message:'Spotify erneut mit user-follow-read verbinden.'},403);return json({code:'push_unavailable',message:'Push-Dienst nicht verfügbar. Bitte Server-Konfiguration prüfen.'},503);}
export async function GET(req:NextRequest){
 if(!pushConfigured())return json({configured:false,enabled:false,devices:0,publicKey:null,genres:[]});
 try{
  const valid=await authorize();if(!valid)return unauth();
  const me=await identity(valid);if(!me)return responseWithCookie(json({code:'spotify_unavailable'},503),valid);
  const [account,subscriptions]=await Promise.all([readPushAccount(me.id),listPushSubscriptions(me.id)]);
  const endpoint=req.nextUrl.searchParams.get("endpoint");
  const currentDeviceEnabled=!!endpoint&&endpoint.length<=2048&&subscriptions.some(s=>s.key===pushEndpointId(endpoint));
  return responseWithCookie(json({configured:true,enabled:!!account&&subscriptions.length>0,currentDeviceEnabled,devices:subscriptions.length,publicKey:pushSecrets().publicKey,genres:normalizeStoredAccount(account)?.genres??[]}),me.valid);
 }catch(e){return failure(e);}
}
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return json({code:'invalid_origin'},403);
 if(!pushConfigured())return json({code:'not_configured',message:'Server-Push benötigt Redis und VAPID-Schlüssel.'},503);
 try{
  const body=await parseBody(req);const sub=validatePushSubscription(body?.subscription);const genres=parsePushGenres(body?.genres);
  if(!sub||!genres)return json({code:'invalid_subscription'},400);
  const valid=await authorize();if(!valid)return unauth();
  const me=await identity(valid);if(!me)return responseWithCookie(json({code:'spotify_unavailable'},503),valid);
  const [all,oldRaw]=await Promise.all([listPushSubscriptions(me.id),readPushAccount(me.id)]);
  const id=pushEndpointId(sub.endpoint);
  if(all.length>=PUSH_MAX_DEVICES_V365&&!all.some(x=>x.key===id))return responseWithCookie(json({code:'device_limit',message:'Maximal drei Geräte je Spotify-Konto. Bitte zuerst ein Gerät entfernen.'},409),me.valid);
  const old=normalizeStoredAccount(oldRaw);
  const account:PushAccountV365={version:1,refreshTokenEncrypted:pushEncrypt(me.valid.session.refreshToken,pushSecrets().key),initialized:old?.initialized??false,after:old?.after??null,seenIds:old?.seenIds??[],genres};
  await redis('SET',pushKeys.sub(me.id,id),JSON.stringify(sub));await redis('SADD',pushKeys.subs(me.id),id);await savePushAccount(me.id,account);
  return responseWithCookie(json({enabled:true,devices:all.length+(all.some(x=>x.key===id)?0:1),genres}),me.valid);
 }catch(e){return failure(e);}
}
export async function DELETE(req:NextRequest){
 if(!sameOrigin(req))return json({code:'invalid_origin'},403);
 if(!pushConfigured())return json({enabled:false});
 try{
  const body=await parseBody(req);if(!body||(!(body.all===true)&&typeof body.endpoint!=='string'))return json({code:'invalid_request'},400);
  const valid=await authorize();if(!valid)return unauth();
  const me=await identity(valid);if(!me)return responseWithCookie(json({code:'spotify_unavailable'},503),valid);
  if(body.all===true)await revokePushAccount(me.id);
  else{
   const endpoint=String(body.endpoint);const all=await listPushSubscriptions(me.id);
   const key=pushEndpointId(endpoint);
   if(all.some(s=>s.key===key))await deletePushSubscription(me.id,key);
   if(all.length<=1&&all.some(s=>s.key===key))await revokePushAccount(me.id);
  }
  const remaining=await listPushSubscriptions(me.id);
  return responseWithCookie(json({enabled:remaining.length>0,devices:remaining.length}),me.valid);
 }catch(e){return failure(e);}
}
