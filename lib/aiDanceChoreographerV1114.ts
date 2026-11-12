/** V1114 – AI Dance Choreographer 4.0.
 * Seven-scene local choreography score for the real Stage Crew clip scheduler.
 * Never fabricates future audio sections or rig animations: suggestions use
 * existing GLB clip names, and playback is delegated to the opt-in crew engine.
 * No API, microphone, hardware or storage access in this pure module.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowDanceV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,
 type AiShowRemixV1106} from './arena360AiShowRemixV1106';
import {type AvatarPersonalityShowV1112} from './aiAvatarPersonalityV1112';
import {type PerformanceShowV1113,type PerformanceCueV1113} from './aiPerformanceDirectorV1113';

export const DANCE_STYLES_V1114=['expressive','festival','precise','cinematic'] as const;
export type DanceStyleV1114=typeof DANCE_STYLES_V1114[number];
export const DANCE_STYLE_LABELS_V1114:Record<DanceStyleV1114,string>={
 expressive:'Musikalisch & natürlich',festival:'Festival & Hardtekk',
 precise:'Präzise & technisch',cinematic:'Filmisch & dramatisch',
};
export type DanceFormV1114='solo'|'duet'|'canon'|'unison';
export type DanceCrewModeV1114='individual'|'unison'|'canon'|'spotlight';
export type DanceOptionsV1114={style:DanceStyleV1114;intensityCap:number;
 /** Actual animation names loaded for each avatar. When supplied, suggestions
  * are resolved only against that member's repertoire; no match means no clip.
  */
 availableClipsByMember?:Record<string,readonly string[]>};
export type DanceMemberV1114={id:string;label:string;role:'lead'|'support'|'echo'|'rest';
 energy:number;clipSuggestion:string;beatOffset:number;lead:boolean};
export type DanceCueV1114={index:number;scene:string;start:number;end:number;
 form:DanceFormV1114;crewMode:DanceCrewModeV1114;section:'quiet'|'verse'|'hook'|'drop';
 dance:ArenaShowDanceV1040;intensity:number;members:DanceMemberV1114[];description:string};
export type DanceShowV1114={style:DanceStyleV1114;remix:AiShowRemixV1106;cues:DanceCueV1114[];
 quality:{scenes:number;performers:number;differentForms:number;individualClips:number;
 continuousTimeline:boolean;withinCap:boolean;safeTransitions:boolean;actualCrewModes:boolean}};

const clipOptions:Record<DanceStyleV1114,readonly [string,string,string]>={
 expressive:['Dance_HipHop','Dance_House','Dance_PopLock'],
 festival:['Dance_Shuffle','Dance_FestivalBounce','Dance_Robot'],
 precise:['Dance_NeonCircuit','Dance_DiscoStar','Dance_Clockwork'],
 cinematic:['Dance_LaserStep','Dance_FestivalFlow','Dance_PopLock'],
};
const formations:readonly DanceFormV1114[]=['unison','solo','canon','duet','unison','solo','unison'];
const sections:readonly DanceCueV1114['section'][]=['quiet','verse','verse','hook','quiet','verse','drop'];
const descriptions=[
 'Reduzierter gemeinsamer Einstieg: ruhige Clips und Luft für den Song.',
 'Neon Pulse übernimmt die Strophe, die Crew unterstützt zurückhaltend.',
 'Kanon: der zweite und dritte Performer steigen beatversetzt ein.',
 'Duo mit präziser Antwortbewegung; dritter Avatar hält den Groove.',
 'Bewusste Atempause mit geringer Bewegungsenergie.',
 'Nächster Solomoment – Kontrast zum ersten Spotlight.',
 'Gemeinsamer Finale-Hit mit synchroner Energie und Gruppenbewegung.',
] as const;
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
export function normalizeDanceOptionsV1114(raw:unknown):DanceOptionsV1114|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const x=raw as Record<string,unknown>;
 if(!DANCE_STYLES_V1114.includes(x.style as DanceStyleV1114)||
  typeof x.intensityCap!=='number'||!Number.isInteger(x.intensityCap)||
  x.intensityCap<30||x.intensityCap>85)return null;
 const available=x.availableClipsByMember;
 if(available!==undefined&&(!available||typeof available!=='object'||Array.isArray(available)||
  Object.values(available as Record<string,unknown>).some(v=>!Array.isArray(v)||
   v.some(name=>typeof name!=='string'||!name.trim()))))return null;
 return {style:x.style as DanceStyleV1114,intensityCap:x.intensityCap,
  ...(available!==undefined?{availableClipsByMember:available as Record<string,readonly string[]>}:{})};
}
/** Resolve a preference to the exact spelling of an animation loaded by
 * one avatar. Matching is case/spacing/separator insensitive; the returned
 * value is always the original loaded clip name, never a fabricated alias.
 */
export function resolveDanceClipSuggestionV1114(
 preferred:readonly string[],available:readonly string[],
):string {
 const key=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'');
 const loaded=new Map<string,string>();
 for(const name of available)if(typeof name==='string'&&name.trim()&&!loaded.has(key(name)))loaded.set(key(name),name);
 for(const name of preferred){const match=loaded.get(key(name));if(match)return match;}
 return '';
}
/** The existing three real GLB performers remain the only cast members.
 * Mode and clip suggestion apply to a real crew player if separately enabled.
 */
