import {NextResponse} from 'next/server';
import {getValidSession,ReauthRequiredError} from '@/lib/spotify';
import {setSessionCookie} from '@/lib/session';
import {safeArtistNameV335,normalizeWikipediaV335} from '@/services/stageContent/artistProvidersV335';
/** Wikipedia page summaries; no scraping, API keys, or direct browser requests. */
export async function GET(request:Request){
  const artist=safeArtistNameV335(new URL(request.url).searchParams.get('artist'));
  if(!artist)return NextResponse.json({error:'Invalid artist'},{status:400});
  let auth:Awaited<ReturnType<typeof getValidSession>>=null;
  try{auth=await getValidSession();}catch(e){return NextResponse.json({error:e instanceof ReauthRequiredError?'Unauthorized':'Spotify unavailable'},{status:e instanceof ReauthRequiredError?401:503});}
  if(!auth)return NextResponse.json({error:'Unauthorized'},{status:401});
  let content:null|{title:string;text:string}=null;
  for(const lang of ['de','en']){
    try{
      const url=`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artist)}`;
      const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'SonicDisplay/0.1 (artist-information-display)'},next:{revalidate:3600},signal:AbortSignal.timeout(6500)});
      if(!response.ok)continue;
      content=normalizeWikipediaV335(await response.json(),artist);
      if(content)break;
    }catch{/* next language or empty result */}
  }
  const res=NextResponse.json(content??{title:artist,text:null});
  res.headers.set('Cache-Control','private, no-store');
  if(auth.refreshed)setSessionCookie(res,auth.session);
  return res;
}
