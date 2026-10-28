/** V502: a playback-clock-only, genre-aware visual accent layer.
 * The source is the existing V318 timeline (imported labels or live estimates).
 * No beat/speaker inference, new request, clip, timers, persistence or GPU objects.
 */
import type {SongSectionV318} from '../../services/musicAnalysis/trackAnalysisV318';

export type ConcertGenreV502='deutschrap'|'hardstyle'|'hardtekk'|'rock'|'pop'|'other';
export type ConcertTierV502='low'|'balanced'|'high';
export interface ConcertDynamicsV502 {
  active:boolean;
  genre:ConcertGenreV502;
  section:SongSectionV318;
  source:'imported'|'live';
  /** Multipliers are accents, not absolute camera/dance/light commands. */
  dance:number;
  camera:number;
  lighting:number;
  /** Applied only to decorative lyric glow/background, not karaoke progress. */
  lyrics:number;
  /** Debug/status info: does not assert that a live section is authoritative. */
  evidence:'labeled'|'estimated'|'none';
}
export interface ConcertDynamicsInputV502 {
  trackId:string;
  progressMs:number;
  playing:boolean;
  enabled:boolean;
  reducedMotion:boolean;
  genre:string|null|undefined;
  section:SongSectionV318;
  source:'imported'|'live';
  hasSectionLabels:boolean;
  sectionStartMs:number|null;
  energy:number;
  kick:number;
  tier:ConcertTierV502;
  lyricFocus:boolean;
  lyricsVisible:boolean;
  manualDance:boolean;
  manualCamera:boolean;
  manualLighting:boolean;
  manualLyrics:boolean;
}
const clamp=(value:number, min:number, max:number)=>Number.isFinite(value)?Math.min(max,Math.max(min,value)):min;
const smooth=(value:number)=>{const t=clamp(value,0,1);return t*t*(3-2*t);};
const round=(value:number)=>Math.round(value*10000)/10000;
export function classifyConcertGenreV502(genre:string|null|undefined):ConcertGenreV502{
  const normalized=(genre??'').toLowerCase().replace(/[ _-]+/g,'');
  if(/hardtekk|hardtek|tekk|hardtekno/.test(normalized))return 'hardtekk';
  if(/hardstyle|rawstyle|hardcore|uptempo/.test(normalized))return 'hardstyle';
  if(/deutschrap|germanrap|hiphop|rap|trap|drill|grime|boombap/.test(normalized))return 'deutschrap';
  if(/rock|punk|metal|grunge|alternative/.test(normalized))return 'rock';
  if(/pop|synthpop|electropop|dancepop|kpop/.test(normalized))return 'pop';
  return 'other';
}
const sections:Record<ConcertGenreV502,Record<SongSectionV318,number>>={
  deutschrap:{verse:.50,hook:.88,build:.65,drop:.83,break:.16},
  hardstyle:{verse:.42,hook:.76,build:.68,drop:1,break:.09},
  hardtekk:{verse:.64,hook:.80,build:.73,drop:.96,break:.12},
  rock:{verse:.52,hook:.89,build:.69,drop:.81,break:.16},
  pop:{verse:.49,hook:.84,build:.63,drop:.76,break:.20},
  other:{verse:.5,hook:.5,build:.5,drop:.5,break:.5},
};
export function planSmartConcertDynamicsV502(input:ConcertDynamicsInputV502):ConcertDynamicsV502 {
  const genre=classifyConcertGenreV502(input.genre);
  const base:ConcertDynamicsV502={active:false,genre,section:input.section,source:input.source,
    dance:1,camera:1,lighting:1,lyrics:0,evidence:'none'};
  if(!input.trackId||!input.playing||!input.enabled||input.reducedMotion||genre==='other'||
    !Number.isFinite(input.progressMs)||input.progressMs<0||
    !Object.prototype.hasOwnProperty.call(sections[genre],input.section))return base;
  const labeled=input.source==='imported'&&input.hasSectionLabels&&
    input.sectionStartMs!==null&&Number.isFinite(input.sectionStartMs)&&
    input.sectionStartMs>=0&&input.progressMs>=input.sectionStartMs;
  // Existing live section detection is an estimate, not proof of Verse/Hook/Drop.
  const evidence=labeled?'labeled':'estimated';
  const evidenceGain=labeled?1:.40;
  const tierGain=input.tier==='low'?.32:input.tier==='balanced'?.68:1;
  const onset=labeled?smooth((input.progressMs-input.sectionStartMs!)/750):1;
  const gain=evidenceGain*tierGain*onset;
  const section=sections[genre][input.section];
  const energy=clamp(input.energy,0,1),kick=clamp(input.kick,0,1);
  // Energy enriches drops, but never creates one or invents structural timestamps.
  const rhythmic=.75+.18*energy+.07*kick;
  const drive=clamp((section-.5)*2,-1,1)*gain*rhythmic;
  const dance=input.manualDance?1:clamp(1+drive*.12,.88,1.12);
  const camera=input.manualCamera?1:clamp(1+drive*.095,.91,1.095);
  const lighting=input.manualLighting?1:clamp(1+drive*.11,.90,1.11);
  // When synchronized text is the priority, never brighten its backdrop aggressively.
  const lyricBase=input.lyricFocus?.055:.12;
  const lyrics=input.manualLyrics||!input.lyricsVisible||input.tier==='low'?0:
    clamp(Math.max(0,drive)*lyricBase,0,.12);
  return {active:true,genre,section:input.section,source:input.source,
    dance:round(dance),camera:round(camera),lighting:round(lighting),
    lyrics:round(lyrics),evidence};
}
/** Only acts on an already enabled system, never changes user switches. */
export function concertDynamicsPercentV502(value:number,multiplier:number):number {
  const base=clamp(value,0,100);
  return Math.round(clamp(base*clamp(multiplier,.88,1.12),0,100));
}
/** Works on normalized motion-ranking energy; never mutates authored clips. */
export function concertDynamicsEnergyV502(value:number,cue:ConcertDynamicsV502):number {
  return clamp(clamp(value,0,1)*cue.dance,0,1);
}
