/** V650: narrow, versioned preset snapshots for the existing V649 controls.
 * No playback credentials, vocal assignment, authored timeline or audio data is serialized.
 * All imports are rebuilt through the V649 allowlist, never spread into UiPreferences.
 */
import type {UiPreferences} from "@/types/music";
import {buildControlPatchV649,CONTROLLABLE_KEYS_V649,type ControlKeyV649} from "./concertControlPolicyV649";

export type ConcertPresetV650={id:string;name:string;description:string;patch:Partial<UiPreferences>;
  view:"stage"|"split"|"lyrics";readability:"standard"|"clear"|"large";displayProfile?:"off"|"auto"|"eco"|"sharp"};
export type PresetLibraryV650={schema:"sonic-concert-presets";version:1;profiles:ConcertPresetV650[]};
export const PRESET_STORAGE_KEY_V650="sonic-display:v650:concert-presets";
export const MAX_CUSTOM_PRESETS_V650=12;
const VIEWS=["stage","split","lyrics"] as const;
const READABILITY=["standard","clear","large"] as const;
const DISPLAY_PROFILES=["off","auto","eco","sharp"] as const;
const plainObject=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==="object"&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const isOf=(list:readonly string[],v:unknown):v is string=>typeof v==="string"&&list.includes(v);
const normalizedName=(v:unknown)=>typeof v==="string"?v.trim().replace(/\s+/g," "):"";

/** Published profiles use the SAME supported controls as the V649 control center. */
export const FACTORY_PRESETS_V650:readonly ConcertPresetV650[]=[
 {id:"builtin:deutschrap",name:"Deutschrap · Vocal Focus",description:"Sängerporträt, ruhige Details und lesbare Lyrics",view:"split",readability:"large",
  patch:{stageTheme:"cyberpunk",stageReactive:true,stageLightStrength:48,avatarVocalCameraV369:"performance",avatarVocalCameraStrengthV369:78,rapCameraEnabledV429:true,lyricsFontSize:116,lyricsFocusMode:true,lyricsImmersiveEnabled:false,multiAvatarMode:"duet",avatarDancePreset:"auto",avatarLipSyncEnabled:true,concertDetailEnabledV555:true,concertDetailStrengthV555:30,reducedMotion:false}},
 {id:"builtin:hardtekk",name:"Hardtekk · Rave Tunnel",description:"Neon, schnelle Bühnenakzente und druckvolle Gruppenshow",view:"stage",readability:"clear",
  patch:{stageTheme:"neon",stageReactive:true,stageLightStrength:83,avatarVocalCameraV369:"auto",avatarVocalCameraStrengthV369:40,rapCameraEnabledV429:false,lyricsFontSize:100,lyricsFocusMode:false,lyricsImmersiveEnabled:false,multiAvatarMode:"sync",avatarDancePreset:"hardstyle",avatarLipSyncEnabled:true,concertDetailEnabledV555:true,concertDetailStrengthV555:75,reducedMotion:false}},
 {id:"builtin:hardstyle",name:"Hardstyle · Festival",description:"Festival-Bühne und dynamisches Licht",view:"split",readability:"clear",
  patch:{stageTheme:"festival",stageReactive:true,stageLightStrength:78,avatarVocalCameraV369:"auto",avatarVocalCameraStrengthV369:45,rapCameraEnabledV429:false,lyricsFontSize:106,lyricsFocusMode:true,lyricsImmersiveEnabled:false,multiAvatarMode:"sync",avatarDancePreset:"hardstyle",avatarLipSyncEnabled:true,concertDetailEnabledV555:true,concertDetailStrengthV555:66,reducedMotion:false}},
 {id:"builtin:rock",name:"Rock · Live Arena",description:"Rock-Arena, Ensemble und Bühnenstrahler",view:"split",readability:"clear",
  patch:{stageTheme:"rock",stageReactive:true,stageLightStrength:64,avatarVocalCameraV369:"auto",avatarVocalCameraStrengthV369:58,rapCameraEnabledV429:false,lyricsFontSize:105,lyricsFocusMode:true,lyricsImmersiveEnabled:false,multiAvatarMode:"sync",avatarDancePreset:"rock-metal",avatarLipSyncEnabled:true,concertDetailEnabledV555:true,concertDetailStrengthV555:60,reducedMotion:false}},
 {id:"builtin:pop",name:"Pop · Prism Studio",description:"Helle Pop-Atmosphäre und gut sichtbare Vocals",view:"split",readability:"clear",
  patch:{stageTheme:"vaporwave",stageReactive:true,stageLightStrength:62,avatarVocalCameraV369:"performance",avatarVocalCameraStrengthV369:65,rapCameraEnabledV429:false,lyricsFontSize:112,lyricsFocusMode:true,lyricsImmersiveEnabled:false,multiAvatarMode:"duet",avatarDancePreset:"freestyle",avatarLipSyncEnabled:true,concertDetailEnabledV555:true,concertDetailStrengthV555:45,reducedMotion:false}},
 {id:"builtin:touch",name:"10 Zoll · Lyrics klar",description:"Große Texte, wenig Effekte und reduzierte Bewegung",view:"lyrics",readability:"large",
  patch:{stageTheme:"minimal",stageReactive:false,stageLightStrength:35,avatarVocalCameraV369:"off",avatarVocalCameraStrengthV369:30,rapCameraEnabledV429:false,lyricsFontSize:128,lyricsFocusMode:true,lyricsImmersiveEnabled:false,multiAvatarMode:"solo",avatarDancePreset:"auto",avatarLipSyncEnabled:true,concertDetailEnabledV555:false,concertDetailStrengthV555:12,reducedMotion:true}},
] as const;

