import {NextResponse} from 'next/server';
import {getValidSession,ReauthRequiredError} from '@/lib/spotify';
import {setSessionCookie} from '@/lib/session';
import {safeArtistNameV335} from '@/services/stageContent/artistProvidersV335';
import {normalizeArtistQueryV336,normalizeOeticketV336,normalizeTicketmasterTaggedV336,mergeConcertsV336,type ConcertV336} from '@/services/stageContent/concertProvidersV336';
export const runtime='nodejs';
async function remoteJson(url:URL):Promise<unknown>{
  const res=await fetch(url,{next:{revalidate:1800},signal:AbortSignal.timeout(6500),headers:{Accept:'application/json'}});
  if(!res.ok)throw Error(`Upstream status ${res.status}`);
  return res.json() as Promise<unknown>;
}
/** Two independent optional providers; one failing provider must not hide results from the others. */
export async function GET(request:Request){
  const params=new URL(request.url).searchParams;
  const artist=safeArtistNameV335(params.get('artist'));
  if(!artist)return NextResponse.json({error:'Invalid artist'},{status:400});
  let auth:Awaited<ReturnType<typeof getValidSession>>=null;
  try{auth=await getValidSession();}catch(e){return NextResponse.json({error:e instanceof ReauthRequiredError?'Unauthorized':'Spotify unavailable'},{status:e instanceof ReauthRequiredError?401:503});}
  if(!auth)return NextResponse.json({error:'Unauthorized'},{status:401});
  const country=(params.get('country')||process.env.STAGE_CONCERT_COUNTRY||'AT').toUpperCase();
  if(!/^[A-Z]{2}$/.test(country))return NextResponse.json({error:'Invalid country'},{status:400});
  const now=new Date().toISOString();
  const jobs:Array<Promise<ConcertV336[]>>=[];
  // Eventim exploration API is undocumented and may change. Explicit feature flag for deployments.
  if(country==='AT'&&process.env.STAGE_OETICKET_ENABLED==='true'){
    const uri=new URL('https://public-api.eventim.com/websearch/search/api/exploration/v2/productGroups');
    for(const [k,v] of Object.entries({webId:'web__oeticket-at',retail_partner:'EOE',language:'de',search_term:normalizeArtistQueryV336(artist),sort:'Recommendation',auto_suggest:'true',tags:'DISABLE_FBS'}))uri.searchParams.set(k,v);
    jobs.push(remoteJson(uri).then(j=>normalizeOeticketV336(j,artist,now)).catch(()=>[]));
  }
  const ticketmasterKey=process.env.TICKETMASTER_API_KEY;
  if(ticketmasterKey){
    const uri=new URL('https://app.ticketmaster.com/discovery/v2/events.json');
    uri.searchParams.set('apikey',ticketmasterKey);uri.searchParams.set('keyword',artist);uri.searchParams.set('classificationName','music');uri.searchParams.set('size','30');uri.searchParams.set('sort','date,asc');uri.searchParams.set('countryCode',country);
    jobs.push(remoteJson(uri).then(j=>normalizeTicketmasterTaggedV336(j,artist,now)).catch(()=>[]));
  }
  const lists=await Promise.all(jobs);
  const events=mergeConcertsV336(lists.flat());
  const result=NextResponse.json({title:`Konzerte: ${artist}`,events});
  result.headers.set('Cache-Control','private, no-store');
  if(auth.refreshed)setSessionCookie(result,auth.session);
  return result;
}
