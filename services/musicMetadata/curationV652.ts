/** V652 — deterministic, side-effect-free identity, provenance and stage-image curation.
 * No networking, API keys, or automatic assertions about a photograph's subject.
 */
import {canonicalV651,httpsV651,validMbidV651} from './normalizeV651';

export type IdentityStatusV652 = 'verified'|'provisional'|'conflict'|'unresolved';
export interface ArtistIdentityV652 {
  mbid:string|null;
  status:IdentityStatusV652;
  source:'musicbrainz'|'lastfm'|null;
}
export function resolveArtistIdentityV652(
  musicBrainz:{mbid:string}|null|undefined,
  lastfm:{mbid:string|null}|null|undefined,
):ArtistIdentityV652{
  const mb=validMbidV651(musicBrainz?.mbid)?musicBrainz.mbid.toLowerCase():null;
  const lf=validMbidV651(lastfm?.mbid)?lastfm.mbid.toLowerCase():null;
  // Disagreeing identities must not be used for another provider's linked requests.
  if(mb&&lf&&mb!==lf)return {mbid:null,status:'conflict',source:null};
  if(mb)return {mbid:mb,status:'verified',source:'musicbrainz'};
  if(lf)return {mbid:lf,status:'provisional',source:'lastfm'};
  return {mbid:null,status:'unresolved',source:null};
}

/** Higher-priority, verified structured artist tags lead; duplicate spellings are collapsed. */
export function mergeGenresV652(audioGenre:string|null|undefined,lastfmGenres:readonly string[]|null|undefined,max=12):string[]{
  const out:string[]=[];const seen=new Set<string>();
  for(const raw of [audioGenre,...(lastfmGenres||[])]){
    const value=raw?.replace(/\s+/g,' ').trim().slice(0,100);
    if(!value)continue;
    const canonical=canonicalV651(value);
    if(!canonical||['unknown','none','other','various','unbekannt','n a'].includes(canonical)||seen.has(canonical))continue;
    seen.add(canonical);out.push(value);
    if(out.length>=max)break;
  }
  return out;
}

export type StagePhotoSceneV652='lyrics'|'balanced'|'photos';
export type StagePhotoSourceV652='spotify'|'commons'|'flickr'|'theaudiodb';
export interface StagePhotoCandidateV652 {
  url:string;credit?:string;page?:string;source:StagePhotoSourceV652;
  title?:string;width?:number;height?:number;
}
export interface StagePhotoSelectionV652 extends StagePhotoCandidateV652 {credit:string;score:number;}

const sources:Record<StagePhotoSourceV652,number>={spotify:90,commons:82,flickr:76,theaudiodb:53};
const photoScene=(scene:unknown):StagePhotoSceneV652=>scene==='lyrics'||scene==='photos'?scene:'balanced';
export const stagePhotoSceneV652=photoScene;

function canonicalImageKey(candidate:StagePhotoCandidateV652):string{
  // Page identity catches alternate resolutions of the same Flickr / Commons photo.
  if(candidate.page){const page=httpsV651(candidate.page);if(page)return `page:${page.toLowerCase().replace(/\/$/,'')}`;}
  try{
    const url=new URL(candidate.url);
    url.hash='';url.search='';
    // Flickr thumbnail suffixes (_m, _z, etc.) are the *same photograph*.
    if(/(?:^|\.)staticflickr\.com$/i.test(url.hostname))url.pathname=url.pathname.replace(/_[a-z](?=\.[a-z0-9]+$)/i,'');
    return `url:${url.hostname.toLowerCase()}${decodeURIComponent(url.pathname).toLowerCase()}`;
  }catch{return candidate.url;}
}
function scorePhoto(candidate:StagePhotoCandidateV652,scene:StagePhotoSceneV652):number{
  const text=canonicalV651(candidate.title||'');
  const live=/(?:^| )(live|concert|gig|festival|stage|performance|konzert|auftritt)(?: |$)/.test(text);
  const portrait=/(?:^| )(portrait|press|portraitfoto|promo|official)(?: |$)/.test(text);
  const wide=(candidate.width||0)>0&&(candidate.height||0)>0&&candidate.width! >= 1.45*candidate.height!;
  const tall=(candidate.width||0)>0&&(candidate.height||0)>0&&candidate.height! > candidate.width! * 1.15;
  const pixels=Number(candidate.width)*Number(candidate.height);
  const detail=Number.isFinite(pixels)&&pixels>=1280*720?8:Number.isFinite(pixels)&&pixels>=640*480?4:0;
  const context=scene==='photos'?(live?18:0)+(wide?10:0):scene==='lyrics'?(portrait?12:0)+(tall?5:0)-(live?5:0):(live?6:0)+(wide?4:0);
  // Deliberately prioritize verified artist-profile imagery over uncertain text-search hits.
  return sources[candidate.source]+detail+context;
}
export function rankStagePhotosV652(
  candidates:readonly StagePhotoCandidateV652[],scene:StagePhotoSceneV652='balanced',limit=12,
):StagePhotoSelectionV652[]{
  const safe=photoScene(scene);const out=new Map<string,StagePhotoSelectionV652>();
  for(const photo of candidates){
    const url=httpsV651(photo.url);if(!url||!sources[photo.source])continue;
    const key=canonicalImageKey({...photo,url});
    const image:StagePhotoSelectionV652={...photo,url,credit:photo.credit?.slice(0,500)||'',score:scorePhoto(photo,safe)};
    const prev=out.get(key);
    if(!prev||image.score>prev.score)out.set(key,image);
  }
  return [...out.values()].sort((a,b)=>b.score-a.score||a.url.localeCompare(b.url)).slice(0,Math.max(1,Math.min(12,limit)));
}
