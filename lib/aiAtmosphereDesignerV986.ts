/** V986 AI Atmosphere Designer – virtual, human-approved colour and lighting story.
 * A V984 storyboard is creative metadata-derived input, NOT measured audio.
 * No beat times, hardware commands, LED-wall rendering or Govee calls here.
 */
import {normalizeConcertStoryV984,immersivePlanFromStoryV984,
 type ConcertStoryV984} from './aiConcertStoryV984';
import {normalizeSongInsightV983,type SongInsightV983,type SongMoodV983} from './aiSongIntelligenceV983';
import {normalizeImmersivePlanV982,type ImmersivePlanV982,
 type ImmersivePaletteV982,type ImmersiveSectionV982} from './immersiveAiDirectorV982';

export type AtmosphereAccentV986='indigo'|'crimson'|'white'|'cyan'|'violet'|'magenta'|'amber'|'red';
export type AtmosphereLedV986='silhouette'|'soft-bars'|'rings'|'geometry'|'horizon';
export type AtmosphereTransitionV986='dissolve'|'soft-rise'|'sweep';
export interface AtmosphereActV986 {
 section:ImmersiveSectionV982;accent:AtmosphereAccentV986;
 haze:number;beams:number;virtualLight:number;
 led:AtmosphereLedV986;transition:AtmosphereTransitionV986;note:string;
}
export interface AtmospherePlanV986 {
 title:string;motif:string;description:string;palette:ImmersivePaletteV982;
 acts:AtmosphereActV986[];
 /** Trusted server/client normalization owns these guarantees. */
 basis:'creative-storyboard';verifiedTiming:null;physicalControl:false;
}
const SECTIONS:readonly ImmersiveSectionV982[]=['intro','verse','hook','drop','finale'];
const PALETTES:readonly ImmersivePaletteV982[]=['noir','electric','arena','dream'];
const LED:readonly AtmosphereLedV986[]=['silhouette','soft-bars','rings','geometry','horizon'];
const TRANSITIONS:readonly AtmosphereTransitionV986[]=['dissolve','soft-rise','sweep'];
const ACCENTS:Record<ImmersivePaletteV982,readonly AtmosphereAccentV986[]>={
 noir:['indigo','crimson','white'],electric:['cyan','violet','magenta'],
 arena:['amber','red','white'],dream:['violet','cyan','amber']};
export const ACCENT_HEX_V986:Readonly<Record<AtmosphereAccentV986,string>>={
 indigo:'#363c86',crimson:'#a73155',white:'#e1e2e6',cyan:'#26a5b9',
 violet:'#8060b8',magenta:'#a53596',amber:'#dc963f',red:'#b84b47'};
const clean=(value:unknown,max:number):string=>typeof value==='string'
 ? value.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max):'';
const allowed=<T extends string>(value:unknown,list:readonly T[]):value is T=>
 typeof value==='string'&&list.includes(value as T);
const whole=(v:unknown,max:number):v is number=>
 typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=max;
const misleading=(s:string)=>/\b\d{1,3}\s*(?:bpm|sekunden|seconds|minuten)\b|\b\d{1,2}:\d{2}\b/i.test(s);

