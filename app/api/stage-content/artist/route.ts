import {NextResponse} from "next/server";
import {getValidSession,ReauthRequiredError} from "@/lib/spotify";
import {setSessionCookie} from "@/lib/session";
import {commonsSearchUrlV339,selectCommonsPhotosV339} from "@/services/stageContent/commonsGalleryV339";

/** Optional built-in artist photo provider: Spotify's documented artist search, no API keys in client settings. */
export async function GET(request:Request){
  const artist=new URL(request.url).searchParams.get("artist")?.trim()??"";
  if(!artist||artist.length>140)return NextResponse.json({error:"Invalid artist"},{status:400});
  let credentials:Awaited<ReturnType<typeof getValidSession>>=null;
  try{credentials=await getValidSession();}catch(e){return NextResponse.json({error:e instanceof ReauthRequiredError?"Unauthorized":"Spotify unavailable"},{status:e instanceof ReauthRequiredError?401:503});}
  if(!credentials)return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const params=new URLSearchParams({q:`artist:${artist}`,type:"artist",limit:"5"});
    const spotify=await fetch(`https://api.spotify.com/v1/search?${params.toString()}`,{
      headers:{Authorization:`Bearer ${credentials.session.accessToken}`},cache:"no-store",signal:AbortSignal.timeout(7000),
    });
    let imageUrl:null|string=null;
    let images:string[]=[];
    let label=artist;
    if(spotify.ok){
      const response=await spotify.json() as {artists?:{items?:Array<{name?:string;images?:Array<{url?:string}>}>}};
      const normalized=artist.toLocaleLowerCase().trim();
      const items=response.artists?.items??[];
      const match=items.find(item=>item.name?.toLocaleLowerCase()===normalized)??items[0];
      const raw=match?.images?.[0]?.url;
      if(raw){try{const u=new URL(raw);if(u.protocol==="https:"){imageUrl=u.href;label=match?.name||artist;}}catch{/* invalid URL */}}
      // Spotify returns multiple resolutions of one image, not multiple distinct photos.
      images=imageUrl?[imageUrl]:[];
    }
    // Wikimedia Commons provides independent photographic motifs (not Spotify resolution variants).
    // Optional at deployment; false disables all Wikimedia requests.
    let credits:Record<string,string>={};
    if(process.env.STAGE_WIKIMEDIA_ENABLED!=="false"){
      try{
        const response=await fetch(commonsSearchUrlV339(label),{
          headers:{Accept:'application/json','User-Agent':'SonicDisplay/0.1 (artist-photo-gallery; contact via host operator)'},
          next:{revalidate:3600},signal:AbortSignal.timeout(6500),
        });
        if(response.ok){
          const photos=selectCommonsPhotosV339(await response.json(),label,8);
          for(const photo of photos){images.push(photo.url);credits[photo.url]=`${photo.credit} · ${photo.descriptionUrl}`;}
        }
      }catch{/* Wikimedia is optional. Keep Spotify fallback. */}
    }
    images=[...new Set(images)].slice(0,12);
    const result=NextResponse.json({title:label,imageUrl:images[0]??imageUrl,images,credits});
    result.headers.set("Cache-Control","private, no-store");
    if(credentials.refreshed)setSessionCookie(result,credentials.session);
    return result;
  }catch{
    const result=NextResponse.json({title:artist,imageUrl:null});
    result.headers.set("Cache-Control","private, no-store");
    if(credentials.refreshed)setSessionCookie(result,credentials.session);
    return result;
  }
}
