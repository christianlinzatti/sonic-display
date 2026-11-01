import {NextResponse} from "next/server";
import {getValidSession,ReauthRequiredError} from "@/lib/spotify";
import {setSessionCookie} from "@/lib/session";
import {commonsSearchUrlV339,selectCommonsPhotosV339} from "@/services/stageContent/commonsGalleryV339";
import {readMusicMetadataV651} from "@/lib/musicMetadataV651";
import {rankStagePhotosV652,type StagePhotoCandidateV652} from "@/services/musicMetadata/curationV652";

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
    const candidates:StagePhotoCandidateV652[]=[];
    let label=artist;
    if(spotify.ok){
      const response=await spotify.json() as {artists?:{items?:Array<{name?:string;images?:Array<{url?:string}>}>}};
      const normalized=artist.toLocaleLowerCase().trim();
      const items=response.artists?.items??[];
      const match=items.find(item=>item.name?.toLocaleLowerCase()===normalized);
      const raw=match?.images?.[0]?.url;
      if(raw){try{const u=new URL(raw);if(u.protocol==="https:"){imageUrl=u.href;label=match?.name||artist;}}catch{/* invalid URL */}}
      // Spotify returns multiple resolutions of one image, not multiple distinct photos.
      if(imageUrl)candidates.push({url:imageUrl,source:'spotify',title:'Official artist portrait'});
    }
    // Wikimedia Commons provides independent photographic motifs (not Spotify resolution variants).
    // Optional at deployment; false disables all Wikimedia requests.
    if(process.env.STAGE_WIKIMEDIA_ENABLED!=="false"){
      try{
        const response=await fetch(commonsSearchUrlV339(label),{
          headers:{Accept:'application/json','User-Agent':'SonicDisplay/0.1 (artist-photo-gallery; contact via host operator)'},
          next:{revalidate:3600},signal:AbortSignal.timeout(6500),
        });
        if(response.ok){
          const photos=selectCommonsPhotosV339(await response.json(),label,8);
          for(const photo of photos)candidates.push({url:photo.url,source:'commons',credit:`${photo.credit} · ${photo.descriptionUrl}`,page:photo.descriptionUrl,title:photo.title,width:photo.width,height:photo.height});
        }
      }catch{/* Wikimedia is optional. Keep Spotify fallback. */}
    }
    // Licensed Flickr photos and optional TheAudioDB images complement Commons/Spotify.
    // Provider failures never prevent the original photo gallery from working.
    try {
      const metadata=await readMusicMetadataV651(label);
      for(const photo of metadata.artist.photos){
        if(photo.source==='theaudiodb'&&process.env.STAGE_THEAUDIODB_PHOTOS_ENABLED!=='true')continue;
        candidates.push(photo);
      }
    }catch{/* keep the original gallery */}
    // Select artist-safe photo candidates per scene. Actual 3D rendering decides
    // which ordering to use as the song switches between lyrics and photo focus.
    const ordered={
      balanced:rankStagePhotosV652(candidates,'balanced'),
      lyrics:rankStagePhotosV652(candidates,'lyrics'),
      photos:rankStagePhotosV652(candidates,'photos'),
    };
    const allPhotos=[...ordered.balanced,...ordered.photos,...ordered.lyrics];
    const images=[...new Set(allPhotos.map(photo=>photo.url))].slice(0,12);
    const credits=Object.fromEntries(allPhotos.map(photo=>[photo.url,photo.credit]).filter(([,credit])=>!!credit));
    const selections={lyrics:ordered.lyrics.map(p=>p.url).filter(url=>images.includes(url)),balanced:ordered.balanced.map(p=>p.url).filter(url=>images.includes(url)),photos:ordered.photos.map(p=>p.url).filter(url=>images.includes(url))};
    const result=NextResponse.json({title:label,imageUrl:images[0]??imageUrl,images,credits,selections});
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