export function normalizeAtmospherePlanV986(raw:unknown):AtmospherePlanV986|null {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Record<string,unknown>;
 if(!allowed(r.palette,PALETTES)||!Array.isArray(r.acts)||r.acts.length!==5)return null;
 const title=clean(r.title,76),motif=clean(r.motif,85),description=clean(r.description,240);
 if(!title||!motif||!description||[title,motif,description].some(misleading))return null;
 const acts:AtmosphereActV986[]=[];
 for(let i=0;i<5;i++){
  const item=r.acts[i];if(!item||typeof item!=='object'||Array.isArray(item))return null;
  const a=item as Record<string,unknown>;
  if(a.section!==SECTIONS[i]||!allowed(a.accent,ACCENTS[r.palette])||
   !whole(a.haze,35)||!whole(a.beams,55)||!whole(a.virtualLight,65)||
   !allowed(a.led,LED)||!allowed(a.transition,TRANSITIONS))return null;
  const note=clean(a.note,145);
  if(!note||misleading(note))return null;
  acts.push({section:SECTIONS[i],accent:a.accent,haze:a.haze,beams:a.beams,
   virtualLight:a.virtualLight,led:a.led,transition:a.transition,note});
 }
 // Visually related but not five indistinguishable stages; avoid uncontrolled jumps.
 const lights=acts.map(x=>x.virtualLight);
 if(Math.max(...lights)-Math.min(...lights)<8||
  lights.some((x,i)=>i>0&&Math.abs(x-lights[i-1])>40))return null;
 return {title,motif,description,palette:r.palette,acts,
  basis:'creative-storyboard',verifiedTiming:null,physicalControl:false};
}
export function normalizeAtmosphereInputV986(raw:unknown):{
 story:ConcertStoryV984;mood:SongMoodV983}|null {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Record<string,unknown>;
 const story=normalizeConcertStoryV984(r.story);
 const moods:readonly SongMoodV983[]=['dark','energetic','anthemic','dreamy','warm','neutral'];
 return story&&allowed(r.mood,moods)?{story,mood:r.mood}:null;
}
export function localAtmospherePlanV986(story:ConcertStoryV984,mood:SongMoodV983):AtmospherePlanV986|null {
 const normalized=normalizeConcertStoryV984(story);
 if(!normalized)return null;
 const palette:ImmersivePaletteV982=mood==='dark'?'noir':mood==='energetic'?'electric':
  mood==='anthemic'||mood==='warm'?'arena':'dream';
 const accents=ACCENTS[palette];
 const pattern:AtmosphereLedV986[]=['silhouette','soft-bars','rings','geometry','horizon'];
 const transitions:AtmosphereTransitionV986[]=['soft-rise','dissolve','sweep','soft-rise','dissolve'];
 const scenes=normalized.acts.map((act,i)=>({
  section:act.section,accent:accents[i===3?1:i===4?0:i%3],
  haze:Math.min(35,Math.round(act.energy*.38)),
  beams:Math.min(55,Math.round(act.energy*.72)),
  virtualLight:Math.min(65,Math.round(act.energy*.84)),
  led:pattern[i],transition:transitions[i],
  note:i===1?'Ruhige Silhouetten lassen Lyrics und Künstler sichtbar.':
   i===3?'Virtueller Höhepunkt ohne Blitz oder physische Lampenbefehle.':
   i===4?'Farben und Licht zur Ausgangsstimmung zurückführen.':
   `Visuelles Leitmotiv ${normalized.motif} behutsam weiterentwickeln.`
 }));
 const result={title:`${normalized.title} · Lichtwelt`,motif:normalized.motif,
  description:'Abgestimmte Farb- und Lichtfamilie für fünf kreative Akte; weder Songzeiten noch echte Lichtausgaben.',
  palette,acts:scenes};
 return normalizeAtmospherePlanV986(result);
}
/** Applies only V982's ALREADY ENABLED virtual controls, after the user's approval.
 * Per-act LED/haze/beams remain descriptive (not real wall/fog/hardware signals).
 */
export function immersivePlanFromAtmosphereV986(atmosphere:AtmospherePlanV986,
 story:ConcertStoryV984,insight:SongInsightV983):ImmersivePlanV982|null {
 const safe=normalizeAtmospherePlanV986(atmosphere);
 const checked=normalizeSongInsightV983(insight);
 const base=checked?immersivePlanFromStoryV984(story,checked):null;
 if(!safe||!base)return null;
 const peak=Math.max(...safe.acts.map(x=>x.virtualLight));
 return normalizeImmersivePlanV982({...base,palette:safe.palette,
  title:safe.title,
  explanation:`V986 virtuelle Lichtwelt (ohne bestätigte Zeitpunkte): ${safe.description}`,
  atmosphereIntensity:Math.min(65,base.atmosphereIntensity,peak),
  stageIntensity:Math.min(65,base.stageIntensity,peak),
  fxIntensity:Math.min(35,base.fxIntensity),
  scenes:safe.acts.map((x,i)=>({section:x.section,
   description:`${story.acts[i].title}: ${x.note} · LED-Idee: ${x.led} · Übergang: ${x.transition}`}))});
}