export function choreographDanceV1114(baseRaw:unknown,performance:PerformanceShowV1113|null,
 optionsRaw:unknown):DanceShowV1114|null{
 const base=normalizeArenaShowPlanV1040(baseRaw),opts=normalizeDanceOptionsV1114(optionsRaw);
 const remix=normalizeAiShowRemixV1106(performance?.remix);
 if(!base||!opts||!performance||!remix||base.segments.length!==7||
  !Array.isArray(performance.cues)||performance.cues.length!==7||
  remix.acts.some(a=>a.intensity>opts.intensityCap))return null;
 const ids=performance.cues[0]?.performers.map(x=>x.id);
 if(!ids||ids.length!==3||new Set(ids).size!==3||ids.some(id=>typeof id!=='string'||!id))return null;
 for(let i=0;i<7;i++){
  const c=performance.cues[i],a=remix.acts[i],s=base.segments[i];
  if(!c||!a||!s||c.index!==i||c.scene!==a.scene||c.scene!==s.scene||
    c.start!==s.start||c.end!==s.end||c.intensity!==a.intensity||
    c.dance!==a.dance||!Array.isArray(c.performers)||c.performers.length!==3||
    c.performers.some((m,j)=>m.id!==ids[j]||!Number.isFinite(m.energy)||
     m.energy<0||m.energy>opts.intensityCap||
     !(['lead','support','echo','rest'] as string[]).includes(m.role)))return null;
 }
 const mapped=remix.acts.map((a,i)=>{
  const quiet=i===0||i===4;
  const dance:ArenaShowDanceV1040=quiet?'calm':i===3?'group':i===6?'peak':
    opts.style==='festival'&&i===2?'peak':
    opts.style==='cinematic'&&i===5?'calm':'groove';
  return {...a,dance,note:(a.note+' V1114 '+formations[i]+' – '+descriptions[i]).slice(0,145)};
 });
 const staged=normalizeAiShowRemixV1106({...remix,acts:mapped,
  explanation:('V1114 AI Dance Choreographer: echte vorhandene Stage-Crew-Clips und Kanon/Solo/Unisono als Vorschlag; Wiedergabe nur bei separater Crew-Aktivierung. '+remix.explanation).slice(0,300)});
 if(!staged||!applyAiShowRemixV1106(base,staged,opts.intensityCap))return null;
 const cues:DanceCueV1114[]=performance.cues.map((p,i)=>{
  const form=formations[i],ensemble=form==='unison',quiet=i===0||i===4;
  const crewMode:DanceCrewModeV1114=ensemble?'unison':form==='canon'?'canon':'spotlight';
  const leadIndex=form==='duet'?0:i===5?2:i===1?0:0;
  const members=p.performers.map((m,j)=>{
   const isLead=ensemble||j===leadIndex||(form==='duet'&&j===1);
   const role:DanceMemberV1114['role']=ensemble?'lead':isLead?'lead':form==='duet'?'support':m.role;
   const desired=quiet?'Idle_Breathe':ensemble&&i===6?'Dance_FestivalBounce':
    form==='canon'?'Dance_House':clipOptions[opts.style][j];
   const fallback=quiet?['Idle_Breathe','Idle','Idle_Standing']:
    [...clipOptions[opts.style], 'Dance_Groove','Dance_House','Dance_FestivalBounce'];
   const clipSuggestion=opts.availableClipsByMember?
    resolveDanceClipSuggestionV1114([desired,...fallback.filter(x=>x!==desired)],
     opts.availableClipsByMember[m.id]??[]):desired;
   const energy=quiet?Math.min(m.energy,Math.round(opts.intensityCap*.32)):
    clamp(m.energy+(isLead?5:-3),0,opts.intensityCap);
   return {id:m.id,label:m.label,role,energy,clipSuggestion,
    beatOffset:form==='canon'?j*2:0,lead:isLead};
  });
  return {index:i,scene:p.scene,start:p.start,end:p.end,form,crewMode,
   section:sections[i],dance:staged.acts[i].dance,intensity:staged.acts[i].intensity,
   members,description:descriptions[i]};
 });
 const quality={scenes:cues.length,performers:ids.length,
  differentForms:new Set(cues.map(x=>x.form)).size,
  individualClips:new Set(cues.flatMap(c=>c.members.map(m=>m.clipSuggestion))).size,
  continuousTimeline:cues[0].start===0&&cues[6].end===1&&
   cues.every((c,i)=>i===0||c.start===cues[i-1].end),
  withinCap:cues.every(c=>c.intensity<=opts.intensityCap&&c.members.every(m=>m.energy<=opts.intensityCap)),
  safeTransitions:cues.every((c,i)=>i===0||Math.abs(c.intensity-cues[i-1].intensity)<=45),
  actualCrewModes:cues.every(c=>['individual','unison','canon','spotlight'].includes(c.crewMode)),
 };
 if(!quality.continuousTimeline||!quality.withinCap||!quality.safeTransitions||
  !quality.actualCrewModes||quality.differentForms!==4)return null;
 return {style:opts.style,remix:staged,cues,quality};
}
export function syncDancePerformanceV1114(performance:PerformanceShowV1113|null,
 dance:DanceShowV1114|null):PerformanceShowV1113|null{
 if(!performance||!dance||performance.cues.length!==7||dance.cues.length!==7||
  performance.cues.some((c,i)=>c.index!==dance.cues[i].index||c.start!==dance.cues[i].start||
  c.end!==dance.cues[i].end))return null;
 const cues:PerformanceCueV1113[]=performance.cues.map((c,i)=>({...c,
  dance:dance.cues[i].dance,intensity:dance.cues[i].intensity}));
 return {...performance,remix:dance.remix,cues};
}
export function sampleDanceCueV1114(show:DanceShowV1114|null,progress:unknown):DanceCueV1114|null{
 if(!show||!Array.isArray(show.cues)||show.cues.length!==7||
  typeof progress!=='number'||!Number.isFinite(progress)||progress<0||progress>1)return null;
 return show.cues.find(c=>progress<c.end)??show.cues[6];
}
