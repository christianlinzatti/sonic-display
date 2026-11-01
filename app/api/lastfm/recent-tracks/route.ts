import {NextRequest,NextResponse} from 'next/server';
import {normalizeLastFmPageV706,validLastFmUsernameV706,V706_PAGE_SIZE} from '@/lib/lastfm-history-v706';
export const dynamic='force-dynamic';
const json=(data:object,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'}});
/** Public Last.fm scrobbles. API key lives on the server; never forward caller-controlled URLs. */
export async function GET(req:NextRequest){
 const username=req.nextUrl.searchParams.get('user');
 const rawPage=req.nextUrl.searchParams.get('page')??'1';
 if(!validLastFmUsernameV706(username)||!/^\d{1,6}$/.test(rawPage)||Number(rawPage)<1||Number(rawPage)>100000)return json({code:'invalid_parameters',message:'Last.fm-Benutzername oder Seite ungültig.'},400);
 const to=req.nextUrl.searchParams.get('to');
 if(to!==null&&(!/^\d{10,11}$/.test(to)||Number(to)<946684800||Number(to)>Math.floor(Date.now()/1000)+60))return json({code:'invalid_parameters',message:'Ungültige Last.fm-Zeitgrenze.'},400);
 const key=process.env.LASTFM_API_KEY;
 if(!key||key.startsWith('your_')||!/^[-a-zA-Z0-9]{16,128}$/.test(key))return json({code:'not_configured',message:'LASTFM_API_KEY fehlt in der Server-Konfiguration.'},503);
 const url=new URL('https://ws.audioscrobbler.com/2.0/');
 url.searchParams.set('method','user.getRecentTracks');url.searchParams.set('user',username);url.searchParams.set('api_key',key);url.searchParams.set('format','json');url.searchParams.set('limit',String(V706_PAGE_SIZE));url.searchParams.set('page',rawPage);if(to!==null)url.searchParams.set('to',to);
 try{
  const response=await fetch(url.toString(),{headers:{Accept:'application/json','User-Agent':'SonicDisplay/0.1 (Lastfm History Reader)'},cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(response.status===429){const res=json({code:'rate_limited',message:'Last.fm begrenzt gerade die Anfragen.'},429);const retry=response.headers.get('Retry-After');if(retry&&/^\d{1,5}$/.test(retry))res.headers.set('Retry-After',retry);return res;}
  if(!response.ok)return json({code:'lastfm_unavailable',message:'Last.fm ist vorübergehend nicht erreichbar.'},503);
  const body=await response.text();if(body.length>1_500_000)return json({code:'invalid_response',message:'Last.fm-Antwort ist zu groß.'},502);
  let data:unknown;try{data=JSON.parse(body);}catch{return json({code:'invalid_response',message:'Last.fm-Antwort ist kein gültiges JSON.'},502);}
  if(data&&typeof data==='object'&&'error' in data){const err=Number(data.error);
   if(err===6||err===17)return json({code:'user_unavailable',message:'Last.fm-Konto nicht gefunden oder Hörverlauf nicht öffentlich.'},404);
   if(err===29)return json({code:'rate_limited',message:'Last.fm begrenzt gerade die Anfragen.'},429);
   if(err===10||err===26)return json({code:'key_invalid',message:'Last.fm-API-Schlüssel ungültig oder gesperrt.'},503);
   return json({code:'lastfm_unavailable',message:'Last.fm konnte die Anfrage nicht beantworten.'},503);
  }
  const parsed=normalizeLastFmPageV706(data,username);
  if(!parsed||parsed.page!==Number(rawPage))return json({code:'invalid_response',message:'Last.fm hat unerwartete Verlaufsdaten zurückgegeben.'},502);
  return json(parsed);
 }catch{return json({code:'lastfm_unavailable',message:'Last.fm konnte nicht erreicht werden.'},503);}
}