export function sanitizeConcertPatchV650(raw:unknown):Partial<UiPreferences>|null{
 if(!plainObject(raw))return null;
 const result:Record<string,unknown>={};
 const entries=Object.entries(raw);
 if(entries.length===0||entries.length>CONTROLLABLE_KEYS_V649.length)return null;
 for(const [key,value] of entries){
   if(!CONTROLLABLE_KEYS_V649.includes(key as ControlKeyV649))return null;
   const part=buildControlPatchV649(key as ControlKeyV649,value);
   if(!part)return null;
   const clean=(part as Record<string,unknown>)[key];
   // Reject out-of-range imported numbers rather than silently clamping them.
   if(!Object.is(clean,value))return null;
   result[key]=clean;
 }
 return result as Partial<UiPreferences>;
}
/** Normalized for both the import path and the apply path. */
export function validateConcertPresetV650(raw:unknown):ConcertPresetV650|null{
 if(!plainObject(raw))return null;
 const {id,description,view,readability,displayProfile}=raw;
 const name=normalizedName(raw.name);
 if(typeof id!=="string"||!(/^(custom:[a-zA-Z0-9_-]{1,50}|builtin:[a-z]{2,20})$/).test(id))return null;
 if(name.length<2||name.length>40||typeof description!=="string"||description.length>120)return null;
 if(!isOf(VIEWS,view)||!isOf(READABILITY,readability)||(displayProfile!==undefined&&!isOf(DISPLAY_PROFILES,displayProfile)))return null;
 const patch=sanitizeConcertPatchV650(raw.patch);
 if(!patch)return null;
 return {...(displayProfile!==undefined?{displayProfile:displayProfile as ConcertPresetV650["displayProfile"]}:{}),id,name,description,view:view as ConcertPresetV650["view"],readability:readability as ConcertPresetV650["readability"],patch};
}
export function emptyPresetLibraryV650():PresetLibraryV650{return {schema:"sonic-concert-presets",version:1,profiles:[]};}
export function parsePresetLibraryV650(raw:unknown):PresetLibraryV650|null{
 if(typeof raw==="string"){
   if(raw.length>65536)return null;
   try{raw=JSON.parse(raw);}catch{return null;}
 }
 if(!plainObject(raw)||raw.schema!=="sonic-concert-presets"||raw.version!==1||!Array.isArray(raw.profiles)||raw.profiles.length>MAX_CUSTOM_PRESETS_V650)return null;
 const profiles:ConcertPresetV650[]=[];
 const ids=new Set<string>(),names=new Set<string>();
 for(const candidate of raw.profiles){
   const preset=validateConcertPresetV650(candidate);
   if(!preset||!preset.id.startsWith("custom:")||FACTORY_PRESETS_V650.some(p=>p.name.toLocaleLowerCase("de")===preset.name.toLocaleLowerCase("de")))return null;
   const canonical=preset.name.toLocaleLowerCase("de");
   if(ids.has(preset.id)||names.has(canonical))return null;
   profiles.push(preset);ids.add(preset.id);names.add(canonical);
 }
 return {...emptyPresetLibraryV650(),profiles};
}
/** Capture explicit user-facing controls only, not the complete preference object. */
export function captureConcertPresetV650(id:string,name:string,preferences:UiPreferences,view:ConcertPresetV650["view"],readability:ConcertPresetV650["readability"],displayProfile?:ConcertPresetV650["displayProfile"]):ConcertPresetV650|null{
 const patch:Record<string,unknown>={};
 for(const key of CONTROLLABLE_KEYS_V649){
   const raw=preferences[key];
   if(raw===undefined)continue;
   const part=buildControlPatchV649(key,raw);
   if(part)patch[key]=(part as Record<string,unknown>)[key];
 }
 return validateConcertPresetV650({id,name,description:"Eigene Einstellungen aus der Touch-Steuerzentrale",patch,view,readability,displayProfile});
}
export function mergePresetLibraryV650(current:PresetLibraryV650,incoming:PresetLibraryV650):{library:PresetLibraryV650;added:number;skipped:number}{
 const profiles=[...current.profiles];let added=0,skipped=0;
 for(const candidate of incoming.profiles){
   if(profiles.length>=MAX_CUSTOM_PRESETS_V650||profiles.some(p=>p.id===candidate.id||p.name.toLocaleLowerCase("de")===candidate.name.toLocaleLowerCase("de"))){skipped++;continue;}
   profiles.push(candidate);added++;
 }
 return {library:{...emptyPresetLibraryV650(),profiles},added,skipped};
}
