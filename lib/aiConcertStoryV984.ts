/** V984 – AI Concert Story Director.
 * Creative, untimed dramaturgy: metadata is not audio analysis. Never produces
 * timestamps, confirmed drops, hardware commands, or automatic effect triggers.
 */
import {normalizeSongInsightV983,immersivePlanFromInsightV983,
 type SongInsightV983} from './aiSongIntelligenceV983';
import {normalizeImmersivePlanV982,type ImmersivePlanV982,
 type ImmersiveSectionV982} from './immersiveAiDirectorV982';

export type ConcertStoryStyleV984='cinematic'|'festival'|'intimate';
export const STORY_STYLES_V984:readonly ConcertStoryStyleV984[]=['cinematic','festival','intimate'];
const SECTIONS:readonly ImmersiveSectionV982[]=['intro','verse','hook','drop','finale'];
export interface StoryActV984 {
 section:ImmersiveSectionV982; title:string; energy:number;
 direction:string; camera:string; transition:string;
}
export interface ConcertStoryV984 {
 title:string; motif:string; arcDescription:string; acts:StoryActV984[];
 /** Synthesized locally, never trusted from the model. */
 basis:'metadata-only'; confidence:'creative-estimate'; verifiedTiming:null;
}
const clean=(v:unknown,max:number)=>typeof v==='string'
 ? v.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max):'';
