import {NextResponse} from "next/server";
import {getValidSession,ReauthRequiredError} from "@/lib/spotify";
import {setSessionCookie} from "@/lib/session";
import {parseGeniusSongV447,selectGeniusSongV447,type GeniusSongInsightsV447} from "@/services/genius/songInsightsV447";

// Server-only access to Genius. No token, lyrics scraping or private information enters client bundles.
const cache = new Map<string,{expires:number;data:GeniusSongInsightsV447|null}>();
const CACHE_MAX = 100;
const BASE = "https://api.genius.com";
async function geniusGetV447(path:string, token:string):Promise<Record<string,unknown>> {
  const result = await fetch(`${BASE}${path}`,{
    headers:{Authorization:`Bearer ${token}`,Accept:"application/json"},
    cache:"no-store",signal:AbortSignal.timeout(7000),
  });
  if(!result.ok)throw new Error(`Genius HTTP ${result.status}`);
  const json:unknown = await result.json();
  return json && typeof json==="object" && !Array.isArray(json) ? json as Record<string,unknown> : {};
}
function payloadV447(input:Record<string,unknown>,name:string):unknown {
  const response = input.response;
  return response && typeof response==="object" && !Array.isArray(response) ? (response as Record<string,unknown>)[name] : null;
}
async function resolveV447(title:string,artist:string,token:string):Promise<GeniusSongInsightsV447|null> {
  const query = new URLSearchParams({q:`${title} ${artist}`});
  const search = await geniusGetV447(`/search?${query}`,token);
  const id = selectGeniusSongV447(payloadV447(search,"hits"),title,[artist,...artist.split(/\s*(?:,|&| feat\.? | ft\.? | x )\s*/i).filter(Boolean)]);
  if(!id)return null;
  const song = await geniusGetV447(`/songs/${id}?text_format=plain`,token);
  const details = payloadV447(song,"song");
  // Referents are strictly optional and never used as timed lyrics or artist identities.
  let referents:unknown = null;
  try {
    const annotations = await geniusGetV447(`/referents?song_id=${id}&text_format=plain&per_page=20`,token);
    referents = payloadV447(annotations,"referents");
  } catch { /* Credits and song stories must still work without annotations. */ }
  return parseGeniusSongV447(details,referents);
}
export async function GET(request:Request) {
  const params=new URL(request.url).searchParams;
  const title=params.get("title")?.trim()??"";
  const artist=params.get("artist")?.trim()??"";
  if(!title||!artist||title.length>160||artist.length>140||/[\u0000-\u001f]/.test(title+artist))
    return NextResponse.json({error:"Invalid song"},{status:400});
  const token=process.env.GENIUS_ACCESS_TOKEN;
  // No configuration required: feature silently unavailable if no token is set.
  if(!token||token.startsWith("your_"))return NextResponse.json({data:null,configured:false},{headers:{"Cache-Control":"private, no-store"}});
  let auth:Awaited<ReturnType<typeof getValidSession>>=null;
  try {auth=await getValidSession();}
  catch(e){return NextResponse.json({error:e instanceof ReauthRequiredError?"Unauthorized":"Spotify unavailable"},{status:e instanceof ReauthRequiredError?401:503});}
  if(!auth)return NextResponse.json({error:"Unauthorized"},{status:401});
  const key=`${title.toLocaleLowerCase()}|${artist.toLocaleLowerCase()}`;
  const stored=cache.get(key), now=Date.now();
  let data:GeniusSongInsightsV447|null=null;
  if(stored && stored.expires>now)data=stored.data;
  else {
    try {
      data=await resolveV447(title,artist,token);
      if(cache.size>=CACHE_MAX)cache.delete(cache.keys().next().value ?? "");
      cache.set(key,{expires:now+(data?6*60*60*1000:15*60*1000),data});
    } catch {
      const unavailable=NextResponse.json({data:null,unavailable:true},{status:503});
      unavailable.headers.set("Cache-Control","private, no-store");
      if(auth.refreshed)setSessionCookie(unavailable,auth.session);
      return unavailable;
    }
  }
  const response=NextResponse.json({data,configured:true});
  response.headers.set("Cache-Control","private, no-store");
  if(auth.refreshed)setSessionCookie(response,auth.session);
  return response;
}
