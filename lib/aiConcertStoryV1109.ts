/** V1109 · Concert Story Engine: a local, deterministic seven-act narrative.
 * Uses existing validated show fields, never guesses live song sections, never
 * changes user-authored times and never drives Govee, strobes, pyro or audio.
 */
import {normalizeAiShowRemixV1106,type AiShowRemixV1106,type RemixActV1106} from './arena360AiShowRemixV1106';
import {normalizeArenaShowPlanV1040,type ArenaShowPlanV1040} from './arena360ShowDesignerV1040';

export const STORY_ARCS_V1109=['crescendo','waves','mystery','anthem'] as const;
export const STORY_PACING_V1109=['balanced','slow-burn','early-energy'] as const;
export type ConcertStoryArcV1109=typeof STORY_ARCS_V1109[number];
export type ConcertStoryPacingV1109=typeof STORY_PACING_V1109[number];
export type ConcertStoryOptionsV1109={arc:ConcertStoryArcV1109;pacing:ConcertStoryPacingV1109;intensityCap:number};
export type ConcertStoryBeatV1109={scene:RemixActV1106['scene'];index:number;start:number;end:number;
 title:string;description:string;intensity:number;camera:RemixActV1106['camera'];dance:RemixActV1106['dance']};
export type ConcertStoryQualityV1109={quietMoments:number;cameraVariety:number;stageVariety:number;
 dramaticRange:number;finaleIsClimax:boolean;safeTransitions:boolean;continuousTimeline:boolean};
export type ConcertStoryResultV1109={arc:ConcertStoryArcV1109;pacing:ConcertStoryPacingV1109;
 remix:AiShowRemixV1106;beats:ConcertStoryBeatV1109[];quality:ConcertStoryQualityV1109};

const ARC_LABELS:Record<ConcertStoryArcV1109,string>={
 crescendo:'Vom Schatten zum großen Finale',waves:'Zwei Wellen mit Atempause',
 mystery:'Rätsel, Enthüllung und Finale',anthem:'Festivalhymne mit Arena-Höhepunkten'
};
export const STORY_ARC_LABELS_V1109=ARC_LABELS;
const ENERGY:Record<ConcertStoryArcV1109,readonly number[]>={
 crescendo:[.22,.38,.53,.70,.27,.63,1],
 waves:[.30,.52,.66,.88,.29,.63,.97],
 mystery:[.19,.32,.55,.73,.18,.62,.94],
 anthem:[.36,.53,.67,.87,.35,.73,1]
};
const BEATS=[
 ['Vorhang','Ein bewusster Einstieg mit Raum zum Entdecken.'],
 ['Künstler im Fokus','Die Performance erzählt den ersten Teil der Geschichte.'],
 ['Erwartung','Kamera und Bühne bauen auf den nächsten Höhepunkt hin.'],
 ['Erste Entladung','Breite Perspektive und Ensemble für den geplanten Höhepunkt.'],
 ['Atempause','Ein Kontrast schafft Luft für den nächsten Moment.'],
 ['Überraschende Rückkehr','Neue Perspektiven kündigen das Finale an.'],
 ['Finale','Die gesamte 360°-Bühne findet zu einem gemeinsamen Abschluss.'],
] as const;
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

/** Reject all malformed settings instead of silently accepting high intensities. */
export function normalizeConcertStoryOptionsV1109(value:unknown):ConcertStoryOptionsV1109|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const raw=value as Record<string,unknown>;
 if(!STORY_ARCS_V1109.includes(raw.arc as ConcertStoryArcV1109)||
  !STORY_PACING_V1109.includes(raw.pacing as ConcertStoryPacingV1109)||
  typeof raw.intensityCap!=='number'||!Number.isInteger(raw.intensityCap)||
  raw.intensityCap<30||raw.intensityCap>85)return null;
 return {arc:raw.arc as ConcertStoryArcV1109,pacing:raw.pacing as ConcertStoryPacingV1109,
  intensityCap:raw.intensityCap};
}
/** Compose purely local scene cues. An existing user-authored timing plan is
 * examined but NEVER modified; narrative timing is shown only in the preview.
 * Original AI suggestions are validated BEFORE touching their fields.
 */
