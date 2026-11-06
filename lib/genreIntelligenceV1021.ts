/** V1021 Genre Intelligence 3.0 — deterministic, evidence-gated concert STYLE preview.
 * Genres are *metadata hints*, not beat/tempo/vocal classification. Verified
 * V1020 narrative acts remain the ONLY authority for section and finale claims.
 * No network, storage, timers, random values or device control.
 */
import {buildConcertStoryV1020,type ConcertStoryInputV1020,
 type StoryPhaseV1020,type StorySafetyReasonV1020} from './aiConcertStorytellingV1020';

export type GenreProfileV1021='deutschrap'|'hardtekk'|'hardstyle'|'deutschrock'|'other';
export type GenreEnergyV1021='intimate'|'drive'|'anthem'|'rest';
export type GenreCameraV1021='close'|'tracking'|'steady'|'rhythmic'|'wide'|'sweep';
export type GenreStageV1021='cinematic'|'geometry'|'festival'|'arena'|'minimal';
export type GenreAvatarsV1021='lead-rap'|'footwork'|'ensemble'|'frontline'|'hold';
export type GenreLightsV1021='low-key'|'contrast'|'broad'|'warm'|'soft';
export type GenreLyricsV1021='foreground'|'readable';
export type GenreReasonV1021=StorySafetyReasonV1020;
export interface GenreLookV1021 {
 camera:GenreCameraV1021;stage:GenreStageV1021;
 avatars:GenreAvatarsV1021;lights:GenreLightsV1021;lyrics:GenreLyricsV1021;
}
export interface GenreActV1021 {
 ordinal:number;actIndex:number;phase:StoryPhaseV1020;
 startMs:number;endMs:number;energy:GenreEnergyV1021;
 /** A proposed dramaturgical intensity, never measured volume or bass. */
 plannedIntensity:number;look:GenreLookV1021;
}
export interface GenreConcertPlanV1021 {
 status:'unavailable'|'verified';reason:GenreReasonV1021;
 profile:GenreProfileV1021;profileSource:'genre-hint'|'unclassified';
 source:'verified-v604'|'unavailable';
 acts:ReadonlyArray<GenreActV1021>;
 current:GenreActV1021|null;next:GenreActV1021|null;
 audioMeasured:boolean;
}
export type GenreConcertInputV1021=ConcertStoryInputV1020 & {lyricsProtected?:boolean};
export const MAX_GENRE_ACTS_V1021=96;
const limited=(value:unknown)=>typeof value==='string'?value.trim().slice(0,80).toLowerCase():'';
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
/** Classification of an explicit genre string only. Does not analyze audio. */
export function genreProfileV1021(value:unknown):GenreProfileV1021 {
 const g=limited(value);
 if(/hardtekk|hard.?tekk|\btekk\b/.test(g))return 'hardtekk';
 if(/hardstyle|rawstyle|euphoric.?hardstyle/.test(g))return 'hardstyle';
 if(/deutschrap|deutsch.?rap|hip[ -]?hop|\brap\b|\btrap\b|\bdrill\b/.test(g))return 'deutschrap';
 if(/deutschrock|rock|metal|neue deutsche härte|\bndh\b|industrial/.test(g))return 'deutschrock';
 return 'other';
}
const STILL:GenreLookV1021={camera:'steady',stage:'minimal',avatars:'hold',lights:'soft',lyrics:'readable'};
const LOOKS:Record<GenreProfileV1021,Record<'focus'|'build'|'peak'|'breather',GenreLookV1021>>={
 deutschrap:{
  focus:{camera:'close',stage:'cinematic',avatars:'lead-rap',lights:'low-key',lyrics:'foreground'},
  build:{camera:'tracking',stage:'cinematic',avatars:'lead-rap',lights:'contrast',lyrics:'foreground'},
  peak:{camera:'wide',stage:'arena',avatars:'ensemble',lights:'broad',lyrics:'foreground'},
  breather:STILL},
 hardtekk:{
  focus:{camera:'rhythmic',stage:'geometry',avatars:'footwork',lights:'contrast',lyrics:'readable'},
  build:{camera:'sweep',stage:'geometry',avatars:'footwork',lights:'contrast',lyrics:'readable'},
  peak:{camera:'wide',stage:'geometry',avatars:'ensemble',lights:'contrast',lyrics:'readable'},
  breather:STILL},
 hardstyle:{
  focus:{camera:'tracking',stage:'festival',avatars:'footwork',lights:'soft',lyrics:'readable'},
  build:{camera:'sweep',stage:'festival',avatars:'ensemble',lights:'broad',lyrics:'readable'},
  peak:{camera:'wide',stage:'festival',avatars:'ensemble',lights:'broad',lyrics:'readable'},
  breather:STILL},
 deutschrock:{
  focus:{camera:'tracking',stage:'arena',avatars:'frontline',lights:'warm',lyrics:'foreground'},
  build:{camera:'sweep',stage:'arena',avatars:'frontline',lights:'warm',lyrics:'foreground'},
  peak:{camera:'wide',stage:'arena',avatars:'ensemble',lights:'broad',lyrics:'foreground'},
  breather:STILL},
 other:{
  focus:{camera:'close',stage:'cinematic',avatars:'hold',lights:'soft',lyrics:'readable'},
  build:{camera:'tracking',stage:'minimal',avatars:'hold',lights:'soft',lyrics:'readable'},
  peak:{camera:'wide',stage:'arena',avatars:'ensemble',lights:'broad',lyrics:'readable'},
  breather:STILL}
};
const adjustment:Record<GenreProfileV1021,number>={deutschrap:-.025,hardtekk:.065,
 hardstyle:.045,deutschrock:.015,other:0};
