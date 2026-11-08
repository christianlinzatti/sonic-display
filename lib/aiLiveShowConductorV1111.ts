/** V1111 · AI Live Show Conductor: deterministic cue coordination for the existing
 * V1040 live 360° timeline. A validated seven-act rehearsal plan is previewed
 * first; only the existing explicit V1106 apply action can save it. No live
 * AI loop, microphone permission, network, hardware I/O, audio or side effects.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowPlanV1040,
 type ArenaShowCameraV1040,type ArenaShowDanceV1040,
 type ArenaShowDeckV1040,type ArenaShowFloatV1040,type ArenaShowLaserV1040}
 from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,
 type AiShowRemixV1106,type RemixActV1106} from './arena360AiShowRemixV1106';

export const CONDUCTOR_MODES_V1111=['cinematic','festival','balanced'] as const;
export type ConductorModeV1111=typeof CONDUCTOR_MODES_V1111[number];
export type ConductorOptionsV1111={mode:ConductorModeV1111;intensityCap:number;surprise:boolean};
export type ConductorMomentV1111='opening'|'focus'|'buildup'|'ensemble'|'breath'|'return'|'finale';
export type ConductorCueV1111={index:number;scene:RemixActV1106['scene'];start:number;end:number;
 moment:ConductorMomentV1111;description:string;camera:ArenaShowCameraV1040;dance:ArenaShowDanceV1040;
 deck:ArenaShowDeckV1040;floating:ArenaShowFloatV1040;lasers:ArenaShowLaserV1040;intensity:number};
export type ConductorQualityV1111={synchronizedActs:number;cameraVariety:number;quietContrast:boolean;
 controlledFinale:boolean;safeTransitions:boolean;continuousTimeline:boolean};
export type ConductorShowV1111={mode:ConductorModeV1111;remix:AiShowRemixV1106;
 cues:ConductorCueV1111[];quality:ConductorQualityV1111};
const NAMES:readonly {moment:ConductorMomentV1111;description:string}[]=[
 {moment:'opening',description:'Weite Totale, langsame Plattform und reduzierte Laser.'},
 {moment:'focus',description:'Lead-Avatar und Lyrics im Fokus; ruhiger Kameraschnitt.'},
 {moment:'buildup',description:'Kamera-Orbit, steigende Bühne und spiralförmige Laser zusammenführen.'},
 {moment:'ensemble',description:'Ensemble-Kamera, Gruppentanz und Bühne gemeinsam öffnen.'},
 {moment:'breath',description:'Bewusste Ruhe: weniger Bewegung, Laser zurücknehmen.'},
 {moment:'return',description:'Künstler kehrt zurück; neuer Blickwinkel als Vorbereitung.'},
 {moment:'finale',description:'360°-Totale und Ensemble zum geplanten Finale zusammenführen.'},
];
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const levels:Record<ConductorModeV1111,readonly number[]>={
 cinematic:[.28,.48,.62,.82,.23,.67,.98],
 festival:[.37,.53,.75,.92,.32,.75,1],
 balanced:[.33,.51,.68,.86,.28,.68,.97],
};
/** Reject malformed options explicitly, including untrusted remote model values. */
export function normalizeConductorOptionsV1111(raw:unknown):ConductorOptionsV1111|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const x=raw as Record<string,unknown>;
 if(!CONDUCTOR_MODES_V1111.includes(x.mode as ConductorModeV1111)||
  typeof x.intensityCap!=='number'||!Number.isInteger(x.intensityCap)||
  x.intensityCap<30||x.intensityCap>85||typeof x.surprise!=='boolean')return null;
 return {mode:x.mode as ConductorModeV1111,intensityCap:x.intensityCap,surprise:x.surprise};
}
/** One musical intent drives ALL five existing, typed V1040 visual controls.
 * This is a template across the authored timeline, not real-time audio onset
 * detection. No extra Govee, pyro, strobe, hardware or 3D effect controls.
 */
