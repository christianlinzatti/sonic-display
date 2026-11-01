import type {UiPreferences} from '../types/music';
import {isMusicGenre,type MusicGenre} from '../config/musicGenres';

/** V676 is a strictly scoped, browser-local look library. It must never store Spotify history,
 * account information, avatars, camera directives or authored show timelines. */
export const LOOK_STORAGE_KEY_V676='sonic-display:v676:concert-looks';
export const MAX_LOOKS_V676=24;
export const LOOK_STAGES_V676=[
 {id:'classic',label:'Classic Stage'}, {id:'neon',label:'Neon Club'},
 {id:'festival',label:'Festival Mainstage'}, {id:'minimal',label:'Minimal Studio'},
 {id:'cyberpunk',label:'Cyberpunk Club'}, {id:'vaporwave',label:'Vaporwave Sunset'},
 {id:'galaxy',label:'Cosmic Galaxy'}, {id:'white',label:'White Showroom'},
 {id:'rock',label:'Rock Arena'},
] as const satisfies ReadonlyArray<{id:UiPreferences['stageTheme'];label:string}>;
export const LOOK_DANCES_V676=[
 {id:'auto',label:'Automatisch'}, {id:'hardstyle',label:'Hardstyle'},
 {id:'techno',label:'Techno'}, {id:'rock-metal',label:'Rock / Metal'},
 {id:'robot',label:'Robot'}, {id:'ambient',label:'Ambient'},
 {id:'freestyle',label:'Freestyle'},
] as const satisfies ReadonlyArray<{id:UiPreferences['avatarDancePreset'];label:string}>;
export type LookGenreV676=MusicGenre|'all';
export type LookPatchV676=Pick<UiPreferences,
 'stageTheme'|'stageReactive'|'stageLightStrength'|'avatarDancePreset'|'danceFxEnabled'|'danceFxStrength'>;
export type ConcertLookV676={id:string;name:string;genre:LookGenreV676;patch:LookPatchV676};
export type LookLibraryV676={schema:'sonic-concert-looks';version:1;looks:ConcertLookV676[]};
export function emptyLookLibraryV676():LookLibraryV676{return {schema:'sonic-concert-looks',version:1,looks:[]};}
const record=(raw:unknown):raw is Record<string,unknown>=>raw!==null&&typeof raw==='object'&&!Array.isArray(raw);
const num=(v:unknown):v is number=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=100;
export function validLookGenreV676(genre:unknown):genre is LookGenreV676{
 return genre==='all'||(typeof genre==='string'&&isMusicGenre(genre));
}
export function validateLookPatchV676(raw:unknown):LookPatchV676|null{
 if(!record(raw))return null;
 const keys=['stageTheme','stageReactive','stageLightStrength','avatarDancePreset','danceFxEnabled','danceFxStrength'];
 if(Object.keys(raw).length!==keys.length||keys.some(k=>!Object.prototype.hasOwnProperty.call(raw,k)))return null;
 if(!LOOK_STAGES_V676.some(s=>s.id===raw.stageTheme)||typeof raw.stageReactive!=='boolean'||!num(raw.stageLightStrength)
   ||!LOOK_DANCES_V676.some(d=>d.id===raw.avatarDancePreset)||typeof raw.danceFxEnabled!=='boolean'||!num(raw.danceFxStrength))return null;
 return {stageTheme:raw.stageTheme as LookPatchV676['stageTheme'],stageReactive:raw.stageReactive,
  stageLightStrength:raw.stageLightStrength,avatarDancePreset:raw.avatarDancePreset as LookPatchV676['avatarDancePreset'],
  danceFxEnabled:raw.danceFxEnabled,danceFxStrength:raw.danceFxStrength};
}
export function validateConcertLookV676(raw:unknown):ConcertLookV676|null{
 if(!record(raw)||typeof raw.id!=='string'||!/^look-[a-zA-Z0-9_-]{5,45}$/.test(raw.id)||typeof raw.name!=='string'||!validLookGenreV676(raw.genre))return null;
 const name=raw.name.trim().replace(/\s+/g,' ');
 if(name.length<2||name.length>42)return null;
 const patch=validateLookPatchV676(raw.patch);
 return patch?{id:raw.id,name,genre:raw.genre,patch}:null;
}
/** Fail closed: invalid stored / imported content is never silently overwritten or partially loaded. */
export function parseLookLibraryV676(raw:unknown):LookLibraryV676|null{
 if(typeof raw==='string'){
  if(raw.length>60000)return null;
  try{raw=JSON.parse(raw);}catch{return null;}
 }
 if(!record(raw)||raw.schema!=='sonic-concert-looks'||raw.version!==1||!Array.isArray(raw.looks)||raw.looks.length>MAX_LOOKS_V676)return null;
 const looks:ConcertLookV676[]=[],ids=new Set<string>(),names=new Set<string>();
 for(const source of raw.looks){
  const look=validateConcertLookV676(source);
  if(!look)return null;
  const groupName=`${look.genre}:${look.name.toLocaleLowerCase('de')}`;
  if(ids.has(look.id)||names.has(groupName))return null;
  ids.add(look.id);names.add(groupName);looks.push(look);
 }
 return {...emptyLookLibraryV676(),looks};
}
export function upsertConcertLookV676(lib:LookLibraryV676,candidate:unknown):LookLibraryV676|null{
 const look=validateConcertLookV676(candidate);
 if(!look)return null;
 const remaining=lib.looks.filter(item=>item.id!==look.id);
 if(remaining.length>=MAX_LOOKS_V676||remaining.some(item=>item.genre===look.genre&&item.name.toLocaleLowerCase('de')===look.name.toLocaleLowerCase('de')))return null;
 return {...emptyLookLibraryV676(),looks:[...remaining,look]};
}
export function removeConcertLookV676(lib:LookLibraryV676,id:string):LookLibraryV676{
 return {...emptyLookLibraryV676(),looks:lib.looks.filter(item=>item.id!==id)};
}
export function mergeConcertLooksV676(existing:LookLibraryV676,incoming:LookLibraryV676):{library:LookLibraryV676;added:number;skipped:number}{
 let library=existing,added=0,skipped=0;
 for(const item of incoming.looks){
  if(library.looks.some(l=>l.id===item.id)){skipped++;continue;}
  const next=upsertConcertLookV676(library,item);
  if(next){added++;library=next;}else skipped++;
 }
 return {library,added,skipped};
}
export function captureConcertLookV676(p:UiPreferences):LookPatchV676{
 return {stageTheme:p.stageTheme,stageReactive:p.stageReactive,stageLightStrength:p.stageLightStrength,
  avatarDancePreset:p.avatarDancePreset,danceFxEnabled:p.danceFxEnabled,danceFxStrength:p.danceFxStrength};
}
export function canUndoConcertLookV676(current:UiPreferences,applied:LookPatchV676):boolean{
 return (Object.keys(applied) as (keyof LookPatchV676)[]).every(key=>current[key]===applied[key]);
}
/** A specific genre also shows universal (all-genre) looks, but never an unrelated genre. */
export function selectConcertLooksV676(lib:LookLibraryV676,genre:LookGenreV676|'any'):ConcertLookV676[]{
 return lib.looks.filter(item=>genre==='any'||item.genre===genre||item.genre==='all');
}
