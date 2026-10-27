import type {Lyrics} from "@/types/music";

/** V561 changes only the opt-in preview, never the playback state or source GLB. */
export type ConcertLipPreviewModeV561 = "off" | "rap" | "singing" | "song";
export type ConcertLipSongV561 = Readonly<{
  lyrics:Lyrics|null; trackId:string|null; progressMs:number; fetchedAt:number;
  durationMs:number|null; isPlaying:boolean; connected:boolean; offsetMs:number;
}>;
export type ConcertLipPreviewPlanV561 = Readonly<{
  source:"off"|"demo-rap"|"demo-singing"|"song";
  timing:"word"|"line"|"demo"|"none";
  reason:string;
}>;
const finite=(v:number)=>typeof v==="number"&&Number.isFinite(v);
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));

/** A synced flag alone is insufficient; never invent word or line timestamps. */
export function concertLipTimingV561(lyrics:Lyrics|null):"word"|"line"|"none" {
  if(!lyrics?.synced||!Array.isArray(lyrics.lines))return "none";
  let timedLine=false;
  for(const line of lyrics.lines){
    if(!line||!finite(line.startMs)||line.startMs<0||typeof line.text!=="string"||!line.text.trim())continue;
    timedLine=true;
    if(line.words?.some(word=>typeof word.text==="string"&&!!word.text.trim()&&finite(word.startMs)&&word.startMs>=line.startMs && (word.endMs==null||finite(word.endMs)&&word.endMs>word.startMs)))return "word";
  }
  return timedLine?"line":"none";
}
export function planConcertLipPreviewV561(mode:ConcertLipPreviewModeV561,playing:boolean,reducedMotion:boolean,song?:ConcertLipSongV561|null):ConcertLipPreviewPlanV561 {
  if(mode==="off")return {source:"off",timing:"none",reason:"Lip-Sync-Vorschau ausgeschaltet"};
  if(reducedMotion)return {source:"off",timing:"none",reason:"Reduzierte Bewegung ist aktiviert"};
  if(!playing)return {source:"off",timing:"none",reason:"Vorschau pausiert"};
  if(mode==="rap"||mode==="singing")return {source:mode==="rap"?"demo-rap":"demo-singing",timing:"demo",reason:"Demobewegung – keine echten Zeitmarken"};
  const quality=concertLipTimingV561(song?.lyrics??null);
  if(!song?.trackId||!song.connected||!finite(song.progressMs)||!finite(song.fetchedAt)||quality==="none")return {source:"off",timing:"none",reason:"Kein verbundener Song mit gültigen Lyrics-Zeitmarken"};
  if(!song.isPlaying)return {source:"off",timing:quality,reason:"Spotify ist pausiert"};
  return {source:"song",timing:quality,reason:quality==="word"?"Spotify-Songzeit · bestätigte Wort-Timestamps":"Spotify-Songzeit · nur Zeilen-Timestamps (reduzierte Präzision)"};
}

/** Reuses the player clock exactly like SonicDisplay, with a bounded stale-data guard.
 * Date.now is passed in for testability. No timers or polling are created here.
 */
export function concertLipSongClockV561(song:ConcertLipSongV561|null|undefined,nowMs:number):{progressMs:number;playing:boolean}{
  if(!song||!song.connected||!song.isPlaying||!song.trackId||!finite(nowMs)||!finite(song.progressMs)||!finite(song.fetchedAt))
    return {progressMs:0,playing:false};
  const age=nowMs-song.fetchedAt;
  if(age< -1000||age>20000)return {progressMs:0,playing:false};
  const duration=finite(song.durationMs??NaN)&&(song.durationMs??0)>0?(song.durationMs as number):Infinity;
  const progress=clamp(song.progressMs+Math.max(0,age),0,duration);
  const offset=finite(song.offsetMs)?clamp(song.offsetMs,-15000,15000):0;
  return {progressMs:Math.max(0,progress+offset),playing:progress<duration};
}
