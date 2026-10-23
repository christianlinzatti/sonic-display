/** V350 – explicit, local, opt-in coordination between displayed lyrics and photo panels.
 * This module is pure except for the small, guarded settings persistence functions. */
export type LyricsPhotoModeV350='auto'|'manual';
export type LyricsPhotoCueV350='lyrics'|'balanced'|'photos';
export interface LyricsPhotoSettingsV350 {
 enabled:boolean;mode:LyricsPhotoModeV350;manualCue:LyricsPhotoCueV350;
 lyricPriority:number;chorusImpact:number;motionReduction:number;
 versePhotoLimit:number;chorusPhotoLimit:number;transitionMs:number;
}
export interface LyricsPhotoInputV350 {
 lyricsActive:boolean;section?:string;beatAccent?:number;playing?:boolean;
 imageCount:number;reducedMotion?:boolean;lyricsSide?:'left'|'right'|null;
}
export interface LyricsPhotoDecisionV350 {
 active:boolean;cue:LyricsPhotoCueV350;visiblePhotos:number;photoOpacity:number;
 photoMotion:number;avoidLyricsX:number;transitionMs:number;reason:string;
}
export const LYRICS_PHOTO_KEY_V350='sonic-lyrics-photo-choreography-v350';
export const LYRICS_PHOTO_EVENT_V350='sonic:lyrics-photo-choreography-v350';
export const DEFAULT_LYRICS_PHOTO_V350:LyricsPhotoSettingsV350={
 enabled:false,mode:'auto',manualCue:'balanced',lyricPriority:.78,chorusImpact:.8,
 motionReduction:.72,versePhotoLimit:2,chorusPhotoLimit:8,transitionMs:850,
};
const limited=(x:unknown,min:number,max:number,def:number)=>typeof x==='number'&&Number.isFinite(x)?Math.max(min,Math.min(max,x)):def;
export function sanitizeLyricsPhotoV350(raw:unknown):LyricsPhotoSettingsV350 {
 const v=raw&&typeof raw==='object'?raw as Partial<LyricsPhotoSettingsV350>:{};
 return {enabled:v.enabled===true,mode:v.mode==='manual'?'manual':'auto',
  manualCue:v.manualCue==='lyrics'||v.manualCue==='photos'?v.manualCue:'balanced',
  lyricPriority:limited(v.lyricPriority,0,1,.78),chorusImpact:limited(v.chorusImpact,0,1,.8),
  motionReduction:limited(v.motionReduction,0,1,.72),
  versePhotoLimit:Math.round(limited(v.versePhotoLimit,1,8,2)),
  chorusPhotoLimit:Math.round(limited(v.chorusPhotoLimit,1,8,8)),
  transitionMs:Math.round(limited(v.transitionMs,0,3500,850))};
}
export function readLyricsPhotoV350():LyricsPhotoSettingsV350 {
 if(typeof window==='undefined')return {...DEFAULT_LYRICS_PHOTO_V350};
 try{return sanitizeLyricsPhotoV350(JSON.parse(window.localStorage.getItem(LYRICS_PHOTO_KEY_V350)||'null'));}
 catch{return {...DEFAULT_LYRICS_PHOTO_V350};}
}
export function saveLyricsPhotoV350(input:LyricsPhotoSettingsV350):LyricsPhotoSettingsV350 {
 const clean=sanitizeLyricsPhotoV350(input);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(LYRICS_PHOTO_KEY_V350,JSON.stringify(clean));}catch{}
  window.dispatchEvent(new Event(LYRICS_PHOTO_EVENT_V350));
 }
 return clean;
}
/** Only consider a synchronized line active while it is actually displayed. Unsynced text is readable throughout. */
export function hasActiveLyricsV350(
 lyrics:{lines:readonly {startMs:number;endMs?:number|null}[];synced?:boolean}|null|undefined,
 activeIndex:number|undefined,progressMs:number|undefined,
):boolean {
 if(!lyrics?.lines.length||!Number.isFinite(activeIndex)||activeIndex===undefined)return false;
 const i=Math.floor(activeIndex);
 if(i<0||i>=lyrics.lines.length)return false;
 if(!lyrics.synced)return true;
 const line=lyrics.lines[i];
 const next=lyrics.lines[i+1];
 const start=Number.isFinite(line.startMs)?line.startMs:0;
 const end=typeof line.endMs==='number'&&Number.isFinite(line.endMs)&&line.endMs>start?Number(line.endMs):next?.startMs??start+3500;
 const at=Number.isFinite(progressMs)?Number(progressMs):0;
 return at>=start-350&&at<=end+280;
}
export function decideLyricsPhotoV350(input:LyricsPhotoInputV350,raw:LyricsPhotoSettingsV350):LyricsPhotoDecisionV350 {
 const s=sanitizeLyricsPhotoV350(raw);
 const images=Math.max(0,Math.min(8,Math.floor(Number.isFinite(input.imageCount)?input.imageCount:0)));
 const neutral:LyricsPhotoDecisionV350={active:false,cue:'balanced',visiblePhotos:images,photoOpacity:1,photoMotion:1,avoidLyricsX:0,transitionMs:s.transitionMs,reason:'Vorherige Bühnendarstellung'};
 if(!s.enabled||images===0||(!input.lyricsActive&&s.mode==='auto'))return neutral;
 const section=(input.section||'').toLowerCase();
 // Manual cue is a conscious override; auto falls back to photos when lyrics are unavailable.
 const cue:LyricsPhotoCueV350=s.mode==='manual'?s.manualCue:
  !input.lyricsActive?'photos':
  /drop|chorus|hook|refrain|climax|peak/.test(section)?'photos':
  /verse|strophe|intro|outro|bridge|break|pre.?chorus/.test(section)?'lyrics':'balanced';
 const impact=limited(input.beatAccent,0,1,0)*(input.playing===false?0:1);
 const photoOpacity=cue==='lyrics'?Math.max(.30,1-s.lyricPriority*.63):cue==='balanced'?Math.max(.65,1-s.lyricPriority*.22):1;
 const visiblePhotos=cue==='lyrics'?Math.min(images,s.versePhotoLimit):cue==='photos'?Math.min(images,s.chorusPhotoLimit):Math.min(images,Math.max(s.versePhotoLimit,3));
 // Synchronized lyrics win in verse; stronger photo motion is allowed for hooks and drops.
 const photoMotion=input.reducedMotion||input.playing===false?0:
  cue==='lyrics'?Math.max(0,1-s.motionReduction):cue==='photos'?1+impact*s.chorusImpact*.4:Math.max(.35,1-s.motionReduction*.4);
 // World-space offset, only used by 3D gallery panels; no extra camera/controller.
 const avoidLyricsX=input.lyricsActive&&cue==='lyrics'?(input.lyricsSide==='left'?.18:input.lyricsSide==='right'?-.18:0)*s.lyricPriority:0;
 return {active:true,cue,visiblePhotos,photoOpacity,photoMotion,avoidLyricsX,transitionMs:s.transitionMs,
  reason:cue==='lyrics'?'Lyrics im Vordergrund':cue==='photos'?'Musikalischer Höhepunkt / Fotofokus':'Lyrics und Fotos im Gleichgewicht'};
}