/** A visual proposal only; cannot schedule or dispatch a cue. */
export function planGenreConcertV1021(input:GenreConcertInputV1021):GenreConcertPlanV1021 {
 const profile=genreProfileV1021(input?.genre);
 const profileSource:GenreConcertPlanV1021['profileSource']=profile==='other'?'unclassified':'genre-hint';
 const story=buildConcertStoryV1020(input);
 const base={profile,profileSource,audioMeasured:story.measuredAudio};
 if(story.status!=='verified'||!story.current)
  return {...base,status:'unavailable',reason:story.reason,source:'unavailable',
   acts:[],current:null,next:null};
 const acts=story.acts.slice(0,MAX_GENRE_ACTS_V1021).map(act=>{
  const kind=act.phase==='breather'?'breather':act.phase==='build'?'build':
   act.phase==='peak'||act.phase==='finale'?'peak':'focus';
  const look= input.reducedMotion?STILL:{...LOOKS[profile][kind]};
  // Readable lyrics and reduced-motion accessibility trump genre spectacle.
  if(input.lyricsProtected&&!input.reducedMotion){
   look.camera='steady';look.stage='minimal';look.lights='soft';look.lyrics='foreground';
  }
  const energy:GenreEnergyV1021=act.phase==='breather'?'rest':
   act.phase==='opening'?'intimate':
   act.phase==='peak'||act.phase==='finale'?'anthem':'drive';
  const intensity=input.reducedMotion?Math.min(act.intendedIntensity,.5):
   clamp(act.intendedIntensity+(act.phase==='breather'||act.phase==='opening'?0:adjustment[profile]));
  return {ordinal:act.ordinal,actIndex:act.actIndex,phase:act.phase,
   startMs:act.startMs,endMs:act.endMs,energy,
   plannedIntensity:Number(intensity.toFixed(3)),look};
 });
 const current=acts[story.currentOrdinal??-1]??null;
 const next=story.nextOrdinal===null?null:acts[story.nextOrdinal]??null;
 return {...base,status:'verified',reason:'verified-story',source:'verified-v604',
  acts,current,next};
}
