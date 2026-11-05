/** V983 Song Intelligence: creative interpretations from supplied metadata only.
 * No audio, lyrics, stems or Spotify audio features are accessed by this module.
 * Sections are untimed design hypotheses, never confirmed musical events.
 */
import {normalizeImmersivePlanV982,type ImmersivePlanV982,type ImmersiveSectionV982,
 type ImmersiveLookV982,type ImmersivePaletteV982} from './immersiveAiDirectorV982';

const PHASES:readonly ImmersiveSectionV982[]=['intro','verse','hook','drop','finale'];
const MOODS=['dark','energetic','anthemic','dreamy','warm','neutral'] as const;
export type SongMoodV983=typeof MOODS[number];
export interface SongContextV983 {title:string;artist:string;genre:string;durationMs:number}
export interface SongPhaseV983 {section:ImmersiveSectionV982;energy:number;idea:string}
export interface SongInsightV983 {
 mood:SongMoodV983;genreHint:string;direction:string;explanation:string;
 phases:SongPhaseV983[];
 /** These fixed fields are added by our validator, not supplied by the AI. */
 basis:'metadata-only';confidence:'creative-estimate';measuredBpm:null;verifiedSectionTimes:null;
}
const clean=(v:unknown,max:number)=>typeof v==='string' ? v.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max):'';
const value=(v:unknown)=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=75?v:null;
export function normalizeSongContextV983(raw:unknown):SongContextV983|null {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Record<string,unknown>;
 if([r.title,r.artist,r.genre].some(x=>typeof x!=='string'||/[\u0000-\u001f\u007f]/.test(x)))return null;
 const title=clean(r.title,120),artist=clean(r.artist,120),genre=clean(r.genre,80);
 if(!title||!artist||title.length!==(r.title as string).trim().length||
  artist.length!==(r.artist as string).trim().length||genre.length!==(r.genre as string).trim().length)return null;
 const durationMs=r.durationMs;
 if(typeof durationMs!=='number'||!Number.isInteger(durationMs)||durationMs<15000||durationMs>3600000)return null;
 return {title,artist,genre,durationMs};
}
export function normalizeSongInsightV983(raw:unknown):SongInsightV983|null {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Record<string,unknown>;
 if(typeof r.mood!=='string'||!MOODS.includes(r.mood as SongMoodV983))return null;
 const genreHint=clean(r.genreHint,65),direction=clean(r.direction,90),explanation=clean(r.explanation,280);
 if(!genreHint||!direction||!explanation||!Array.isArray(r.phases)||r.phases.length!==5)return null;
 const phases:SongPhaseV983[]=[];
 for(let i=0;i<PHASES.length;i++){
  const p=r.phases[i];if(!p||typeof p!=='object'||Array.isArray(p))return null;
  const entry=p as Record<string,unknown>;
  const energy=value(entry.energy),idea=clean(entry.idea,150);
  if(entry.section!==PHASES[i]||energy===null||!idea)return null;
  phases.push({section:PHASES[i],energy,idea});
 }
 return {mood:r.mood as SongMoodV983,genreHint,direction,explanation,phases,
  basis:'metadata-only',confidence:'creative-estimate',measuredBpm:null,verifiedSectionTimes:null};
}
/** Deterministic offline proposal. Genre is user-provided; title/artist are not acoustically analyzed. */
export function localSongInsightV983(context:SongContextV983):SongInsightV983 {
 const q=context.genre.toLocaleLowerCase();
 const hard=/hardtekk|hardstyle|techno|rave|trance/.test(q);
 const rock=/rock|metal|industrial|ndh/.test(q);
 const rap=/rap|hip.?hop|trap|drill/.test(q);
 const quiet=/ambient|ballade|acoustic|chill|klassik|classical/.test(q);
 const mood:SongMoodV983=hard?'energetic':rock?'anthemic':rap?'dark':quiet?'dreamy':'neutral';
 const basis=hard?[32,46,57,67,54]:rock?[29,43,58,57,66]:rap?[24,42,55,57,49]:quiet?[15,23,31,30,37]:[23,36,47,51,48];
 return {mood,genreHint:context.genre||'Nicht angegeben',direction:
  hard?'Neon-Reaktor':rock?'Arena-Inszenierung':rap?'Cinematic Noir':quiet?'Schwebender Lichtbogen':'Prismatische Konzertbühne',
  explanation:'Lokale, regelbasierte Idee nur aus Titel, Künstler, Dauer und Genre. Stimmung und Abschnitte sind nicht durch Audioanalyse bestätigt.',
  phases:PHASES.map((section,i)=>({section,energy:basis[i],idea:[
   'Sanftes räumliches Intro als Gestaltungsidee.',
   'Künstler, Gesang und Lyrics im Mittelpunkt halten.',
   'Licht und virtuelle LED-Wand zur möglichen Hook öffnen.',
   'Optionaler Akzent nur bei tatsächlich bestätigtem Drop.',
   'Großes, kontrolliertes Schlussbild mit sanftem Ausklang.'
  ][i]})),basis:'metadata-only',confidence:'creative-estimate',measuredBpm:null,verifiedSectionTimes:null};
}
/** Translate a proposal into existing virtual-only V982 settings; no hardware and no timeline writes. */
export function immersivePlanFromInsightV983(insight:SongInsightV983):ImmersivePlanV982|null {
 const normalized=normalizeSongInsightV983(insight);if(!normalized)return null;
 const mood=normalized.mood;
 const look:ImmersiveLookV982=mood==='energetic'?'reactor':mood==='anthemic'?'rock-arena':mood==='dark'?'noir':'prism';
 const palette:ImmersivePaletteV982=mood==='energetic'?'electric':mood==='anthemic'?'arena':mood==='dark'?'noir':'dream';
 const peak=Math.max(...normalized.phases.map(x=>x.energy));
 return normalizeImmersivePlanV982({title:normalized.direction,
  explanation:`V983 Song-Idee (nur Metadaten): ${normalized.explanation}`,
  look,palette,pace:peak>=60?'festival':peak<=35?'gentle':'cinematic',
  atmosphereIntensity:Math.min(65,Math.round(peak)),stageIntensity:Math.min(65,Math.round(peak)),
  fxIntensity:Math.min(45,Math.round(peak*.6)),
  scenes:normalized.phases.map(x=>({section:x.section,description:x.idea}))});
}
