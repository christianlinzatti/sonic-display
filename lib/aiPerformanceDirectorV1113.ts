/** V1113 · AI Performance Director.
 * Deterministic performer direction for the V1112 Stage Crew and approved
 * V1040 timeline. Three individual character gestures are REHEARSAL NOTES,
 * not nonexistent GLB animation clips. Only real shared camera/dance modes
 * are written to the normal opt-in V1106 preview; no device or network I/O.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowPlanV1040,
 type ArenaShowCameraV1040,type ArenaShowDanceV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,
 type AiShowRemixV1106,type RemixActV1106} from './arena360AiShowRemixV1106';
import {normalizeAvatarCastV1112,type AvatarPersonalityShowV1112,
 type AvatarPersonalityV1112,type AvatarPersonalityRoleV1112,
 type AvatarPersonalityCueV1112} from './aiAvatarPersonalityV1112';

export const PERFORMANCE_MODES_V1113=['natural','dynamic','cinematic'] as const;
export type PerformanceModeV1113=typeof PERFORMANCE_MODES_V1113[number];
export const PERFORMANCE_MODE_LABELS_V1113:Record<PerformanceModeV1113,string>={
 natural:'Natürlich & musikalisch',dynamic:'Energiegeladen & direkt',cinematic:'Filmisch & ausdrucksstark',
};
export type PerformanceDirectorOptionsV1113={mode:PerformanceModeV1113;expression:number;intensityCap:number};
export type PerformanceGestureV1113='head-nod'|'open-arms'|'callout'|'crowd-pump'|
 'arm-sweep'|'sharp-accent'|'footwork'|'silhouette'|'controlled-pause'|'group-hit';
export type PerformanceBeatV1113={id:string;label:string;personality:AvatarPersonalityV1112;
 role:AvatarPersonalityRoleV1112;energy:number;gesture:PerformanceGestureV1113;
 cue:string;spotlight:boolean};
export type PerformanceCueV1113={index:number;scene:RemixActV1106['scene'];start:number;end:number;
 focusId:string|null;camera:ArenaShowCameraV1040;dance:ArenaShowDanceV1040;
 intensity:number;performers:PerformanceBeatV1113[];moment:string};
export type PerformanceShowV1113={mode:PerformanceModeV1113;expression:number;
 remix:AiShowRemixV1106;cues:PerformanceCueV1113[];
 quality:{chapters:number;soloChapters:number;ensembleChapters:number;
 distinctGestures:number;characterEnergyChanges:boolean;continuousTimeline:boolean;
 safeTransitions:boolean;maxPerformerEnergy:number}};

export function normalizePerformanceOptionsV1113(raw:unknown):PerformanceDirectorOptionsV1113|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Record<string,unknown>;
 if(!PERFORMANCE_MODES_V1113.includes(r.mode as PerformanceModeV1113)||
  typeof r.expression!=='number'||!Number.isInteger(r.expression)||r.expression<20||r.expression>80||
  r.expression%10!==0||typeof r.intensityCap!=='number'||!Number.isInteger(r.intensityCap)||
  r.intensityCap<30||r.intensityCap>85)return null;
 return {mode:r.mode as PerformanceModeV1113,expression:r.expression,intensityCap:r.intensityCap};
}

const gestures:Record<AvatarPersonalityV1112,readonly [PerformanceGestureV1113,PerformanceGestureV1113,PerformanceGestureV1113]>={
 frontman:['head-nod','callout','open-arms'],
 hype:['crowd-pump','arm-sweep','group-hit'],
 precision:['footwork','sharp-accent','head-nod'],
 mystery:['silhouette','controlled-pause','arm-sweep'],
};
const gestureNotes:Record<PerformanceGestureV1113,string>={
 'head-nod':'Kopfnicken im Rhythmus', 'open-arms':'offene, breite Bühnenpose',
 'callout':'deutliche Akzente zur Phrase', 'crowd-pump':'mitreißende Armbewegung',
 'arm-sweep':'weiter Arm-Sweep', 'sharp-accent':'präziser Bewegungsakzent',
 'footwork':'betontes Footwork', 'silhouette':'ruhige Silhouettenpose',
 'controlled-pause':'bewusster Bewegungsstopp', 'group-hit':'gemeinsamer Bühnenakzent',
};
const roleScale:Record<AvatarPersonalityRoleV1112,number>={lead:1,support:.68,echo:.46,rest:.23};
const modeScale:Record<PerformanceModeV1113,number>={natural:.90,dynamic:1.12,cinematic:1};
const phaseScale=[.62,.82,1.02,1.13,.42,.91,1.16];

/** Validates the existing personality rehearsal before adding per-member intent.
 * Does not infer real audio beats or fabricate per-rig movement capabilities.
 */
