import {validArtistId} from './artist-follow-v359';
export const ALEXA_ARTIST_KEY_V1007='sonic-display:alexa-artist-follow-v1007';
export const ALEXA_ARTIST_EVENT_V1007='sonic-display:alexa-artist-consent-v1007';
export type AlexaArtistCommandV1007='artist-follow'|'artist-unfollow';
export type ArtistVoiceConsentV1007={enabled:boolean;since:number};
export type ArtistVoiceMessageV1007={id:string;command:AlexaArtistCommandV1007;createdAt:number};
export function isAlexaArtistCommandV1007(value:unknown):value is AlexaArtistCommandV1007 {
 return value==='artist-follow'||value==='artist-unfollow';
}
export function parseArtistVoiceConsentV1007(raw:string|null):ArtistVoiceConsentV1007 {
 try{const v=JSON.parse(raw||'null');if(v?.enabled===true&&Number.isSafeInteger(v.since)&&v.since>0)return {enabled:true,since:v.since};}catch{/* disabled */}
 return {enabled:false,since:0};
}
export function canApplyAlexaArtistV1007(raw:unknown,since:number,now:number):raw is ArtistVoiceMessageV1007 {
 if(!raw||typeof raw!=='object'||!Number.isFinite(now)||!Number.isSafeInteger(since)||since<=0||since>now)return false;
 const v=raw as Partial<ArtistVoiceMessageV1007>;
 return typeof v.id==='string'&&/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(v.id)&&
  isAlexaArtistCommandV1007(v.command)&&Number.isSafeInteger(v.createdAt)&&v.createdAt!>=since&&v.createdAt!<=now&&now-v.createdAt!<=15000;
}
export async function executeAlexaArtistV1007(message:ArtistVoiceMessageV1007,options:{
 since:number;now:()=>number;allowed:()=>boolean;fetcher:typeof fetch;signal?:AbortSignal;
}):Promise<{artistId:string;artistName:string;following:boolean}> {
 const check=()=>{if(options.signal?.aborted||!options.allowed()||!canApplyAlexaArtistV1007(message,options.since,options.now()))
  throw Error('Alexa-Künstleraktion abgelaufen oder nicht mehr freigegeben.');};
 check();
 const current=await options.fetcher('/api/spotify/current',{cache:'no-store',signal:options.signal});
 if(!current.ok)throw Error('Spotify bitte neu verbinden oder später erneut versuchen.');
 const data=await current.json();check();
 const artist=data?.track?.artistDetails?.[0];
 if(data?.connected!==true||!validArtistId(artist?.id)||typeof artist.name!=='string'||!artist.name.trim())
  throw Error('Kein aktueller Spotify-Künstler verfügbar. Starte zuerst einen Titel.');
 const follow=message.command==='artist-follow';
 const response=await options.fetcher('/api/spotify/artists/follow',{
  method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({artistId:artist.id,follow}),signal:options.signal,
 });
 const result=await response.json();
 if(!response.ok)throw Error(typeof result?.message==='string'?result.message.slice(0,400):'Spotify hat die Künstleraktion nicht bestätigt.');
 if(result?.artistId!==artist.id||result?.following!==follow)throw Error('Spotify hat den neuen Künstlerstatus nicht bestätigt.');
 return {artistId:artist.id,artistName:artist.name.trim().slice(0,120),following:follow};
}
