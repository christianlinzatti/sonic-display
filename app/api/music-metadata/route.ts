import {NextResponse} from 'next/server';
import {getValidSession,ReauthRequiredError} from '@/lib/spotify';
import {setSessionCookie} from '@/lib/session';
import {safeArtistNameV335} from '@/services/stageContent/artistProvidersV335';
import {readMusicMetadataV651} from '@/lib/musicMetadataV651';
export const runtime='nodejs';
export const dynamic='force-dynamic';
/** Enrich current artist/track/album without leaking third-party API keys. */
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const artist=safeArtistNameV335(params.get('artist'));
 const track=params.get('track')?.trim()||'';
 const album=params.get('album')?.trim()||'';
 if(!artist||track.length>180||album.length>180||/[\x00-\x1f]/.test(track+album))return NextResponse.json({error:'Invalid artist, track or album'},{status:400});
 let auth:Awaited<ReturnType<typeof getValidSession>>=null;
 try{auth=await getValidSession();}catch(e){return NextResponse.json({error:e instanceof ReauthRequiredError?'Unauthorized':'Spotify unavailable'},{status:e instanceof ReauthRequiredError?401:503});}
 if(!auth)return NextResponse.json({error:'Unauthorized'},{status:401});
 const data=await readMusicMetadataV651(artist,track,album);
 const res=NextResponse.json(data);
 res.headers.set('Cache-Control','private, no-store');
 if(auth.refreshed)setSessionCookie(res,auth.session);
 return res;
}