const validText=(v:unknown,max:number)=>{
 const s=clean(v,max);
 // Discourage fabricated audio evidence and real-world control instructions.
 if(!s||/\b\d{1,3}\s*(?:bpm|sekunden|seconds|sek\.?|minuten)\b/i.test(s)||
  /\b\d{1,2}:\d{2}\b/.test(s))return '';
 return s;
};
export function normalizeConcertStoryV984(raw:unknown):ConcertStoryV984|null {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Record<string,unknown>;
 const title=validText(r.title,80),motif=validText(r.motif,65),
  arcDescription=validText(r.arcDescription,260);
 if(!title||!motif||!arcDescription||!Array.isArray(r.acts)||r.acts.length!==5)return null;
 const acts:StoryActV984[]=[];
 for(let i=0;i<5;i++){
  const rawAct=r.acts[i];
  if(!rawAct||typeof rawAct!=='object'||Array.isArray(rawAct))return null;
  const act=rawAct as Record<string,unknown>;
  const energy=act.energy;
  if(act.section!==SECTIONS[i]||typeof energy!=='number'||!Number.isInteger(energy)||
   energy<0||energy>75)return null;
  const actTitle=validText(act.title,68),direction=validText(act.direction,150),
   camera=validText(act.camera,95),transition=validText(act.transition,125);
  if(!actTitle||!direction||!camera||!transition)return null;
  acts.push({section:SECTIONS[i],title:actTitle,energy,direction,camera,transition});
 }
 const energies=acts.map(a=>a.energy);
 // Reject flat or implausibly abrupt narratives. Intensity is a design target.
 if(Math.max(...energies)-Math.min(...energies)<8||
  energies.some((e,i)=>i>0&&Math.abs(e-energies[i-1])>45))return null;
 return {title,motif,arcDescription,acts,basis:'metadata-only',
  confidence:'creative-estimate',verifiedTiming:null};
}
export function normalizeStoryInputV984(raw:unknown):{insight:SongInsightV983;style:ConcertStoryStyleV984}|null {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const data=raw as Record<string,unknown>;
 if(!STORY_STYLES_V984.includes(data.style as ConcertStoryStyleV984))return null;
 const insight=normalizeSongInsightV983(data.insight);
 if(!insight)return null;
 return {insight,style:data.style as ConcertStoryStyleV984};
}
/** Offline narrative deliberately uses only V983 ideas, no inferred timestamps. */
export function localConcertStoryV984(insight:SongInsightV983,style:ConcertStoryStyleV984):ConcertStoryV984 {
 const checked=normalizeSongInsightV983(insight);
 const data=checked??normalizeSongInsightV983({mood:'neutral',genreHint:'Unbekannt',
  direction:'Prismatische Bühne',explanation:'Metadaten-basierter Entwurf',
  phases:SECTIONS.map((section,i)=>({section,energy:[22,35,43,51,36][i],idea:'Virtuelle Konzertgestaltung'}))})!;
 const actualStyle=STORY_STYLES_V984.includes(style)?style:'cinematic';
 const modes={cinematic:{label:'Filmische Reise',levels:[21,35,49,64,40],
  camera:['Langsame Totale','Ruhiges Tracking','Wechsel auf die Künstler','Weite Hero-Perspektive','Sanfter Rückzug'],
  links:['Licht aus dem Dunkel aufbauen','Einzelne Lichtakzente verbinden','Weichen Crossfade vorbereiten','Weite Bühne kontrolliert öffnen','Licht und Partikel weich ausklingen']},
 festival:{label:'Festival-Eskalation',levels:[29,43,58,71,48],
  camera:['Weite Bühnenaufnahme','Bewegte Halbtotalen','Dynamische Frontperspektive','Weite Arena-Perspektive','Langsamer Ausklang'],
  links:['Neon-Grundmotiv aufgreifen','Stufenweise LED-Flächen ergänzen','Virtuelle Farben vorsichtig steigern','Großer virtueller Höhepunkt','Zurück zur Ausgangspalette']},
 intimate:{label:'Intime Lichtgeschichte',levels:[15,25,38,48,28],
  camera:['Ruhige Nahaufnahme','Künstlerfokus','Sanfte Seitentotale','Warme Bühnenöffnung','Ruhiges Schlussbild'],
  links:['Ein Spotlight behutsam öffnen','Licht und Text lesbar halten','Atmosphäre in Schichten erweitern','Ohne Blitz einen Höhepunkt setzen','Licht weich zurückführen']}}[actualStyle];
 const motif=data.mood==='dark'?'Schatten und Lichtkanten':data.mood==='energetic'?'Elektrische Lichtlinien':
  data.mood==='anthemic'?'Warme Arena-Bögen':data.mood==='dreamy'?'Schwebende Lichtbögen':
  data.mood==='warm'?'Goldene Lichtinseln':'Prismatische Lichtflächen';
 const labels=['Prolog','Fokus','Öffnung','Höhepunkt','Epilog'];
 const acts=SECTIONS.map((section,i)=>({section,title:labels[i],
  energy:Math.max(0,Math.min(75,Math.round(modes.levels[i]*.75+data.phases[i].energy*.25))),
  direction:`${motif}: ${data.phases[i].idea}`,camera:modes.camera[i],transition:modes.links[i]}));
 return normalizeConcertStoryV984({title:modes.label+' · '+data.direction,
  motif,arcDescription:'Fünf aufeinander abgestimmte virtuelle Szenen. Ein visuelles Leitmotiv verbindet Anfang, Aufbau, Höhepunkt und Ausklang. Keine Songstruktur oder Zeiten wurden nachgewiesen.',acts})!;
}
/** Approved story maps only to V982's existing virtual settings. Not a scheduler. */
export function immersivePlanFromStoryV984(story:ConcertStoryV984,
 insight:SongInsightV983):ImmersivePlanV982|null {
 const verified=normalizeConcertStoryV984(story);
 const base=immersivePlanFromInsightV983(insight);
 if(!verified||!base)return null;
 const peak=Math.max(...verified.acts.map(a=>a.energy));
 return normalizeImmersivePlanV982({...base,title:verified.title,
  explanation:`V984 Regieentwurf (ohne Timing): ${verified.arcDescription}`,
  stageIntensity:Math.min(base.stageIntensity,peak,65),
  atmosphereIntensity:Math.min(base.atmosphereIntensity,peak,65),
  fxIntensity:Math.min(base.fxIntensity,Math.round(peak*.55),40),
  scenes:verified.acts.map(a=>({section:a.section,
   description:`${a.title}: ${a.direction} | Übergang: ${a.transition}`}))});
}
