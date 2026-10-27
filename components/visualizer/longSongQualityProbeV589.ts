/** V589 simulated long-song review over the *actual available GLB clip metadata*.
 * This is a hypothetical stress test of V588's selector, not real song/lyrics
 * or visual observation. No source clips, animations or live settings modified.
 */
import {planLongFormChoreographyV588,musicalWindowV588} from './longFormChoreographyV588';
import {suggestMotionCategoryV535} from './motionLibraryIntelligenceV535';
import type {GenreMotionCandidateV536,GenreMotionInputV536} from './genreAwareMotionDirectorV536';
export type SourceClipV589={name:string;duration:number;trackCount:number};
export type LongSongEntryV589={atSeconds:number;section:string;clipName:string|null;clipIndex:number|null;poolSize:number};
export type LongSongProbeV589={entries:readonly LongSongEntryV589[];totalWindows:number;uniqueClips:number;immediateRepeats:number;unavailableWindows:number;mode:'hypothetical-not-playback';note:string};
const sectionFor=(fraction:number)=>fraction<.13?'intro':fraction<.4?'verse':fraction<.55?'hook':fraction<.81?'verse':fraction<.94?'hook':'outro';
/** 2-8 min, at most 50 windows; actual V588 genre planner, no random selection. */
export function probeLongSongQualityV589(clips:readonly SourceClipV589[],options:{minutes:number;bpm:number;genre:string;modelKey:string}):LongSongProbeV589{
 const minutes=Number.isFinite(options.minutes)?Math.max(2,Math.min(8,options.minutes)):4;
 const bpm=Number.isFinite(options.bpm)?Math.max(55,Math.min(220,options.bpm)):120;
 const durationMs=minutes*60_000;
 const windowMs=musicalWindowV588({bpm,progressMs:0}).durationMs;
 const candidates:GenreMotionCandidateV536[]=clips.slice(0,512).map((c,i)=>({
  name:c.name||`Clip-${i}`,label:c.name||`Clip-${i}`,duration:c.duration,trackCount:c.trackCount,
  source:'embedded',category:suggestMotionCategoryV535(c.name),
 }));
 const entries:LongSongEntryV589[]=[];
 const seen=new Set<string>();let repeats=0,unavailable=0,last:string|null=null;
 for(let ms=0;ms<durationMs&&entries.length<50;ms+=windowMs){
  const section=sectionFor(ms/durationMs);
  const input:GenreMotionInputV536={clips:candidates,trackId:'v589-review-example-only',modelKey:options.modelKey||'preview',progressMs:ms,
   genre:options.genre,section,bpm,energy:section==='intro'||section==='outro'?.2:section==='hook'?.86:.55,
   slot:0,playing:true,reducedMotion:false,manualPriority:false};
  const plan=planLongFormChoreographyV588(input);
  const chosen=plan.name;
  if(!chosen)unavailable++;else {seen.add(chosen);if(last===chosen)repeats++;}
  entries.push({atSeconds:Math.round(ms/1000*10)/10,section,clipName:chosen,clipIndex:chosen===null?null:candidates.findIndex(c=>c.name===chosen),poolSize:plan.poolSize});
  last=chosen;
 }
 return {entries,totalWindows:entries.length,uniqueClips:seen.size,immediateRepeats:repeats,unavailableWindows:unavailable,
  mode:'hypothetical-not-playback',note:'Modellierte Songstruktur und vorhandene GLB-Metadaten; kein echter Track, keine Wiedergabe und kein Beweis für flüssige Übergänge. Nur die anschließende manuelle GLB-Vorschau kann optische Fehler zeigen.'};
}