export function directPerformanceV1113(baseRaw:unknown,personalityRaw:AvatarPersonalityShowV1112|null,
 optionsRaw:unknown):PerformanceShowV1113|null{
 const plan=normalizeArenaShowPlanV1040(baseRaw),opts=normalizePerformanceOptionsV1113(optionsRaw);
 const source=personalityRaw;
 const cast=normalizeAvatarCastV1112(source?.cast);
 const remix=normalizeAiShowRemixV1106(source?.remix);
 if(!plan||!opts||!source||!cast||!remix||!Array.isArray(source.cues)||source.cues.length!==7||
  plan.segments.length!==7||remix.acts.some(a=>a.intensity>opts.intensityCap))return null;
 for(let i=0;i<7;i++){
  const c=source.cues[i],s=plan.segments[i],a=remix.acts[i];
  if(!c||c.index!==i||c.scene!==s.scene||c.start!==s.start||c.end!==s.end||
   c.intensity!==a.intensity||c.camera!==a.camera||c.dance!==a.dance||
   !Array.isArray(c.performers)||c.performers.length!==3||
   (c.focusId!==null&&!cast.some(m=>m.id===c.focusId))||
   c.performers.some((m,j)=>m.id!==cast[j].id||m.personality!==cast[j].personality||
     !(['lead','support','echo','rest'] as string[]).includes(m.role)))return null;
 }
 // V1040 only provides group camera/dance cues: energy dynamics are mapped to
 // existing shared modes while individual gestures remain a visible score.
 const acts=remix.acts.map((a,i)=>{
  const quiet=i===0||i===4,ensemble=i===3||i===6;
  const mode=opts.mode;
  const dance:ArenaShowDanceV1040=quiet?'calm':i===3?'group':i===6?'peak':
   mode==='dynamic'&&a.intensity>=50&&(i===2||i===5)?'peak':a.dance;
  const camera:ArenaShowCameraV1040=quiet?'wide':ensemble?'group':
   mode==='cinematic'&&(i===2||i===5)?'orbit':
   mode==='dynamic'&&i===2?'orbit':a.camera;
  const note=(a.note+' V1113 '+(ensemble?'Ensemble':quiet?'Atempause':'Charakter-Fokus')+
   ' – '+PERFORMANCE_MODE_LABELS_V1113[mode]+'.').slice(0,145);
  return {...a,camera,dance,note};
 });
 const staged=normalizeAiShowRemixV1106({...remix,acts,
  explanation:('V1113 AI Performance Director: Sieben abgestimmte Szenen und individuelle Proben-Gestik; die Live-Engine verwendet vorhandene gemeinsame Tanz- und Kameramodi. '+remix.explanation).slice(0,300)});
 if(!staged||!applyAiShowRemixV1106(plan,staged,opts.intensityCap))return null;
 const cues:PerformanceCueV1113[]=source.cues.map((original,i)=>{
  const a=staged.acts[i];
  const performers=original.performers.map((member,j)=>{
   const persona=cast[j].personality;
   const quiet=i===0||i===4;
   const final=i===6;
   const gesture=quiet?(persona==='mystery'?'silhouette':'head-nod'):
    final?'group-hit':gestures[persona][(i+(opts.mode==='cinematic'?1:0))%3];
   const raw=a.intensity*phaseScale[i]*roleScale[member.role]*modeScale[opts.mode]*
    (.75+opts.expression/160);
   const energy=Math.min(opts.intensityCap,Math.max(0,Math.round(raw)));
   const spotlight=original.focusId===member.id||(final&&member.role==='lead');
   return {id:member.id,label:member.label,personality:persona,role:member.role,
    energy,gesture,cue:gestureNotes[gesture],spotlight};
  });
  return {index:i,scene:a.scene,start:original.start,end:original.end,
   focusId:original.focusId,camera:a.camera,dance:a.dance,intensity:a.intensity,
   performers,moment:i===0?'Einstieg':i===4?'Atempause':i===6?'Finale':
    i===3?'Ensemble-Höhepunkt':i===2?'Spannungsaufbau':'Künstler-Fokus'};
 });
 const energies=cues.flatMap(c=>c.performers.map(p=>p.energy));
 const quality={chapters:cues.length,soloChapters:cues.filter(c=>c.focusId!==null).length,
  ensembleChapters:cues.filter(c=>c.focusId===null).length,
  distinctGestures:new Set(cues.flatMap(c=>c.performers.map(p=>p.gesture))).size,
  characterEnergyChanges:cast.every(member=>new Set(cues.map(c=>c.performers.find(p=>p.id===member.id)?.energy)).size>=2),
  continuousTimeline:cues[0].start===0&&cues[6].end===1&&
   cues.every((c,i)=>i===0||c.start===cues[i-1].end),
  safeTransitions:cues.every((c,i)=>i===0||Math.abs(c.intensity-cues[i-1].intensity)<=45),
  maxPerformerEnergy:Math.max(...energies)};
 if(!quality.continuousTimeline||!quality.safeTransitions||!quality.characterEnergyChanges||
  quality.maxPerformerEnergy>opts.intensityCap)return null;
 return {mode:opts.mode,expression:opts.expression,remix:staged,cues,quality};
}

/** Keep V1112's preview aligned with the real shared timeline after V1113. */
export function syncPerformancePersonalityV1113(personality:AvatarPersonalityShowV1112|null,
 performance:PerformanceShowV1113|null):AvatarPersonalityShowV1112|null{
 if(!personality||!performance||personality.cues.length!==performance.cues.length)return null;
 const cues:AvatarPersonalityCueV1112[]=personality.cues.map((c,i)=>({...c,
  camera:performance.cues[i].camera,dance:performance.cues[i].dance,
  intensity:performance.cues[i].intensity}));
 return {...personality,remix:performance.remix,cues};
}

/** Read-only virtual progress for preview UI, never a playback action. */
export function samplePerformanceCueV1113(show:PerformanceShowV1113|null,
 progress:unknown):PerformanceCueV1113|null{
 if(!show||!Array.isArray(show.cues)||show.cues.length!==7||
  typeof progress!=='number'||!Number.isFinite(progress)||progress<0||progress>1)return null;
 return show.cues.find(c=>progress<c.end)??show.cues[6];
}