export function composeConcertStoryV1109(planRaw:unknown,remixRaw:unknown,optionsRaw:unknown):ConcertStoryResultV1109|null{
 const plan=normalizeArenaShowPlanV1040(planRaw),proposal=normalizeAiShowRemixV1106(remixRaw);
 const opts=normalizeConcertStoryOptionsV1109(optionsRaw);
 if(!plan||!proposal||!opts||plan.segments.length!==proposal.acts.length)return null;
 // The provided plan must line up exactly with the validated seven-act story.
 if(plan.segments.some((segment,i)=>segment.scene!==proposal.acts[i].scene))return null;
 const cap=opts.intensityCap;
 const peaks=ENERGY[opts.arc];
 const result:RemixActV1106[]=proposal.acts.map((old,i)=>{
  const quiet=i===0||i===4,showPeak=i===3||i===6;
  const pace=opts.pacing==='slow-burn'?(i<3?-.09:i===6?.04:0):
   opts.pacing==='early-energy'?(i===1||i===2?.09:i===6?-.02:0):0;
  const level=clamp(peaks[i]+pace,.08,1);
  // Preserve a little of the model's validated intent, but create a genuine
  // long-form dynamic curve independent of single bass kicks.
  const modelWeight=opts.arc==='mystery'?.14:.22;
  let intensity=Math.round(clamp(level*cap*(1-modelWeight)+Math.min(cap,old.intensity)*modelWeight,0,cap));
  if(quiet)intensity=Math.min(intensity,Math.round(cap*(i===4?.46:.53)));
  if(i===6)intensity=Math.max(intensity,Math.round(cap*.82));
  const camera:RemixActV1106['camera']=quiet?'wide':showPeak?'group':i===1?'lead':i===2?'orbit':
   opts.arc==='mystery'?'lead':old.camera;
  const dance:RemixActV1106['dance']=quiet?'calm':i===6?'peak':i===3?'group':old.dance;
  const deck:RemixActV1106['deck']=quiet?'halo':showPeak?'fan':i===2?'spiral':old.deck;
  const floating:RemixActV1106['floating']=quiet?'wave':i===6?'rise':i===2?'orbit':old.floating;
  const lasers:RemixActV1106['lasers']=quiet?'halo':showPeak?'tunnel':i===2?'spiral':old.lasers;
  const note=('Story: '+BEATS[i][1]+' '+(opts.arc==='mystery'&&i===5?
   'Die Perspektive wechselt vor der Enthüllung.':'' )).trim().slice(0,145);
  return {...old,intensity,camera,dance,deck,floating,lasers,note};
 });
 // No abrupt programmed light/intensity jump even with a small user cap.
 for(let i=1;i<result.length;i++)result[i].intensity=Math.min(result[i].intensity,result[i-1].intensity+45);
 for(let i=result.length-2;i>=0;i--)result[i].intensity=Math.min(result[i].intensity,result[i+1].intensity+45);
 const remix=normalizeAiShowRemixV1106({...proposal,acts:result,
  explanation:('V1109 Story Engine: '+ARC_LABELS[opts.arc]+'. Lokaler dramaturgischer Entwurf, keine erkannten Songabschnitte. '+proposal.explanation).slice(0,300)});
 if(!remix)return null;
 const beats:ConcertStoryBeatV1109[]=remix.acts.map((act,i)=>({
  scene:act.scene,index:i,start:plan.segments[i].start,end:plan.segments[i].end,
  title:BEATS[i][0],description:BEATS[i][1],intensity:act.intensity,
  camera:act.camera,dance:act.dance,
 }));
 const levels=remix.acts.map(act=>act.intensity);
 const quality:ConcertStoryQualityV1109={
  quietMoments:levels.filter((level,i)=>(i===0||i===4)&&level<=Math.round(cap*.55)).length,
  cameraVariety:new Set(remix.acts.map(a=>a.camera)).size,
  stageVariety:new Set(remix.acts.map(a=>a.deck+'-'+a.floating)).size,
  dramaticRange:Math.max(...levels)-Math.min(...levels),
  finaleIsClimax:levels[6]>=Math.max(...levels),
  safeTransitions:levels.every((v,i)=>i===0||Math.abs(v-levels[i-1])<=45),
  continuousTimeline:plan.segments[0].start===0&&plan.segments[6].end===1&&
   plan.segments.every((segment,i)=>i===0||segment.start===plan.segments[i-1].end),
 };
 // Strictly validate the final story itself; never return partial instructions.
 if(!quality.safeTransitions||!quality.continuousTimeline||!remix.acts.every(a=>a.intensity<=cap))return null;
 return {arc:opts.arc,pacing:opts.pacing,remix,beats,quality};
}