export function conductAiShowV1111(planRaw:unknown,remixRaw:unknown,optionsRaw:unknown):ConductorShowV1111|null{
 const plan=normalizeArenaShowPlanV1040(planRaw),remix=normalizeAiShowRemixV1106(remixRaw);
 const options=normalizeConductorOptionsV1111(optionsRaw);
 if(!plan||!remix||!options||plan.segments.length!==remix.acts.length||
  plan.segments.some((s,i)=>s.scene!==remix.acts[i].scene)||
  remix.acts.some(a=>a.intensity>options.intensityCap))return null;
 const cap=options.intensityCap,mode=options.mode;
 const result:RemixActV1106[]=remix.acts.map((original,i)=>{
  const quiet=i===0||i===4,peak=i===3||i===6;
  const target=clamp(Math.round(cap*levels[mode][i]*.75+original.intensity*.25),0,cap);
  const intensity=quiet?Math.min(target,Math.round(cap*(i===4?.38:.49))):
   i===6?Math.max(target,Math.round(cap*.88)):target;
  const camera:ArenaShowCameraV1040=i===1?'lead':i===2?'orbit':peak?'group':
   i===5?(options.surprise?'orbit':'lead'):'wide';
  const dance:ArenaShowDanceV1040=quiet?'calm':i===3?'group':i===6?'peak':'groove';
  const deck:ArenaShowDeckV1040=quiet?'halo':peak?'fan':i===2||i===5?'spiral':
   mode==='festival'?'fan':'halo';
  const floating:ArenaShowFloatV1040=quiet?'wave':i===2?'orbit':peak?'rise':
   mode==='cinematic'&&i===5?'rise':'orbit';
  const lasers:ArenaShowLaserV1040=quiet?'halo':i===2?'spiral':peak?'tunnel':
   mode==='balanced'?'halo':'spiral';
  const note=(original.note+' V1111 Regie: '+NAMES[i].description).slice(0,145);
  return {...original,intensity,camera,dance,deck,floating,lasers,note};
 });
 // At most 45 intensity points between consecutive authored scenes.
 for(let i=1;i<result.length;i++)result[i].intensity=Math.min(result[i].intensity,result[i-1].intensity+45);
 for(let i=result.length-2;i>=0;i--)result[i].intensity=Math.min(result[i].intensity,result[i+1].intensity+45);
 const safe=normalizeAiShowRemixV1106({...remix,acts:result,
  explanation:('V1111 Live Show Conductor: alle virtuellen Show-Cues koordiniert. Offline-Probe mit vorhandener Song-Timeline, keine Audio-Sektionserkennung. '+remix.explanation).slice(0,300)});
 if(!safe||!applyAiShowRemixV1106(plan,safe,cap))return null;
 const cues:ConductorCueV1111[]=safe.acts.map((a,i)=>({index:i,scene:a.scene,
  start:plan.segments[i].start,end:plan.segments[i].end,...NAMES[i],
  camera:a.camera,dance:a.dance,deck:a.deck,floating:a.floating,lasers:a.lasers,intensity:a.intensity}));
 const strengths=safe.acts.map(a=>a.intensity);
 const quality:ConductorQualityV1111={
  synchronizedActs:cues.length,
  cameraVariety:new Set(cues.map(c=>c.camera)).size,
  quietContrast:cues[4].intensity<cues[3].intensity&&cues[0].dance==='calm'&&cues[4].dance==='calm',
  controlledFinale:cues[6].intensity>=Math.round(cap*.75)&&cues[6].camera==='group'&&cues[6].dance==='peak',
  safeTransitions:strengths.every((v,i)=>i===0||Math.abs(v-strengths[i-1])<=45),
  continuousTimeline:cues[0].start===0&&cues.at(-1)?.end===1&&
   cues.every((c,i)=>i===0||c.start===cues[i-1].end),
 };
 if(!quality.continuousTimeline||!quality.safeTransitions||!quality.quietContrast||!quality.controlledFinale)return null;
 return {mode,remix:safe,cues,quality};
}
/** Read-only cue sheet at any rehearsal percentage, or the actual Spotify
 * progress fraction when the user expressly enables follow mode. Never
 * writes preferences or drives real lights, avatars or devices itself.
 */
export function sampleConductorCueV1111(raw:ConductorShowV1111|null,progress:unknown):ConductorCueV1111|null{
 if(!raw||!Array.isArray(raw.cues)||raw.cues.length!==7||
  typeof progress!=='number'||!Number.isFinite(progress)||progress<0||progress>1)return null;
 const index=raw.cues.findIndex(c=>progress<c.end);
 return raw.cues[index<0?raw.cues.length-1:index]||null;
}
