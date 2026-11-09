import {backgroundJsonV1009} from './backgroundJsonV1009';
import {validArtistId} from './artist-follow-v359';
import {validGoveeVoiceTargetV1141,type GoveeVoiceTargetV1141} from './goveeVoiceTargetV1141';
import type {UiPreferences} from '@/types/music';
export const VOICE_COMMANDS_V1008=['artist-follow','artist-follow-all','artist-unfollow','artist-status','artist-undo','artist-follow-primary','artist-unfollow-primary','lyrics-on','lyrics-off','avatar-next','display-calm','display-normal','connection-status','govee-power-on','govee-power-off','govee-sync-start','govee-sync-pause'] as const;
export type VoiceCommandV1008=typeof VOICE_COMMANDS_V1008[number];
export type VoiceTargetV1008={artistId:string;trackId:string};
export type VoiceMessageV1008={id:string;command:VoiceCommandV1008;createdAt:number;target?:VoiceTargetV1008;goveeTarget?:GoveeVoiceTargetV1141};
export type VoiceChoiceV1008={id:string;name:string};
export type VoiceResultV1008={kind:'complete'|'error'|'selection';text:string;choices?:VoiceChoiceV1008[];trackId?:string;action?:'artist-follow'|'artist-unfollow'|'artist-status'};
export type VoiceUndoV1008={owner:string;artistId:string;artistName:string;before:boolean;after:boolean;at:number;batch?:Array<{artistId:string;artistName:string;before:boolean;after:boolean}>};
export const VOICE_DISPLAY_KEY_V1008='sonic-display:alexa-display-v1008';
export const VOICE_SETTINGS_EVENT_V1008='sonic:alexa-settings-v1008';
export const voiceIdV1008=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
export const isVoiceCommandV1008=(v:unknown):v is VoiceCommandV1008=>typeof v==='string'&&(VOICE_COMMANDS_V1008 as readonly string[]).includes(v);
export const isArtistVoiceV1008=(v:VoiceCommandV1008)=>v.startsWith('artist-');
export function validTargetV1008(v:unknown):v is VoiceTargetV1008 {const x=v as VoiceTargetV1008|null;return !!x&&validArtistId(x.artistId)&&validArtistId(x.trackId);}
export function freshVoiceV1008(v:unknown,since:number,now:number):v is VoiceMessageV1008 {
 const x=v as VoiceMessageV1008|null;
 return !!x&&voiceIdV1008(x.id)&&isVoiceCommandV1008(x.command)&&Number.isSafeInteger(x.createdAt)&&since>0&&since<=now&&x.createdAt>=since&&x.createdAt<=now&&now-x.createdAt<=30000&&(!x.target||validTargetV1008(x.target))&&(!x.goveeTarget||(['govee-power-on','govee-power-off'].includes(x.command)&&validGoveeVoiceTargetV1141(x.goveeTarget)));
}
export function validVoiceResultV1008(v:unknown):v is VoiceResultV1008 {
 const x=v as VoiceResultV1008|null;
 if(!x||!['complete','error','selection'].includes(x.kind)||typeof x.text!=='string'||x.text.length<1||x.text.length>1200)return false;
 if(x.kind!=='selection')return x.choices===undefined&&x.trackId===undefined&&x.action===undefined;
 return ['artist-follow','artist-unfollow','artist-status'].includes(x.action||'')&&validArtistId(x.trackId)&&Array.isArray(x.choices)&&x.choices.length>=2&&x.choices.length<=10&&new Set(x.choices.map(c=>c.id)).size===x.choices.length&&x.choices.every(c=>validArtistId(c.id)&&typeof c.name==='string'&&c.name.trim().length>0&&c.name.length<=120);
}
type Fetcher=typeof fetch;
export async function executeArtistVoiceV1008(message:VoiceMessageV1008,options:{since:number;now:()=>number;allowed:()=>boolean;fetcher:Fetcher;undo:VoiceUndoV1008|null;saveUndo:(v:VoiceUndoV1008|null)=>void;signal?:AbortSignal;notify:(v:{artistId:string;following:boolean})=>void}):Promise<VoiceResultV1008>{
 const {fetcher}=options;
 if(!isArtistVoiceV1008(message.command))throw Error('Ungültiger Künstlerbefehl.');
 const check=()=>{if(options.signal?.aborted||!options.allowed()||!freshVoiceV1008(message,options.since,options.now()))throw Error('Die Künstleranfrage ist abgelaufen oder nicht mehr freigegeben.');};
 const read=async(url:string)=>{check();const r=await backgroundJsonV1009(url,{cache:'no-store',signal:options.signal},12000,fetcher);const data=await r.json();if(!r.ok)throw Error(typeof data?.message==='string'?data.message.slice(0,400):'Spotify bitte neu verbinden oder später erneut versuchen.');check();return data;};
 const ownerData=await read('/api/spotify/history-identity');
 if(typeof ownerData?.spotifyUserId!=='string'||!ownerData.spotifyUserId||ownerData.spotifyUserId.length>200)throw Error('Spotify-Konto konnte nicht bestätigt werden.');
 const owner=ownerData.spotifyUserId;
 const batch=async(changes:Array<{artistId:string;follow:boolean}>,extra:object={})=>{
  check();const r=await backgroundJsonV1009('/api/spotify/artists/follow-batch',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({changes,...extra}),signal:options.signal},20000,fetcher);
  const data=await r.json();if(!r.ok||data.confirmed!==true||!Array.isArray(data.values)||data.values.length!==changes.length||changes.some(c=>!data.values.some((v:{artistId:string;before:boolean;following:boolean})=>v.artistId===c.artistId&&typeof v.before==='boolean'&&v.following===c.follow)))throw Error(typeof data.message==='string'?data.message:'Spotify hat die Sammeländerung nicht bestätigt.');return data.values as Array<{artistId:string;before:boolean;following:boolean}>;
 };
 if(message.command==='artist-undo'&&options.undo?.batch){
  const u=options.undo;if(u.owner!==owner||!Number.isSafeInteger(u.at)||u.at>options.now()||options.now()-u.at>600000||u.batch!.length<1||u.batch!.length>40||u.batch!.some(c=>!validArtistId(c.artistId)||typeof c.artistName!=='string'||typeof c.before!=='boolean'||typeof c.after!=='boolean'))throw Error('Keine gültige Sammeländerung zum Rückgängigmachen vorhanden.');
  const values=await batch(u.batch!.map(c=>({artistId:c.artistId,follow:c.before})),{expected:Object.fromEntries(u.batch!.map(c=>[c.artistId,c.after]))});
  options.saveUndo(null);values.forEach(v=>options.notify({artistId:v.artistId,following:v.following}));
  return {kind:'complete',text:`Rückgängig: Der vorherige Status für ${values.length} Künstler wurde wiederhergestellt.`};
 }
 if(message.command==='artist-follow-all'){
  const current=await read('/api/spotify/current');
  const rows=current?.track?.artistDetails;
  if(current.connected!==true||!validArtistId(current?.track?.id)||!Array.isArray(rows)||!rows.length||rows.some((a:VoiceChoiceV1008)=>!validArtistId(a?.id)||typeof a.name!=='string'))throw Error('Keine vollständige aktuelle Künstlerliste verfügbar.');
  const artists=Array.from(new Map<string,VoiceChoiceV1008>(rows.map((a:VoiceChoiceV1008)=>[a.id,{id:a.id,name:a.name.trim().slice(0,120)}])).values());
  if(artists.length>40)throw Error('Dieser Titel hat mehr als 40 Künstler. Es wurde nichts geändert.');
  const values=await batch(artists.map(a=>({artistId:a.id,follow:true})),{trackId:current.track.id});
  const changes=values.filter(v=>!v.before).map(v=>({artistId:v.artistId,artistName:artists.find(a=>a.id===v.artistId)!.name,before:v.before,after:v.following}));
  if(changes.length)options.saveUndo({owner,...changes[0],at:options.now(),batch:changes});
  values.forEach(v=>options.notify({artistId:v.artistId,following:v.following}));
  return {kind:'complete',text:`Du folgst jetzt allen ${artists.length} Künstlern dieses Titels auf Spotify.`};
 }
 let artist:VoiceChoiceV1008,before:boolean,desired:boolean;
 if(message.command==='artist-undo'){
  const undo=options.undo;
  if(!undo||undo.owner!==owner||!validArtistId(undo.artistId)||typeof undo.artistName!=='string'||typeof undo.before!=='boolean'||typeof undo.after!=='boolean'||!Number.isSafeInteger(undo.at)||undo.at>options.now()||options.now()-undo.at>600000)throw Error('Keine rückgängig machbare Künstleränderung für dieses Spotify-Konto vorhanden.');
  artist={id:undo.artistId,name:undo.artistName};desired=undo.before;
  const state=await read(`/api/spotify/artists/follow?ids=${encodeURIComponent(artist.id)}`);
  if(state?.statuses?.[artist.id]!==undo.after)throw Error('Der Künstlerstatus wurde inzwischen geändert. Rückgängig wurde nicht ausgeführt.');
  before=undo.after;
 }else{
  const current=await read('/api/spotify/current');
  const entries:VoiceChoiceV1008[]=Array.isArray(current?.track?.artistDetails)?current.track.artistDetails.filter((a:VoiceChoiceV1008)=>validArtistId(a?.id)&&typeof a.name==='string'&&a.name.trim()).map((a:VoiceChoiceV1008)=>({id:a.id,name:a.name.trim().slice(0,120)})):[];
  const artists=Array.from(new Map(entries.map(a=>[a.id,a])).values()).slice(0,10);
  if(current?.connected!==true||!validArtistId(current?.track?.id)||!artists.length)throw Error('Kein aktueller Spotify-Künstler verfügbar. Starte zuerst einen Titel.');
  if(message.target){
   if(message.target.trackId!==current.track.id||!artists.some(a=>a.id===message.target!.artistId))throw Error('Der Song oder die Besetzung hat sich geändert. Bitte stelle die Künstleranfrage erneut.');
   artist=artists.find(a=>a.id===message.target!.artistId)!;
  }else if(artists.length>1&&!message.command.endsWith('-primary')){
   const action=message.command as 'artist-follow'|'artist-unfollow'|'artist-status';
   return {kind:'selection',action,trackId:current.track.id,choices:artists,text:`Welchen Künstler meinst du? ${artists.map((a,i)=>`Nummer ${i+1}: ${a.name.slice(0,60)}`).join('. ')}. Sage zum Beispiel Nummer zwei.`};
  }else artist=artists[0];
  const state=await read(`/api/spotify/artists/follow?ids=${encodeURIComponent(artist.id)}`);
  before=state?.statuses?.[artist.id];if(typeof before!=='boolean')throw Error('Spotify hat keinen gültigen Künstlerstatus geliefert.');
  if(message.command==='artist-status')return {kind:'complete',text:before?`Du folgst ${artist.name} bereits auf Spotify.`:`Du folgst ${artist.name} auf Spotify noch nicht.`};
  desired=message.command==='artist-follow'||message.command==='artist-follow-primary';
 }
 if(before===desired)return {kind:'complete',text:desired?`Du folgst ${artist.name} bereits auf Spotify.`:`Du folgst ${artist.name} auf Spotify nicht.`};
 check();
 const response=await backgroundJsonV1009('/api/spotify/artists/follow',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({artistId:artist.id,follow:desired}),signal:options.signal},20000,fetcher);
 const confirmed=await response.json();
 if(!response.ok||confirmed?.artistId!==artist.id||confirmed?.following!==desired)throw Error(typeof confirmed?.message==='string'?confirmed.message.slice(0,400):'Spotify hat die Änderung nicht bestätigt.');
 options.saveUndo(message.command==='artist-undo'?null:{owner,artistId:artist.id,artistName:artist.name,before,after:desired,at:options.now()});
 options.notify({artistId:artist.id,following:desired});
 return {kind:'complete',text:message.command==='artist-undo'?`Rückgängig: Du folgst ${artist.name} ${desired?'wieder':'nicht mehr'} auf Spotify.`:desired?`Du folgst jetzt ${artist.name} auf Spotify.`:`Du folgst ${artist.name} auf Spotify nicht mehr.`};
}
export function displayPatchV1008(command:VoiceCommandV1008):Partial<UiPreferences>|null {
 switch(command){case 'lyrics-on':return {lyricsVisible:true};case 'lyrics-off':return {lyricsVisible:false,lyricsImmersiveEnabled:false};case 'display-calm':return {reducedMotion:true};case 'display-normal':return {reducedMotion:false};default:return null;}
}
export function nextVoiceAvatarV1008(current:string,catalog:unknown):{id:string;label:string}|null{
 const c=catalog as {defaults?:unknown[];models?:unknown[]}|null;
 const entries=[...(Array.isArray(c?.defaults)?c.defaults:[]),...(Array.isArray(c?.models)?c.models:[])];
 const models=entries.filter((m):m is {id:string;label:string;url?:string}=>!!m&&typeof m==='object'&&typeof (m as {id?:unknown}).id==='string'&&typeof (m as {label?:unknown}).label==='string'&&((m as {id:string}).id==='procedural'||typeof (m as {url?:unknown}).url==='string'&&!!(m as {url:string}).url));
 const unique=Array.from(new Map(models.map(m=>[m.id,m])).values());
 if(unique.length<2)return null;const index=unique.findIndex(m=>m.id===current);return unique[(index+1)%unique.length];
}
export async function executeDisplayVoiceV1008(command:VoiceCommandV1008,options:{current:string;fetcher:typeof fetch;update:(patch:Partial<UiPreferences>)=>void;allowed:()=>boolean;signal?:AbortSignal}):Promise<VoiceResultV1008>{
 const {fetcher}=options;
 if(!options.allowed()||options.signal?.aborted)throw Error('Anzeigesteuerung nicht mehr freigegeben.');
 const patch=displayPatchV1008(command);
 if(patch){options.update(patch);return {kind:'complete',text:command==='lyrics-on'?'Lyrics sind eingeblendet.':command==='lyrics-off'?'Lyrics sind ausgeblendet.':command==='display-calm'?'Die ruhige Darstellung ist aktiviert.':'Die normale Darstellung ist aktiviert.'};}
 if(command!=='avatar-next')throw Error('Unbekannter Anzeigebefehl.');
 const response=await backgroundJsonV1009('/api/avatars',{cache:'no-store',signal:options.signal},12000,fetcher);
 if(!response.ok)throw Error('Avatar-Bibliothek ist momentan nicht erreichbar.');
 const next=nextVoiceAvatarV1008(options.current,await response.json());
 if(!options.allowed()||options.signal?.aborted)throw Error('Anzeigesteuerung nicht mehr freigegeben.');
 if(!next)return {kind:'complete',text:'Es ist nur ein Avatar verfügbar. Installiere zuerst ein weiteres Modell.'};
 options.update({avatarModelId:next.id});return {kind:'complete',text:`Avatar ${next.label.slice(0,120)} ist ausgewählt.`};
}
