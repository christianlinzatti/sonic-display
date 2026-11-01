/** V653: deterministic, browser-safe direction for already-fetched artist content.
 * No network access, artificial singer detection, timers or extra render loop. */
import type {LyricsPhotoDecisionV350} from './lyricsPhotoChoreographyV350';
import type {StagePhotoSceneV652} from '../musicMetadata/curationV652';

export type ArtistBioModeV653='full'|'teaser';
export interface SmartArtistVisualSettingsV653 {
 enabled:boolean;
 lyricProtection:number;
 hookEnergy:number;
 maximumPhotos:number;
 transitionMs:number;
}
export interface SmartArtistVisualInputV653 {
 section?:string;lyricsActive:boolean;lipSyncActive?:boolean;
 playing:boolean;reducedMotion:boolean;imageCount:number;beatAccent?:number;
 lyricsSide?:'left'|'right'|null;
}
export interface SmartArtistVisualCueV653 {
 active:boolean;scene:StagePhotoSceneV652;visiblePhotos:number;
 photoOpacity:number;photoMotion:number;transitionMs:number;
 bioMode:ArtistBioModeV653;bioOpacity:number;
 avoidLyricsX:number;reason:string;
}
export const ARTIST_VISUAL_KEY_V653='sonic-artist-visual-director-v653';
export const ARTIST_VISUAL_EVENT_V653='sonic:artist-visual-director-v653';
export const DEFAULT_ARTIST_VISUAL_V653:SmartArtistVisualSettingsV653={
 enabled:true,lyricProtection:.85,hookEnergy:.8,maximumPhotos:4,transitionMs:850,
};
const clamp=(n:unknown,min:number,max:number,def:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):def;
export function sanitizeSmartArtistVisualV653(value:unknown):SmartArtistVisualSettingsV653 {
 const v=value&&typeof value==='object'?value as Partial<SmartArtistVisualSettingsV653>:{};
 return {enabled:v.enabled!==false,lyricProtection:clamp(v.lyricProtection,0,1,.85),
  hookEnergy:clamp(v.hookEnergy,0,1,.8),maximumPhotos:Math.round(clamp(v.maximumPhotos,1,8,4)),
  transitionMs:Math.round(clamp(v.transitionMs,0,3500,850))};
}
export function readSmartArtistVisualV653():SmartArtistVisualSettingsV653 {
 if(typeof window==='undefined')return {...DEFAULT_ARTIST_VISUAL_V653};
 try{return sanitizeSmartArtistVisualV653(JSON.parse(window.localStorage.getItem(ARTIST_VISUAL_KEY_V653)||'null'));}
 catch{return {...DEFAULT_ARTIST_VISUAL_V653};}
}
export function saveSmartArtistVisualV653(raw:SmartArtistVisualSettingsV653):SmartArtistVisualSettingsV653 {
 const safe=sanitizeSmartArtistVisualV653(raw);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(ARTIST_VISUAL_KEY_V653,JSON.stringify(safe));}catch{/* optional storage */}
  window.dispatchEvent(new Event(ARTIST_VISUAL_EVENT_V653));
 }
 return safe;
}
/** Gives verified lyrics and vocal-performance visibility priority, even during drops. */
export function planSmartArtistVisualV653(input:SmartArtistVisualInputV653,raw:SmartArtistVisualSettingsV653=DEFAULT_ARTIST_VISUAL_V653):SmartArtistVisualCueV653 {
 const s=sanitizeSmartArtistVisualV653(raw);
 const count=Math.max(0,Math.min(12,Math.floor(clamp(input.imageCount,0,12,0))));
 const section=(input.section??'').trim().toLowerCase();
 const hook=/hook|chorus|refrain|drop|peak|climax/.test(section);
 const instrumental=/intro|outro|break|instrumental|interlude/.test(section);
 const activeLyrics=!!input.lyricsActive;
 const vocal=activeLyrics||input.lipSyncActive===true;
 const beat=clamp(input.beatAccent,0,1,0);
 const active=s.enabled;
 const scene:StagePhotoSceneV652=!active?'balanced':
  vocal&&!hook?'lyrics':hook||instrumental?'photos':activeLyrics?'lyrics':'balanced';
 const focus=vocal?1-s.lyricProtection*.55:1;
 const photoOpacity=active?clamp(scene==='lyrics'?focus*.83:scene==='photos'&&vocal?focus*.94:focus*.96,.28,1,1):1;
 const available=Math.min(count,s.maximumPhotos);
 const visiblePhotos=!active?count:scene==='lyrics'?Math.min(available,1):scene==='photos'?Math.min(available,vocal?2:4):Math.min(available,2);
 const motion=!input.playing||input.reducedMotion?0:
  scene==='lyrics'?.10:scene==='photos'?(vocal?.25:.50)+beat*s.hookEnergy*(vocal?.15:.45):.25;
 const avoidLyricsX=vocal?(input.lyricsSide==='left'?.12:input.lyricsSide==='right'?-.12:0)*s.lyricProtection:0;
 const bioMode:ArtistBioModeV653=vocal?'teaser':'full';
 return {active,scene,visiblePhotos,photoOpacity,photoMotion:active?clamp(motion,0,1,0):1,
  transitionMs:input.reducedMotion?0:s.transitionMs,bioMode,
  bioOpacity:active?(vocal?.65:.98):1,avoidLyricsX,
  reason:!active?'Bisherige Bildregie':vocal&&!hook?'Lyrics und Lip-Sync haben Vorrang':
   vocal&&hook?'Hook-Energie mit geschützten Lyrics':hook?'Hook / Drop – Konzertbilder':
   instrumental?'Instrumental – Raum für Künstlerinhalte':'Ausgewogene Künstlerinszenierung'};
}
/** Preserve explicit V350 manual cues, and only tighten the V351/V352 safety envelope. */
export function coordinateArtistVisualV653(
 cue:SmartArtistVisualCueV653,legacy:LyricsPhotoDecisionV350,manualV350:boolean,
):LyricsPhotoDecisionV350 {
 if(!cue.active||cue.visiblePhotos===0||manualV350)return legacy;
 return {...legacy,active:true,cue:legacy.active?legacy.cue:cue.scene,
  visiblePhotos:Math.min(legacy.visiblePhotos,cue.visiblePhotos),
  photoOpacity:Math.min(legacy.photoOpacity,cue.photoOpacity),
  photoMotion:Math.min(legacy.photoMotion,cue.photoMotion),
  avoidLyricsX:legacy.avoidLyricsX||cue.avoidLyricsX,
  transitionMs:Math.max(legacy.active?legacy.transitionMs:0,cue.transitionMs),
  reason:legacy.active?legacy.reason:cue.reason};
}
